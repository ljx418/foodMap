import type { FoodLayer, FoodPlace, FoodRating } from "../domain/types";
import { createId, nowIso } from "../domain/validators";
import type { AmapScanlistRecommendation } from "./types";
import { getRecommendationFilterTags } from "./tags";
import { evaluateRecommendation } from "./verification";

export const RECOMMENDATION_LAYER_ID = "recommendation-amap-scanlist";

export const RECOMMENDATION_LAYER: FoodLayer = {
  id: RECOMMENDATION_LAYER_ID,
  name: "高德扫街榜",
  color: "#2F7D8C",
  icon: "star",
  visible: true,
  sortOrder: 5
};

export function scoreToRating(score: number): FoodRating {
  if (score >= 4.6) return 5;
  if (score >= 4.2) return 4;
  if (score >= 3.6) return 3;
  if (score >= 3) return 2;
  return 1;
}

export function recommendationToMapPlace(recommendation: AmapScanlistRecommendation): FoodPlace {
  if (typeof recommendation.longitude !== "number" || typeof recommendation.latitude !== "number") {
    throw new Error(`推荐项 ${recommendation.name} 未通过坐标核验，不能生成地图图钉`);
  }
  const now = recommendation.crawledAt;
  return {
    id: recommendationMapId(recommendation.sourceId),
    name: recommendation.name,
    longitude: recommendation.longitude,
    latitude: recommendation.latitude,
    coordinateSystem: recommendation.coordinateSystem ?? "gcj02",
    address: recommendation.address,
    city: "武汉",
    layerId: RECOMMENDATION_LAYER_ID,
    tags: getRecommendationFilterTags(recommendation),
    rating: scoreToRating(recommendation.score),
    visitedAt: now.slice(0, 10),
    notes: recommendation.summaryReview,
    photoIds: [],
    createdAt: now,
    updatedAt: now,
    mapLabel: String(recommendation.rank),
    mapAccuracy: recommendation.locationAccuracy
  };
}

export function recommendationToFoodPlace(recommendation: AmapScanlistRecommendation, layerId: string): FoodPlace {
  const now = nowIso();
  const verification = evaluateRecommendation(recommendation);
  if (!verification.mappable) {
    throw new Error("推荐项未通过坐标核验，不能收藏为地图地点");
  }
  const hasCoordinate = typeof recommendation.longitude === "number" && typeof recommendation.latitude === "number";
  return {
    id: createId("place"),
    name: recommendation.name,
    longitude: hasCoordinate ? recommendation.longitude as number : 114.3055,
    latitude: hasCoordinate ? recommendation.latitude as number : 30.5928,
    coordinateSystem: hasCoordinate ? (recommendation.coordinateSystem ?? "gcj02") : "wgs84",
    address: recommendation.address,
    city: "武汉",
    layerId,
    tags: getRecommendationFilterTags(recommendation).slice(0, 16),
    rating: scoreToRating(recommendation.score),
    visitedAt: now.slice(0, 10),
    notes: [
      `来源：高德扫街榜`,
      `榜单分：${recommendation.score}`,
      `推荐语：${recommendation.summaryReview}`,
      recommendation.publicReviewSnippets.length > 0 ? `公开评论摘录：${recommendation.publicReviewSnippets.join(" / ")}` : "",
      `位置精度：${hasCoordinate ? (recommendation.locationAccuracy === "exact" ? "精确坐标" : "近似位置，建议手动校准") : "未通过坐标核验，已放置在武汉默认中心点，请手动校准"}`,
      `核验状态：${verification.status}，置信度 ${Math.round(verification.confidence * 100)}%`,
      verification.warnings.length > 0 ? `核验风险：${verification.warnings.join(" / ")}` : "",
      `来源链接：${recommendation.sourceUrl}`
    ].filter(Boolean).join("\n"),
    photoIds: [],
    createdAt: now,
    updatedAt: now
  };
}

export function recommendationMapId(sourceId: string): string {
  return `recommendation:${sourceId}`;
}

export function sourceIdFromMapId(id: string): string | undefined {
  return id.startsWith("recommendation:") ? id.slice("recommendation:".length) : undefined;
}
