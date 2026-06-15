#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const outputPath = path.resolve("src/recommendations/amap-wuhan-scanlist.generated.json");
const sources = [
  "https://www.amap.com/ranking/wuhan"
];

async function main() {
  const result = {
    generatedAt: new Date().toISOString(),
    note: "This generator keeps to publicly reachable pages only. If live extraction fails, update curated seeds in src/recommendations/amapWuhanScanlist.ts.",
    sources
  };
  await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
