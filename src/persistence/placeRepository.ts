import type { FoodPlace } from "../domain/types";
import { deleteFromStore, getAllFromStore, getFromStore, putInStore } from "./db";

export const placeRepository = {
  list: () => getAllFromStore<FoodPlace>("places"),
  get: (id: string) => getFromStore<FoodPlace>("places", id),
  save: (place: FoodPlace) => putInStore("places", place),
  remove: (id: string) => deleteFromStore("places", id)
};
