import type { FoodLayer, FoodPlace } from "../domain/types";
import { normalizeTags } from "../domain/validators";
import { deleteFromStore, getAllFromStore, getFromStore, putInStore } from "./db";
import {
  MAP_ADMITTED_PERSONAL_FAVORITE_PINS,
  PERSONAL_FAVORITE_ENTRIES,
  PERSONAL_FAVORITE_LAYER_ID,
  verifiedFavoriteToFoodPlace,
} from "../personalFavorites/wuhanPersonalFavorites";

const PERSONAL_FAVORITE_SEED_VERSION = "2026-06-12-personal-favorites-v8-score-formula";
const PERSONAL_FAVORITE_META_KEY = "personal-favorites-seed";
const PERSONAL_FAVORITE_SCORE_META_KEY = "personal-favorites-score-model";
const PERSONAL_FAVORITE_SCORE_MODEL_VERSION = "2026-06-12-score-formula-v1";
const PERSONAL_FAVORITE_COORDINATE_META_KEY = "personal-favorites-coordinate-risk";
const PERSONAL_FAVORITE_COORDINATE_MODEL_VERSION = "2026-06-12-water-risk-v2-full-pending-audit";

interface SeedMeta {
  key: string;
  version: string;
  seededAt: string;
}

const PERSONAL_FAVORITE_LAYER: FoodLayer = {
  id: PERSONAL_FAVORITE_LAYER_ID,
  name: "我的收藏",
  icon: "heart",
  color: "#2F8F6F",
  visible: true,
  sortOrder: 60
};

export async function ensurePersonalFavoriteLayer(): Promise<void> {
  await upsertPersonalFavoriteLayer();
  await migrateExistingPersonalFavoritePinsIfNeeded();
  await repairPartialPersonalFavoriteImport();
  await migrateExistingPersonalFavoriteScoresIfNeeded();
  await migrateExistingPersonalFavoriteCoordinateRiskIfNeeded();
}

export async function importPersonalFavoritePins(): Promise<number> {
  await ensurePersonalFavoriteLayer();
  const verifiedPlaces = MAP_ADMITTED_PERSONAL_FAVORITE_PINS.map(verifiedFavoriteToFoodPlace);
  const meta = await getFromStore<SeedMeta>("meta", PERSONAL_FAVORITE_META_KEY);
  const existingPlaces = await getAllFromStore<FoodPlace>("places");
  if (meta?.version === PERSONAL_FAVORITE_SEED_VERSION && hasCompletePersonalFavoriteImport(existingPlaces)) {
    return verifiedPlaces.length;
  }

  const selectedIds = new Set(verifiedPlaces.map((place) => place.id));
  const allSeedIds = PERSONAL_FAVORITE_ENTRIES.map((entry) => `personal-favorite:${entry.id}`);

  await Promise.all(verifiedPlaces.map((place) => putInStore("places", place)));

  await Promise.all(allSeedIds
    .filter((id) => !selectedIds.has(id))
    .map((id) => deleteFromStore("places", id)));

  await putInStore<SeedMeta>("meta", {
    key: PERSONAL_FAVORITE_META_KEY,
    version: PERSONAL_FAVORITE_SEED_VERSION,
    seededAt: new Date().toISOString()
  });
  return verifiedPlaces.length;
}

async function upsertPersonalFavoriteLayer(): Promise<void> {
  const existing = await getFromStore<FoodLayer>("layers", PERSONAL_FAVORITE_LAYER_ID);
  if (!existing) {
    await putInStore("layers", PERSONAL_FAVORITE_LAYER);
    return;
  }
  if (existing.name !== PERSONAL_FAVORITE_LAYER.name || existing.sortOrder !== PERSONAL_FAVORITE_LAYER.sortOrder) {
    await putInStore("layers", { ...PERSONAL_FAVORITE_LAYER, visible: existing.visible });
  }
}

async function migrateExistingPersonalFavoritePinsIfNeeded(): Promise<void> {
  const places = await getAllFromStore<FoodPlace>("places");
  const admittedIds = new Set(MAP_ADMITTED_PERSONAL_FAVORITE_PINS.map((pin) => `personal-favorite:${pin.id}`));
  await Promise.all(
    places
      .filter((place) => place.id.startsWith("personal-favorite:") && !admittedIds.has(place.id))
      .map((place) => deleteFromStore("places", place.id))
  );
}

