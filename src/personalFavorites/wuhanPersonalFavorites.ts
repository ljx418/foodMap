import { groupsFromTags, tagsFromGroups } from "../domain/tagGroups";
import type { FoodPlace, FoodRating, VisitStatusTag } from "../domain/types";

export const PERSONAL_FAVORITE_LAYER_ID = "layer-personal-favorites";

export interface PersonalFavoriteEntry {
  id: string;
  raw: string;
  name: string;
  visited: boolean;
  score?: number;
  cuisineTags: string[];
}

export interface VerifiedPersonalFavoritePin extends PersonalFavoriteEntry {
  address: string;
  district: string;
  longitude: number;
  latitude: number;
  coordinateAccuracy: "exact" | "approximate";
  confidence: number;
  evidence: string[];
  verificationNote: string;
}

export interface PendingPersonalFavoriteEntry extends PersonalFavoriteEntry {
  reason: string;
  possibleScope?: string;
}

export type PersonalFavoriteMapAdmission = "verified" | "needs-calibration";

const HIGH_RISK_POSITION_IDS = new Set([
  "sosen-zhengxian",
  "crazyones-wuhan-tiandi",
  "chongqing-noodle",
  "goya",
  "meijie",
  "sushiro",
  "baodao-seafood-bbq",
  "xiaoxilong",
  "shuangxi-teppanyaki"
]);

