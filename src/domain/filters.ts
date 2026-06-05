import type { FoodFilterState, FoodLayer, FoodPlace } from "./types";

export const EMPTY_FILTER: FoodFilterState = {
  keyword: "",
  layerIds: [],
  tags: []
};

export function filterPlaces(places: FoodPlace[], layers: FoodLayer[], filter: FoodFilterState): FoodPlace[] {
  const visibleLayerIds = new Set(layers.filter((layer) => layer.visible).map((layer) => layer.id));
  const keyword = filter.keyword.trim().toLowerCase();
  return places.filter((place) => {
    if (!visibleLayerIds.has(place.layerId)) return false;
    if (filter.layerIds.length > 0 && !filter.layerIds.includes(place.layerId)) return false;
    if (filter.minRating && place.rating < filter.minRating) return false;
    if (filter.city && place.city !== filter.city) return false;
    if (filter.visitedFrom && place.visitedAt < filter.visitedFrom) return false;
    if (filter.visitedTo && place.visitedAt > filter.visitedTo) return false;
    if (filter.tags.length > 0 && !filter.tags.every((tag) => place.tags.includes(tag))) return false;
    if (!keyword) return true;
    const haystack = [place.name, place.address, place.city, place.notes, ...place.tags].join(" ").toLowerCase();
    return haystack.includes(keyword);
  });
}

export function collectTags(places: FoodPlace[]): string[] {
  return Array.from(new Set(places.flatMap((place) => place.tags))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

export function collectCities(places: FoodPlace[]): string[] {
  return Array.from(new Set(places.map((place) => place.city).filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b, "zh-Hans-CN")
  );
}
