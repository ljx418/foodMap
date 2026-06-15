import type { FoodPlace } from "./types";

export type CoordinateRiskLevel = "ok" | "warning" | "blocked";

export interface CoordinateRiskAssessment {
  level: CoordinateRiskLevel;
  reasons: string[];
}

interface WaterBox {
  name: string;
  minLongitude: number;
  maxLongitude: number;
  minLatitude: number;
  maxLatitude: number;
}

const WUHAN_CENTRAL_WATER_BOXES: WaterBox[] = [
  {
    name: "长江武汉天地-武昌江滩水域",
    minLongitude: 114.303,
    maxLongitude: 114.327,
    minLatitude: 30.586,
    maxLatitude: 30.604
  },
  {
    name: "汉江汉口-汉阳交汇水域",
    minLongitude: 114.250,
    maxLongitude: 114.295,
    minLatitude: 30.548,
    maxLatitude: 30.596
  },
  {
    name: "东湖主湖水域",
    minLongitude: 114.355,
    maxLongitude: 114.445,
    minLatitude: 30.535,
    maxLatitude: 30.585
  },
  {
    name: "墨水湖水域",
    minLongitude: 114.205,
    maxLongitude: 114.275,
    minLatitude: 30.515,
    maxLatitude: 30.560
  }
];

export function assessCoordinateRisk(place: Pick<FoodPlace, "longitude" | "latitude" | "mapAccuracy" | "tags">): CoordinateRiskAssessment {
  const tagReasons = riskReasonsFromTags(place.tags);
  const waterArea = WUHAN_CENTRAL_WATER_BOXES.find((area) => isInsideWaterBox(place, area));
  if (!waterArea) {
    return tagReasons.length > 0 ? { level: "warning", reasons: tagReasons } : { level: "ok", reasons: [] };
  }
  const approximate = place.mapAccuracy === "approximate" || place.tags.includes("待校准") || place.tags.includes("近似坐标");
  return {
    level: approximate ? "warning" : "blocked",
    reasons: [
      ...tagReasons,
      `坐标落入疑似水域：${waterArea.name}`,
      approximate ? "当前只能作为待确认线索，不能解锁精确导航。" : "精确图钉不得落入水域，请重新核验或手动挪动。"
    ]
  };
}

export function isLikelyWaterCoordinate(point: Pick<FoodPlace, "longitude" | "latitude">): boolean {
  return WUHAN_CENTRAL_WATER_BOXES.some((area) => isInsideWaterBox(point, area));
}

function isInsideWaterBox(point: Pick<FoodPlace, "longitude" | "latitude">, area: WaterBox): boolean {
  return point.longitude >= area.minLongitude &&
    point.longitude <= area.maxLongitude &&
    point.latitude >= area.minLatitude &&
    point.latitude <= area.maxLatitude;
}

function riskReasonsFromTags(tags: string[]): string[] {
  const reasons: string[] = [];
  if (tags.includes("位置高风险")) {
    reasons.push("该地点未通过多源位置核验，当前坐标只保留为候选线索。");
  }
  if (tags.includes("位置待确认")) {
    reasons.push("请通过候选确认或手动挪动图钉后再用于导航。");
  }
  return reasons;
}