export const PERSONAL_FAVORITE_ENTRIES: PersonalFavoriteEntry[] = [
  entry("sushiro", "寿司郎✓90", "寿司郎", true, 90, ["日料", "寿司"]),
  entry("sosen-zhengxian", "粗茶淡饭 争鲜✓84", "粗茶淡饭 争鲜", true, 84, ["日料", "寿司"]),
  entry("yongxin-seafood", "永信海鲜", "永信海鲜", false, undefined, ["海鲜"]),
  entry("chuanpangzi", "川胖子", "川胖子", false, undefined, ["川菜"]),
  entry("kaihuo-hanyang-rose", "开火泥炉老火锅·宵夜沸腾（汉阳玫瑰街店）", "开火泥炉老火锅·宵夜沸腾（汉阳玫瑰街店）", false, undefined, ["火锅", "宵夜"]),
  entry("dajun-dongbei", "大军东北菜粗粮馆√90", "大军东北菜粗粮馆", true, 90, ["东北菜"]),
  entry("xiaohuzi-xiangbiao", "小胡子祥彪√87", "小胡子祥彪", true, 87, ["小吃"]),
  entry("xiaoyu-bbq", "小宇烧烤√95", "小宇烧烤", true, 95, ["烧烤", "炭烤", "宵夜"]),
  entry("niupaijia", "牛排家√", "牛排家", true, undefined, ["牛排", "西餐"]),
  entry("wangpin", "王品牛排√", "王品牛排", true, undefined, ["牛排", "西餐"]),
  entry("xinjishan", "新极膳／95", "新极膳", true, 95, ["日料"]),
  entry("dayu-vanke-future", "大渔铁板烧 万科未来中心 ✓96", "大渔铁板烧(武汉万科未来中心店)", true, 96, ["铁板烧", "日料"]),
  entry("baodao-seafood-bbq", "宝岛海鲜烧烤", "宝岛海鲜烧烤", false, undefined, ["海鲜", "烧烤"]),
  entry("crazyones-wuhan-tiandi", "CRAZYONES克芮旺斯西班牙餐厅XXBUFF√", "CRAZYONES克芮旺斯西班牙餐厅XXBUFF", true, undefined, ["西餐", "自助"]),
  entry("xiaoxilong", "小熙龙酒店✓", "小熙龙酒店", true, undefined, ["湖北菜"]),
  entry("zengshi-brothers-beef-noodle", "曾氏兄弟牛肉面馆√", "曾氏兄弟牛肉面馆", true, undefined, ["牛肉面", "小吃"]),
  entry("quanjude-xunlimen", "全聚德 循礼门国金店", "全聚德(循礼门国金店)", false, undefined, ["烤鸭", "北京菜"]),
  entry("yeego", "野果yeego√73", "野果yeego", true, 73, ["西餐", "甜品"]),
  entry("chongqing-noodle", "重庆面庄√82", "重庆面庄", true, 82, ["面馆", "小吃"]),
  entry("dongbeiren-bbq", "东北人烤肉√92", "东北人烤肉", true, 92, ["东北菜", "烤肉"]),
  entry("xieyaoyao", "谢妖幺千滋兔自贡盐帮菜√89", "谢妖幺千滋兔自贡盐帮菜", true, 89, ["川菜"]),
  entry("shuangxi-teppanyaki", "双喜铁板烧√83", "双喜铁板烧", true, 83, ["铁板烧"]),
  entry("goya", "戈雅法餐厅√80", "戈雅法餐厅", true, 80, ["法餐", "西餐"]),
  entry("sanjiequ-28", "三街区28号饭店／92", "三街区28号饭店", true, 92, ["湖北菜"]),
  entry("baobing-wulong", "薄冰羊肉馆 五龙路√95", "薄冰羊肉馆(五龙路店)", true, 95, ["羊肉", "湖北菜"]),
  entry("xiahuang", "虾皇√85", "虾皇", true, 85, ["小龙虾", "湖北菜"]),
  entry("laoyoudie", "老油碟 三拖一火锅／96", "老油碟三拖一火锅", true, 96, ["火锅"]),
  entry("meijie", "梅姐√89", "梅姐", true, 89, ["小吃"]),
  entry("zhuguangyu", "朱光玉√88", "朱光玉", true, 88, ["火锅"]),
  entry("benluobo", "笨萝卜√90", "笨萝卜", true, 90, ["湘菜"]),
  entry("shanmanman", "山慢慢跷脚牛肉√75", "山慢慢跷脚牛肉", true, 75, ["跷脚牛肉", "川菜"]),
  entry("pingjie-guanggu", "萍姐火锅 光谷店 ✓83", "萍姐火锅(光谷店)", true, 83, ["火锅"]),
  entry("xiti-steak", "西提牛排 ✓ 82", "西提牛排", true, 82, ["牛排", "西餐"]),
  entry("shangchang-simenkou", "上场 老火锅 司门口黄鹤楼附近 ✓ 92", "上场老火锅(司门口黄鹤楼店)", true, 92, ["火锅"]),
  entry("xiashi-casserole", "夏氏砂锅 ✓ 93", "夏氏砂锅(总店)", true, 93, ["砂锅", "湖北菜"])
];

