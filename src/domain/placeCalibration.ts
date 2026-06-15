import { inferCoordinateSystem, toWgs84Point } from "./coordinates";
import { searchPlaceCandidates, type MapProviderSearchResult } from "./placeSearch";
import type { PlaceCandidate } from "./placeRecognition";
import type { FoodPlace } from "./types";

interface CalibrationCandidateInput {
  place: FoodPlace;
  places: FoodPlace[];
  mapProviderResults?: MapProviderSearchResult[];
}

export function buildCalibrationCandidates(input: CalibrationCandidateInput): PlaceCandidate[] {
  const point = toWgs84Point(
    { longitude: input.place.longitude, latitude: input.place.latitude },
    inferCoordinateSystem(input.place)
  );
  const search = searchPlaceCandidates({
    text: buildSearchText(input.place),
    point,
    historyPlaces: input.places.filter((place) => place.id !== input.place.id),
    mapProviderResults: input.mapProviderResults
  });
  return dedupeCalibrationCandidates([
    ...search.candidates.filter((candidate) => candidate.source !== "text"),
    placeToCurrentCandidate(input.place)
  ]).slice(0, 10);
}

export function candidateSolidifiesPrecisePlace(candidate: PlaceCandidate): boolean {
  return candidate.coordinateAccuracy === "exact" && typeof candidate.longitude === "number" && typeof candidate.latitude === "number";
}

function placeToCurrentCandidate(place: FoodPlace): PlaceCandidate {
  return {
    id: `current:${place.id}`,
    name: place.name,
    address: place.address,
    city: place.city,
    longitude: place.longitude,
    latitude: place.latitude,
    coordinateSystem: inferCoordinateSystem(place),
    tags: place.tags,
    notes: place.notes,
    source: "manual",
    sourceLabel: place.mapAccuracy === "exact" ? "当前已保存地点" : "当前待校准图钉",
    confidence: place.mapAccuracy === "exact" ? 0.9 : 0.64,
    coordinateAccuracy: place.mapAccuracy ?? "approximate",
    reasons: [
      place.mapAccuracy === "exact" ? "当前地点已有精确坐标" : "当前坐标仅作为上图占位",
      "确认后会写回并保留审计记录"
    ],
    rawInputRef: place.name
  };
}

function buildSearchText(place: FoodPlace): string {
  return place.name;
}

function dedupeCalibrationCandidates(candidates: PlaceCandidate[]): PlaceCandidate[] {
  const byKey = new Map<string, PlaceCandidate>();
  for (const candidate of candidates) {
    const key = [
      normalize(candidate.name),
      normalize(candidate.address ?? ""),
      candidate.longitude?.toFixed(5) ?? "",
      candidate.latitude?.toFixed(5) ?? ""
    ].join("|");
    const existing = byKey.get(key);
    if (!existing || candidate.confidence > existing.confidence) byKey.set(key, candidate);
  }
  return Array.from(byKey.values()).sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（(].*?[)）]/g, "")
    .replace(/[·\s,，。:：|｜\-]/g, "")
    .trim();
}
