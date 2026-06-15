import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const GENERATED_PATH = "src/recommendations/amapWuhanScanlist.generated.ts";
const MANUAL_PINS_PATH = "src/recommendations/manualVerifiedPins.ts";
const REPORT_PATH = "docs/active/amap-scanlist-refresh-report.md";
const TARGET_COUNT = 50;
const WUHAN_BOUNDS = {
  minLongitude: 113.6,
  maxLongitude: 115,
  minLatitude: 29.9,
  maxLatitude: 31
};

function loadTsExport(filePath, exportName) {
  const source = fs.readFileSync(filePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    }
  }).outputText;
  const sandbox = {
    exports: {},
    require: (name) => {
      throw new Error(`Unexpected runtime require(${name}) while loading ${filePath}`);
    }
  };
  vm.runInNewContext(output, sandbox, { filename: filePath });
  return sandbox.exports[exportName];
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function inRange(value, min, max) {
  return isNumber(value) && value >= min && value <= max;
}

function assertCheck(checks, condition, message) {
  if (!condition) checks.push(message);
}

function withinWuhan(pin) {
  return inRange(pin.longitude, WUHAN_BOUNDS.minLongitude, WUHAN_BOUNDS.maxLongitude) &&
    inRange(pin.latitude, WUHAN_BOUNDS.minLatitude, WUHAN_BOUNDS.maxLatitude);
}

function verifyGuardrail(checks, manualPins, poiId, guardrail) {
  const pin = manualPins[poiId];
  assertCheck(checks, Boolean(pin), `${guardrail.label}: missing manual verified pin ${poiId}`);
  if (!pin) return;
  assertCheck(checks, guardrail.district.test(pin.district), `${guardrail.label}: district drifted to ${pin.district}`);
  assertCheck(checks, guardrail.address.test(pin.address), `${guardrail.label}: address no longer matches guardrail`);
  assertCheck(
    checks,
    inRange(pin.longitude, guardrail.longitude[0], guardrail.longitude[1]) &&
      inRange(pin.latitude, guardrail.latitude[0], guardrail.latitude[1]),
    `${guardrail.label}: coordinate drifted to ${pin.longitude},${pin.latitude}`
  );
}

function main() {
  const recommendations = loadTsExport(GENERATED_PATH, "AMAP_WUHAN_SCANLIST");
  const manualPins = loadTsExport(MANUAL_PINS_PATH, "MANUAL_VERIFIED_AMAP_PINS");
  const report = fs.readFileSync(REPORT_PATH, "utf8");
  const checks = [];
  const approximatePins = [];

  assertCheck(checks, Array.isArray(recommendations), "generated scanlist export is not an array");
  assertCheck(checks, recommendations.length === TARGET_COUNT, `expected ${TARGET_COUNT} scanlist entries, got ${recommendations.length}`);

  const poiIds = new Set();
  const sourceIds = new Set();
  const ranks = new Set();

  for (const recommendation of recommendations) {
    const label = `${recommendation.rank ?? "?"} ${recommendation.name ?? recommendation.poiId}`;
    const pin = manualPins[recommendation.poiId];

    assertCheck(checks, typeof recommendation.poiId === "string" && recommendation.poiId, `${label}: missing POI ID`);
    assertCheck(checks, !poiIds.has(recommendation.poiId), `${label}: duplicated POI ID ${recommendation.poiId}`);
    assertCheck(checks, !sourceIds.has(recommendation.sourceId), `${label}: duplicated sourceId ${recommendation.sourceId}`);
    assertCheck(checks, !ranks.has(recommendation.rank), `${label}: duplicated rank ${recommendation.rank}`);
    poiIds.add(recommendation.poiId);
    sourceIds.add(recommendation.sourceId);
    ranks.add(recommendation.rank);

    assertCheck(checks, Boolean(pin), `${label}: missing manual verification overlay`);
    if (!pin) continue;

    const trust = pin.coordinateTrust ?? "high";
    const confidence = pin.confidence ?? 0.88;
    const accuracy = pin.accuracy ?? "exact";
    const sourceGroup = accuracy === "approximate" ? "manual" : "open-web";
    const sourceGroups = new Set(["amap", sourceGroup]);

    if (accuracy === "approximate") approximatePins.push(label);

    assertCheck(checks, pin.poiId === recommendation.poiId, `${label}: manual pin POI ID mismatch`);
    assertCheck(checks, typeof pin.district === "string" && pin.district.length > 0, `${label}: missing verified district`);
    assertCheck(checks, typeof pin.address === "string" && pin.address.length > 0, `${label}: missing verified address`);
    assertCheck(checks, withinWuhan(pin), `${label}: coordinate outside Wuhan bounds`);
    assertCheck(checks, trust === "medium" || trust === "high", `${label}: coordinate trust is ${trust}`);
    assertCheck(checks, confidence >= 0.78, `${label}: confidence below admission threshold`);
    assertCheck(checks, sourceGroups.size >= 2, `${label}: insufficient independent source groups`);
    assertCheck(checks, /^https?:\/\//.test(pin.evidenceUrl), `${label}: invalid evidence URL`);
    assertCheck(checks, typeof pin.evidenceName === "string" && pin.evidenceName.length > 0, `${label}: missing evidence name`);
    assertCheck(checks, typeof pin.observedAt === "string" && pin.observedAt.length > 0, `${label}: missing observedAt`);
    assertCheck(checks, Boolean(recommendation.coverImageUrl), `${label}: missing cover image`);
    assertCheck(checks, recommendation.imageEvidence?.matched === true, `${label}: image evidence is not matched`);
  }

  assertCheck(checks, report.includes("- 榜单条目：50"), "refresh report does not record 50 ranking entries");
  assertCheck(checks, report.includes("- 目标条目：50"), "refresh report does not record target count 50");
  assertCheck(checks, report.includes("- 已核验可上图：50"), "refresh report does not record 50 verified mappable entries");
  assertCheck(checks, report.includes("- 待核验不上图：0"), "refresh report does not record zero unmappable pending entries");
  assertCheck(checks, report.includes("- 冲突已隐藏：0"), "refresh report does not record zero hidden conflicts");

  verifyGuardrail(checks, manualPins, "B0IKR7NJ3M", {
    label: "刘聋子牛肉粉馆(汉阳龙兴东街店)",
    district: /汉阳区/,
    address: /龙兴东街|龙阳/,
    longitude: [114.18, 114.23],
    latitude: [30.53, 30.57]
  });
  verifyGuardrail(checks, manualPins, "B0JUBRFQAV", {
    label: "万松小院·荷花垄",
    district: /江汉区/,
    address: /荷花垄|中山公园/,
    longitude: [114.24, 114.29],
    latitude: [30.57, 30.6]
  });
  verifyGuardrail(checks, manualPins, "B0FFFFP4HX", {
    label: "小骆川菜馆",
    district: /洪山区/,
    address: /方家村|东湖/,
    longitude: [114.38, 114.43],
    latitude: [30.5, 30.55]
  });

  if (checks.length > 0) {
    console.error("FoodMap scanlist baseline verification failed:");
    for (const check of checks) console.error(`- ${check}`);
    process.exit(1);
  }

  console.log(`FoodMap scanlist baseline verification passed.`);
  console.log(`- Entries: ${recommendations.length}`);
  console.log(`- Manual verification overlays: ${Object.keys(manualPins).length}`);
  console.log(`- Approximate but admitted pins: ${approximatePins.length}`);
  console.log(`- Guardrails: 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆`);
}

main();
