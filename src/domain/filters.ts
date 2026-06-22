import type { FoodFilterState, FoodLayer, FoodPlace } from "./types";
import { distanceMeters } from "./geo";
import { deriveLocationStatus, getUserFacingTags, isPendingLocationStatus } from "./locationStatus";
import { VISIT_STATUS_LABELS } from "./tagGroups";

export const EMPTY_FILTER: FoodFilterState = {
  keyword: "",
  layerIds: [],
  tags: [],
  visitStatuses: [],
  reviewTags: [],
  cuisineTags: [],
  source: "all",
  verificationStatus: "all"
};

export function filterPlaces(places: FoodPlace[], layers: FoodLayer[], filter: FoodFilterState): FoodPlace[] {
  const visibleLayerIds = new Set(layers.filter((layer) => layer.visible).map((layer) => layer.id));
  const keyword = filter.keyword.trim().toLowerCase();
  return places.filter((place) => {
    if (filter.source === "recommendation") return false;
    if (!visibleLayerIds.has(place.layerId)) return false;
    if (filter.layerIds.length > 0 && !filter.layerIds.includes(place.layerId)) return false;
    if (filter.minRating && place.rating < filter.minRating) return false;
    if (filter.city && place.city !== filter.city) return false;
    if (filter.visitedFrom && place.visitedAt < filter.visitedFrom) return false;
    if (filter.visitedTo && place.visitedAt > filter.visitedTo) return false;
    if (filter.tags.length > 0 && !filter.tags.every((tag) => place.tags.includes(tag))) return false;
    if (filter.visitStatuses?.length && !filter.visitStatuses.some((status) => place.tagGroups?.visitStatus === status || place.tags.includes(VISIT_STATUS_LABELS[status]))) return false;
    if (filter.reviewTags?.length && !filter.reviewTags.every((tag) => place.tagGroups?.review.includes(tag) || place.tags.includes(tag))) return false;
    if (filter.cuisineTags?.length && !filter.cuisineTags.every((tag) => place.tagGroups?.cuisine.includes(tag) || place.tags.includes(tag))) return false;
    if (filter.verificationStatus && filter.verificationStatus !== "all" && !placeMatchesVerificationStatus(place, filter.verificationStatus)) return false;
    if (filter.district && ![place.city, place.address, place.notes, ...place.tags].join(" ").includes(filter.district)) return false;
    if (filter.distanceCenter && filter.distanceKm && distanceMeters(filter.distanceCenter, place) > filter.distanceKm * 1000) return false;
    if (!keyword) return true;
    const haystack = [place.name, place.address, place.city, place.notes, ...place.tags].join(" ").toLowerCase();
    return haystack.includes(keyword);
  });
}

export function isPendingCalibrationPlace(place: FoodPlace): boolean {
  return isPendingLocationStatus(deriveLocationStatus(place));
}

export function placeMatchesVerificationStatus(place: FoodPlace, status: NonNullable<FoodFilterState["verificationStatus"]>): boolean {
  const text = [place.mapAccuracy, place.notes, ...place.tags].join(" ");
  const needsCalibration = isPendingCalibrationPlace(place);
  if (status === "pending") return needsCalibration;
  if (status === "approximate") return needsCalibration || place.tags.includes("近似坐标");
  if (status === "verified") return !needsCalibration && (place.mapAccuracy === "exact" || place.tags.includes("已核验") || place.tags.includes("精确坐标"));
  if (status === "conflict") return /冲突|不一致|错位|无法核验|待确认|位置高风险/.test(text) || deriveLocationStatus(place) === "blocked";
  return true;
}

export function collectGroupedTags(places: FoodPlace[]): { review: string[]; cuisine: string[] } {
  const review = new Set<string>();
  const cuisine = new Set<string>();
  places.forEach((place) => {
    place.tagGroups?.review.forEach((tag) => review.add(tag));
    place.tagGroups?.cuisine.forEach((tag) => cuisine.add(tag));
  });
  return {
    review: Array.from(review).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")),
    cuisine: Array.from(cuisine).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"))
  };
}

export function collectTags(places: FoodPlace[]): string[] {
  return Array.from(new Set(places.flatMap((place) => getUserFacingTags(place.tags)))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

export function collectCities(places: FoodPlace[]): string[] {
  return Array.from(new Set(places.map((place) => place.city).filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b, "zh-Hans-CN")
  );
}
