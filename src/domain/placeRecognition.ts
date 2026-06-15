import { distanceMeters } from "./geo";
import { toWgs84Point } from "./coordinates";
import type { CoordinateSystem, FoodPlace, VisitStatusTag } from "./types";
import { normalizeTags } from "./validators";
import type { AmapScanlistRecommendation } from "../recommendations/types";
import { evaluateRecommendation } from "../recommendations/verification";

export interface PlaceRecognitionInput {
  text?: string;
  url?: string;
  point?: { longitude: number; latitude: number };
  clickedPoint?: { longitude: number; latitude: number };
  userLocation?: { longitude: number; latitude: number };
  historyPlaces?: FoodPlace[];
  scanlist?: AmapScanlistRecommendation[];
}

export interface PlaceCandidate {
  id: string;
  name: string;
  address?: string;
  city?: string;
  district?: string;
  longitude?: number;
  latitude?: number;
  coordinateSystem?: CoordinateSystem;
  tags: string[];
  notes?: string;
  source: "text" | "history" | "scanlist" | "agent" | "map-provider" | "manual";
  sourceLabel: string;
  confidence: number;
  coordinateAccuracy: "exact" | "approximate" | "inferred" | "unknown";
  distanceMeters?: number;
  reasons: string[];
  rawInputRef?: string;
  evidenceUrl?: string;
  evidenceLabel?: string;
  screenshotPath?: string;
  blockers?: string[];
}

export interface AgentPlaceCandidatePayload {
  candidates: Array<Partial<PlaceCandidate>>;
}

const CUISINE_HINTS = ["炭烤", "火锅", "川菜", "牛肉粉", "热干面", "小吃", "咖啡", "甜品", "烧烤", "湖北菜"];
const REVIEW_HINTS = ["夯", "拉完了", "一般", "好吃", "不推荐", "值得排队", "下次还来"];
const VISIT_HINTS: Record<string, VisitStatusTag> = {
  吃过: "eaten",
  想吃: "want",
  再去: "revisit",
  避雷: "avoid"
};

export function parsePlaceCandidatesFromText(input: PlaceRecognitionInput): PlaceCandidate[] {
  const text = [input.text, input.url].filter(Boolean).join("\n").trim();
  if (!text) return [];
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const name = extractName(lines, text);
  const address = extractAddress(lines);
  const city = /武汉|武昌|汉口|汉阳|江汉|硚口|洪山|江岸/.test(text) ? "武汉" : undefined;
  const tags = normalizeTags([
    ...CUISINE_HINTS.filter((tag) => text.includes(tag)),
    ...REVIEW_HINTS.filter((tag) => text.includes(tag)),
    ...Object.keys(VISIT_HINTS).filter((tag) => text.includes(tag))
  ]);
  const hasUrl = Boolean(input.url || /https?:\/\/|www\./i.test(text));
  const reasons = ["从简介文本提取"];
  if (address) reasons.push("识别到地址");
  if (tags.length > 0) reasons.push("识别到标签");
  if (hasUrl) reasons.push("包含链接，等待 Agent 补充核对");

  return [{
    id: `local-${hashText(text)}`,
    name,
    address,
    city,
    longitude: input.point?.longitude,
    latitude: input.point?.latitude,
    coordinateSystem: input.point ? "wgs84" as const : undefined,
    tags,
    notes: text.slice(0, 320),
    source: "text" as const,
    sourceLabel: "本地文本",
    confidence: Math.min(0.9, 0.35 + (name ? 0.2 : 0) + (address ? 0.2 : 0) + (tags.length > 0 ? 0.1 : 0) + (hasUrl ? 0.05 : 0)),
    coordinateAccuracy: input.point ? "inferred" as const : "unknown" as const,
    reasons,
    rawInputRef: hasUrl ? "用户输入链接或含链接文本" : "用户输入文本"
  }].filter((candidate) => candidate.name);
}

export function normalizeAgentCandidates(payload: AgentPlaceCandidatePayload | unknown): PlaceCandidate[] {
  const candidates = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as AgentPlaceCandidatePayload).candidates)
      ? (payload as AgentPlaceCandidatePayload).candidates
      : [];
  return candidates
    .map((candidate, index) => ({
      id: candidate.id ?? `agent-${index}`,
      name: candidate.name?.trim() ?? "",
      address: candidate.address?.trim() || undefined,
      city: candidate.city?.trim() || "武汉",
      district: candidate.district?.trim() || undefined,
      longitude: typeof candidate.longitude === "number" ? candidate.longitude : undefined,
      latitude: typeof candidate.latitude === "number" ? candidate.latitude : undefined,
      coordinateSystem: normalizeCoordinateSystem(candidate.coordinateSystem),
      tags: normalizeTags(candidate.tags ?? []),
      notes: candidate.notes,
      source: "agent" as const,
      sourceLabel: candidate.sourceLabel?.trim() || "Agent 候选",
      confidence: clamp(candidate.confidence ?? 0.7, 0, 1),
      coordinateAccuracy: candidate.coordinateAccuracy ?? (typeof candidate.longitude === "number" && typeof candidate.latitude === "number" ? "exact" : "unknown"),
      distanceMeters: typeof candidate.distanceMeters === "number" ? candidate.distanceMeters : undefined,
      reasons: normalizeTags(candidate.reasons ?? ["Agent 结构化识别"]),
      rawInputRef: candidate.rawInputRef
    }))
    .filter((candidate) => candidate.name);
}

