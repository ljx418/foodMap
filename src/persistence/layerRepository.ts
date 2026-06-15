import type { FoodLayer } from "../domain/types";
import { getAllFromStore, putInStore } from "./db";

export const layerRepository = {
  async list(): Promise<FoodLayer[]> {
    const layers = await getAllFromStore<FoodLayer>("layers");
    return layers.sort((a, b) => a.sortOrder - b.sortOrder);
  },
  save: (layer: FoodLayer) => putInStore("layers", layer)
};
