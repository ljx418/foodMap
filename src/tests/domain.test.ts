import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LAYERS } from "../domain/sampleData";
import { collectTags, EMPTY_FILTER, filterPlaces } from "../domain/filters";
import { gcj02ToWgs84, toMapDisplayPoint, wgs84ToGcj02 } from "../domain/coordinates";
import { assessCoordinateRisk, isLikelyWaterCoordinate } from "../domain/coordinateRisk";
import { getExternalMapCandidatesForPlace } from "../domain/externalMapCandidates";
import { buildExternalMapLink, buildExternalMapSearchFallback } from "../domain/externalMapLinks";
import { deriveLocationStatus, derivePersonalDataHealthReport, getLocationStatusBadges, getUserFacingTags } from "../domain/locationStatus";
import { searchAmapPlaceCandidates } from "../domain/liveMapSearch";
import { applyManualPinMove, canManuallyMovePlace } from "../domain/manualPinMove";
import { buildPosterSourceSet, createMapPosterSvg, filterPlacesByViewport } from "../domain/mapPoster";
import { buildCalibrationCandidates, candidateSolidifiesPrecisePlace, confirmPlaceCandidate } from "../domain/placeCalibration";
import { normalizeAgentCandidates, parsePlaceCandidatesFromText, rankPlaceCandidates } from "../domain/placeRecognition";
import { searchPlaceCandidates } from "../domain/placeSearch";
import { describeUserLocation, userLocationToPoint } from "../domain/userLocation";
import {
  DINGTUYI_SHARE_LAYER_ID,
  DINGTUYI_WUHAN_FOOD_MARKERS,
  dingtuyiMarkerToMapPlace,
  sourceIdFromDingtuyiMapId
} from "../externalShares/dingtuyiWuhanFoodShare";
import { groupsFromTags, tagsFromGroups } from "../domain/tagGroups";
import { findDuplicatePlaceWarning } from "../domain/duplicates";
import type { FoodPlace } from "../domain/types";
import { decodeSnapshotFile, encodeSnapshot, summarizeSnapshot, validateSnapshotPackageText } from "../persistence/importExportCodec";
import { AMAP_WUHAN_SCANLIST } from "../recommendations/amapWuhanScanlist";
import { recommendationToFoodPlace, recommendationToMapPlace } from "../recommendations/recommendationUtils";
import {
  evaluateRecommendation,
  findSemanticDuplicateGroups,
  getMappableRecommendations,
  normalizePlaceName
} from "../recommendations/verification";
import type { AmapScanlistRecommendation } from "../recommendations/types";
import { classifyRefreshDiff } from "../recommendations/refreshDiff";
import { getImageEvidenceView } from "../recommendations/evidence";
import { filterRecommendations } from "../recommendations/filters";
import { getRecommendationFilterTags } from "../recommendations/tags";
import {
  deriveGovernanceIssueGroups,
  deriveGovernanceReport,
  journalEntryForImport,
  previewDuplicateDecision,
  planGovernanceBatchAction,
  planImportConflicts,
  previewPlaceMerge,
  setImportConflictStrategy,
  suggestDuplicatePlaces
} from "../domain/governance";
import {
  MAP_ADMITTED_PERSONAL_FAVORITE_PINS,
  MAP_READY_PERSONAL_FAVORITE_PINS,
  PENDING_PERSONAL_FAVORITES,
  PERSONAL_FAVORITE_ENTRIES,
  personalScoreToRating,
  SELECTED_PERSONAL_FAVORITE_PINS,
  verifiedFavoriteToFoodPlace,
  VERIFIED_PERSONAL_FAVORITE_PINS
} from "../personalFavorites/wuhanPersonalFavorites";

