import fs from "node:fs/promises";

const RANKING_URL = "https://www.amap.com/ranking/wuhan";
const RANKING_SOURCE_URLS = [
  "https://www.amap.com/ranking/wuhan/food",
  "https://www.amap.com/ranking/wuhan/food/420103",
  "https://www.amap.com/ranking/wuhan/food/420102",
  "https://www.amap.com/ranking/wuhan/food/420106",
  "https://www.amap.com/ranking/wuhan/food/420111",
  "https://www.amap.com/ranking/wuhan/food/420105",
  "https://www.amap.com/ranking/wuhan/food/420112",
  "https://www.amap.com/ranking/wuhan/food/420107",
  "https://www.amap.com/ranking/wuhan/food/420115",
  "https://www.amap.com/ranking/wuhan/food/420104"
];
const TARGET_RECOMMENDATION_COUNT = 50;
const OUTPUT_PATH = process.env.REFRESH_OUTPUT_PATH || "src/recommendations/amapWuhanScanlist.generated.ts";
const REPORT_PATH = process.env.REFRESH_REPORT_PATH || "docs/active/amap-scanlist-refresh-report.md";
const MANUAL_VERIFIED_PATH = "src/recommendations/manualVerifiedPins.ts";
const WUHAN_BOUNDS = {
  minLongitude: 113.6,
  maxLongitude: 115,
  minLatitude: 29.9,
  maxLatitude: 31
};
const REFRESH_MODE = process.argv.includes("--apply") ? "apply" : "dry-run";

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function decodeHtmlAttribute(value) {
  return stripHtml(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeString(value) {
  return JSON.stringify(value ?? "");
}

function parseRankingCards(html, observedAt, pageUrl) {
  const cardRegex = /<a href="\/place\/([^"]+)" class="poi-card"[^>]*>([\s\S]*?)<\/a>/g;
  const cards = [];
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const [, poiId, body] = match;
    const nameMatch = body.match(/<div class="poi-name">([\s\S]*?)<\/div>/);
    const scoreMatch = body.match(/<span class="detail-text">全年综合分([\d.]+)<\/span>/);
    if (!nameMatch || !scoreMatch) continue;
    const name = stripHtml(nameMatch[1]);
    const imageMatch = body.match(/<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*class="poi-image"/);
    const imageUrl = imageMatch ? decodeHtmlAttribute(imageMatch[1]) : undefined;
    const imageAlt = imageMatch ? decodeHtmlAttribute(imageMatch[2]) : undefined;
    const imageMatched = Boolean(
      imageUrl &&
      imageAlt &&
      normalizeName(imageAlt) &&
      normalizeName(name) &&
      (normalizeName(imageAlt).includes(normalizeName(name)) || normalizeName(name).includes(normalizeName(imageAlt)))
    );
    const tags = Array.from(body.matchAll(/border-radius: 4px;[^>]*>([\s\S]*?)<\/span>/g))
      .map((item) => stripHtml(item[1]))
      .filter(Boolean);
    const summaryMatch = body.match(/font-style: italic;">([\s\S]*?)<\/span>/);
    cards.push({
      source: "amap-ranking",
      url: pageUrl,
      poiId,
      rank: cards.length + 1,
      name,
      score: Number(scoreMatch[1]),
      tags,
      summary: summaryMatch ? stripHtml(summaryMatch[1]) : undefined,
      imageUrl,
      imageAlt,
      imageMatched,
      observedAt
    });
  }
  return cards;
}

async function fetchRankingCards(observedAt) {
  const deduped = new Map();
  for (const url of RANKING_SOURCE_URLS) {
    const html = await fetch(url).then((response) => response.text());
    const cards = parseRankingCards(html, observedAt, url);
    for (const card of cards) {
      if (!deduped.has(card.poiId)) {
        deduped.set(card.poiId, {
          ...card,
          rank: deduped.size + 1,
          sourcePageRank: card.rank
        });
      }
      if (deduped.size >= TARGET_RECOMMENDATION_COUNT) break;
    }
    if (deduped.size >= TARGET_RECOMMENDATION_COUNT) break;
  }
  return Array.from(deduped.values());
}

