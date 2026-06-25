import type { FoodPlace } from "./types";
import { assessCoordinateRisk } from "./coordinateRisk";

const SYSTEM_TAGS = new Set([
  "我的收藏",
  "已核验",
  "精确坐标",
  "近似坐标",
  "待校准",
  "默认候选",
  "位置待确认",
  "位置高风险",
  "陆地点修正",
  "手动校准",
  "暂时跳过"
]);

export type LocationStatusTone = "success" | "warning" | "danger" | "neutral";
export type LocationStatus = "verified" | "pending" | "manual-adjusted" | "blocked" | "skipped";

export interface LocationStatusBadge {
  label: string;
  tone: LocationStatusTone;
}

export interface PersonalDataHealthReport {
  total: number;
  verified: FoodPlace[];
  pending: FoodPlace[];
  highRisk: FoodPlace[];
  manualAdjusted: FoodPlace[];
  skipped: FoodPlace[];
}

export function isSystemLocationTag(tag: string): boolean {
  return SYSTEM_TAGS.has(tag);
}

export function getUserFacingTags(tags: string[]): string[] {
  return tags.filter((tag) => !isSystemLocationTag(tag));
}

export function getLocationStatusBadges(place: Pick<FoodPlace, "tags" | "mapAccuracy">): LocationStatusBadge[] {
  const tags = new Set(place.tags);
  const badges: LocationStatusBadge[] = [];

  if (tags.has("位置高风险")) {
    badges.push({ label: "高风险位置", tone: "danger" });
  } else if (tags.has("暂时跳过")) {
    badges.push({ label: "已跳过确认", tone: "warning" });
  } else if (tags.has("位置待确认") || tags.has("待校准") || place.mapAccuracy === "approximate") {
    badges.push({ label: "待确认位置", tone: "warning" });
  }

  if (tags.has("陆地点修正")) {
    badges.push({ label: "已避开水域", tone: "warning" });
  }

  if (tags.has("手动校准")) {
    badges.push({ label: "手动校准", tone: "success" });
  } else if (tags.has("已核验") || place.mapAccuracy === "exact") {
    badges.push({ label: "已核验", tone: "success" });
  } else if (tags.has("近似坐标") || place.mapAccuracy === "approximate") {
    badges.push({ label: "近似坐标", tone: "neutral" });
  }

  return badges;
}

export function deriveLocationStatus(place: Pick<FoodPlace, "tags" | "mapAccuracy">): LocationStatus {
  const tags = new Set(place.tags);
  if (tags.has("位置高风险")) return "blocked";
  if (tags.has("暂时跳过")) return "skipped";
  if (tags.has("手动校准")) return "manual-adjusted";
  if (tags.has("位置待确认") || tags.has("待校准") || tags.has("近似坐标") || place.mapAccuracy === "approximate") {
    return "pending";
  }
  return "verified";
}

export function isPendingLocationStatus(status: LocationStatus): boolean {
  return status === "pending" || status === "blocked" || status === "skipped";
}

export function derivePersonalDataHealthReport(places: FoodPlace[]): PersonalDataHealthReport {
  const pending: FoodPlace[] = [];
  const highRisk: FoodPlace[] = [];
  const manualAdjusted: FoodPlace[] = [];
  const skipped: FoodPlace[] = [];
  const verified: FoodPlace[] = [];

  for (const place of places) {
    const tags = new Set(place.tags);
    const status = deriveLocationStatus(place);
    const risk = assessCoordinateRisk(place);
    const isHighRisk = tags.has("位置高风险") || risk.level === "blocked";
    const isSkipped = tags.has("暂时跳过") || /暂时跳过|跳过确认/.test(place.notes);
    const isManualAdjusted = tags.has("手动校准") || /手动(拖动|挪动|校准)|原坐标/.test(place.notes);
    const isPending = status === "pending"
      || tags.has("位置待确认")
      || tags.has("待校准")
      || tags.has("近似坐标")
      || place.mapAccuracy === "approximate";

    if (isHighRisk) highRisk.push(place);
    if (isSkipped) skipped.push(place);
    if (isManualAdjusted) manualAdjusted.push(place);
    if (isPending) pending.push(place);
    if (!isHighRisk && !isSkipped && !isPending && (place.mapAccuracy === "exact" || tags.has("已核验") || tags.has("精确坐标") || status === "verified")) {
      verified.push(place);
    }
  }

  return {
    total: places.length,
    verified,
    pending,
    highRisk,
    manualAdjusted,
    skipped
  };
}