export function scanlistToPlaceCandidates(scanlist: AmapScanlistRecommendation[], input: PlaceRecognitionInput = {}): PlaceCandidate[] {
  const query = [input.text, input.url].filter(Boolean).join(" ").trim();
  if (!query) return [];
  return scanlist
    .filter((item) => evaluateRecommendation(item).mappable)
    .filter((item) => matchesQuery(item, query))
    .map((item) => ({
      id: `scanlist-${item.sourceId}`,
      name: item.name,
      address: item.address,
      city: "武汉",
      district: item.district,
      longitude: item.longitude,
      latitude: item.latitude,
      coordinateSystem: item.coordinateSystem ?? "gcj02" as const,
      tags: normalizeTags(["高德扫街榜", ...item.tags]),
      notes: item.summaryReview,
      source: "scanlist" as const,
      sourceLabel: "已核验扫街榜",
      confidence: Math.min(0.95, 0.72 + item.verification.confidence * 0.2),
      coordinateAccuracy: item.locationAccuracy,
      reasons: ["来自已核验扫街榜参考", `${item.district} · 榜单 #${item.rank}`],
      rawInputRef: item.sourceUrl
    }));
}

export function rankPlaceCandidates(candidates: PlaceCandidate[], input: PlaceRecognitionInput): PlaceCandidate[] {
  const history = input.historyPlaces ?? [];
  const anchor = input.userLocation ?? input.clickedPoint ?? input.point;
  const frequentTags = new Set(history.flatMap((place) => place.tags).slice(0, 40));
  const frequentCities = new Set(history.map((place) => place.city).filter(Boolean));

  return candidates
    .filter(isUsableCandidate)
    .map((candidate) => {
      const reasons = new Set(candidate.reasons);
      let score = candidate.confidence * 60;
      if (candidate.address) score += 12;
      if (typeof candidate.longitude === "number" && typeof candidate.latitude === "number") {
        score += candidate.coordinateAccuracy === "exact" ? 12 : candidate.coordinateAccuracy === "approximate" ? 7 : 3;
        reasons.add(candidate.coordinateAccuracy === "exact" ? "地址和坐标完整" : "坐标可用，建议确认");
      }
      if (candidate.city && frequentCities.has(candidate.city)) {
        score += 8;
        reasons.add("匹配历史常用城市");
      }
      const tagHits = candidate.tags.filter((tag) => frequentTags.has(tag)).length;
      if (tagHits > 0) {
        score += Math.min(12, tagHits * 4);
        reasons.add("匹配历史标签偏好");
      }
      if (anchor && typeof candidate.longitude === "number" && typeof candidate.latitude === "number") {
        const candidatePoint = toWgs84Point(
          { longitude: candidate.longitude, latitude: candidate.latitude },
          candidate.coordinateSystem ?? "wgs84"
        );
        const distance = Math.round(distanceMeters(anchor, candidatePoint));
        candidate.distanceMeters = distance;
        if (distance <= 1000) {
          score += 16;
          reasons.add(input.userLocation ? `距离你约 ${formatDistance(distance)}` : "靠近你点击的位置");
        } else if (distance <= 5000) {
          score += 8;
          reasons.add(input.userLocation ? `距离你约 ${formatDistance(distance)}` : "距当前选点较近");
        }
      } else if (anchor) {
        score += 4;
        reasons.add("沿用地图点击位置");
      }
      if (candidate.source === "agent") {
        score += 8;
        reasons.add("Agent 辅助候选");
      }
      if (candidate.source === "scanlist") {
        score += 10;
        reasons.add("来自已核验扫街榜参考");
      }
      if (candidate.source === "history") {
        score += 6;
        reasons.add("来自历史个人记录");
      }
      return { ...candidate, confidence: clamp(score / 100, 0, 1), reasons: Array.from(reasons).slice(0, 4) };
    })
    .sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function extractName(lines: string[], text: string): string {
  const explicit = text.match(/(?:店名|名称|餐厅|门店)[:：]\s*([^\n，,。]+)/);
  if (explicit?.[1]) return cleanupName(explicit[1]);
  const firstUseful = lines.find((line) => !/^https?:\/\//i.test(line) && !/地址|电话|营业|人均/.test(line));
  return cleanupName(firstUseful ?? lines[0] ?? "");
}

function isUsableCandidate(candidate: PlaceCandidate): boolean {
  if (!candidate.name.trim()) return false;
  if (candidate.source === "agent" && !candidate.address && (typeof candidate.longitude !== "number" || typeof candidate.latitude !== "number")) return false;
  if (typeof candidate.longitude === "number" && (candidate.longitude < 113 || candidate.longitude > 116)) return false;
  if (typeof candidate.latitude === "number" && (candidate.latitude < 29 || candidate.latitude > 32)) return false;
  return true;
}

function matchesQuery(item: AmapScanlistRecommendation, query: string): boolean {
  const normalized = query.toLowerCase();
  return [item.name, item.address, item.district, ...item.tags].some((value) => {
    const candidate = value.toLowerCase();
    return normalized.includes(candidate) || candidate.includes(normalized);
  });
}

function formatDistance(distance: number): string {
  return distance >= 1000 ? `${(distance / 1000).toFixed(1)} 公里` : `${distance} 米`;
}

function extractAddress(lines: string[]): string | undefined {
  const explicit = lines.join("\n").match(/(?:地址|位置)[:：]\s*([^\n]+)/);
  if (explicit?.[1]) return explicit[1].trim();
  return lines.find((line) => /路|街|巷|号|区|商场|广场|附近/.test(line) && line.length <= 80);
}

function cleanupName(value: string): string {
  return value.replace(/^#+\s*/, "").replace(/[｜|].*$/, "").trim().slice(0, 40);
}

function hashText(value: string): string {
  let hash = 0;
  for (const char of value) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(36);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeCoordinateSystem(value: unknown): CoordinateSystem {
  return value === "gcj02" ? "gcj02" : "wgs84";
}
