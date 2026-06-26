import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const evidenceDir = path.join(root, "docs", "active", "evidence", "p26");
const manifestPath = path.join(evidenceDir, "release-gate-manifest.json");
const checks = [];

function fail(message) {
  checks.push({ name: message, status: "fail" });
  console.error(`[P26 Release Verify] ${message}`);
  process.exitCode = 1;
}

function pass(name) {
  checks.push({ name, status: "pass" });
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function assertIncludes(filePath, needle, label) {
  const source = read(filePath);
  if (!source.includes(needle)) fail(`${label}: missing "${needle}"`);
  else pass(`${label}: contains "${needle}"`);
}

function assertNotMatches(filePath, pattern, label) {
  const source = read(filePath);
  if (pattern.test(source)) fail(`${label}: contains prohibited wording`);
  else pass(`${label}: no prohibited wording`);
}

function checkFileExists(filePath) {
  if (!fs.existsSync(path.join(root, filePath))) fail(`missing ${filePath}`);
  else pass(`exists ${filePath}`);
}

function checkDrawio() {
  const drawioPath = "docs/active/current-vs-target-gap.drawio";
  const source = read(drawioPath);
  const diagrams = [...source.matchAll(/<diagram\b[^>]*\bname="([^"]+)"/g)].map((match) => ({ name: match[1] }));
  if (diagrams.length === 0) fail("drawio has no pages");
  else pass(`drawio page count ${diagrams.length}`);
  if (diagrams.length > 8) fail("drawio page count exceeds 8");
  const names = diagrams.map((diagram) => diagram.name).join(" | ");
  for (const required of ["目标体验", "代码实体", "开发及验收计划", "项目里程碑", "验收门槛"]) {
    if (!names.includes(required)) fail(`drawio missing page concept ${required}`);
    else pass(`drawio includes ${required}`);
  }
}

const requiredDocs = [
  "docs/active/product-requirements-document.md",
  "docs/active/target-architecture.md",
  "docs/active/development-and-acceptance-plan.md",
  "docs/active/acceptance-gate.md",
  "docs/active/current-vs-target-gap.md",
  "docs/active/current-vs-target-gap.drawio",
  "docs/active/milestone-roadmap.md",
  "docs/active/e2e-test-and-evidence-matrix.md",
  "docs/active/visual-acceptance-checklist.md",
  "docs/active/p26-detailed-development-and-acceptance-plan.md",
  "docs/active/p26-preimplementation-audit.md",
  "docs/active/p26-stage-implementation-contract.md",
  "docs/active/p26-1-acceptance-report.md"
];

for (const filePath of requiredDocs) checkFileExists(filePath);

assertIncludes("docs/active/product-requirements-document.md", "4M. 本阶段目标：P26", "PRD");
assertIncludes("docs/active/target-architecture.md", "0D. P26 Target Hardening Architecture", "target architecture");
assertIncludes("package.json", "verify:p26:release", "package scripts");
assertIncludes("src/components/WebAppStatus.tsx", "webapp-release-target", "WebAppStatus");
assertIncludes("src/components/WebAppStatus.tsx", "webapp-storage-status", "WebAppStatus");
assertIncludes("src/components/WebAppStatus.tsx", "webapp-service-worker-status", "WebAppStatus");
assertIncludes("src/features/share/ShareView.tsx", "share-missing-recovery", "ShareView");
assertIncludes("src/features/workspace/GovernanceWorkbench.tsx", "import-write-summary", "GovernanceWorkbench");
assertIncludes("e2e/workspace.spec.ts", "P26 mobile release diagnostics", "P26 E2E");
assertIncludes("e2e/workspace.spec.ts", "P26 local maintenance preview", "P26 E2E");

assertNotMatches("src/components/WebAppStatus.tsx", /云同步成功|原生鸿蒙应用|AppGallery|永久公网分享|离线地图瓦片/, "WebAppStatus");
assertNotMatches("src/features/share/ShareView.tsx", /云同步成功|永久公网分享/, "ShareView");
assertNotMatches("src/features/workspace/GovernanceWorkbench.tsx", /自动修复|自动删除|静默合并/, "GovernanceWorkbench");
assertNotMatches("public/sw.js", /云同步成功|原生鸿蒙应用|AppGallery|永久公网分享|离线地图瓦片/, "service worker");

checkDrawio();

fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(
  manifestPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    scope: "P26 release gate automation",
    acceptedBaseline: "P25",
    checks,
    result: process.exitCode ? "fail" : "pass",
    notes: [
      "This verifier proves static source and documentation release-gate readiness only.",
      "It does not replace Playwright, real scanlist verification, deployed-origin checks, or Mate70 fixed-URL evidence."
    ]
  }, null, 2)}\n`
);

if (!process.exitCode) {
  console.log(`[P26 Release Verify] Checks passed. Manifest: ${path.relative(root, manifestPath)}`);
}
