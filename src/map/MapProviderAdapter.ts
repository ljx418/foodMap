import type { FoodPlace } from "../domain/types";

export interface MapInitializeOptions {
  center: { longitude: number; latitude: number };
  zoom: number;
  readonly?: boolean;
}

export interface MapSearchResult {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address?: string;
  city?: string;
  provider: string;
}

export interface MapProviderAdapter {
  name: string;
  initialize(container: HTMLElement, options: MapInitializeOptions): Promise<void>;
  destroy(): void;
  setPlaces(places: FoodPlace[]): void;
  focusPlace(placeId: string): void;
  setLayerVisibility(layerId: string, visible: boolean): void;
  searchPlaces(keyword: string): Promise<MapSearchResult[]>;
  locateByCoordinates(longitude: number, latitude: number): Promise<MapSearchResult | undefined>;
  onPlaceClick(callback: (placeId: string) => void): void;
  onMapClick(callback: (point: { longitude: number; latitude: number }) => void): void;
}