async function fetchPoiDetail(poiId, observedAt) {
  const key = process.env.AMAP_WEB_SERVICE_KEY;
  if (!key) {
    return {
      source: "amap-poi-detail",
      poiId,
      name: "",
      rawStatus: "missing-key",
      rawInfo: "AMAP_WEB_SERVICE_KEY is not configured",
      observedAt
    };
  }
  const url = new URL("https://restapi.amap.com/v3/place/detail");
  url.searchParams.set("key", key);
  url.searchParams.set("id", poiId);
  url.searchParams.set("extensions", "all");
  const response = await fetch(url);
  const data = await response.json();
  const poi = data.pois?.[0];
  if (!poi) {
    return {
      source: "amap-poi-detail",
      poiId,
      name: "",
      rawStatus: data.status,
      rawInfo: data.info ?? "No POI returned",
      observedAt
    };
  }
  const [longitudeText, latitudeText] = String(poi.location ?? "").split(",");
  const longitude = Number(longitudeText);
  const latitude = Number(latitudeText);
  return {
    source: "amap-poi-detail",
    poiId,
    name: poi.name ?? "",
    city: Array.isArray(poi.cityname) ? poi.cityname[0] : poi.cityname,
    district: Array.isArray(poi.adname) ? poi.adname[0] : poi.adname,
    address: Array.isArray(poi.address) ? poi.address[0] : poi.address,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    rawStatus: data.status,
    rawInfo: data.info,
    observedAt
  };
}

function normalizeName(name) {
  return name
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/(武汉市|餐厅|饭店|酒楼|小吃|特色|品质|国际|美食|百汇|世家|老店|总店|分店|店)/g, "")
    .replace(/[·・\-_\s]/g, "")
    .trim()
    .toLowerCase();
}

function isInWuhan(longitude, latitude) {
  return longitude >= WUHAN_BOUNDS.minLongitude &&
    longitude <= WUHAN_BOUNDS.maxLongitude &&
    latitude >= WUHAN_BOUNDS.minLatitude &&
    latitude <= WUHAN_BOUNDS.maxLatitude;
}

function verify(ranking, poi) {
  const warnings = [];
  const hasCoordinate = typeof poi.longitude === "number" && typeof poi.latitude === "number";
  const rankingName = normalizeName(ranking.name);
  const poiName = normalizeName(poi.name);
  const nameMatches = Boolean(rankingName && poiName && (rankingName.includes(poiName) || poiName.includes(rankingName)));
  const cityText = [poi.city, poi.district, poi.address].filter(Boolean).join("");
  if (!poi.name) warnings.push("POI Detail 未返回门店名称。");
  if (!nameMatches && poi.name) warnings.push("榜单名称与 POI Detail 名称不一致。");
  if (!hasCoordinate) warnings.push("POI Detail 未返回坐标。");
  if (hasCoordinate && !isInWuhan(poi.longitude, poi.latitude)) warnings.push("POI 坐标超出武汉合理范围。");
  if (cityText && !/武汉|江岸|江汉|硚口|汉阳|武昌|青山|洪山|东西湖|汉南|蔡甸|江夏|黄陂|新洲/.test(cityText)) {
    warnings.push("POI 行政区不属于武汉。");
  }
  const status = hasCoordinate && nameMatches && isInWuhan(poi.longitude, poi.latitude) ? "verified" : (warnings.some((item) => /不一致|超出|不属于/.test(item)) ? "conflict" : "unverified");
  return {
    canonicalKey: `${normalizeName(ranking.name)}@${poi.district ?? ""}${poi.address ?? ""}` || ranking.poiId,
    duplicateGroupId: `amap:${normalizeName(ranking.name) || ranking.poiId}`,
    status,
    confidence: status === "verified" ? 0.86 : status === "conflict" ? 0.05 : 0.2,
    coordinateTrust: status === "verified" ? "high" : "none",
    evidence: [
      {
        source: "amap-ranking",
        url: ranking.url,
        observedName: ranking.name,
        observedAt: ranking.observedAt,
        independentSourceGroup: "amap"
      },
      {
        source: "amap-poi",
        observedName: poi.name || "",
        observedDistrict: poi.district,
        observedAddress: poi.address,
        observedCoordinate: hasCoordinate ? { longitude: poi.longitude, latitude: poi.latitude, accuracy: "exact" } : undefined,
        observedAt: poi.observedAt,
        independentSourceGroup: "amap"
      }
    ],
    warnings
  };
}

