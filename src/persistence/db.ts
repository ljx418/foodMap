import { DEFAULT_LAYERS } from "../domain/sampleData";
import type { FoodLayer, FoodPlace, GovernanceJournalEntry, PhotoAsset, ShareSnapshot } from "../domain/types";

export const DB_NAME = "foodmap-db";
export const DB_VERSION = 2;

export interface FoodMapDB extends IDBDatabase {}

export type StoreName = "places" | "layers" | "photos" | "snapshots" | "meta" | "governanceJournal";

let dbPromise: Promise<FoodMapDB> | undefined;

export function openFoodMapDb(): Promise<FoodMapDB> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("places")) {
          const places = db.createObjectStore("places", { keyPath: "id" });
          places.createIndex("layerId", "layerId");
          places.createIndex("city", "city");
          places.createIndex("visitedAt", "visitedAt");
          places.createIndex("updatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("layers")) {
          const layers = db.createObjectStore("layers", { keyPath: "id" });
          layers.createIndex("sortOrder", "sortOrder");
        }
        if (!db.objectStoreNames.contains("photos")) {
          const photos = db.createObjectStore("photos", { keyPath: "id" });
          photos.createIndex("placeId", "placeId");
          photos.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("snapshots")) {
          const snapshots = db.createObjectStore("snapshots", { keyPath: "id" });
          snapshots.createIndex("exportedAt", "exportedAt");
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("governanceJournal")) {
          const journal = db.createObjectStore("governanceJournal", { keyPath: "id" });
          journal.createIndex("createdAt", "createdAt");
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        void seedDefaultLayers(request.result)
          .then(() => resolve(request.result))
          .catch(reject);
      };
    });
  }
  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openFoodMapDb();
  const tx = db.transaction(storeName, "readonly");
  return requestToPromise<T[]>(tx.objectStore(storeName).getAll());
}

export async function getFromStore<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  const db = await openFoodMapDb();
  const tx = db.transaction(storeName, "readonly");
  return requestToPromise<T | undefined>(tx.objectStore(storeName).get(id));
}

export async function putInStore<T>(storeName: StoreName, value: T): Promise<void> {
  const db = await openFoodMapDb();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).put(value);
  await transactionDone(tx);
}

export async function deleteFromStore(storeName: StoreName, id: string): Promise<void> {
  const db = await openFoodMapDb();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).delete(id);
  await transactionDone(tx);
}

export function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function seedDefaultLayers(db: IDBDatabase): Promise<void> {
  const tx = db.transaction("layers", "readonly");
  const layers = await requestToPromise<FoodLayer[]>(tx.objectStore("layers").getAll());
  if (layers.length > 0) return;
  const writeTx = db.transaction("layers", "readwrite");
  DEFAULT_LAYERS.forEach((layer) => writeTx.objectStore("layers").put(layer));
  await transactionDone(writeTx);
}

export type StoreValueMap = {
  places: FoodPlace;
  layers: FoodLayer;
  photos: PhotoAsset;
  snapshots: ShareSnapshot;
  governanceJournal: GovernanceJournalEntry;
};