export const VERIFIED_PERSONAL_FAVORITE_PINS: VerifiedPersonalFavoritePin[] = [
  verified("kaihuo-hanyang-rose", {
    address: "汉阳区玫瑰街片区，近汉阳大道与玫瑰街",
    district: "汉阳区",
    longitude: 114.222,
    latitude: 30.559,
    coordinateAccuracy: "approximate",
    confidence: 0.81,
    evidence: ["用户原始条目包含明确分店：汉阳玫瑰街店", "公开地图/搜索可检索到同名汉阳玫瑰街门店"],
    verificationNote: "分店名明确；当前坐标为玫瑰街商圈近似点，详情页标记为近似坐标。"
  }),
  verified("dayu-vanke-future", {
    address: "武汉万科未来中心",
    district: "洪山区",
    longitude: 114.411,
    latitude: 30.493,
    coordinateAccuracy: "approximate",
    confidence: 0.8,
    evidence: ["用户原始条目包含明确商场：万科未来中心", "公开搜索可检索到大渔铁板烧武汉万科未来中心店"],
    verificationNote: "商场分店明确；当前为商场级近似坐标，需用户后续可手动微调。"
  }),
  verified("crazyones-wuhan-tiandi", {
    address: "江岸区武汉天地/壹方购物中心陆地区域（近似点）",
    district: "江岸区",
    longitude: 114.3036,
    latitude: 30.6072,
    coordinateAccuracy: "approximate",
    confidence: 0.7,
    evidence: ["用户原始条目包含品牌名：CRAZYONES 克芮旺斯", "未取得稳定公开门牌；当前仅按武汉天地/壹方购物中心陆地区域保留近似点", "旧坐标触发长江水域风险，已迁出水域"],
    verificationNote: "未取得可稳定引用的精确门店地址；当前坐标为武汉天地/壹方购物中心陆地区域近似点，必须继续待校准。"
  }),
  verified("quanjude-xunlimen", {
    address: "江汉区循礼门国金中心片区",
    district: "江汉区",
    longitude: 114.2869,
    latitude: 30.585,
    coordinateAccuracy: "approximate",
    confidence: 0.8,
    evidence: ["用户原始条目包含明确分店：循礼门国金店", "循礼门国金中心片区可定位"],
    verificationNote: "分店名明确；当前为国金中心商圈近似坐标。"
  }),
  verified("xieyaoyao", {
    address: "武昌区丁字桥南路片区",
    district: "武昌区",
    longitude: 114.327,
    latitude: 30.505,
    coordinateAccuracy: "approximate",
    confidence: 0.79,
    evidence: ["公开搜索可检索到谢妖幺千滋兔自贡盐帮菜武汉门店", "名称与用户条目完全匹配"],
    verificationNote: "同名武汉门店可检索；当前坐标为丁字桥南路片区近似点。"
  }),
  verified("sanjiequ-28", {
    address: "武昌区楚河汉街第三街区28号附近",
    district: "武昌区",
    longitude: 114.345,
    latitude: 30.559,
    coordinateAccuracy: "approximate",
    confidence: 0.82,
    evidence: ["用户原始条目包含明确名称：三街区28号饭店", "公开搜索可定位到楚河汉街第三街区28号片区"],
    verificationNote: "门店名自带街区门牌；当前为楚河汉街三街区近似坐标。"
  }),
  verified("baobing-wulong", {
    address: "汉阳区五龙路片区",
    district: "汉阳区",
    longitude: 114.248,
    latitude: 30.543,
    coordinateAccuracy: "approximate",
    confidence: 0.81,
    evidence: ["用户原始条目包含明确道路：五龙路", "公开搜索可检索到薄冰羊肉馆五龙路相关门店"],
    verificationNote: "道路线索明确；当前为五龙路片区近似坐标。"
  }),
  verified("shanmanman", {
    address: "武汉市武昌区中南/洪山广场片区",
    district: "武昌区",
    longitude: 114.332,
    latitude: 30.535,
    coordinateAccuracy: "approximate",
    confidence: 0.79,
    evidence: ["公开搜索可检索到山慢慢跷脚牛肉武汉门店", "名称与用户条目完全匹配"],
    verificationNote: "同名武汉门店可检索；坐标为可复核片区近似点。"
  }),
  verified("pingjie-guanggu", {
    address: "洪山区光谷片区",
    district: "洪山区",
    longitude: 114.405,
    latitude: 30.506,
    coordinateAccuracy: "approximate",
    confidence: 0.8,
    evidence: ["用户原始条目包含明确分店：光谷店", "光谷商圈可定位"],
    verificationNote: "分店名明确；当前为光谷商圈近似坐标。"
  }),
  verified("shangchang-simenkou", {
    address: "武昌区司门口黄鹤楼片区",
    district: "武昌区",
    longitude: 114.304,
    latitude: 30.548,
    coordinateAccuracy: "approximate",
    confidence: 0.8,
    evidence: ["用户原始条目包含明确位置：司门口黄鹤楼附近", "司门口黄鹤楼商圈可定位"],
    verificationNote: "位置线索明确；当前为司门口黄鹤楼片区近似坐标。"
  }),
  verified("xiashi-casserole", {
    address: "江汉区雪松路73号",
    district: "江汉区",
    longitude: 114.269349,
    latitude: 30.592914,
    coordinateAccuracy: "exact",
    confidence: 0.93,
    evidence: ["项目扫街榜人工核验记录：夏氏砂锅(总店)，江汉区雪松路73号", "Apple Maps/公开地图证据已在项目内人工覆盖核验"],
    verificationNote: "复用项目内已通过人工复核的精确坐标。"
  })
];

