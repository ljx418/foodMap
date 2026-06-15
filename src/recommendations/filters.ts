import type { FoodFilterState } from "../domain/types";
import { distanceMeters } from "../domain/geo";
import type { AmapScanlistRecommendation } from "./types";
import { getRecommendationFilterTags } from "./tags";
import { evaluateRecommendation } from "./verification";

export function filterRecommendations(
  recommendations: AmapScanlistRecommendation[],
  filter: FoodFilterState
): AmapScanlistRecommendation[] {
  if (filter.source === "personal") return [];
  if (filter.visitStatuses?.length) return [];
  const keyword = filter.keyword.trim().toLowerCase();
  return recommendations.filter((item) => {
    const decision = evaluateRecommendation(item);
    if (filter.minRating && Math.floor(item.score) < filter.minRating) return false;
    if (filter.district && item.district !== filter.district) return false;
    if (filter.verificationStatus && filter.verificationStatus !== "all") {
      if (filter.verificationStatus === "verified" && !decision.mappable) return false;
      if (filter.verificationStatus === "approximate" && item.locationAccuracy !== "approximate") return false;
      if (filter.verificationStatus === "conflict" && decision.status !== "conflict") return false;
      if (filter.verificationStatus === "pending" && decision.mappable) return false;
    }
    if (filter.distanceCenter && filter.distanceKm) {
      if (typeof item.longitude !== "number" || typeof item.latitude !== "number") return false;
      if (distanceMeters(filter.distanceCenter, { longitude: item.longitude, latitude: item.latitude }) > filter.distanceKm * 1000) {
        return false;
      }
    }
    const derivedTags = getRecommendationFilterTags(item);
    if (filter.tags.length > 0 && !filter.tags.every((tag) => derivedTags.includes(tag))) return false;
    if (filter.reviewTags?.length && !filter.reviewTags.every((tag) => derivedTags.includes(tag))) return false;
    if (filter.cuisineTags?.length && !filter.cuisineTags.every((tag) => derivedTags.includes(tag))) return false;
    if (!keyword) return true;
    const haystack = [item.name, item.district, item.address, item.summaryReview, ...derivedTags].join(" ").toLowerCase();
    return haystack.includes(keyword);
  });
}

export function collectRecommendationDistricts(recommendations: AmapScanlistRecommendation[]): string[] {
  return Array.from(new Set(recommendations.map((item) => item.district).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "zh-Hans-CN")
  );
}