async function repairPartialPersonalFavoriteImport(): Promise<void> {
  const places = await getAllFromStore<FoodPlace>("places");
  const existingPersonalFavorites = places.filter((place) => place.id.startsWith("personal-favorite:"));
  if (existingPersonalFavorites.length === 0 || hasCompletePersonalFavoriteImport(places)) return;

  const existingIds = new Set(existingPersonalFavorites.map((place) => place.id));
  const missingPlaces = MAP_ADMITTED_PERSONAL_FAVORITE_PINS
    .map(verifiedFavoriteToFoodPlace)
    .filter((place) => !existingIds.has(place.id));

  await Promise.all(missingPlaces.map((place) => putInStore("places", place)));
}

async function migrateExistingPersonalFavoriteScoresIfNeeded(): Promise<void> {
  const meta = await getFromStore<SeedMeta>("meta", PERSONAL_FAVORITE_SCORE_META_KEY);
  if (meta?.version === PERSONAL_FAVORITE_SCORE_MODEL_VERSION) return;

  const canonicalPlaces = new Map(MAP_ADMITTED_PERSONAL_FAVORITE_PINS.map((pin) => {
    const place = verifiedFavoriteToFoodPlace(pin);
    return [place.id, place] as const;
  }));
  const places = await getAllFromStore<FoodPlace>("places");
  const updates = places
    .filter((place) => canonicalPlaces.has(place.id))
    .map((place) => migratePersonalFavoriteScore(place, canonicalPlaces.get(place.id)!))
    .filter((place): place is FoodPlace => Boolean(place));

  await Promise.all(updates.map((place) => putInStore("places", place)));
  await putInStore<SeedMeta>("meta", {
    key: PERSONAL_FAVORITE_SCORE_META_KEY,
    version: PERSONAL_FAVORITE_SCORE_MODEL_VERSION,
    seededAt: new Date().toISOString()
  });
}

async function migrateExistingPersonalFavoriteCoordinateRiskIfNeeded(): Promise<void> {
  const meta = await getFromStore<SeedMeta>("meta", PERSONAL_FAVORITE_COORDINATE_META_KEY);
  if (meta?.version === PERSONAL_FAVORITE_COORDINATE_MODEL_VERSION) return;

  const canonicalPlaces = new Map(MAP_ADMITTED_PERSONAL_FAVORITE_PINS.map((pin) => {
    const place = verifiedFavoriteToFoodPlace(pin);
    return [place.id, place] as const;
  }));
  const places = await getAllFromStore<FoodPlace>("places");
  const updates = places
    .map((place) => migratePersonalFavoriteCoordinateRisk(place, canonicalPlaces.get(place.id)))
    .filter((place): place is FoodPlace => Boolean(place));

  await Promise.all(updates.map((place) => putInStore("places", place)));
  await putInStore<SeedMeta>("meta", {
    key: PERSONAL_FAVORITE_COORDINATE_META_KEY,
    version: PERSONAL_FAVORITE_COORDINATE_MODEL_VERSION,
    seededAt: new Date().toISOString()
  });
}

function migratePersonalFavoriteCoordinateRisk(existing: FoodPlace, canonical?: FoodPlace): FoodPlace | undefined {
  if (!canonical) return undefined;
  const canonicalRiskTags = canonical.tags.filter((tag) => ["近似坐标", "待校准", "位置待确认", "位置高风险", "陆地点修正", "默认候选"].includes(tag));
  const shouldMoveCrazyones = existing.id === "personal-favorite:crazyones-wuhan-tiandi" && !existing.notes.includes("用户手动拖动图钉校准");
  const shouldDowngradeGoya = existing.id === "personal-favorite:goya";
  const tags = normalizeTags([...existing.tags.filter((tag) => tag !== "水域风险"), ...canonicalRiskTags]);
  const tagGroups = existing.tagGroups ? {
    ...existing.tagGroups,
    custom: normalizeTags([...existing.tagGroups.custom.filter((tag) => tag !== "水域风险"), ...canonicalRiskTags])
  } : existing.tagGroups;
  const next = {
    ...existing,
    longitude: shouldMoveCrazyones ? canonical.longitude : existing.longitude,
    latitude: shouldMoveCrazyones ? canonical.latitude : existing.latitude,
    coordinateSystem: canonical.coordinateSystem,
    address: shouldMoveCrazyones || shouldDowngradeGoya ? canonical.address : existing.address,
    tags,
    tagGroups,
    mapAccuracy: existing.mapAccuracy === "exact" && !canonical.tags.includes("待校准") ? existing.mapAccuracy : canonical.mapAccuracy,
    notes: appendCoordinateAuditNote(existing, canonical, shouldMoveCrazyones, shouldDowngradeGoya)
  };
  const changed = JSON.stringify(next) !== JSON.stringify(existing);
  return changed ? next : undefined;
}

