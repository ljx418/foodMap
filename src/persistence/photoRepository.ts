import type { PhotoAsset } from "../domain/types";
import { deleteFromStore, getAllFromStore, putInStore } from "./db";

export const photoRepository = {
  list: () => getAllFromStore<PhotoAsset>("photos"),
  save: (photo: PhotoAsset) => putInStore("photos", photo),
  remove: (id: string) => deleteFromStore("photos", id),
  async removeByPlace(placeId: string): Promise<void> {
    const photos = await getAllFromStore<PhotoAsset>("photos");
    await Promise.all(photos.filter((photo) => photo.placeId === placeId).map((photo) => deleteFromStore("photos", photo.id)));
  }
};
