import { CUISINE_TAG_PRESETS, REVIEW_TAG_PRESETS } from "../domain/tagGroups";
import { normalizeTags } from "../domain/validators";
import type { AmapScanlistRecommendation } from "./types";

export interface RecommendationTagGroups {
  review: string[];
  cuisine: string[];
  custom: string[];
}

export const RECOMMENDATION_REVIEW_FILTERS = ["夯", "值得排队", "下次还来", "一般"];

export const RECOMMENDATION_CUISINE_FILTERS = [
  "牛肉粉",
  "热干面",
  "火锅",
  "川菜",
  "小龙虾",
  "炭烤",
  "湖北菜",
  "包点",
  "甜品",
  "自助"
];

export function getRecommendationTagGroups(recommendation: AmapScanlistRecommendation): RecommendationTagGroups {
  const text = [
    recommendation.name,
    recommendation.address,
    recommendation.summaryReview,
    ...recommendation.tags,
    ...recommendation.publicReviewSnippets
  ].join(" ");
  const review = new Set<string>();
  const cuisine = new Set<string>();

  if (recommendation.score >= 4.82) review.add("夯");
  if (recommendation.score >= 4.78 || /排队|招牌|头牌|首选|私藏|必点/.test(text)) review.add("值得排队");
  if (/下次|再来|二刷|回头|推荐/.test(text)) review.add("下次还来");
  if (recommendation.score < 4.65) review.add("一般");

  addCuisine(cuisine, text);

  const custom = normalizeTags([
    recommendation.district,
    recommendation.locationAccuracy === "approximate" ? "近似坐标" : "精确坐标",
    "高德扫街榜"
  ]);

  return {
    review: normalizeTags(Array.from(review).filter((tag) => REVIEW_TAG_PRESETS.includes(tag) || RECOMMENDATION_REVIEW_FILTERS.includes(tag))),
    cuisine: normalizeTags(Array.from(cuisine).filter((tag) => CUISINE_TAG_PRESETS.includes(tag) || RECOMMENDATION_CUISINE_FILTERS.includes(tag))),
    custom
  };
}

export function getRecommendationFilterTags(recommendation: AmapScanlistRecommendation): string[] {
  const groups = getRecommendationTagGroups(recommendation);
  return normalizeTags([...recommendation.tags, ...groups.review, ...groups.cuisine, ...groups.custom]);
}

export function collectRecommendationGroupedTags(recommendations: AmapScanlistRecommendation[]): { review: string[]; cuisine: string[] } {
  const review = new Set<string>();
  const cuisine = new Set<string>();
  recommendations.forEach((recommendation) => {
    const groups = getRecommendationTagGroups(recommendation);
    groups.review.forEach((tag) => review.add(tag));
    groups.cuisine.forEach((tag) => cuisine.add(tag));
  });
  return {
    review: sortKnownTags(Array.from(review), RECOMMENDATION_REVIEW_FILTERS),
    cuisine: sortKnownTags(Array.from(cuisine), RECOMMENDATION_CUISINE_FILTERS)
  };
}

function addCuisine(cuisine: Set<string>, text: string): void {
  const rules: Array<[RegExp, string]> = [
    [/牛肉粉|宽粉|粉馆|泡粉/, "牛肉粉"],
    [/热干面|拌面|汤面|面馆|加面/, "热干面"],
    [/火锅|重庆|牛油锅|涮/, "火锅"],
    [/川菜|麻辣|辣子|水煮|干锅/, "川菜"],
    [/小龙虾|龙虾|虾球|蟹钳|罗氏虾|蟹神/, "小龙虾"],
    [/炭烤|烧烤|烤虾|烤肉|烤鱼|烤/, "炭烤"],
    [/湖北菜|藕汤|排骨汤|鱼圆|豆皮|糊汤粉|院里菜|家常菜|土菜|饭店|餐厅/, "湖北菜"],
    [/包子|烧麦|烧卖|酥饺|油饼|锅贴|煎包/, "包点"],
    [/甜|千层|蛋糕|饮品|奶茶|甜品/, "甜品"],
    [/自助|百汇|海鲜自助|放题/, "自助"]
  ];
  rules.forEach(([pattern, tag]) => {
    if (pattern.test(text)) cuisine.add(tag);
  });
}

function sortKnownTags(tags: string[], knownOrder: string[]): string[] {
  return tags.sort((a, b) => {
    const indexA = knownOrder.indexOf(a);
    const indexB = knownOrder.indexOf(b);
    if (indexA !== -1 || indexB !== -1) {
      return (indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA) - (indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB);
    }
    return a.localeCompare(b, "zh-Hans-CN");
  });
}
