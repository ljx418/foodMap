import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadLocalEnv } from "./load_local_env.mjs";

const root = process.cwd();
loadLocalEnv(root);

const evidenceDir = path.join(root, "docs", "active", "evidence", "p27");
const manifestPath = path.join(evidenceDir, "release-gate-manifest.json");
const deployUrl = process.env.FOODMAP_MAINLAND_DEPLOY_URL?.trim() || "";
const strictAcceptance = process.env.P27_REQUIRE_STABLE_URL === "1";

const checks = [];
const blockers = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function record(name, passed, note = "") {
  checks.push({ name, passed, note });
  if (!passed) console.error(`[P27 Release Verify] ${name}: ${note || "failed"}`);
}

function classifyUrl(rawUrl) {
  if (!rawUrl) return { state: "missing", stableCandidate: false, reason: "FOODMAP_MAINLAND_DEPLOY_URL is not set" };
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { state: "invalid", stableCandidate: false, reason: "URL cannot be parsed" };
  }
  const host = parsed.hostname.toLowerCase();
  const tokenLike = [...parsed.searchParams.keys()].some((key) => /token|eo_token|eo_time|preview|auth|session/i.test(key));
  if (parsed.protocol !== "https:") {
    return { state: "not_https", stableCandidate: false, reason: "URL is not HTTPS" };
  }
  if (tokenLike) {
    return { state: "protected_preview", stableCandidate: false, reason: "URL contains preview/auth token-like query parameters" };
  }
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local") || /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    return { state: "local_or_lan", stableCandidate: false, reason: "URL is local or LAN only" };
  }
  if (host.endsWith("github.io")) {
    return { state: "github_pages", stableCandidate: false, reason: "GitHub Pages is not mainland production acceptance" };
  }
  return { state: "stable_candidate", stableCandidate: true, reason: "URL is HTTPS and has no obvious private preview markers" };
}