export const DEFAULT_PERSONAL_FAVORITE_PINS: VerifiedPersonalFavoritePin[] = [
  preferred("sushiro", {
    name: "寿司郎(王家湾店)",
    address: "汉阳区王家湾商圈",
    district: "汉阳区",
    longitude: 114.212,
    latitude: 30.561,
    cuisineTags: ["日料", "寿司"],
    confidence: 0.82,
    verificationNote: "用户补充明确分店：王家湾店；按王家湾商圈坐标上图。"
  }),
  preferred("sosen-zhengxian", {
    name: "粗茶淡饭 争鲜(光谷世界城候选)",
    address: "洪山区光谷世界城附近",
    district: "洪山区",
    longitude: 114.404,
    latitude: 30.506,
    cuisineTags: ["日料", "寿司"],
    confidence: 0.74,
    verificationNote: "用户补充位置：光谷世界城附近；名称可能包含两家店，本轮按一条用户记录只上一家光谷世界城候选。"
  }),
  preferred("dajun-dongbei", {
    address: "武昌区铁机路附近",
    district: "武昌区",
    longitude: 114.356,
    latitude: 30.601,
    confidence: 0.8,
    verificationNote: "用户补充位置：铁机路附近；按铁机路片区坐标上图。"
  }),
  preferred("xiaohuzi-xiangbiao", {
    name: "小胡子祥彪(后湖总店)",
    address: "江岸区后湖片区",
    district: "江岸区",
    longitude: 114.302,
    latitude: 30.651,
    confidence: 0.82,
    verificationNote: "用户补充明确分店：后湖总店；按后湖片区坐标上图。"
  }),
  preferred("xiaoyu-bbq", {
    name: "小宇炭烤(江欣苑路店)",
    address: "汉阳区江欣苑路墨水湖片区，近江堤中路",
    district: "汉阳区",
    longitude: 114.249,
    latitude: 30.526,
    confidence: 0.72,
    verificationNote: "用户补充明确道路：江欣苑路；公开公交线路可确认江欣苑路墨水湖与江堤中路走廊存在，但未取得精确门牌，本轮按江欣苑路墨水湖片区近似上图。"
  }),
  preferred("niupaijia", {
    name: "牛排家(万象城店)",
    address: "江岸区武汉万象城",
    district: "江岸区",
    longitude: 114.284,
    latitude: 30.604,
    confidence: 0.82,
    verificationNote: "用户补充明确分店：万象城店；按武汉万象城坐标上图。"
  }),
  preferred("wangpin", {
    name: "王品牛排(武汉国广店)",
    address: "江汉区武汉国际广场",
    district: "江汉区",
    longitude: 114.270,
    latitude: 30.580,
    confidence: 0.84,
    verificationNote: "用户补充明确分店：武汉国广店；按武汉国际广场坐标上图。"
  }),
  preferred("xinjishan", {
    name: "新极膳(万科未来中心店)",
    address: "洪山区武汉万科未来中心",
    district: "洪山区",
    longitude: 114.411,
    latitude: 30.493,
    confidence: 0.84,
    verificationNote: "用户补充明确分店：万科未来中心店；按武汉万科未来中心坐标上图。"
  }),
  preferred("baodao-seafood-bbq", {
    address: "洪山区绿缘路附近",
    district: "洪山区",
    longitude: 114.415,
    latitude: 30.518,
    confidence: 0.76,
    verificationNote: "用户补充位置：绿缘路附近；按绿缘路片区坐标上图。"
  }),
  preferred("xiaoxilong", {
    address: "江汉区江汉路附近",
    district: "江汉区",
    longitude: 114.286,
    latitude: 30.584,
    confidence: 0.76,
    verificationNote: "用户补充位置：江汉路附近；按江汉路片区坐标上图。"
  }),
  preferred("zengshi-brothers-beef-noodle", {
    address: "汉阳区麒麟路附近",
    district: "汉阳区",
    longitude: 114.224,
    latitude: 30.554,
    confidence: 0.8,
    verificationNote: "用户补充位置：麒麟路附近；按麒麟路片区坐标上图。"
  }),
  preferred("yeego", {
    name: "野果yeego(光谷K11候选)",
    address: "洪山区光谷K11附近",
    district: "洪山区",
    longitude: 114.410,
    latitude: 30.513,
    confidence: 0.8,
    verificationNote: "用户补充位置：光谷K11附近；按光谷K11片区坐标上图。"
  }),
  preferred("chongqing-noodle", {
    name: "重庆面庄(江汉路候选)",
    address: "江汉区江汉路/循礼门片区",
    district: "江汉区",
    longitude: 114.286,
    latitude: 30.584,
    confidence: 0.74,
    verificationNote: "用户补充位置：江汉路附近；名称仍较泛，按江汉路片区坐标上图。"
  }),
  preferred("dongbeiren-bbq", {
    name: "东北人烤肉(K11店)",
    address: "洪山区光谷K11",
    district: "洪山区",
    longitude: 114.410,
    latitude: 30.513,
    confidence: 0.82,
    verificationNote: "用户补充明确分店：K11店；按光谷K11坐标上图。"
  }),
  preferred("shuangxi-teppanyaki", {
    address: "武昌区武汉大学附近",
    district: "武昌区",
    longitude: 114.364,
    latitude: 30.541,
    confidence: 0.76,
    verificationNote: "用户补充位置：武大附近；按武汉大学片区坐标上图。"
  }),
  preferred("goya", {
    name: "戈雅法餐厅(壹方公馆候选)",
    address: "用户线索：壹方公馆；公开搜索未稳定命中具体门店，需人工确认",
    district: "江岸区",
    longitude: 114.311,
    latitude: 30.600,
    confidence: 0.55,
    verificationNote: "用户补充位置：壹方公馆；本轮联网搜索未获得稳定公开门牌或可引用门店页，当前坐标仅为用户线索占位点，不能作为真实门店位置。"
  }),
  preferred("xiahuang", {
    name: "虾皇(光谷六路店)",
    address: "洪山区光谷六路片区",
    district: "洪山区",
    longitude: 114.505,
    latitude: 30.489,
    confidence: 0.84,
    verificationNote: "用户补充明确分店：光谷六路店；按光谷六路片区坐标上图。"
  }),
  preferred("meijie", {
    name: "梅姐(光谷世界城候选)",
    address: "洪山区光谷世界城",
    district: "洪山区",
    longitude: 114.404,
    latitude: 30.506,
    confidence: 0.78,
    verificationNote: "用户补充位置：光谷世界城；按光谷世界城坐标上图。"
  }),
  preferred("zhuguangyu", {
    name: "朱光玉火锅馆(大悦城店)",
    address: "武昌区武汉大悦城片区",
    district: "武昌区",
    longitude: 114.348,
    latitude: 30.589,
    confidence: 0.82,
    verificationNote: "用户补充明确分店：大悦城店；按武汉大悦城片区坐标上图。"
  }),
  preferred("benluobo", {
    name: "笨萝卜浏阳菜馆(江汉路马客茂店)",
    address: "江汉区江汉路马客茂片区",
    district: "江汉区",
    longitude: 114.287,
    latitude: 30.584,
    confidence: 0.84,
    verificationNote: "用户补充明确分店：江汉路马客茂店；按马客茂/江汉路片区坐标上图。"
  }),
  preferred("xiti-steak", {
    name: "西提牛排(武汉国广候选)",
    address: "江汉区武汉国际广场附近",
    district: "江汉区",
    longitude: 114.270,
    latitude: 30.580,
    confidence: 0.8,
    verificationNote: "用户补充位置：武汉国广附近；按武汉国际广场片区坐标上图。"
  })
];

