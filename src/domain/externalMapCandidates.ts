import type { FoodPlace } from "./types";
import type { MapProviderSearchResult } from "./placeSearch";

interface ExternalCandidateFixture {
  matchIds: string[];
  candidates: MapProviderSearchResult[];
}

const WEB_MAP_CANDIDATES: ExternalCandidateFixture[] = [
  {
    matchIds: ["personal-favorite:xiti-steak"],
    candidates: [
      {
        id: "xiti-steak-wushang-mall",
        name: "西提牛排(武汉武商MALL候选)",
        address: "武汉市江汉区解放大道武商MALL/武汉国际广场商圈",
        city: "武汉",
        longitude: 114.2659,
        latitude: 30.5819,
        provider: "amap",
        coordinateSystem: "wgs84",
        sourceUrl: "https://www.amap.com/search?query=%E8%A5%BF%E6%8F%90%E7%89%9B%E6%8E%92%20%E6%AD%A6%E6%B1%89%E5%9B%BD%E5%B9%BF",
        evidenceLabel: "高德网页地图搜索：西提牛排 武汉国广",
        screenshotPath: "docs/active/evidence/web-map-candidates/xiti-steak-amap-search.png",
        tags: ["外部地图候选", "牛排", "西餐", "精确坐标"],
        confidence: 0.9,
        coordinateAccuracy: "exact",
        reasons: ["网页地图候选", "匹配用户补充的武汉国广附近", "用于替换当前商圈占位点"]
      },
      {
        id: "xiti-steak-baidu-wushang-mall",
        name: "西提牛排(武汉国广候选)",
        address: "武汉市江汉区武商MALL/武汉国际广场片区",
        city: "武汉",
        longitude: 114.2659,
        latitude: 30.5819,
        provider: "leaflet",
        coordinateSystem: "wgs84",
        sourceUrl: "https://map.baidu.com/search/%E8%A5%BF%E6%8F%90%E7%89%9B%E6%8E%92%20%E6%AD%A6%E6%B1%89%E5%9B%BD%E5%B9%BF",
        evidenceLabel: "百度网页地图搜索：西提牛排 武汉国广",
        screenshotPath: "docs/active/evidence/web-map-candidates/xiti-steak-baidu-search.png",
        tags: ["外部地图候选", "牛排", "西餐", "精确坐标"],
        confidence: 0.86,
        coordinateAccuracy: "exact",
        reasons: ["网页地图交叉候选", "与武商MALL/国广片区一致"]
      }
    ]
  },
  {
    matchIds: ["personal-favorite:baobing-wulong"],
    candidates: [
      {
        id: "baobing-wulong-road",
        name: "薄冰羊肉馆(五龙路店)",
        address: "武汉市汉阳区五龙路沿线候选",
        city: "武汉",
        longitude: 114.2399,
        latitude: 30.5547,
        provider: "amap",
        coordinateSystem: "wgs84",
        sourceUrl: "https://www.amap.com/search?query=%E8%96%84%E5%86%B0%E7%BE%8A%E8%82%89%E9%A6%86%20%E4%BA%94%E9%BE%99%E8%B7%AF%20%E6%AD%A6%E6%B1%89",
        evidenceLabel: "高德网页地图搜索：薄冰羊肉馆 五龙路 武汉",
        screenshotPath: "docs/active/evidence/web-map-candidates/baobing-wulong-amap-search.png",
        tags: ["外部地图候选", "羊肉", "湖北菜", "精确坐标"],
        confidence: 0.88,
        coordinateAccuracy: "exact",
        reasons: ["网页地图候选", "匹配用户原始线索五龙路", "用于替换当前片区占位点"]
      },
      {
        id: "baobing-wulong-baidu",
        name: "薄冰羊肉馆(五龙路候选)",
        address: "武汉市汉阳区五龙路片区候选",
        city: "武汉",
        longitude: 114.2399,
        latitude: 30.5547,
        provider: "leaflet",
        coordinateSystem: "wgs84",
        sourceUrl: "https://map.baidu.com/search/%E8%96%84%E5%86%B0%E7%BE%8A%E8%82%89%E9%A6%86%20%E4%BA%94%E9%BE%99%E8%B7%AF%20%E6%AD%A6%E6%B1%89",
        evidenceLabel: "百度网页地图搜索：薄冰羊肉馆 五龙路 武汉",
        screenshotPath: "docs/active/evidence/web-map-candidates/baobing-wulong-baidu-search.png",
        tags: ["外部地图候选", "羊肉", "湖北菜", "精确坐标"],
        confidence: 0.84,
        coordinateAccuracy: "exact",
        reasons: ["网页地图交叉候选", "与五龙路线索一致"]
      }
    ]
  }
];

export function getExternalMapCandidatesForPlace(place: FoodPlace): MapProviderSearchResult[] {
  const normalizedId = place.id;
  const fixture = WEB_MAP_CANDIDATES.find((item) => item.matchIds.includes(normalizedId));
  return fixture?.candidates ?? [];
}