function migratePersonalFavoriteScore(existing: FoodPlace, canonical: FoodPlace): FoodPlace | undefined {
  const tags = normalizeTags(existing.tags.filter((tag) => !isScoreTag(tag)));
  const tagGroups = existing.tagGroups ? {
    ...existing.tagGroups,
    custom: normalizeTags(existing.tagGroups.custom.filter((tag) => !isScoreTag(tag)))
  } : existing.tagGroups;
  const nextNotes = appendScoreFormulaNote(existing.notes, canonical.notes);
  const changed = existing.rating !== canonical.rating ||
    tags.join("|") !== existing.tags.join("|") ||
    nextNotes !== existing.notes ||
    (tagGroups?.custom.join("|") ?? "") !== (existing.tagGroups?.custom.join("|") ?? "");
  if (!changed) return undefined;
  return {
    ...existing,
    rating: canonical.rating,
    tags,
    tagGroups,
    notes: nextNotes
  };
}

function appendUniqueNote(existingNotes: string, note: string): string {
  if (existingNotes.includes(note.split("\n")[0])) return existingNotes;
  return [existingNotes, note].filter(Boolean).join("\n\n");
}

function appendCoordinateAuditNote(existing: FoodPlace, canonical: FoodPlace, movedCrazyones: boolean, downgradedGoya: boolean): string {
  let notes = existing.notes;
  if (canonical.tags.includes("位置待确认")) {
    notes = appendUniqueNote(notes, "全量位置审计：该地点缺少精确门牌或稳定多源坐标，当前图钉仅作为待确认线索，不作为精确导航依据。");
  }
  if (canonical.tags.includes("位置高风险")) {
    notes = appendUniqueNote(notes, "位置高风险：该地点名称、分店或商圈线索不足，需用户补充截图/门牌或通过手动挪动完成确认。");
  }
  if (movedCrazyones) {
    notes = appendUniqueNote(notes, [
      "坐标风险修正：旧 CRAZYONES 坐标落入疑似长江水域，已迁移到武汉天地/壹方购物中心陆地区域近似点。",
      "该点仍不是精确门店坐标，请继续通过候选确认或手动挪动完成校准。"
    ].join("\n"));
  }
  if (downgradedGoya) {
    notes = appendUniqueNote(notes, "戈雅法餐厅审计：本轮联网搜索未获得稳定公开门牌或可引用门店页，壹方公馆坐标不得视为真实门店位置。");
  }
  return notes;
}

function appendScoreFormulaNote(existingNotes: string, canonicalNotes: string): string {
  if (existingNotes.includes("五分制折算：")) return existingNotes;
  const formulaLine = canonicalNotes.split("\n").find((line) => line.startsWith("五分制折算："));
  if (!formulaLine) return existingNotes;
  return [existingNotes, formulaLine].filter(Boolean).join("\n");
}

function isScoreTag(tag: string): boolean {
  return /^百分制(?:\d+|待补)$/.test(tag) || /^原始\d+分$/.test(tag) || /^折算\d(?:\.\d)?星$/.test(tag);
}

function hasCompletePersonalFavoriteImport(places: FoodPlace[]): boolean {
  const existingIds = new Set(places.map((place) => place.id));
  return MAP_ADMITTED_PERSONAL_FAVORITE_PINS.every((pin) => existingIds.has(`personal-favorite:${pin.id}`));
}