export const SELECTED_PERSONAL_FAVORITE_PINS: VerifiedPersonalFavoritePin[] = [
  ...VERIFIED_PERSONAL_FAVORITE_PINS,
  ...DEFAULT_PERSONAL_FAVORITE_PINS
].sort((a, b) => PERSONAL_FAVORITE_ENTRIES.findIndex((item) => item.id === a.id) - PERSONAL_FAVORITE_ENTRIES.findIndex((item) => item.id === b.id));

export const MAP_READY_PERSONAL_FAVORITE_PINS: VerifiedPersonalFavoritePin[] = SELECTED_PERSONAL_FAVORITE_PINS
  .filter((pin) => pin.coordinateAccuracy === "exact");

export const MAP_ADMITTED_PERSONAL_FAVORITE_PINS: VerifiedPersonalFavoritePin[] = SELECTED_PERSONAL_FAVORITE_PINS;

export const PENDING_PERSONAL_FAVORITES: PendingPersonalFavoriteEntry[] = PERSONAL_FAVORITE_ENTRIES
  .filter((item) => !SELECTED_PERSONAL_FAVORITE_PINS.some((pin) => pin.id === item.id))
  .map((item) => ({
    ...item,
    reason: pendingReason(item),
    possibleScope: pendingScope(item)
  }));

