import type {
  FoodLayer,
  FoodMapExportFile,
  FoodMapPackageValidationResult,
  FoodPlace,
  PhotoAsset,
  ShareSnapshot,
  SnapshotPhoto,
  SnapshotPortabilitySummary
} from "../domain/types";
import { createId, isFoodRating, nowIso } from "../domain/validators";
import { snapshotRepository } from "./snapshotRepository";

export function createSnapshot(title: string, places: FoodPlace[], layers: ShareSnapshot["layers"], photos: PhotoAsset[]): ShareSnapshot {
  const includedIds = new Set(places.flatMap((place) => place.photoIds));
  return {
    id: createId("snapshot"),
    title: title.trim() || "美食地图分享",
    places,
    layers,
    photos: photos
      .filter((photo) => includedIds.has(photo.id))
      .map(({ id, placeId, fileName, mimeType, thumbnailDataUrl, createdAt }) => ({
        id,
        placeId,
        fileName,
        mimeType,
        thumbnailDataUrl,
        createdAt
      })),
    exportedAt: nowIso()
  };
}

export function summarizeSnapshot(snapshot: ShareSnapshot): SnapshotPortabilitySummary {
  return {
    snapshotId: snapshot.id,
    title: snapshot.title,
    exportedAt: snapshot.exportedAt,
    placeCount: snapshot.places.length,
    layerCount: snapshot.layers.length,
    thumbnailCount: snapshot.photos.length,
    readonly: true
  };
}

export function encodeSnapshot(snapshot: ShareSnapshot): string {
  const file: FoodMapExportFile = {
    schema: "foodmap.share",
    version: 1,
    exportedAt: nowIso(),
    snapshot
  };
  return JSON.stringify(file, null, 2);
}

export function validateSnapshotPackageText(text: string): FoodMapPackageValidationResult {
  try {
    return validateSnapshotPackage(JSON.parse(text));
  } catch {
    return {
      ok: false,
      errors: ["文件不是有效 JSON，未导入任何数据"]
    };
  }
}

export function validateSnapshotPackage(value: unknown): FoodMapPackageValidationResult {
  const errors: string[] = [];
  if (!value || typeof value !== "object") {
    return { ok: false, errors: ["文件结构不正确，未导入任何数据"] };
  }

  const file = value as Partial<FoodMapExportFile>;
  if (file.schema !== "foodmap.share") errors.push("schema 必须是 foodmap.share");
  if (file.version !== 1) errors.push("仅支持 version 1 的 .foodmap.json");
  if (typeof file.exportedAt !== "string" || !file.exportedAt.trim()) errors.push("缺少 exportedAt");
  const snapshot = file.snapshot;
  if (!snapshot || typeof snapshot !== "object") {
    errors.push("缺少 snapshot");
  } else {
    errors.push(...validateSnapshot(snapshot));
  }

  if (errors.length > 0 || !snapshot || typeof snapshot !== "object") {
    return {
      ok: false,
      schemaVersion: typeof file.version === "number" ? file.version : undefined,
      snapshotId: typeof snapshot?.id === "string" ? snapshot.id : undefined,
      errors
    };
  }

  return {
    ok: true,
    schemaVersion: 1,
    snapshotId: snapshot.id,
    errors: [],
    summary: summarizeSnapshot(snapshot)
  };
}

export function decodeSnapshotFile(text: string): ShareSnapshot {
  const parsed: unknown = JSON.parse(text);
  const validation = validateSnapshotPackage(parsed);
  if (!validation.ok) {
    throw new Error(validation.errors.join("；") || "文件格式不正确，未导入任何数据");
  }
  return (parsed as FoodMapExportFile).snapshot;
}

export async function importSnapshotText(text: string): Promise<ShareSnapshot> {
  const snapshot = decodeSnapshotFile(text);
  const existing = await snapshotRepository.get(snapshot.id);
  const stored = existing ? { ...snapshot, id: createId("snapshot"), title: `${snapshot.title} 副本` } : snapshot;
  await snapshotRepository.save(stored);
  return stored;
}

