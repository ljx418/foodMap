import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { loadLocalEnv } from "./load_local_env.mjs";

const root = process.cwd();
loadLocalEnv(root);

const evidenceDir = path.join(root, "docs", "active", "evidence", "p27");
const resultPath = path.join(evidenceDir, "browser-smoke-result.json");
const rawUrl = process.env.FOODMAP_MAINLAND_DEPLOY_URL?.trim() || "";

function classifyUrl(input) {
  if (!input) return { stableCandidate: false, state: "missing", reason: "FOODMAP_MAINLAND_DEPLOY_URL is not set" };
  let url;
  try {
    url = new URL(input);
  } catch {
    return { stableCandidate: false, state: "invalid", reason: "URL cannot be parsed" };
  }
  const host = url.hostname.toLowerCase();
  const hasToken = [...url.searchParams.keys()].some((key) => /token|eo_token|eo_time|preview|auth|session/i.test(key));
  if (url.protocol !== "https:") return { stableCandidate: false, state: "not_https", reason: "URL is not HTTPS" };
  if (hasToken) return { stableCandidate: false, state: "protected_preview", reason: "URL contains preview/auth token-like query parameters" };
  if (host === "localhost" || host === "127.0.0.1" || /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    return { stableCandidate: false, state: "local_or_lan", reason: "URL is local or LAN only" };
  }
  if (host.endsWith("github.io")) return { stableCandidate: false, state: "github_pages", reason: "GitHub Pages is not mainland production acceptance" };
  return { stableCandidate: true, state: "stable_candidate", reason: "URL is HTTPS and has no obvious private preview markers" };
}

function writeResult(result) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
}

function withHash(base, hash) {
  const url = new URL(base);
  if (!url.pathname.endsWith("/")) url.pathname = `${url.pathname}/`;
  url.hash = hash;
  return url.toString();
}

const classification = classifyUrl(rawUrl);
if (!classification.stableCandidate) {
  writeResult({
    generatedAt: new Date().toISOString(),
    status: "blocked_before_browser_smoke",
    accepted: false,
    urlClassification: classification,
    screenshots: [],
    note: "Browser smoke requires a stable public HTTPS URL."
  });
  console.error(`[P27 Browser Smoke] Blocked: ${classification.state}: ${classification.reason}`);
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true
});
const page = await context.newPage();

const screenshots = [];
try {
  await page.goto(withHash(rawUrl, "#/map"), { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: path.join(evidenceDir, "p27-browser-map.png"), fullPage: true });
  screenshots.push("docs/active/evidence/p27/p27-browser-map.png");

  const title = await page.title();
  if (!/FoodMap|美食地图/.test(title)) throw new Error(`Unexpected title: ${title}`);
  const bodyText = await page.locator("body").innerText({ timeout: 10000 });
  if (/账号登录|云同步成功|远程备份|原生鸿蒙应用|AppGallery|永久公网分享/.test(bodyText)) {
    throw new Error("Page body contains prohibited over-claim wording");
  }

  await page.reload({ waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: path.join(evidenceDir, "p27-browser-map-refresh.png"), fullPage: true });
  screenshots.push("docs/active/evidence/p27/p27-browser-map-refresh.png");

  await page.goto(withHash(rawUrl, "#/share/missing-p27-snapshot"), { waitUntil: "networkidle", timeout: 30000 });
  const shareText = await page.locator("body").innerText({ timeout: 10000 });
  if (!/导入|数据包|快照|分享/.test(shareText)) throw new Error("Missing share fallback text is not visible");
  await page.screenshot({ path: path.join(evidenceDir, "p27-browser-missing-share.png"), fullPage: true });
  screenshots.push("docs/active/evidence/p27/p27-browser-missing-share.png");

  writeResult({
    generatedAt: new Date().toISOString(),
    status: "passed",
    accepted: false,
    urlClassification: classification,
    screenshots,
    note: "Browser smoke passed. Mate70 evidence and final report are still required before P27 acceptance."
  });
  console.log(`[P27 Browser Smoke] Passed. Result: ${path.relative(root, resultPath)}`);
} catch (error) {
  writeResult({
    generatedAt: new Date().toISOString(),
    status: "failed",
    accepted: false,
    urlClassification: classification,
    screenshots,
    error: error.message
  });
  console.error(`[P27 Browser Smoke] ${error.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
