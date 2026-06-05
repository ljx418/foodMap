import type { FoodMapExportFile, FoodPlace, FoodRating, ShareSnapshot } from "./types";

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isFoodRating(value: unknown): value is FoodRating {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

export function normalizeTags(input: string | string[]): string[] {
  const raw = Array.isArray(input) ? input : input.split(/[,\s，、]+/);
  return Array.from(new Set(raw.map((tag) => tag.trim()).filter(Boolean))).slice(0, 12);
}

export function validatePlaceDraft(place: Partial<FoodPlace>): string[] {
  const errors: string[] = [];
  if (!place.name?.trim()) errors.push("名称不能为空");
  if (typeof place.longitude !== "number" || Number.isNaN(place.longitude)) errors.push("经度不正确");
  if (typeof place.latitude !== "number" || Number.isNaN(place.latitude)) errors.push("纬度不正确");
  if (!place.layerId) errors.push("请选择图层");
  if (!isFoodRating(place.rating)) errors.push("评分必须是 1-5");
  if (!place.visitedAt) errors.push("请选择到访时间");
  return errors;
}

export function isExportFile(value: unknown): value is FoodMapExportFile {
  if (!value || typeof value !== "object") return false;
  const file = value as FoodMapExportFile;
  return file.schema === "foodmap.share" && file.version === 1 && isSnapshot(file.snapshot);
}

export function isSnapshot(value: unknown): value is ShareSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as ShareSnapshot;
  return (
    typeof snapshot.id === "string" &&
    typeof snapshot.title === "string" &&
    Array.isArray(snapshot.places) &&
    Array.isArray(snapshot.layers) &&
    Array.isArray(snapshot.photos) &&
    typeof snapshot.exportedAt === "string"
  );
}