export function downloadSnapshot(snapshot: ShareSnapshot): void {
  const blob = new Blob([encodeSnapshot(snapshot)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${snapshot.title || "foodmap"}.foodmap.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function validateSnapshot(value: unknown): string[] {
  const errors: string[] = [];
  const snapshot = value as Partial<ShareSnapshot>;
  if (typeof snapshot.id !== "string" || !snapshot.id.trim()) errors.push("snapshot.id 缺失");
  if (typeof snapshot.title !== "string" || !snapshot.title.trim()) errors.push("snapshot.title 缺失");
  if (typeof snapshot.exportedAt !== "string" || !snapshot.exportedAt.trim()) errors.push("snapshot.exportedAt 缺失");
  if (!Array.isArray(snapshot.places)) errors.push("snapshot.places 必须是数组");
  if (!Array.isArray(snapshot.layers)) errors.push("snapshot.layers 必须是数组");
  if (!Array.isArray(snapshot.photos)) errors.push("snapshot.photos 必须是数组");
  if (Array.isArray(snapshot.places)) snapshot.places.forEach((place, index) => errors.push(...validatePlace(place, index)));
  if (Array.isArray(snapshot.layers)) snapshot.layers.forEach((layer, index) => errors.push(...validateLayer(layer, index)));
  if (Array.isArray(snapshot.photos)) snapshot.photos.forEach((photo, index) => errors.push(...validatePhoto(photo, index)));
  return errors;
}

function validatePlace(value: unknown, index: number): string[] {
  const errors: string[] = [];
  const place = value as Partial<FoodPlace>;
  const prefix = `places[${index}]`;
  if (!value || typeof value !== "object") return [`${prefix} 必须是对象`];
  if (typeof place.id !== "string" || !place.id.trim()) errors.push(`${prefix}.id 缺失`);
  if (typeof place.name !== "string" || !place.name.trim()) errors.push(`${prefix}.name 缺失`);
  if (typeof place.layerId !== "string" || !place.layerId.trim()) errors.push(`${prefix}.layerId 缺失`);
  if (typeof place.longitude !== "number" || !Number.isFinite(place.longitude) || place.longitude < -180 || place.longitude > 180) errors.push(`${prefix}.longitude 不正确`);
  if (typeof place.latitude !== "number" || !Number.isFinite(place.latitude) || place.latitude < -90 || place.latitude > 90) errors.push(`${prefix}.latitude 不正确`);
  if (!Array.isArray(place.tags)) errors.push(`${prefix}.tags 必须是数组`);
  if (!isFoodRating(place.rating)) errors.push(`${prefix}.rating 必须是 0-5`);
  if (typeof place.visitedAt !== "string") errors.push(`${prefix}.visitedAt 缺失`);
  if (typeof place.notes !== "string") errors.push(`${prefix}.notes 缺失`);
  if (!Array.isArray(place.photoIds)) errors.push(`${prefix}.photoIds 必须是数组`);
  if (typeof place.createdAt !== "string") errors.push(`${prefix}.createdAt 缺失`);
  if (typeof place.updatedAt !== "string") errors.push(`${prefix}.updatedAt 缺失`);
  return errors;
}

function validateLayer(value: unknown, index: number): string[] {
  const errors: string[] = [];
  const layer = value as Partial<FoodLayer>;
  const prefix = `layers[${index}]`;
  if (!value || typeof value !== "object") return [`${prefix} 必须是对象`];
  if (typeof layer.id !== "string" || !layer.id.trim()) errors.push(`${prefix}.id 缺失`);
  if (typeof layer.name !== "string" || !layer.name.trim()) errors.push(`${prefix}.name 缺失`);
  if (typeof layer.color !== "string" || !layer.color.trim()) errors.push(`${prefix}.color 缺失`);
  if (typeof layer.icon !== "string" || !layer.icon.trim()) errors.push(`${prefix}.icon 缺失`);
  if (typeof layer.visible !== "boolean") errors.push(`${prefix}.visible 必须是布尔值`);
  if (typeof layer.sortOrder !== "number" || !Number.isFinite(layer.sortOrder)) errors.push(`${prefix}.sortOrder 必须是数字`);
  return errors;
}

function validatePhoto(value: unknown, index: number): string[] {
  const errors: string[] = [];
  const photo = value as Partial<SnapshotPhoto>;
  const prefix = `photos[${index}]`;
  if (!value || typeof value !== "object") return [`${prefix} 必须是对象`];
  if (typeof photo.id !== "string" || !photo.id.trim()) errors.push(`${prefix}.id 缺失`);
  if (typeof photo.placeId !== "string" || !photo.placeId.trim()) errors.push(`${prefix}.placeId 缺失`);
  if (typeof photo.fileName !== "string" || !photo.fileName.trim()) errors.push(`${prefix}.fileName 缺失`);
  if (typeof photo.mimeType !== "string" || !photo.mimeType.startsWith("image/")) errors.push(`${prefix}.mimeType 必须是图片类型`);
  if (typeof photo.thumbnailDataUrl !== "string" || !photo.thumbnailDataUrl.startsWith("data:image/")) errors.push(`${prefix}.thumbnailDataUrl 必须是图片 data URL`);
  if (typeof photo.createdAt !== "string" || !photo.createdAt.trim()) errors.push(`${prefix}.createdAt 缺失`);
  return errors;
}
