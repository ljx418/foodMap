import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const targetUrl = process.env.FOODMAP_MAINLAND_DEPLOY_URL?.trim();
const expectedBase = process.env.FOODMAP_MAINLAND_BASE_PATH?.trim() || "/";

function fail(message) {
  console.error(`[Mainland Deployment Verify] ${message}`);
  process.exitCode = 1;
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(read(filePath));
}

function normalizeBase(basePath) {
  if (!basePath.startsWith("/")) return `/${basePath}`;
  return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

function checkManifest(manifest) {
  if (manifest.name !== "FoodMap 美食地图") fail("manifest name mismatch");
  if (manifest.display !== "standalone") fail("manifest display must be standalone");
  if (typeof manifest.start_url !== "string" || !manifest.start_url.includes("#/map")) fail("manifest start_url must target #/map");
  if (manifest.scope !== "./") fail("manifest scope must remain relative to the static host path");
  if (!Array.isArray(manifest.icons) || !manifest.icons.some((icon) => icon.src?.includes("foodmap-icon.svg"))) {
    fail("manifest icon is missing FoodMap SVG");
  }
}

function checkServiceWorker(sw) {
  if (!/foodmap-app-shell-v\d+/.test(sw)) fail("service worker cache name missing");
  if (!sw.includes("FoodMap 暂时无法连接静态站点")) fail("service worker fallback copy missing");
  if (!sw.includes("不会把本地收藏误报为云同步")) fail("service worker local-first copy missing");
  if (/账号登录|云同步成功|远程备份|原生鸿蒙应用|AppGallery|永久公网分享/.test(sw)) {
    fail("service worker contains prohibited over-claim wording");
  }
}

function checkIndexHtml(indexHtml, sourceLabel) {
  const normalizedBase = normalizeBase(expectedBase);
  if (!indexHtml.includes('rel="manifest"')) fail(`${sourceLabel} index missing manifest link`);
  if (!indexHtml.includes("viewport-fit=cover")) fail(`${sourceLabel} index missing viewport-fit`);
  if (!indexHtml.includes('name="theme-color"')) fail(`${sourceLabel} index missing theme color`);
  if (normalizedBase !== "/" && !indexHtml.includes(normalizedBase)) {
    fail(`${sourceLabel} index does not include configured base ${normalizedBase}`);
  }
  if (normalizedBase === "/" && /\/foodMap\/assets\//.test(indexHtml)) {
    fail(`${sourceLabel} index still points to GitHub Pages /foodMap/ assets; run npm run build:mainland`);
  }
  if (/账号登录|云同步|远程备份|原生鸿蒙|AppGallery|永久公网分享/.test(indexHtml)) {
    fail(`${sourceLabel} index contains prohibited over-claim wording`);
  }
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    fail(`${url} returned HTTP ${response.status}`);
    return "";
  }
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    fail(`${url} returned HTTP ${response.status}`);
    return {};
  }
  try {
    return await response.json();
  } catch {
    fail(`${url} did not return valid JSON`);
    return {};
  }
}

async function verifyRemote(baseUrl) {
  const normalized = new URL(baseUrl);
  if (!normalized.pathname.endsWith("/")) normalized.pathname = `${normalized.pathname}/`;
  const origin = normalized.toString();
  const indexHtml = await fetchText(origin);
  const manifest = await fetchJson(new URL("manifest.webmanifest", origin).toString());
  const sw = await fetchText(new URL("sw.js", origin).toString());
  const icon = await fetchText(new URL("icons/foodmap-icon.svg", origin).toString());

  checkIndexHtml(indexHtml, "remote");
  checkManifest(manifest);
  checkServiceWorker(sw);
  if (!icon.includes("<svg")) fail("remote icon is not SVG");

  if (!process.exitCode) {
    console.log(`[Mainland Deployment Verify] Remote static deployment checks passed for ${origin}`);
  }
}

function verifyDist() {
  const indexPath = path.join(dist, "index.html");
  const manifestPath = path.join(dist, "manifest.webmanifest");
  const swPath = path.join(dist, "sw.js");
  const iconPath = path.join(dist, "icons", "foodmap-icon.svg");

  for (const filePath of [indexPath, manifestPath, swPath, iconPath]) {
    if (!fs.existsSync(filePath)) fail(`Missing ${path.relative(root, filePath)}`);
  }
  if (process.exitCode) return;

  checkIndexHtml(read(indexPath), "dist");
  checkManifest(readJson(manifestPath));
  checkServiceWorker(read(swPath));
  if (!read(iconPath).includes("<svg")) fail("dist icon is not SVG");

  if (!process.exitCode) {
    console.log(`[Mainland Deployment Verify] Local dist checks passed for base ${normalizeBase(expectedBase)}.`);
  }
}

if (targetUrl) {
  await verifyRemote(targetUrl);
} else {
  verifyDist();
}
