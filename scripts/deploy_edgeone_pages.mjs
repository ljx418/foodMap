import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadLocalEnv } from "./load_local_env.mjs";

const root = process.cwd();
loadLocalEnv(root);

const dist = path.join(root, "dist");
const projectName = process.env.EDGEONE_PROJECT_NAME?.trim() || "foodmap";
const token = process.env.EDGEONE_API_TOKEN?.trim();
const dryRun = process.env.EDGEONE_DRY_RUN === "1" || process.argv.includes("--dry-run");
const cliPackage = process.env.EDGEONE_CLI_PACKAGE?.trim() || "edgeone";

function fail(message) {
  console.error(`[EdgeOne Deploy] ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[EdgeOne Deploy] ${message}`);
}

function ensureDist() {
  const required = [
    "index.html",
    "manifest.webmanifest",
    "sw.js",
    path.join("icons", "foodmap-icon.svg")
  ];
  for (const file of required) {
    const filePath = path.join(dist, file);
    if (!fs.existsSync(filePath)) fail(`Missing dist/${file}; run npm run build:edgeone first.`);
  }
  const indexHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  if (/\/foodMap\/assets\//.test(indexHtml)) {
    fail("dist still uses GitHub Pages /foodMap/ asset paths; run npm run build:edgeone.");
  }
}

function commandParts() {
  return [
    "npx",
    "--yes",
    cliPackage,
    "makers",
    "deploy",
    "./dist",
    "-n",
    projectName,
    token ? "with EDGEONE_PAGES_API_TOKEN from environment" : "without token"
  ];
}

ensureDist();

if (dryRun) {
  info(`Dry run only. Command: ${commandParts().join(" ")}`);
  info("After deployment, verify with FOODMAP_MAINLAND_DEPLOY_URL=<EdgeOne URL> npm run verify:mainland:deployment");
  process.exit(0);
}

if (!token) {
  fail("EDGEONE_API_TOKEN is required. Set EDGEONE_API_TOKEN and optionally EDGEONE_PROJECT_NAME, or run EDGEONE_DRY_RUN=1 npm run deploy:edgeone.");
}

const args = [
  "--yes",
  cliPackage,
  "makers",
  "deploy",
  "./dist",
  "-n",
  projectName
];

info(`Deploying dist/ to EdgeOne Pages project "${projectName}".`);
const result = spawnSync("npx", args, {
  cwd: root,
  env: {
    ...process.env,
    EDGEONE_PAGES_API_TOKEN: token
  },
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (result.error) fail(result.error.message);
if (result.status !== 0) fail(`EdgeOne CLI exited with code ${result.status ?? "unknown"}.`);

info("Deployment command completed. Run remote verification with FOODMAP_MAINLAND_DEPLOY_URL=<EdgeOne URL> npm run verify:mainland:deployment");