async function fetchText(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function verifyRemote(baseUrl) {
  const normalized = new URL(baseUrl);
  if (!normalized.pathname.endsWith("/")) normalized.pathname = `${normalized.pathname}/`;
  const origin = normalized.toString();
  const indexHtml = await fetchText(origin);
  const manifest = await fetchJson(new URL("manifest.webmanifest", origin).toString());
  const sw = await fetchText(new URL("sw.js", origin).toString());
  const icon = await fetchText(new URL("icons/foodmap-icon.svg", origin).toString());

  if (!indexHtml.includes('rel="manifest"')) throw new Error("remote index missing manifest link");
  if (/\/foodMap\/assets\//.test(indexHtml)) throw new Error("remote index still points to GitHub Pages /foodMap/ assets");
  if (/账号登录|云同步|远程备份|原生鸿蒙|AppGallery|永久公网分享/.test(indexHtml)) {
    throw new Error("remote index contains prohibited over-claim wording");
  }
  if (manifest.name !== "FoodMap 美食地图" || manifest.display !== "standalone" || !manifest.start_url?.includes("#/map")) {
    throw new Error("remote manifest does not match FoodMap WebApp requirements");
  }
  if (!/foodmap-app-shell-v\d+/.test(sw)) throw new Error("remote service worker cache name missing");
  if (!sw.includes("不会把本地收藏误报为云同步")) throw new Error("remote service worker local-first copy missing");
  if (!icon.includes("<svg")) throw new Error("remote icon is not SVG");
}

function runSecretScan() {
  const tokenQueryPattern = "eo_" + "token=[A-Za-z0-9]";
  const result = spawnSync("rg", [
    "-n",
    `AKID[A-Za-z0-9]{20,}|SecretKey\\s*[:=]|ApiToken\\s*[:=]|saas_(token|sid)\\s*[:=]|${tokenQueryPattern}|EDGEONE_API_TOKEN\\s*[:=]\\s*[A-Za-z0-9+/=]{12,}`,
    "docs/active",
    "README.md",
    "package.json",
    "scripts",
    "vite.config.ts"
  ], { cwd: root, encoding: "utf8" });
  return result.status === 1;
}

fs.mkdirSync(evidenceDir, { recursive: true });

record("PRD contains P27 stage", read("docs/active/product-requirements-document.md").includes("4N. 本阶段目标：P27"), "PRD 4N mainland public access target");
record("Target architecture contains P27 architecture", read("docs/active/target-architecture.md").includes("0F. P27 Mainland Public Access Target Architecture"), "Target architecture 0F");
record("Acceptance gate keeps P27 not accepted", read("docs/active/acceptance-gate.md").includes("Current P27 gate result: not accepted"), "P27 must remain open until stable URL evidence exists");
record("P27 detailed plan exists", exists("docs/active/p27-detailed-development-and-acceptance-plan.md"), "Detailed plan");
record("P27 preimplementation audit exists", exists("docs/active/p27-preimplementation-audit.md"), "Preimplementation audit");
record("P27 progress report exists", exists("docs/active/p27-implementation-progress-report.md"), "Implementation progress report");
record("Package has P27 release verifier script", read("package.json").includes("verify:p27:release"), "package.json script");
record("P27 browser smoke script exists", exists("scripts/p27_browser_smoke.mjs"), "browser smoke script");

try {
  const drawio = read("docs/active/current-vs-target-gap.drawio");
  const diagrams = drawio.match(/<diagram\b/g) || [];
  record("Drawio has at most 8 pages", diagrams.length <= 8, `${diagrams.length} pages`);
  record("Drawio contains P27", read("docs/active/current-vs-target-gap.drawio").includes("P27"), "P27 labels present");
} catch (error) {
  record("Drawio XML parses", false, error.message);
}

const distIndex = exists("dist/index.html") ? read("dist/index.html") : "";
record("Local dist exists", Boolean(distIndex), "dist/index.html");
record("Local dist is not GitHub Pages base", distIndex ? !/\/foodMap\/assets\//.test(distIndex) : false, "root-oriented mainland build");
record("Secret scan has no known leaked token values", runSecretScan(), "known token patterns absent");

const urlClassification = classifyUrl(deployUrl);
if (!urlClassification.stableCandidate) {
  blockers.push(urlClassification.reason);
}
record("Stable public URL candidate", urlClassification.stableCandidate, `${urlClassification.state}: ${urlClassification.reason}`);

let remoteVerification = { attempted: false, passed: false, note: "No stable public URL candidate" };
if (urlClassification.stableCandidate) {
  remoteVerification.attempted = true;
  try {
    await verifyRemote(deployUrl);
    remoteVerification = { attempted: true, passed: true, note: "Remote static deployment checks passed" };
    record("Remote stable URL static checks", true, deployUrl);
  } catch (error) {
    remoteVerification = { attempted: true, passed: false, note: error.message };
    blockers.push(error.message);
    record("Remote stable URL static checks", false, error.message);
  }
}

const fatalFailures = checks.filter((check) => !check.passed && check.name !== "Stable public URL candidate" && check.name !== "Remote stable URL static checks");
const accepted = fatalFailures.length === 0 && urlClassification.stableCandidate && remoteVerification.passed;
const status = accepted ? "ready_for_mate70_and_final_report" : "blocked_before_final_acceptance";

if (!accepted && strictAcceptance) {
  blockers.push("P27_REQUIRE_STABLE_URL=1 requires stable URL and remote verification");
}

const manifest = {
  generatedAt: new Date().toISOString(),
  scope: "P27 release gate automation",
  status,
  accepted: false,
  urlClassification,
  remoteVerification,
  checks,
  blockers: [...new Set(blockers)],
  nextRequiredEvidence: accepted
    ? ["Mate70 stable public URL evidence", "P27 final acceptance report"]
    : [
        "Stable public HTTPS URL without login or expiring preview token",
        "FOODMAP_MAINLAND_DEPLOY_URL=<stable-url> npm run verify:mainland:deployment",
        "P27 browser smoke against the stable URL",
        "Mate70 screenshot or recording for the stable URL",
        "P27 final acceptance report"
      ]
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (fatalFailures.length > 0 || (strictAcceptance && !accepted)) {
  console.error(`[P27 Release Verify] Checks failed. Manifest: ${path.relative(root, manifestPath)}`);
  process.exit(1);
}

console.log(`[P27 Release Verify] ${status}. Manifest: ${path.relative(root, manifestPath)}`);
