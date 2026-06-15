import type { FoodPlace } from "./types";
import { distanceMeters } from "./geo";

const GENERIC_WORD_PATTERN = /(武汉市|餐厅|饭店|酒楼|小吃|特色|品质|国际|美食|百汇|世家|老店|总店|分店|店)/g;

export interface DuplicatePlaceWarning {
  place: FoodPlace;
  distanceMeters: number;
  severity: "same-name" | "similar-name";
  message: string;
}

export function normalizeDuplicateName(name: string): string {
  return name
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(GENERIC_WORD_PATTERN, "")
    .replace(/[·・\-_\s]/g, "")
    .trim()
    .toLowerCase();
}

export function findDuplicatePlaceWarning(
  draft: Pick<FoodPlace, "name" | "longitude" | "latitude">,
  places: FoodPlace[],
  currentPlaceId?: string
): DuplicatePlaceWarning | undefined {
  const draftName = normalizeDuplicateName(draft.name);
  if (!draftName) return undefined;

  let best: DuplicatePlaceWarning | undefined;
  for (const place of places) {
    if (place.id === currentPlaceId) continue;
    const placeName = normalizeDuplicateName(place.name);
    if (!placeName) continue;
    const meters = distanceMeters(draft, place);
    const sameName = draftName === placeName;
    const similarName = draftName.includes(placeName) || placeName.includes(draftName);
    const matches = (sameName && meters <= 800) || (similarName && meters <= 300);
    if (!matches) continue;
    const warning: DuplicatePlaceWarning = {
      place,
      distanceMeters: meters,
      severity: sameName ? "same-name" : "similar-name",
      message: `可能与「${place.name}」重复，距离约 ${meters} 米。`
    };
    if (!best || warning.distanceMeters < best.distanceMeters) best = warning;
  }
  return best;
}
