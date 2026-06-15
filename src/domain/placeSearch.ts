import { AMAP_WUHAN_SCANLIST } from "../recommendations/amapWuhanScanlist";
import type { AmapScanlistRecommendation } from "../recommendations/types";
import { evaluateRecommendation } from "../recommendations/verification";
import { toWgs84Point } from "./coordinates";
import { distanceMeters } from "./geo";
import {
  normalizeAgentCandidates,
  parsePlaceCandidatesFromText,
  rankPlaceCandidates,
  type AgentPlaceCandidatePayload,
  type PlaceCandidate,
  type PlaceRecognitionInput
} from "./placeRecognition";
import type { CoordinateSystem, FoodPlace } from "./types";

export interface CandidateContext extends PlaceRecognitionInput {
  text?: string;
  url?: string;
  mapProviderResults?: MapProviderSearchResult[];
  agentPayload?: AgentPlaceCandidatePayload | unknown;
}

export interface MapProviderSearchResult {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address?: string;
  city?: string;
  provider: "amap" | "leaflet";
  coordinateSystem?: CoordinateSystem;
  sourceUrl?: string;
  evidenceLabel?: string;
  screenshotPath?: string;
  tags?: string[];
  confidence?: number;
  coordinateAccuracy?: PlaceCandidate["coordinateAccuracy"];
  reasons?: string[];
}

export interface PlaceSearchResult {
  candidates: PlaceCandidate[];
  blockedCandidates: PlaceCandidate[];
}

const WUHAN_BOUNDS = {
  minLng: 113.65,
  maxLng: 115.1,
  minLat: 29.95,
  maxLat: 31.35
};

export function searchPlaceCandidates(context: CandidateContext): PlaceSearchResult {
  const textCandidates = parsePlaceCandidatesFromText(context);
  const historyCandidates = candidatesFromHistory(context.text ?? context.url ?? "", context.historyPlaces ?? []);
  const scanlistCandidates = candidatesFromScanlist(context.text ?? context.url ?? "");
  const agentCandidates = normalizeAgentCandidates(context.agentPayload);
  const mapProviderCandidates = (context.mapProviderResults ?? []).map((result) => mapSearchResultToPlaceCandidate(result, context));

  const allCandidates = [
    ...historyCandidates,
    ...scanlistCandidates,
    ...textCandidates,
    ...agentCandidates,
    ...mapProviderCandidates
  ].map((candidate) => applyCandidateBlockers(candidate));

  const blockedCandidates = allCandidates.filter((candidate) => candidate.blockers?.length);
  const allowedCandidates = allCandidates.filter((candidate) => !candidate.blockers?.length);
  const ranked = rankPlaceCandidates(dedupeCandidates(allowedCandidates), context);
  return { candidates: ranked, blockedCandidates };
}

export function mapSearchResultToPlaceCandidate(result: MapProviderSearchResult, context: CandidateContext): PlaceCandidate {
  const hasCompleteFields = Boolean(result.name && result.address && result.city && Number.isFinite(result.longitude) && Number.isFinite(result.latitude));
  const confidence = result.confidence ?? (hasCompleteFields ? 0.88 : result.address ? 0.78 : 0.7);
  const anchor = context.userLocation ?? context.point;
  const coordinateSystem = result.coordinateSystem ?? (result.provider === "amap" ? "gcj02" : "wgs84");
  const comparablePoint = toWgs84Point({ longitude: result.longitude, latitude: result.latitude }, coordinateSystem);
  const distance = anchor ? distanceMeters(anchor, comparablePoint) : undefined;
  return {
    id: `map-provider:${result.provider}:${result.id}`,
    name: result.name,
    address: result.address,
    city: result.city ?? "武汉",
    longitude: result.longitude,
    latitude: result.latitude,
    coordinateSystem,
    tags: result.tags ?? ["外部地图候选"],
    source: "map-provider",
    sourceLabel: result.provider === "amap" ? "高德地图" : "地图搜索",
    confidence,
    coordinateAccuracy: result.coordinateAccuracy ?? (hasCompleteFields ? "exact" : "unknown"),
    distanceMeters: distance,
    reasons: result.reasons ?? [
      "来自地图搜索",
      hasCompleteFields ? "地址和坐标完整" : "地图搜索字段不完整"
    ],
    rawInputRef: result.sourceUrl ?? context.text ?? context.url,
    evidenceUrl: result.sourceUrl,
    evidenceLabel: result.evidenceLabel,
    screenshotPath: result.screenshotPath
  };
}