function recommendationToTs(ranking, poi, verification, crawledAt) {
  const hasCoordinate = verification.status === "verified" && typeof poi.longitude === "number" && typeof poi.latitude === "number";
  const district = poi.district || "待核验";
  const address = poi.address || "POI Detail 未返回可核验地址";
  const summary = ranking.summary || `高德武汉扫街榜公开页第 ${ranking.rank} 名。`;
  const rankingEvidence = {
    source: ranking.source,
    url: ranking.url,
    poiId: ranking.poiId,
    rank: ranking.rank,
    name: ranking.name,
    score: ranking.score,
    tags: ranking.tags,
    summary: ranking.summary,
    imageUrl: ranking.imageUrl,
    imageAlt: ranking.imageAlt,
    imageMatched: ranking.imageMatched,
    observedAt: ranking.observedAt
  };
  const imageEvidence = ranking.imageUrl ? {
    source: "amap-ranking-image",
    url: ranking.url,
    imageUrl: ranking.imageUrl,
    imageAlt: ranking.imageAlt || "",
    observedName: ranking.name,
    matched: Boolean(ranking.imageMatched),
    evidenceStatus: ranking.imageMatched ? "verified" : "mismatch",
    observedAt: ranking.observedAt
  } : undefined;
  return `  {
    source: "amap-scanlist",
    sourceId: "amap-wuhan-${ranking.poiId.toLowerCase()}",
    poiId: ${escapeString(ranking.poiId)},
    name: ${escapeString(ranking.name)},
    score: ${ranking.score},
    rank: ${ranking.rank},
    district: ${escapeString(district)},
    address: ${escapeString(address)},
    ${hasCoordinate ? `longitude: ${poi.longitude},\n    latitude: ${poi.latitude},` : ""}
    locationAccuracy: ${escapeString(hasCoordinate ? "exact" : "approximate")},
    tags: ${JSON.stringify([...ranking.tags.slice(0, 8), "高德扫街榜"], null, 4).replace(/\n/g, "\n    ")},
    summaryReview: ${escapeString(summary)},
    publicReviewSnippets: ${JSON.stringify([`全年综合分${ranking.score}。`], null, 4).replace(/\n/g, "\n    ")},
    ${imageEvidence?.matched ? `coverImageUrl: ${escapeString(imageEvidence.imageUrl)},\n    coverImageAlt: ${escapeString(imageEvidence.imageAlt || ranking.name)},\n    imageEvidence: ${JSON.stringify(imageEvidence, null, 4).replace(/\n/g, "\n    ")},` : ""}
    sourceUrl: ${escapeString(`${ranking.url}#${ranking.poiId}`)},
    crawledAt: ${escapeString(crawledAt)},
    rankingEvidence: ${JSON.stringify(rankingEvidence, null, 4).replace(/\n/g, "\n    ")},
    poiEvidence: ${JSON.stringify(poi, null, 4).replace(/\n/g, "\n    ")},
    verification: ${JSON.stringify(verification, null, 4).replace(/\n/g, "\n    ")}
  }`;
}

async function readManualVerifiedPins() {
  try {
    const source = await fs.readFile(MANUAL_VERIFIED_PATH, "utf8");
    const pins = new Map();
    const blockRegex = /([A-Z0-9]+):\s*\{([\s\S]*?)\n\s*\},?/g;
    let match;
    while ((match = blockRegex.exec(source)) !== null) {
      const [, key, block] = match;
      const poiId = block.match(/poiId:\s*"([^"]+)"/)?.[1] ?? key;
      pins.set(poiId, {
        poiId,
        district: block.match(/district:\s*"([^"]+)"/)?.[1],
        address: block.match(/address:\s*"([^"]+)"/)?.[1],
        coordinateTrust: block.match(/coordinateTrust:\s*"([^"]+)"/)?.[1] ?? "high",
        evidenceUrl: block.match(/evidenceUrl:\s*"([^"]+)"/)?.[1],
        accuracy: block.match(/accuracy:\s*"([^"]+)"/)?.[1] ?? "exact"
      });
    }
    return pins;
  } catch {
    return new Map();
  }
}

async function readBaselineRows() {
  try {
    const source = await fs.readFile(OUTPUT_PATH, "utf8");
    const rows = [];
    const blockRegex = /\{\s*source:\s*"amap-scanlist"[\s\S]*?\n\s*\}/g;
    let match;
    while ((match = blockRegex.exec(source)) !== null) {
      const block = match[0];
      const poiId = block.match(/poiId:\s*"([^"]+)"/)?.[1];
      const name = block.match(/name:\s*"([^"]+)"/)?.[1];
      const longitudeText = block.match(/longitude:\s*([0-9.]+)/)?.[1];
      const latitudeText = block.match(/latitude:\s*([0-9.]+)/)?.[1];
      if (poiId && name) {
        rows.push({
          poiId,
          name,
          longitude: longitudeText ? Number(longitudeText) : undefined,
          latitude: latitudeText ? Number(latitudeText) : undefined
        });
      }
    }
    return rows;
  } catch {
    return [];
  }
}

function finalVerificationStatus(item, manualVerifiedPins) {
  return manualVerifiedPins.has(item.poiId) ? "verified_manual_overlay" : item.verification.status;
}

function distanceMeters(a, b) {
  if (typeof a.longitude !== "number" || typeof a.latitude !== "number" || typeof b.longitude !== "number" || typeof b.latitude !== "number") return 0;
  const toRadians = (degrees) => degrees * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function getDiffStatus(item, baselineByPoiId, manualVerifiedPins) {
  const baseline = baselineByPoiId.get(item.poiId);
  const finalStatus = finalVerificationStatus(item, manualVerifiedPins);
  if (item.verification.status === "conflict") return "conflict";
  if (!baseline) return finalStatus.startsWith("verified") ? "new" : "pending";
  if (normalizeName(baseline.name) && normalizeName(item.name) && normalizeName(baseline.name) !== normalizeName(item.name)) return "renamed";
  if (distanceMeters(baseline, item) > 500) return "moved";
  return finalStatus.startsWith("verified") ? "unchanged" : "pending";
}

function getAdmissionDecision(item, diffStatus, manualVerifiedPins) {
  const finalStatus = finalVerificationStatus(item, manualVerifiedPins);
  if (diffStatus === "conflict" || diffStatus === "moved") return "manual-review";
  if (diffStatus === "pending") return "blocked";
  return finalStatus.startsWith("verified") ? "accepted" : "blocked";
}

function buildRemovedRows(recommendations, baselineRows) {
  const refreshedIds = new Set(recommendations.map((item) => item.poiId));
  return baselineRows.filter((item) => !refreshedIds.has(item.poiId));
}

function buildReport(recommendations, observedAt, manualVerifiedPins, baselineRows) {
  const baselineByPoiId = new Map(baselineRows.map((item) => [item.poiId, item]));
  const removedRows = buildRemovedRows(recommendations, baselineRows);
  const verified = recommendations.filter((item) => finalVerificationStatus(item, manualVerifiedPins).startsWith("verified"));
  const conflicts = recommendations.filter((item) => item.verification.status === "conflict");
  const unverified = recommendations.filter((item) => finalVerificationStatus(item, manualVerifiedPins) === "unverified");
  const imageVerified = recommendations.filter((item) => item.imageMatched).length;
  const diffCounts = { new: 0, removed: removedRows.length, renamed: 0, moved: 0, unchanged: 0, conflict: 0, pending: 0 };
  const rows = recommendations.map((item) => {
    const finalStatus = finalVerificationStatus(item, manualVerifiedPins);
    const manualPin = manualVerifiedPins.get(item.poiId);
    const reportDistrict = manualPin?.district ?? item.district;
    const reportAddress = manualPin?.address ?? item.address;
    const reportTrust = manualPin?.coordinateTrust ?? item.verification.coordinateTrust;
    const reportEvidence = manualPin?.evidenceUrl ? `；覆盖层证据：${manualPin.evidenceUrl}` : "";
    const diffStatus = getDiffStatus(item, baselineByPoiId, manualVerifiedPins);
    diffCounts[diffStatus] += 1;
    const admissionDecision = getAdmissionDecision(item, diffStatus, manualVerifiedPins);
    const risk = finalStatus === "verified_manual_overlay" ? `公开地图地点页人工复核通过${reportEvidence}` : (item.verification.warnings.join("；") || "通过");
    const imageStatus = item.imageMatched ? "图片 alt 与门店名匹配" : "未通过";
    return `| ${item.rank} | ${item.name} | ${item.poiId} | ${finalStatus} | ${diffStatus} | ${admissionDecision} | ${item.verification.duplicateGroupId} | ${reportTrust} | ${reportDistrict} | ${reportAddress} | ${imageStatus} | ${REFRESH_MODE === "apply" && admissionDecision === "accepted" ? "true" : "false"} | ${risk} |`;
  }).join("\n");
  const removedDetailRows = removedRows.map((item) => `| - | ${item.name} | ${item.poiId} | baseline_only | removed | manual-review | - | - | - | - | - | false | 当前刷新未抓取到该基线 POI，不能自动下架。 |`).join("\n");
  return `# 高德扫街榜刷新报告

