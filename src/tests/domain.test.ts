import { describe, expect, it } from "vitest";
import { DEFAULT_LAYERS } from "../domain/sampleData";
import { EMPTY_FILTER, filterPlaces } from "../domain/filters";
import type { FoodPlace } from "../domain/types";
import { decodeSnapshotFile, encodeSnapshot } from "../persistence/importExportCodec";
import { AMAP_WUHAN_SCANLIST } from "../recommendations/amapWuhanScanlist";
import { recommendationToFoodPlace } from "../recommendations/recommendationUtils";
import {
  evaluateRecommendation,
  findSemanticDuplicateGroups,
  getMappableRecommendations,
  normalizePlaceName
} from "../recommendations/verification";
import type { AmapScanlistRecommendation } from "../recommendations/types";

const place: FoodPlace = {
  id: "p1",
  name: "南门面馆",
  longitude: 116.4,
  latitude: 39.9,
  city: "北京",
  layerId: "layer-must-eat",
  tags: ["午餐", "旅行"],
  rating: 5,
  visitedAt: "2026-06-01",
  notes: "汤底清爽",
  photoIds: [],
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z"
};

describe("FoodMap domain", () => {
  it("seeds V1 default layers", () => {
    expect(DEFAULT_LAYERS).toHaveLength(5);
    expect(DEFAULT_LAYERS.map((layer) => layer.name)).toContain("必吃餐厅");
  });

  it("filters by keyword, tag and rating", () => {
    const result = filterPlaces([place], DEFAULT_LAYERS, {
      ...EMPTY_FILTER,
      keyword: "面馆",
      tags: ["旅行"],
      minRating: 5
    });
    expect(result).toEqual([place]);
  });

  it("rejects invalid import payload", () => {
    expect(() => decodeSnapshotFile(JSON.stringify({ schema: "wrong" }))).toThrow();
  });

  it("round trips snapshot export payload", () => {
    const text = encodeSnapshot({
      id: "s1",
      title: "测试快照",
      places: [place],
      layers: DEFAULT_LAYERS,
      photos: [],
      exportedAt: "2026-06-01T00:00:00.000Z"
    });
    expect(decodeSnapshotFile(text).places[0].name).toBe("南门面馆");
  });
});

describe("recommendation verification", () => {
  const candidate: AmapScanlistRecommendation = {
    source: "amap-scanlist",
    sourceId: "candidate-1",
    poiId: "B0JUBRFQAV",
    name: "万松小院(荷花垄店)",
    score: 4.78,
    rank: 20,
    district: "江汉区",
    address: "武汉市江汉区中山公园附近",
    longitude: 114.26,
    latitude: 30.58,
    locationAccuracy: "approximate",
    tags: ["高德扫街榜"],
    summaryReview: "候选数据",
    publicReviewSnippets: [],
    sourceUrl: "https://www.amap.com/ranking/wuhan#B0JUBRFQAV",
    crawledAt: "2026-06-04T00:00:00.000Z",
    rankingEvidence: {
      source: "amap-ranking",
      url: "https://www.amap.com/ranking/wuhan",
      poiId: "B0JUBRFQAV",
      rank: 20,
      name: "万松小院(荷花垄店)",
      score: 4.78,
      tags: ["高德扫街榜"],
      observedAt: "2026-06-04T00:00:00.000Z"
    },
    verification: {
      canonicalKey: "万松小院@江汉中山公园",
      duplicateGroupId: "wuhan-wansongxiaoyuan",
      status: "unverified",
      confidence: 0.2,
      coordinateTrust: "low",
      evidence: [],
      warnings: ["仅榜单候选，未通过坐标核验"]
    }
  };

  it("normalizes branch-heavy names for semantic dedupe", () => {
    expect(normalizePlaceName("万松小院(荷花垄店)")).toBe("万松小院");
    expect(normalizePlaceName("万松小院（万松园店）")).toBe("万松小院");
  });

  it("keeps unverified candidates off map pins", () => {
    expect(evaluateRecommendation(candidate).mappable).toBe(false);
  });

  it("rejects converting unverified candidates into personal places", () => {
    expect(() => recommendationToFoodPlace(candidate, DEFAULT_LAYERS[0].id)).toThrow("未通过坐标核验");
  });

  it("groups semantic duplicates with the same duplicate id", () => {
    const duplicate = {
      ...candidate,
      sourceId: "candidate-2",
      name: "万松小院（万松园店）",
      verification: {
        canonicalKey: "万松小院@江汉中山公园",
        duplicateGroupId: "wuhan-wansongxiaoyuan",
        status: "single_source" as const,
        confidence: 0.5,
        coordinateTrust: "low" as const,
        evidence: [],
        warnings: ["仅单源"]
      }
    };
    const primary = {
      ...candidate,
      verification: {
        ...duplicate.verification,
        canonicalKey: "万松小院@江汉荷花垄"
      }
    };
    expect(findSemanticDuplicateGroups([primary, duplicate]).get("wuhan-wansongxiaoyuan")).toHaveLength(2);
  });

  it("keeps the real Wuhan scanlist baseline fully verified and mappable", () => {
    expect(AMAP_WUHAN_SCANLIST).toHaveLength(50);
    expect(getMappableRecommendations(AMAP_WUHAN_SCANLIST)).toHaveLength(50);

    for (const recommendation of AMAP_WUHAN_SCANLIST) {
      const decision = evaluateRecommendation(recommendation);
      const sourceGroups = new Set(recommendation.verification.evidence.map((item) => item.independentSourceGroup));

      expect(decision.mappable, recommendation.name).toBe(true);
      expect(sourceGroups.size, recommendation.name).toBeGreaterThanOrEqual(2);
      expect(recommendation.verification.coordinateTrust, recommendation.name).not.toMatch(/^(none|low)$/);
      expect(typeof recommendation.longitude, recommendation.name).toBe("number");
      expect(typeof recommendation.latitude, recommendation.name).toBe("number");
      expect(recommendation.coverImageUrl, recommendation.name).toBeTruthy();
      expect(recommendation.imageEvidence?.matched, recommendation.name).toBe(true);
    }
  });
});