export function applyCandidateBlockers(candidate: PlaceCandidate): PlaceCandidate {
  const blockers: string[] = [];
  if (!candidate.name.trim()) blockers.push("缺少名称");
  const hasCoordinates = typeof candidate.longitude === "number" && typeof candidate.latitude === "number";
  if (hasCoordinates && !isInsideWuhan(candidate.longitude as number, candidate.latitude as number)) {
    blockers.push("坐标超出武汉验收范围");
  }
  if (candidate.source === "agent" && (!candidate.address || !hasCoordinates)) {
    blockers.push("Agent 候选缺少地址或坐标");
  }
  return blockers.length > 0 ? { ...candidate, blockers } : candidate;
}

function candidatesFromHistory(query: string, historyPlaces: FoodPlace[]): PlaceCandidate[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  return historyPlaces
    .filter((place) => {
      const haystack = normalizeSearchText([place.name, place.address, place.city, ...place.tags].filter(Boolean).join(" "));
      return haystack.includes(normalizedQuery) || normalizedQuery.includes(normalizeSearchText(place.name));
    })
    .slice(0, 8)
    .map((place) => ({
      id: `history:${place.id}`,
      name: place.name,
      address: place.address,
      city: place.city,
      longitude: place.longitude,
      latitude: place.latitude,
      coordinateSystem: place.coordinateSystem,
      tags: place.tags,
      notes: place.notes,
      source: "history" as const,
      sourceLabel: "历史记录",
      confidence: 0.82,
      coordinateAccuracy: place.mapAccuracy ?? "exact",
      reasons: ["来自已保存地点", "可用于重复提醒和历史偏好"],
      rawInputRef: query
    }));
}

function candidatesFromScanlist(query: string): PlaceCandidate[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  return AMAP_WUHAN_SCANLIST
    .filter((recommendation) => recommendationMatchesQuery(recommendation, normalizedQuery))
    .filter((recommendation) => evaluateRecommendation(recommendation).mappable)
    .slice(0, 8)
    .map((recommendation) => scanlistToCandidate(recommendation, query));
}

function scanlistToCandidate(recommendation: AmapScanlistRecommendation, query: string): PlaceCandidate {
  const verification = evaluateRecommendation(recommendation);
  return {
    id: `scanlist:${recommendation.sourceId}`,
    name: recommendation.name,
    address: recommendation.address,
    city: "武汉",
    district: recommendation.district,
    longitude: recommendation.longitude,
    latitude: recommendation.latitude,
    coordinateSystem: recommendation.coordinateSystem ?? "gcj02",
    tags: recommendation.tags,
    notes: recommendation.summaryReview,
    source: "scanlist",
    sourceLabel: "高德扫街榜",
    confidence: Math.min(0.95, Math.max(0.72, verification.confidence)),
    coordinateAccuracy: recommendation.locationAccuracy,
    reasons: [
      `高德扫街榜第 ${recommendation.rank} 名`,
      `核验置信度 ${Math.round(verification.confidence * 100)}%`,
      recommendation.locationAccuracy === "exact" ? "精确坐标" : "近似坐标"
    ],
    rawInputRef: query
  };
}

function recommendationMatchesQuery(recommendation: AmapScanlistRecommendation, normalizedQuery: string): boolean {
  const haystack = normalizeSearchText([
    recommendation.name,
    recommendation.address,
    recommendation.district,
    recommendation.tags.join(" ")
  ].join(" "));
  return haystack.includes(normalizedQuery) || normalizedQuery.includes(normalizeSearchText(recommendation.name));
}

function dedupeCandidates(candidates: PlaceCandidate[]): PlaceCandidate[] {
  const byKey = new Map<string, PlaceCandidate>();
  for (const candidate of candidates) {
    const key = [
      normalizeSearchText(candidate.name),
      normalizeSearchText(candidate.address ?? ""),
      candidate.longitude?.toFixed(5) ?? "",
      candidate.latitude?.toFixed(5) ?? ""
    ].join("|");
    const existing = byKey.get(key);
    if (!existing || candidate.confidence > existing.confidence) byKey.set(key, candidate);
  }
  return Array.from(byKey.values());
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（(].*?[)）]/g, "")
    .replace(/[·\s,，。:：|｜\-]/g, "")
    .trim();
}

function isInsideWuhan(longitude: number, latitude: number): boolean {
  return longitude >= WUHAN_BOUNDS.minLng && longitude <= WUHAN_BOUNDS.maxLng && latitude >= WUHAN_BOUNDS.minLat && latitude <= WUHAN_BOUNDS.maxLat;
}