刷新时间：${observedAt}

来源：${RANKING_URL}

刷新模式：${REFRESH_MODE}

抓取范围：

${RANKING_SOURCE_URLS.map((url) => `- ${url}`).join("\n")}

## 摘要

- 榜单条目：${recommendations.length}
- 目标条目：${TARGET_RECOMMENDATION_COUNT}
- 当前基线条目：${baselineRows.length}
- 已核验可上图：${verified.length}
- 待核验不上图：${unverified.length}
- 冲突已隐藏：${conflicts.length}
- 图片核验通过：${imageVerified}
- Diff 新增：${diffCounts.new}
- Diff 下架候选：${diffCounts.removed}
- Diff 改名候选：${diffCounts.renamed}
- Diff 迁址候选：${diffCounts.moved}
- Diff 未变化：${diffCounts.unchanged}
- Diff 冲突：${diffCounts.conflict}
- Diff 待核验：${diffCounts.pending}
- 人工复核覆盖层：${MANUAL_VERIFIED_PATH}
- dry-run 行为：只写审计报告，不修改生成推荐数据
- apply 行为：仅通过准入且无冲突的项可更新生成推荐数据

## 明细

| 排名 | 门店 | POI ID | 状态 | Diff | 准入 | 重复组 | 坐标信任 | 区域 | 地址 | 图片 | 地图数据改动 | 风险 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}
${removedDetailRows ? `\n${removedDetailRows}` : ""}
`;
}

async function main() {
  const observedAt = new Date().toISOString();
  const rankings = await fetchRankingCards(observedAt);
  if (rankings.length === 0) throw new Error("No ranking cards parsed from AMap ranking page");
  const manualVerifiedPins = await readManualVerifiedPins();
  const baselineRows = await readBaselineRows();
  const recommendations = [];
  for (const ranking of rankings) {
    const poi = await fetchPoiDetail(ranking.poiId, observedAt);
    const verification = verify(ranking, poi);
    recommendations.push({
      ...ranking,
      district: poi.district || "待核验",
      address: poi.address || "POI Detail 未返回可核验地址",
      poi,
      verification
    });
  }
  const ts = `import type { AmapScanlistRecommendation } from "./types";

export const AMAP_WUHAN_SCANLIST: AmapScanlistRecommendation[] = [
${recommendations.map((item) => recommendationToTs(item, item.poi, item.verification, observedAt)).join(",\n")}
];
`;
  if (REFRESH_MODE === "apply") {
    await fs.writeFile(OUTPUT_PATH, ts);
  }
  await fs.writeFile(REPORT_PATH, buildReport(recommendations, observedAt, manualVerifiedPins, baselineRows));
  console.log(REFRESH_MODE === "apply" ? `Generated ${OUTPUT_PATH} and ${REPORT_PATH}` : `Generated dry-run audit ${REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