afterEach(() => {
  vi.unstubAllGlobals();
});

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
    expect(DEFAULT_LAYERS).toHaveLength(6);
    expect(DEFAULT_LAYERS.map((layer) => layer.name)).toContain("必吃餐厅");
    expect(DEFAULT_LAYERS.map((layer) => layer.name)).toContain("我的收藏");
  });

  it("maps supplied Wuhan personal favorites with verified versus calibration admission", () => {
    expect(VERIFIED_PERSONAL_FAVORITE_PINS).toHaveLength(11);
    expect(SELECTED_PERSONAL_FAVORITE_PINS).toHaveLength(32);
    expect(new Set(SELECTED_PERSONAL_FAVORITE_PINS.map((pin) => pin.id)).size).toBe(32);
    expect(MAP_ADMITTED_PERSONAL_FAVORITE_PINS).toHaveLength(32);
    expect(MAP_READY_PERSONAL_FAVORITE_PINS.map((pin) => pin.name)).toEqual(["夏氏砂锅(总店)"]);
    expect(MAP_READY_PERSONAL_FAVORITE_PINS.every((pin) => pin.coordinateAccuracy === "exact")).toBe(true);
    expect(PENDING_PERSONAL_FAVORITES).toHaveLength(3);
    expect(personalScoreToRating(96, true)).toBe(4.4);
    expect(personalScoreToRating(83, true)).toBe(2.6);
    expect(personalScoreToRating(73, true)).toBe(1.1);
    expect(isLikelyWaterCoordinate({ longitude: 114.3099, latitude: 30.5992 })).toBe(true);
    const crazyones = verifiedFavoriteToFoodPlace(SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "crazyones-wuhan-tiandi")!);
    expect(crazyones.address).toContain("陆地区域");
    expect(crazyones.longitude).toBe(114.3036);
    expect(crazyones.latitude).toBe(30.6072);
    expect(crazyones.tags).toEqual(expect.arrayContaining(["待校准", "近似坐标", "位置待确认", "位置高风险", "陆地点修正", "默认候选"]));
    expect(isLikelyWaterCoordinate(crazyones)).toBe(false);
    expect(assessCoordinateRisk(crazyones).level).toBe("warning");
    const goya = verifiedFavoriteToFoodPlace(SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "goya")!);
    expect(goya.address).toContain("公开搜索未稳定命中");
    expect(goya.tags).toEqual(expect.arrayContaining(["待校准", "近似坐标", "位置待确认", "位置高风险", "默认候选"]));
    expect(assessCoordinateRisk(goya).level).toBe("warning");
    const xiashi = verifiedFavoriteToFoodPlace(SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "xiashi-casserole")!);
    expect(xiashi.name).toBe("夏氏砂锅(总店)");
    expect(xiashi.layerId).toBe("layer-personal-favorites");
    expect(xiashi.coordinateSystem).toBe("wgs84");
    expect(xiashi.rating).toBe(4);
    expect(xiashi.tags).toEqual(expect.arrayContaining(["吃过", "砂锅", "湖北菜", "精确坐标"]));
    expect(xiashi.tags).not.toContain("百分制93");
    expect(xiashi.notes).toContain("个人百分制评分：93");
    expect(xiashi.notes).toContain("五分制折算：4.0 星");
    const xiaoyu = SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "xiaoyu-bbq")!;
    expect(xiaoyu.name).toBe("小宇炭烤(江欣苑路店)");
    expect(xiaoyu.address).toContain("江欣苑路墨水湖片区");
    expect(xiaoyu.longitude).toBe(114.249);
    expect(xiaoyu.latitude).toBe(30.526);
    expect(xiaoyu.confidence).toBeLessThan(0.75);
    const xiaoyuPlace = verifiedFavoriteToFoodPlace(xiaoyu);
    expect(xiaoyuPlace.tags).toEqual(expect.arrayContaining(["待校准", "近似坐标"]));
    expect(xiaoyuPlace.notes).toContain("不作为精确导航依据");
    const calibrationCandidates = buildCalibrationCandidates({ place: xiaoyuPlace, places: [xiaoyuPlace, xiashi] });
    expect(calibrationCandidates.length).toBeGreaterThanOrEqual(1);
    expect(calibrationCandidates.length).toBeLessThanOrEqual(10);
    expect(calibrationCandidates[0].name).toBe("小宇炭烤(江欣苑路店)");
    expect(candidateSolidifiesPrecisePlace(calibrationCandidates[0])).toBe(false);
    expect(SELECTED_PERSONAL_FAVORITE_PINS.map((pin) => pin.name)).toEqual(expect.arrayContaining(["寿司郎(王家湾店)", "笨萝卜浏阳菜馆(江汉路马客茂店)"]));
    expect(PENDING_PERSONAL_FAVORITES.map((item) => item.name)).toEqual(expect.arrayContaining(["永信海鲜", "川胖子", "老油碟三拖一火锅"]));
  });

  it("adds web map evidence candidates to pending personal favorite calibration", () => {
    const xiti = verifiedFavoriteToFoodPlace(SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "xiti-steak")!);
    const providerResults = getExternalMapCandidatesForPlace(xiti);
    expect(providerResults.length).toBeGreaterThanOrEqual(2);
    expect(providerResults[0]).toMatchObject({
      provider: "amap",
      coordinateSystem: "wgs84",
      sourceUrl: expect.stringContaining("amap.com")
    });
    const candidates = buildCalibrationCandidates({ place: xiti, places: [xiti], mapProviderResults: providerResults });
    expect(candidates[0].source).toBe("map-provider");
    expect(candidates[0].evidenceUrl).toContain("amap.com");
    expect(candidates[0].screenshotPath).toContain("web-map-candidates");
    expect(candidates[0].requiresUserConfirmation).toBe(true);
    expect(candidates[0].matchSignals).toEqual(expect.arrayContaining(["用户补充武汉国广附近"]));
    expect(candidates[0].lastCheckedAt).toBe("2026-06-16");
    expect(candidateSolidifiesPrecisePlace(candidates[0])).toBe(true);
  });

  it("turns pure frontend AMap place search results into confirmable map-provider candidates", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      expect(url).toContain("https://restapi.amap.com/v3/place/text?");
      const params = new URL(url).searchParams;
      expect(params.get("keywords")).toBe("西提牛排 武汉国广");
      expect(params.get("city")).toBe("武汉");
      expect(params.get("citylimit")).toBe("true");
      return {
        ok: true,
        json: async () => ({
          status: "1",
          pois: [
            {
              id: "B0TEST001",
              name: "西提牛排(武汉国广店)",
              address: "解放大道690号武汉国际广场C座",
              location: "114.267120,30.581200",
              cityname: "武汉市",
              adname: "江汉区",
              type: "餐饮服务"
            }
          ]
        })
      } as Response;
    }));
    const xiti = verifiedFavoriteToFoodPlace(SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "xiti-steak")!);
    const candidates = await searchAmapPlaceCandidates({
      apiKey: "test-key",
      query: "西提牛排 武汉国广",
      place: xiti,
      historyPlaces: [xiti]
    });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      source: "map-provider",
      sourceLabel: "高德地图",
      name: "西提牛排(武汉国广店)",
      address: "解放大道690号武汉国际广场C座",
      coordinateSystem: "gcj02",
      coordinateAccuracy: "exact",
      requiresUserConfirmation: true,
      matchSignals: expect.arrayContaining(["高德搜索排序 #1", "行政区 江汉区", "类型 餐饮服务"])
    });
    expect(candidateSolidifiesPrecisePlace(candidates[0])).toBe(true);
  });

  it("builds no-key external map search fallback links for pending places", () => {
    const fallback = buildExternalMapSearchFallback({
      name: "西提牛排(武汉国广候选)",
      address: "江汉区武汉国际广场",
      city: "武汉"
    });
    expect(fallback.copyText).toContain("西提牛排");
    expect(fallback.copyText).toContain("江汉区武汉国际广场");
    expect(fallback.links.map((link) => link.label)).toEqual(["高德网页地图", "百度地图", "Apple Maps"]);
    expect(fallback.links[0].href).toContain("amap.com/search");
    expect(fallback.links[1].href).toContain("map.baidu.com/search");
  });

  it("manually moves personal favorite pins and records an audit trail", () => {
    const xiti = verifiedFavoriteToFoodPlace(SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "xiti-steak")!);
    const xiashi = verifiedFavoriteToFoodPlace(SELECTED_PERSONAL_FAVORITE_PINS.find((pin) => pin.id === "xiashi-casserole")!);
    expect(canManuallyMovePlace(xiti)).toBe(true);
    expect(canManuallyMovePlace(xiashi)).toBe(true);
    const moved = applyManualPinMove(xiti, { longitude: 114.266001, latitude: 30.581901 }, "2026-06-12T10:00:00.000+08:00");
    expect(moved.longitude).toBe(114.266001);
    expect(moved.latitude).toBe(30.581901);
    expect(moved.coordinateSystem).toBe("wgs84");
    expect(moved.mapAccuracy).toBe("exact");
    expect(moved.tags).toEqual(expect.arrayContaining(["已核验", "精确坐标", "手动校准"]));
    expect(moved.tags).not.toEqual(expect.arrayContaining(["待校准", "近似坐标"]));
    expect(moved.notes).toContain("用户手动拖动图钉校准");
    expect(moved.notes).toContain("原坐标");
    const movedExact = applyManualPinMove(xiashi, { longitude: 114.27, latitude: 30.59 }, "2026-06-12T10:05:00.000+08:00");
    expect(movedExact.tags).toEqual(expect.arrayContaining(["已核验", "精确坐标", "手动校准"]));
    expect(movedExact.mapAccuracy).toBe("exact");
  });

  it("confirms precise place candidates through a shared domain transform", () => {
    const pendingPlace: FoodPlace = {
      ...place,
      id: "candidate-confirm-pending",
      name: "待确认候选店",
      longitude: 114.2,
      latitude: 30.5,
      city: "武汉",
      tags: ["待校准", "近似坐标", "位置待确认", "位置高风险"],
      mapAccuracy: "approximate"
    };
    const next = confirmPlaceCandidate(pendingPlace, {
      id: "candidate-exact",
      name: "候选精确店",
      address: "武汉市江汉区精确路 1 号",
      city: "武汉",
      longitude: 114.31,
      latitude: 30.59,
      coordinateSystem: "gcj02",
      tags: ["湖北菜"],
      source: "map-provider",
      sourceLabel: "高德地图",
      confidence: 0.88,
      coordinateAccuracy: "exact",
      reasons: ["地图候选"]
    }, "2026-06-23T12:00:00.000+08:00");

    expect(next.name).toBe("候选精确店");
    expect(next.longitude).toBe(114.31);
    expect(next.latitude).toBe(30.59);
    expect(next.coordinateSystem).toBe("gcj02");
    expect(next.mapAccuracy).toBe("exact");
    expect(next.tags).toEqual(expect.arrayContaining(["已核验", "精确坐标", "湖北菜", "高德地图"]));
    expect(next.tags).not.toEqual(expect.arrayContaining(["待校准", "近似坐标", "位置待确认", "位置高风险"]));
    expect(next.notes).toContain("候选确认固化：候选精确店");
  });

  it("keeps approximate confirmed candidates pending instead of silently verifying them", () => {
    const pendingPlace: FoodPlace = {
      ...place,
      id: "candidate-confirm-approx",
      name: "待确认近似店",
      longitude: 114.2,
      latitude: 30.5,
      city: "武汉",
      tags: ["待校准", "近似坐标", "位置待确认"],
      mapAccuracy: "approximate"
    };
    const next = confirmPlaceCandidate(pendingPlace, {
      id: "candidate-approx",
      name: "候选近似店",
      city: "武汉",
      longitude: 114.21,
      latitude: 30.51,
      tags: [],
      source: "manual",
      sourceLabel: "当前待校准图钉",
      confidence: 0.64,
      coordinateAccuracy: "approximate",
      reasons: ["当前坐标仅作为上图占位"]
    }, "2026-06-23T12:05:00.000+08:00");

    expect(next.mapAccuracy).toBe("approximate");
    expect(next.tags).toEqual(expect.arrayContaining(["待校准", "近似坐标", "当前待校准图钉"]));
    expect(next.tags).not.toEqual(expect.arrayContaining(["已核验", "精确坐标"]));
    expect(next.notes).toContain("仍需校准");
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

  it("keeps system location status out of user-facing tag filters", () => {
    const noisyPlace: FoodPlace = {
      ...place,
      tags: ["吃过", "湖北菜", "位置高风险", "待校准", "近似坐标", "默认候选"],
      mapAccuracy: "approximate"
    };

    expect(getUserFacingTags(noisyPlace.tags)).toEqual(["吃过", "湖北菜"]);
    expect(collectTags([noisyPlace])).toEqual(["吃过", "湖北菜"]);
    expect(getLocationStatusBadges(noisyPlace)).toEqual(expect.arrayContaining([
      { label: "高风险位置", tone: "danger" },
      { label: "近似坐标", tone: "neutral" }
    ]));
  });

  it("derives personal data health groups without mutating places", () => {
    const verified: FoodPlace = {
      ...place,
      id: "health-verified",
      tags: ["已核验", "精确坐标"],
      mapAccuracy: "exact"
    };
    const pending: FoodPlace = {
      ...place,
      id: "health-pending",
      tags: ["待校准", "近似坐标", "位置待确认"],
      mapAccuracy: "approximate"
    };
    const highRisk: FoodPlace = {
      ...place,
      id: "health-high-risk",
      longitude: 114.31,
      latitude: 30.59,
      tags: ["位置高风险", "待校准"],
      mapAccuracy: "approximate"
    };
    const manualAdjusted: FoodPlace = {
      ...place,
      id: "health-manual",
      tags: ["已核验", "精确坐标", "手动校准"],
      mapAccuracy: "exact",
      notes: "用户手动拖动图钉校准。原坐标 114.1,30.1"
    };
    const skipped: FoodPlace = {
      ...place,
      id: "health-skipped",
      tags: ["暂时跳过", "位置待确认"],
      mapAccuracy: "approximate",
      notes: "待确认处理：用户暂时跳过。"
    };
    const original = JSON.stringify([verified, pending, highRisk, manualAdjusted, skipped]);
    const report = derivePersonalDataHealthReport([verified, pending, highRisk, manualAdjusted, skipped]);

    expect(report.total).toBe(5);
    expect(report.verified.map((item) => item.id)).toEqual(["health-verified", "health-manual"]);
    expect(report.pending.map((item) => item.id)).toEqual(expect.arrayContaining(["health-pending", "health-high-risk", "health-skipped"]));
    expect(report.highRisk.map((item) => item.id)).toEqual(expect.arrayContaining(["health-high-risk"]));
    expect(report.manualAdjusted.map((item) => item.id)).toEqual(["health-manual"]);
    expect(report.skipped.map((item) => item.id)).toEqual(["health-skipped"]);
    expect(JSON.stringify([verified, pending, highRisk, manualAdjusted, skipped])).toBe(original);
  });

  it("supports source and distance filters for personal places", () => {
    expect(filterPlaces([place], DEFAULT_LAYERS, { ...EMPTY_FILTER, source: "recommendation" })).toHaveLength(0);
    expect(
      filterPlaces([place], DEFAULT_LAYERS, {
        ...EMPTY_FILTER,
        distanceCenter: { longitude: 116.4001, latitude: 39.9001 },
        distanceKm: 1
      })
    ).toEqual([place]);
  });

  it("normalizes structured tag groups and filters by grouped tags", () => {
    const tagGroups = groupsFromTags(["朋友聚餐"], {
      visitStatus: "eaten",
      review: ["夯"],
      cuisine: ["炭烤"],
      custom: []
    });
    const taggedPlace = { ...place, tags: tagsFromGroups(tagGroups), tagGroups };
    expect(taggedPlace.tags).toEqual(expect.arrayContaining(["吃过", "夯", "炭烤", "朋友聚餐"]));
    expect(filterPlaces([taggedPlace], DEFAULT_LAYERS, { ...EMPTY_FILTER, visitStatuses: ["eaten"], reviewTags: ["夯"], cuisineTags: ["炭烤"] })).toEqual([taggedPlace]);
  });

  it("filters personal places by verification status", () => {
    const verified = { ...place, id: "verified-place", tags: ["已核验", "精确坐标"], mapAccuracy: "exact" as const };
    const pending = { ...place, id: "pending-place", tags: ["待校准", "近似坐标"], mapAccuracy: "approximate" as const };
    const skipped = { ...place, id: "skipped-place", tags: ["暂时跳过", "位置待确认"], mapAccuracy: "approximate" as const };
    const blocked = { ...place, id: "blocked-place", tags: ["位置高风险"], mapAccuracy: "approximate" as const };
    expect(filterPlaces([verified, pending], DEFAULT_LAYERS, { ...EMPTY_FILTER, verificationStatus: "verified" })).toEqual([verified]);
    expect(filterPlaces([verified, pending, skipped, blocked], DEFAULT_LAYERS, { ...EMPTY_FILTER, verificationStatus: "pending" })).toEqual([pending, skipped, blocked]);
    expect(filterPlaces([verified, pending, skipped, blocked], DEFAULT_LAYERS, { ...EMPTY_FILTER, verificationStatus: "approximate" })).toEqual([pending, skipped, blocked]);
    expect(deriveLocationStatus(verified)).toBe("verified");
    expect(deriveLocationStatus(pending)).toBe("pending");
    expect(deriveLocationStatus(skipped)).toBe("skipped");
    expect(deriveLocationStatus(blocked)).toBe("blocked");
  });

  it("extracts and ranks place candidates from intro text", () => {
    const candidates = parsePlaceCandidatesFromText({
      text: "店名：小院炭烤\n地址：武汉市江汉区中山公园附近\n夯，下次还来",
      point: { longitude: 114.26, latitude: 30.58 },
      historyPlaces: [place]
    });
    const ranked = rankPlaceCandidates(candidates, { point: { longitude: 114.2601, latitude: 30.5801 }, historyPlaces: [place] });
    expect(ranked[0].name).toBe("小院炭烤");
    expect(ranked[0].tags).toEqual(expect.arrayContaining(["炭烤", "夯", "下次还来"]));
    expect(ranked[0].reasons.join(" ")).toContain("识别到地址");
  });

  it("aggregates explainable P16 candidates from history, scanlist, text and Agent sources", () => {
    const historyA: FoodPlace = {
      ...place,
      id: "wuhan-history-a",
      name: "万松小院",
      address: "武汉市江汉区中山公园附近",
      city: "武汉",
      longitude: 114.266,
      latitude: 30.588,
      tags: ["湖北菜", "想吃"]
    };
    const historyB: FoodPlace = {
      ...place,
      id: "wuhan-history-b",
      name: "万松小院",
      address: "武汉市武昌区水果湖附近",
      city: "武汉",
      longitude: 114.344,
      latitude: 30.555,
      tags: ["湖北菜", "朋友聚餐"]
    };
    const result = searchPlaceCandidates({
      text: "万松小院",
      point: { longitude: 114.265, latitude: 30.587 },
      historyPlaces: [historyA, historyB],
      agentPayload: {
        candidates: [{
          name: "万松小院 Agent 候选",
          address: "武汉市江汉区银松路附近",
          city: "武汉",
          longitude: 114.267,
          latitude: 30.589,
          confidence: 0.8,
          reasons: ["Agent 结构化识别"]
        }]
      }
    });
    expect(result.candidates.length).toBeGreaterThanOrEqual(3);
    expect(result.candidates.map((candidate) => candidate.source)).toEqual(expect.arrayContaining(["history", "agent"]));
    expect(result.candidates[0]).toMatchObject({
      sourceLabel: expect.any(String),
      coordinateAccuracy: expect.any(String),
      reasons: expect.any(Array)
    });
    expect(result.candidates.some((candidate) => candidate.name.includes("万松小院") && candidate.address?.includes("中山公园"))).toBe(true);
    expect(result.candidates.some((candidate) => candidate.name.includes("万松小院") && candidate.address?.includes("水果湖"))).toBe(true);
  });

  it("uses verified scanlist entries as real-data P16 candidates", () => {
    const result = searchPlaceCandidates({
      text: "刘聋子牛肉粉馆",
      point: { longitude: 114.22, latitude: 30.55 },
      historyPlaces: []
    });
    const scanlistCandidate = result.candidates.find((candidate) => candidate.source === "scanlist");
    expect(scanlistCandidate?.sourceLabel).toBe("高德扫街榜");
    expect(scanlistCandidate?.coordinateSystem).toBe("wgs84");
    expect(scanlistCandidate?.address).toBeTruthy();
    expect(scanlistCandidate?.reasons.join(" ")).toContain("高德扫街榜");
  });

  it("keeps manually verified scanlist coordinates as WGS84 before rendering on AMap tiles", () => {
    const xiashiRecommendation = AMAP_WUHAN_SCANLIST.find((item) => item.name.includes("夏氏砂锅"))!;
    expect(xiashiRecommendation.coordinateSystem).toBe("wgs84");
    const mapPlace = recommendationToMapPlace(xiashiRecommendation);
    expect(mapPlace.coordinateSystem).toBe("wgs84");
    const displayPoint = toMapDisplayPoint(mapPlace);
    expect(displayPoint.longitude).toBeGreaterThan(mapPlace.longitude);
    expect(displayPoint.latitude).toBeLessThan(mapPlace.latitude);
  });

  it("converts WGS84 places to the GCJ02 display coordinate used by AMap tiles", () => {
    const displayPoint = wgs84ToGcj02({ longitude: 114.3055, latitude: 30.5928 });
    expect(displayPoint.longitude).toBeGreaterThan(114.3055);
    expect(Math.abs(displayPoint.longitude - 114.3055)).toBeGreaterThan(0.002);
    expect(Math.abs(displayPoint.longitude - 114.3055)).toBeLessThan(0.01);
    const roundTrip = gcj02ToWgs84(displayPoint);
    expect(roundTrip.longitude).toBeCloseTo(114.3055, 4);
    expect(roundTrip.latitude).toBeCloseTo(30.5928, 4);

    const wgsPlace = { ...place, longitude: 114.3055, latitude: 30.5928, coordinateSystem: "wgs84" as const };
    const gcjPlace = { ...wgsPlace, coordinateSystem: "gcj02" as const };
    expect(toMapDisplayPoint(wgsPlace).longitude).toBeCloseTo(displayPoint.longitude, 6);
    expect(toMapDisplayPoint(gcjPlace)).toEqual({ longitude: 114.3055, latitude: 30.5928 });
  });

  it("keeps Dingtuyi shared Wuhan food markers as a GCJ02 read-only reference layer", () => {
    expect(DINGTUYI_WUHAN_FOOD_MARKERS).toHaveLength(120);
    const marker = DINGTUYI_WUHAN_FOOD_MARKERS[0];
    const mapPlace = dingtuyiMarkerToMapPlace(marker);
    expect(mapPlace.id.startsWith("dingtuyi-share:")).toBe(true);
    expect(sourceIdFromDingtuyiMapId(mapPlace.id)).toBe(marker.id);
    expect(mapPlace.layerId).toBe(DINGTUYI_SHARE_LAYER_ID);
    expect(mapPlace.coordinateSystem).toBe("gcj02");
    expect(mapPlace.tags).toEqual(expect.arrayContaining(["钉图易分享", "武汉店家"]));
    expect(mapPlace.notes).toContain("来源：钉图易公开分享图层");
    expect(toMapDisplayPoint(mapPlace)).toEqual({ longitude: marker.longitude, latitude: marker.latitude });
  });

  it("blocks incomplete Agent candidates before they enter selectable P16 results", () => {
    expect(normalizeAgentCandidates([{ name: "Agent 缺字段候选", confidence: 0.8, reasons: ["Agent 结构化识别"] }])).toHaveLength(1);
    expect(normalizeAgentCandidates({
      candidates: [{ name: "Agent 缺字段候选", confidence: 0.8, reasons: ["Agent 结构化识别"] }]
    })).toHaveLength(1);
    const result = searchPlaceCandidates({
      text: "Agent 缺字段候选",
      agentPayload: {
        candidates: [{ name: "Agent 缺字段候选", confidence: 0.8, reasons: ["Agent 结构化识别"] }]
      }
    });
    expect(result.candidates.some((candidate) => candidate.source === "agent")).toBe(false);
    expect(result.blockedCandidates[0].blockers).toEqual(expect.arrayContaining(["Agent 候选缺少地址或坐标"]));
  });

  it("uses granted user location in P16 ranking and keeps denied location as fallback copy", () => {
    const candidateA = {
      id: "candidate-a",
      name: "近处候选",
      address: "武汉市江汉区",
      city: "武汉",
      longitude: 114.266,
      latitude: 30.588,
      tags: [],
      source: "manual" as const,
      sourceLabel: "验收 fixture",
      confidence: 0.7,
      coordinateAccuracy: "exact" as const,
      reasons: ["验收候选"]
    };
    const candidateB = {
      ...candidateA,
      id: "candidate-b",
      name: "远处候选",
      longitude: 114.48,
      latitude: 30.72
    };
    const ranked = rankPlaceCandidates([candidateB, candidateA], {
      userLocation: { longitude: 114.265, latitude: 30.587 },
      historyPlaces: []
    });
    expect(ranked[0].name).toBe("近处候选");
    expect(ranked[0].reasons.join(" ")).toContain("距离你约");
    expect(userLocationToPoint({ status: "granted", longitude: 114.265, latitude: 30.587 })).toEqual({ longitude: 114.265, latitude: 30.587 });
    expect(userLocationToPoint({ status: "denied", reason: "denied" })).toBeUndefined();
    expect(describeUserLocation({ status: "denied", reason: "denied" })).toContain("定位已拒绝");
  });

  it("builds P16 external map links and copy fallback text", () => {
    const linked = buildExternalMapLink({ name: "小院炭烤", address: "武汉市江汉区", longitude: 114.31, latitude: 30.59 });
    expect(linked.primaryHref).toContain("amap.com");
    expect(linked.secondaryLinks.map((item) => item.label)).toEqual(expect.arrayContaining(["高德 App", "Apple Maps", "通用 Geo"]));
    expect(linked.fallbackText).toContain("30.590000,114.310000");
    expect(linked.primaryHref).not.toContain("to=114.31,30.59");

    const missing = buildExternalMapLink({ name: "只有名称" });
    expect(missing.primaryHref).toBeUndefined();
    expect(missing.disabledReason).toBe("缺少可导航坐标");
  });

  it("renders a self-contained map poster svg with filtered place count, tags and generated time", () => {
    const svg = createMapPosterSvg([place], { title: "我的武汉美食地图", subtitle: "1 个个人图钉", generatedAt: "2026-06-08" });
    expect(svg).toContain("<svg");
    expect(svg).toContain("我的武汉美食地图");
    expect(svg).toContain("1 个个人图钉");
    expect(svg).toContain("#午餐");
    expect(svg).toContain("生成时间：2026-06-08");
    expect(svg).toContain("FoodMap 本地生成");
    expect(svg).not.toContain("<image");
    expect(svg).not.toContain("appmaptile");
  });

  it("renders every filtered place in the map poster instead of silently truncating", () => {
    const manyPlaces = Array.from({ length: 85 }, (_, index) => ({
      ...place,
      id: `place-${index}`,
      name: `地点 ${index + 1}`,
      longitude: 114.2 + index * 0.001,
      latitude: 30.5 + index * 0.001
    }));
    const svg = createMapPosterSvg(manyPlaces, { title: "完整导出", subtitle: "85 个个人图钉", generatedAt: "2026-06-11" });
    expect(svg.match(/C17 -28/g)).toHaveLength(85);
    expect(svg).toContain("85 个个人图钉");
  });

  it("builds current viewport poster source from real bounds without falling back to current filter", () => {
    const inside: FoodPlace = {
      ...place,
      id: "inside-wuhan",
      longitude: 114.3,
      latitude: 30.6,
      coordinateSystem: "wgs84",
      tags: ["海报验收"]
    };
    const outside: FoodPlace = {
      ...place,
      id: "outside-wuhan",
      longitude: 113.2,
      latitude: 29.8,
      coordinateSystem: "wgs84",
      tags: ["海报验收"]
    };
    const result = buildPosterSourceSet([inside, outside], "current-viewport", {
      west: 114.2,
      south: 30.5,
      east: 114.4,
      north: 30.7,
      coordinateSystem: "wgs84"
    });
    expect(result.mode).toBe("current-viewport");
    expect(result.count).toBe(1);
    expect(result.places.map((item) => item.id)).toEqual(["inside-wuhan"]);
    expect(result.emptyReason).toBeUndefined();
  });

  it("keeps current viewport poster unavailable without map bounds and excludes reference pins", () => {
    const personal: FoodPlace = { ...place, id: "personal-visible", longitude: 114.3, latitude: 30.6 };
    const recommendation: FoodPlace = { ...place, id: "recommendation:1", longitude: 114.3, latitude: 30.6 };
    const dingtuyi: FoodPlace = { ...place, id: "dingtuyi-share:1", longitude: 114.3, latitude: 30.6 };

    const currentFilter = buildPosterSourceSet([personal, recommendation, dingtuyi], "current-filter");
    expect(currentFilter.count).toBe(1);
    expect(currentFilter.places.map((item) => item.id)).toEqual(["personal-visible"]);

    const unavailable = buildPosterSourceSet([personal], "current-viewport");
    expect(unavailable.count).toBe(0);
    expect(unavailable.unavailableReason).toContain("地图视野");
  });

  it("returns explicit empty viewport poster state", () => {
    const outside: FoodPlace = { ...place, id: "outside-visible", longitude: 113.2, latitude: 29.8, coordinateSystem: "wgs84" };
    expect(filterPlacesByViewport([outside], { west: 114.2, south: 30.5, east: 114.4, north: 30.7 })).toHaveLength(0);
    const result = buildPosterSourceSet([outside], "current-viewport", { west: 114.2, south: 30.5, east: 114.4, north: 30.7 });
    expect(result.count).toBe(0);
    expect(result.emptyReason).toContain("当前地图视野内");
  });

  it("warns before saving a near duplicate personal place", () => {
    const warning = findDuplicatePlaceWarning(
      { name: "南门面馆(分店)", longitude: 116.4002, latitude: 39.9002 },
      [place]
    );
    expect(warning?.severity).toBe("same-name");
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

  it("summarizes and validates a portable readonly snapshot package", () => {
    const snapshot = {
      id: "portable-snapshot",
      title: "可携带快照",
      places: [{ ...place, photoIds: ["photo-1"] }],
      layers: DEFAULT_LAYERS.slice(0, 2),
      photos: [
        {
          id: "photo-1",
          placeId: "p1",
          fileName: "noodle.png",
          mimeType: "image/png",
          thumbnailDataUrl: "data:image/png;base64,abc",
          createdAt: "2026-06-01T00:00:00.000Z"
        }
      ],
      exportedAt: "2026-06-01T00:00:00.000Z"
    };
    const summary = summarizeSnapshot(snapshot);
    expect(summary).toMatchObject({
      snapshotId: "portable-snapshot",
      placeCount: 1,
      layerCount: 2,
      thumbnailCount: 1,
      readonly: true
    });
    const validation = validateSnapshotPackageText(encodeSnapshot(snapshot));
    expect(validation.ok).toBe(true);
    expect(validation.summary?.thumbnailCount).toBe(1);
  });

  it("rejects malformed portable snapshot packages before writes", () => {
    const unsupported = validateSnapshotPackageText(JSON.stringify({ schema: "foodmap.share", version: 99, snapshot: {} }));
    expect(unsupported.ok).toBe(false);
    expect(unsupported.errors.join("；")).toContain("version 1");

    const malformedThumbnail = validateSnapshotPackageText(encodeSnapshot({
      id: "bad-thumbnail",
      title: "坏缩略图",
      places: [{ ...place, photoIds: ["photo-1"] }],
      layers: DEFAULT_LAYERS.slice(0, 1),
      photos: [
        {
          id: "photo-1",
          placeId: "p1",
          fileName: "bad.txt",
          mimeType: "text/plain",
          thumbnailDataUrl: "https://example.com/original.png",
          createdAt: "2026-06-01T00:00:00.000Z"
        }
      ],
      exportedAt: "2026-06-01T00:00:00.000Z"
    }));
    expect(malformedThumbnail.ok).toBe(false);
    expect(malformedThumbnail.errors.join("；")).toContain("thumbnailDataUrl");
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

  it("classifies moved refresh candidates as manual-review and not changed in apply mode", () => {
    const baseline = {
      ...AMAP_WUHAN_SCANLIST[0],
      longitude: 114.2,
      latitude: 30.5
    };
    const refreshed = {
      ...baseline,
      longitude: 114.35,
      latitude: 30.65
    };
    const row = classifyRefreshDiff(baseline, refreshed, "apply");
    expect(row.diffStatus).toBe("moved");
    expect(row.admissionDecision).toBe("manual-review");
    expect(row.mapDataChanged).toBe(false);
  });

  it("keeps missing or mismatched image evidence out of verified display", () => {
    const missing = getImageEvidenceView({ ...candidate, imageEvidence: undefined });
    const mismatch = getImageEvidenceView({
      ...candidate,
      imageEvidence: {
        source: "amap-ranking-image",
        url: "https://www.amap.com/ranking/wuhan",
        imageUrl: "https://example.com/wrong.jpg",
        imageAlt: "其他门店",
        observedName: candidate.name,
        matched: false,
        observedAt: "2026-06-04T00:00:00.000Z"
      }
    });
    expect(missing.verified).toBe(false);
    expect(mismatch.status).toBe("mismatch");
    expect(mismatch.verified).toBe(false);
  });

  it("filters recommendation pins by source, district and verification status", () => {
    const first = AMAP_WUHAN_SCANLIST[0];
    expect(filterRecommendations(AMAP_WUHAN_SCANLIST, { ...EMPTY_FILTER, source: "personal" })).toHaveLength(0);
    expect(filterRecommendations(AMAP_WUHAN_SCANLIST, { ...EMPTY_FILTER, visitStatuses: ["avoid"] })).toHaveLength(0);
    expect(
      filterRecommendations(AMAP_WUHAN_SCANLIST, {
        ...EMPTY_FILTER,
        source: "recommendation",
        district: first.district,
        verificationStatus: "verified"
      }).every((item) => item.district === first.district && evaluateRecommendation(item).mappable)
    ).toBe(true);
  });

  it("derives rich scanlist tags and lets homepage tag filters affect recommendation pins", () => {
    const beefNoodle = AMAP_WUHAN_SCANLIST.find((item) => item.name.includes("刘聋子牛肉粉馆"));
    const crab = AMAP_WUHAN_SCANLIST.find((item) => item.name.includes("蟹神"));
    expect(beefNoodle).toBeTruthy();
    expect(crab).toBeTruthy();
    expect(getRecommendationFilterTags(beefNoodle!)).toEqual(expect.arrayContaining(["牛肉粉", "夯", "值得排队", "高德扫街榜"]));
    expect(getRecommendationFilterTags(crab!)).toEqual(expect.arrayContaining(["小龙虾", "热干面"]));

    const beefNoodleResults = filterRecommendations(AMAP_WUHAN_SCANLIST, { ...EMPTY_FILTER, cuisineTags: ["牛肉粉"] });
    expect(beefNoodleResults.some((item) => item.name.includes("刘聋子牛肉粉馆"))).toBe(true);
    expect(beefNoodleResults.some((item) => item.name.includes("蟹神"))).toBe(false);

    const queueWorthyResults = filterRecommendations(AMAP_WUHAN_SCANLIST, { ...EMPTY_FILTER, reviewTags: ["值得排队"] });
    expect(queueWorthyResults.length).toBeGreaterThan(0);
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

  it("derives P20 governance groups and safe batch preview without mutating places", () => {
    const pending: FoodPlace = {
      id: "p20-pending",
      name: "P20 待确认店",
      longitude: 114.3,
      latitude: 30.6,
      city: "武汉",
      layerId: DEFAULT_LAYERS[0].id,
      tags: ["待校准", "近似坐标"],
      rating: 4,
      visitedAt: "2026-06-24",
      notes: "",
      photoIds: [],
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      mapAccuracy: "approximate"
    };
    const highRisk = { ...pending, id: "p20-risk", name: "P20 高风险店", tags: ["位置高风险"], notes: "需要复核" };
    const original = JSON.stringify([pending, highRisk]);
    const groups = deriveGovernanceIssueGroups([pending, highRisk]);
    expect(groups.map((group) => group.kind)).toEqual(expect.arrayContaining(["pending", "high-risk"]));

    const pendingGroup = groups.find((group) => group.kind === "pending");
    const plan = planGovernanceBatchAction("mark-reviewed", pendingGroup?.issues ?? []);
    expect(plan.summary).toContain("确认前不会写入");
    expect(plan.affectedPlaceIds).toContain("p20-pending");
    expect(JSON.stringify([pending, highRisk])).toBe(original);
  });

  it("suggests duplicate places and builds explicit merge preview", () => {
    const primary: FoodPlace = {
      id: "p20-dup-a",
      name: "万松小院荷花垄",
      longitude: 114.266,
      latitude: 30.59,
      city: "武汉",
      layerId: DEFAULT_LAYERS[0].id,
      tags: ["湖北菜", "已核验"],
      rating: 4,
      visitedAt: "2026-06-24",
      notes: "第一次记录",
      photoIds: ["photo-a"],
      createdAt: "2026-06-20T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      mapAccuracy: "exact"
    };
    const duplicate: FoodPlace = {
      ...primary,
      id: "p20-dup-b",
      name: "万松小院（荷花垄店）",
      longitude: 114.2662,
      latitude: 30.5901,
      tags: ["湖北菜", "想再去"],
      rating: 5,
      notes: "第二次记录",
      photoIds: ["photo-b"],
      updatedAt: "2026-06-23T00:00:00.000Z"
    };
    const suggestions = suggestDuplicatePlaces([primary, duplicate]);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].evidence.join(" ")).toContain("距离");
    const preview = previewPlaceMerge(suggestions[0]);
    expect(preview.retained.id).toBe(primary.id);
    expect(preview.removed.id).toBe(duplicate.id);
    expect(preview.merged.photoIds).toEqual(expect.arrayContaining(["photo-a", "photo-b"]));
    expect(preview.journalEntries[0].summary).toContain("合并重复地点");
  });

  it("plans import conflicts before writes and creates journal entries", () => {
    const existing: FoodPlace = {
      id: "p20-import-existing",
      name: "P20 导入已有店",
      longitude: 114.31,
      latitude: 30.61,
      city: "武汉",
      layerId: DEFAULT_LAYERS[0].id,
      tags: ["已核验"],
      rating: 4,
      visitedAt: "2026-06-24",
      notes: "",
      photoIds: [],
      createdAt: "2026-06-20T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      mapAccuracy: "exact"
    };
    const snapshot = {
      id: "snapshot-p20-import",
      title: "P20 导入验收",
      exportedAt: "2026-06-24T00:00:00.000Z",
      layers: DEFAULT_LAYERS,
      photos: [],
      places: [
        { ...existing, rating: 5 },
        { ...existing, id: "p20-import-new", name: "P20 导入新店", longitude: 114.32 },
        { ...existing, id: "p20-import-dup", name: "P20 导入已有店（分店）", longitude: 114.3101 }
      ]
    };
    const plan = planImportConflicts(snapshot, [existing]);
    expect(plan.counts.update).toBe(1);
    expect(plan.counts.create).toBe(1);
    expect(plan.counts.duplicate).toBe(1);
    const entry = journalEntryForImport(plan.items[0]);
    expect(entry.summary).toContain("导入处理");
  });

  it("covers P20-C stale-reference, three batch actions, duplicate decisions, import strategies, and report", () => {
    const base: FoodPlace = {
      id: "p20c-base",
      name: "P20C 基准店",
      longitude: 114.3036,
      latitude: 30.6072,
      city: "武汉",
      layerId: DEFAULT_LAYERS[0].id,
      tags: ["已核验"],
      rating: 4,
      visitedAt: "2026-06-24",
      notes: "",
      photoIds: [],
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      mapAccuracy: "exact"
    };
    const stale = { ...base, id: "p20c-stale", name: "P20C 过期参考店", tags: ["过期参考"], notes: "stale-reference old evidence" };
    const duplicateA = { ...base, id: "p20c-dup-a", name: "P20C 热干面", tags: ["热干面"] };
    const duplicateB = { ...base, id: "p20c-dup-b", name: "P20C 热干面（江岸店）", longitude: 114.3037, latitude: 30.6073, tags: ["热干面", "想再去"] };
    const groups = deriveGovernanceIssueGroups([stale, duplicateA, duplicateB]);
    expect(groups.map((group) => group.kind)).toContain("stale-reference");
    const staleIssues = groups.find((group) => group.kind === "stale-reference")?.issues ?? [];
    expect(planGovernanceBatchAction("add-to-queue", staleIssues).title).toContain("处理队列");
    expect(planGovernanceBatchAction("mark-skipped", staleIssues).title).toContain("暂时跳过");
    expect(planGovernanceBatchAction("apply-tag", staleIssues).title).toContain("治理标签");

    const suggestion = suggestDuplicatePlaces([duplicateA, duplicateB])[0];
    expect(previewDuplicateDecision(suggestion, "ignore").journalEntries[0].action).toBe("duplicate-ignored");
    expect(previewDuplicateDecision(suggestion, "keep").journalEntries[0].action).toBe("duplicate-kept");
    expect(previewDuplicateDecision(suggestion, "merge").journalEntries[0].action).toBe("duplicate-merged");

    const snapshot = {
      id: "snapshot-p20c-import",
      title: "P20C 导入策略",
      exportedAt: "2026-06-24T00:00:00.000Z",
      layers: DEFAULT_LAYERS,
      photos: [],
      places: [
        { ...base, id: "p20c-import-new", name: "P20C 导入新店" },
        { ...base, id: "p20c-import-skip", name: "P20C 导入跳过店", tags: ["暂时跳过"] }
      ]
    };
    const plan = planImportConflicts(snapshot, [base]);
    expect(plan.counts.create).toBe(1);
    expect(plan.counts.skip).toBe(1);
    const skipped = setImportConflictStrategy(plan, "p20c-import-new", "skip");
    expect(skipped.items.find((item) => item.imported.id === "p20c-import-new")?.strategy).toBe("skip");

    const report = deriveGovernanceReport(groups, [suggestion], [previewDuplicateDecision(suggestion, "keep").journalEntries[0]], plan);
    expect(report.issueCount).toBeGreaterThan(0);
    expect(report.duplicateSuggestions[0].primaryName).toContain("P20C");
    expect(report.importSummary?.skip).toBe(1);
  });
});
