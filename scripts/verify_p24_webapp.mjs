import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const indexPath = path.join(dist, "index.html");
const manifestPath = path.join(dist, "manifest.webmanifest");
const serviceWorkerPath = path.join(dist, "sw.js");
const iconPath = path.join(dist, "icons", "foodmap-icon.svg");

function fail(message) {
  console.error(`[P24 WebApp Verify] ${message}`);
  process.exitCode = 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

for (const filePath of [indexPath, manifestPath, serviceWorkerPath, iconPath]) {
  if (!fs.existsSync(filePath)) fail(`Missing ${path.relative(root, filePath)}`);
}

if (process.exitCode) process.exit();

const indexHtml = fs.readFileSync(indexPath, "utf8");
const manifest = readJson(manifestPath);
const sw = fs.readFileSync(serviceWorkerPath, "utf8");

const indexChecks = [
  ["manifest link", /rel="manifest"/],
  ["viewport fit", /viewport-fit=cover/],
  ["theme color", /name="theme-color"/],
  ["mobile app capable", /mobile-web-app-capable/]
];

for (const [label, pattern] of indexChecks) {
  if (!pattern.test(indexHtml)) fail(`index.html missing ${label}`);
}

const manifestChecks = [
  ["name", manifest.name === "FoodMap 美食地图"],
  ["display standalone", manifest.display === "standalone"],
  ["start_url hash route", typeof manifest.start_url === "string" && manifest.start_url.includes("#/map")],
  ["portrait orientation", manifest.orientation === "portrait-primary"],
  ["svg icon", Array.isArray(manifest.icons) && manifest.icons.some((icon) => icon.src?.includes("foodmap-icon.svg"))]
];

for (const [label, passed] of manifestChecks) {
  if (!passed) fail(`manifest.webmanifest failed ${label}`);
}

if (!/foodmap-app-shell-v\d+/.test(sw)) fail("sw.js missing app shell cache name");
if (!sw.includes("request.mode === \"navigate\"")) fail("sw.js missing navigation fallback");
if (!sw.includes("response.ok ? response : offlineFallbackResponse()")) {
  fail("sw.js missing non-OK navigation fallback");
}

if (!process.exitCode) {
  console.log("[P24 WebApp Verify] dist metadata, manifest, icon and service worker checks passed.");
}
