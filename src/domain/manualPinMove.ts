import type { FoodPlace } from "./types";

export interface ManualPinMovePoint {
  longitude: number;
  latitude: number;
}

const STALE_CALIBRATION_TAGS = new Set(["待校准", "近似坐标", "默认候选", "位置待确认", "位置高风险", "陆地点修正"]);

export function canManuallyMovePlace(place?: FoodPlace): place is FoodPlace {
  return Boolean(place);
}

export function applyManualPinMove(place: FoodPlace, point: ManualPinMovePoint, movedAt = new Date().toISOString()): FoodPlace {
  if (!canManuallyMovePlace(place)) {
    throw new Error("只有用户保存的图钉可以手动挪动");
  }
  const retainedTags = place.tags.filter((tag) => !STALE_CALIBRATION_TAGS.has(tag));
  const tags = uniqueTags(["已核验", "精确坐标", "手动校准", ...retainedTags]);
  const audit = [
    "用户手动拖动图钉校准：",
    `原坐标：${place.latitude.toFixed(6)},${place.longitude.toFixed(6)}`,
    `新坐标：${point.latitude.toFixed(6)},${point.longitude.toFixed(6)}`,
    `操作时间：${movedAt}`,
    "地址未自动反查，请按需手动编辑。"
  ].join("\n");
  return {
    ...place,
    longitude: Number(point.longitude.toFixed(6)),
    latitude: Number(point.latitude.toFixed(6)),
    coordinateSystem: "wgs84",
    tags,
    notes: [place.notes, audit].filter(Boolean).join("\n\n"),
    mapAccuracy: "exact",
    updatedAt: movedAt
  };
}

function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}
