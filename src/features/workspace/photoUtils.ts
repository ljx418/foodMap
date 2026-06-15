import type { PhotoAsset } from "../../domain/types";
import { createId, nowIso } from "../../domain/validators";

export async function filesToPhotoAssets(files: FileList | File[], placeId: string): Promise<PhotoAsset[]> {
  const selected = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, 6);
  return Promise.all(
    selected.map(async (file) => ({
      id: createId("photo"),
      placeId,
      fileName: file.name,
      mimeType: file.type,
      blob: file,
      thumbnailDataUrl: await createThumbnail(file),
      createdAt: nowIso()
    }))
  );
}

function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 420;
        const scale = Math.min(size / img.width, size / img.height, 1);
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(String(reader.result));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
