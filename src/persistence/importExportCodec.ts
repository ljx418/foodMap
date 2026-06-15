import type { FoodMapExportFile, FoodPlace, PhotoAsset, ShareSnapshot } from "../domain/types";
import { createId, isExportFile, nowIso } from "../domain/validators";
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

export function encodeSnapshot(snapshot: ShareSnapshot): string {
  const file: FoodMapExportFile = {
    schema: "foodmap.share",
    version: 1,
    exportedAt: nowIso(),
    snapshot
  };
  return JSON.stringify(file, null, 2);
}

export function decodeSnapshotFile(text: string): ShareSnapshot {
  const parsed: unknown = JSON.parse(text);
  if (!isExportFile(parsed)) {
    throw new Error("文件格式不正确，未导入任何数据");
  }
  return parsed.snapshot;
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
