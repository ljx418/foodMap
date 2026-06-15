import type { FoodTagGroups, VisitStatusTag } from "./types";
import { normalizeTags } from "./validators";

export const VISIT_STATUS_LABELS: Record<VisitStatusTag, string> = {
  eaten: "吃过",
  want: "想吃",
  revisit: "再去",
  avoid: "避雷"
};

export const REVIEW_TAG_PRESETS = ["夯", "拉完了", "一般", "下次还来", "值得排队", "不推荐"];

export const CUISINE_TAG_PRESETS = [
  "炭烤",
  "火锅",
  "川菜",
  "牛肉粉",
  "热干面",
  "小龙虾",
  "湖北菜",
  "包点",
  "甜品",
  "自助",
  "小吃",
  "咖啡"
];

export const EMPTY_TAG_GROUPS: FoodTagGroups = {
  review: [],
  cuisine: [],
  custom: []
};

export function normalizeTagGroups(input?: Partial<FoodTagGroups>): FoodTagGroups {
  return {
    visitStatus: input?.visitStatus,
    review: normalizeTags(input?.review ?? []),
    cuisine: normalizeTags(input?.cuisine ?? []),
    custom: normalizeTags(input?.custom ?? [])
  };
}

export function tagsFromGroups(groups?: Partial<FoodTagGroups>, looseTags: string[] = []): string[] {
  const normalized = normalizeTagGroups(groups);
  return normalizeTags([
    normalized.visitStatus ? VISIT_STATUS_LABELS[normalized.visitStatus] : "",
    ...normalized.review,
    ...normalized.cuisine,
    ...normalized.custom,
    ...looseTags
  ]);
}

export function groupsFromTags(tags: string[] = [], groups?: Partial<FoodTagGroups>): FoodTagGroups {
  const normalized = normalizeTagGroups(groups);
  const visitStatus = normalized.visitStatus ?? (Object.entries(VISIT_STATUS_LABELS).find(([, label]) => tags.includes(label))?.[0] as FoodTagGroups["visitStatus"]);
  const review = normalizeTags([...normalized.review, ...tags.filter((tag) => REVIEW_TAG_PRESETS.includes(tag))]);
  const cuisine = normalizeTags([...normalized.cuisine, ...tags.filter((tag) => CUISINE_TAG_PRESETS.includes(tag))]);
  const grouped = new Set([...Object.values(VISIT_STATUS_LABELS), ...review, ...cuisine, ...normalized.custom]);
  return {
    visitStatus,
    review,
    cuisine,
    custom: normalizeTags([...normalized.custom, ...tags.filter((tag) => !grouped.has(tag))])
  };
}
