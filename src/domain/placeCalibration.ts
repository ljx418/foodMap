import { inferCoordinateSystem, toWgs84Point } from "./coordinates";
import { searchPlaceCandidates, type MapProviderSearchResult } from "./placeSearch";
import type { PlaceCandidate } from "./placeRecognition";
import type { FoodPlace } from "./types";
import { normalizeTags } from "./validators";

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

export function confirmPlaceCandidate(place: FoodPlace, candidate: PlaceCandidate, confirmedAt = new Date().toISOString()): FoodPlace {
  const precise = candidateSolidifiesPrecisePlace(candidate);
  const staleCalibrationTags = new Set(["待校准", "近似坐标", "默认候选", "位置待确认", "位置高风险", "陆地点修正", "暂时跳过"]);
  const baseTags = place.tags.filter((tag) => !staleCalibrationTags.has(tag));
  const tags = normalizeTags([
    ...baseTags,
    ...candidate.tags.filter((tag) => !staleCalibrationTags.has(tag)),
    precise ? "已核验" : "待校准",
    precise ? "精确坐标" : "近似坐标",
    candidate.sourceLabel
  ]);
  const notes = [
    place.notes,
    [
      `候选确认固化：${candidate.name}`,
      candidate.address ? `候选地址：${candidate.address}` : undefined,
      `候选来源：${candidate.sourceLabel}`,
      `候选置信度：${Math.round(candidate.confidence * 100)}%`,
      `操作时间：${confirmedAt}`,
      precise ? "固化结果：已替换为精确坐标，可打开地图导航。" : "固化结果：仍需校准；候选仍非精确坐标，继续保留待校准状态。"
    ].filter(Boolean).join("\n")
  ].filter(Boolean).join("\n\n");

  return {
    ...place,
    name: candidate.name || place.name,
    address: candidate.address ?? place.address,
    city: candidate.city ?? place.city ?? "武汉",
    longitude: typeof candidate.longitude === "number" ? candidate.longitude : place.longitude,
    latitude: typeof candidate.latitude === "number" ? candidate.latitude : place.latitude,
    coordinateSystem: candidate.coordinateSystem ?? place.coordinateSystem ?? "wgs84",
    tags,
    notes,
    mapAccuracy: precise ? "exact" : "approximate",
    updatedAt: confirmedAt
  };
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