export function personalScoreToRating(score?: number, visited = false): FoodRating {
  if (typeof score !== "number") return visited ? 4 : 3;
  return roundRating(clamp(((score - 65) / 35) * 5, 0, 5));
}

export function verifiedFavoriteToFoodPlace(pin: VerifiedPersonalFavoritePin): FoodPlace {
  const admission = personalFavoriteMapAdmission(pin);
  const visitStatus: VisitStatusTag = pin.visited || typeof pin.score === "number" ? "eaten" : "want";
  const reviewTags = typeof pin.score === "number"
    ? [pin.score >= 90 ? "夯" : pin.score >= 80 ? "下次还来" : pin.score >= 70 ? "一般" : "不推荐"]
    : ["评分待补"];
  const customTags = [
    "我的收藏",
    pin.coordinateAccuracy === "exact" ? "精确坐标" : "近似坐标",
    admission === "needs-calibration" ? "待校准" : "已核验",
    admission === "needs-calibration" ? "位置待确认" : undefined,
    HIGH_RISK_POSITION_IDS.has(pin.id) || pin.confidence < 0.75 ? "位置高风险" : undefined,
    pin.id === "crazyones-wuhan-tiandi" ? "陆地点修正" : undefined,
    pin.confidence < 0.75 ? "默认候选" : undefined
  ].filter((tag): tag is string => Boolean(tag));
  const tagGroups = groupsFromTags([], {
    visitStatus,
    review: reviewTags,
    cuisine: pin.cuisineTags,
    custom: customTags
  });
  const tags = tagsFromGroups(tagGroups);
  const now = "2026-06-09T00:00:00.000+08:00";
  return {
    id: `personal-favorite:${pin.id}`,
    name: pin.name,
    longitude: pin.longitude,
    latitude: pin.latitude,
    coordinateSystem: "wgs84",
    address: pin.address,
    city: "武汉",
    layerId: PERSONAL_FAVORITE_LAYER_ID,
    tags,
    rating: personalScoreToRating(pin.score, pin.visited),
    visitedAt: "2026-06-09",
    notes: [
      `原始记录：${pin.raw}`,
      typeof pin.score === "number" ? `个人百分制评分：${pin.score}` : "个人百分制评分：待补",
      typeof pin.score === "number" ? `五分制折算：${personalScoreToRating(pin.score, pin.visited).toFixed(1)} 星（公式：(百分制评分 - 65) / 35 * 5）` : undefined,
      admission === "needs-calibration" ? "上图状态：待校准图钉；当前坐标只用于在地图上保留个人记忆点，不作为精确导航依据。" : "上图状态：已核验精确图钉。",
      `核验置信度：${Math.round(pin.confidence * 100)}%，${pin.verificationNote}`,
      `核验证据：${pin.evidence.join("；")}`
    ].filter(Boolean).join("\n"),
    photoIds: [],
    tagGroups,
    createdAt: now,
    updatedAt: now,
    mapAccuracy: pin.coordinateAccuracy
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundRating(value: number): FoodRating {
  return Number(value.toFixed(1));
}

export function personalFavoriteMapAdmission(pin: VerifiedPersonalFavoritePin): PersonalFavoriteMapAdmission {
  return pin.coordinateAccuracy === "exact" && pin.confidence >= 0.9 ? "verified" : "needs-calibration";
}

function entry(id: string, raw: string, name: string, visited: boolean, score: number | undefined, cuisineTags: string[]): PersonalFavoriteEntry {
  return { id, raw, name, visited: visited || typeof score === "number", score, cuisineTags };
}

function verified(id: string, data: Omit<VerifiedPersonalFavoritePin, keyof PersonalFavoriteEntry>): VerifiedPersonalFavoritePin {
  const base = PERSONAL_FAVORITE_ENTRIES.find((item) => item.id === id);
  if (!base) throw new Error(`Unknown personal favorite id: ${id}`);
  return { ...base, ...data };
}

function preferred(
  id: string,
  data: Partial<Pick<VerifiedPersonalFavoritePin, "name" | "cuisineTags">> &
    Omit<VerifiedPersonalFavoritePin, keyof PersonalFavoriteEntry | "coordinateAccuracy" | "evidence">
): VerifiedPersonalFavoritePin {
  const base = PERSONAL_FAVORITE_ENTRIES.find((item) => item.id === id);
  if (!base) throw new Error(`Unknown personal favorite id: ${id}`);
  return {
    ...base,
    ...data,
    name: data.name ?? base.name,
    cuisineTags: data.cuisineTags ?? base.cuisineTags,
    coordinateAccuracy: "approximate",
    evidence: [
      "用户规则：重名/连锁/模糊店优先采用高德搜索 Top 或评分高候选",
      "当前为默认候选上图，满足每条用户输入都有且只有一家上图；后续可按用户纠偏替换"
    ]
  };
}

function pendingReason(item: PersonalFavoriteEntry): string {
  if (item.id === "laoyoudie") {
    return "用户补充城市为重庆；当前项目为武汉美食地图，不作为武汉图钉上图。";
  }
  if (["寿司郎", "王品牛排", "西提牛排", "朱光玉", "笨萝卜", "虾皇"].includes(item.name)) {
    return "武汉存在连锁或多分店，用户条目未给出具体门店，先不上正式图钉。";
  }
  if (["重庆面庄", "梅姐", "川胖子", "永信海鲜", "宝岛海鲜烧烤"].includes(item.name)) {
    return "名称过泛或同名概率高，缺少可核验分店/道路/商场线索。";
  }
  return "当前未形成足够稳定的地址与坐标证据，需用户补充分店、地址或截图后再上图。";
}

function pendingScope(item: PersonalFavoriteEntry): string | undefined {
  const scopeById: Record<string, string> = {
    sushiro: "请确认具体商场/门店，如江汉路、武商梦时代、光谷等。",
    "sosen-zhengxian": "请确认“粗茶淡饭”和“争鲜”是否为同一家记录，或是否需要拆成两条。",
    xiahuang: "请确认虾皇具体分店。",
    zhuguangyu: "请确认朱光玉具体分店。",
    benluobo: "请确认笨萝卜具体分店；项目内已有江汉路马客茂店坐标，但不能默认采用。",
    "xiti-steak": "请确认西提牛排具体分店。",
    wangpin: "请确认王品牛排具体分店。"
  };
  return scopeById[item.id];
}
