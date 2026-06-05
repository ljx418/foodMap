import type { ShareSnapshot } from "../domain/types";
import { getAllFromStore, getFromStore, putInStore } from "./db";

export const snapshotRepository = {
  async list(): Promise<ShareSnapshot[]> {
    const snapshots = await getAllFromStore<ShareSnapshot>("snapshots");
    return snapshots.sort((a, b) => b.exportedAt.localeCompare(a.exportedAt));
  },
  get: (id: string) => getFromStore<ShareSnapshot>("snapshots", id),
  save: (snapshot: ShareSnapshot) => putInStore("snapshots", snapshot)
};
