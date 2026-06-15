import type { FoodPlace } from "./types";

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
  "手动校准"
]);

export type LocationStatusTone = "success" | "warning" | "danger" | "neutral";

export interface LocationStatusBadge {
  label: string;
  tone: LocationStatusTone;
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
