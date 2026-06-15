# FoodMap V1.0 Map Provider Contract

## Summary

FoodMap V1.0 supports two map providers behind one UI-facing adapter: AMap when `VITE_AMAP_KEY` is configured, and Leaflet + OpenStreetMap fallback otherwise. The UI must not call provider-specific APIs directly.

## Adapter Types

```ts
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
  provider: "amap" | "leaflet";
}

export interface MapProviderAdapter {
  name: "amap" | "leaflet";
  initialize(container: HTMLElement, options: MapInitializeOptions): Promise<void>;
  destroy(): void;
  setPlaces(places: FoodPlace[], layers: FoodLayer[]): void;
  focusPlace(placeId: string): void;
  setLayerVisibility(layerId: string, visible: boolean): void;
  searchPlaces(query: string, city?: string): Promise<MapSearchResult[]>;
  locateByCoordinates(longitude: number, latitude: number): void;
  onPlaceClick(handler: (placeId: string) => void): void;
  onMapClick(handler: (point: { longitude: number; latitude: number }) => void): void;
}
```

## Provider Selection

- If `VITE_AMAP_KEY` exists, attempt AMap provider first.
- If AMap script load or initialization fails, show toast `当前使用备用地图模式。` and use Leaflet fallback.
- If no key exists, use Leaflet fallback directly.
- If Leaflet also fails, render map error state: `地图暂时无法加载，请检查网络或稍后重试。`

## Marker Rules

- Marker color comes from `FoodLayer.color`.
- Marker icon comes from `FoodLayer.icon`.
- Hidden layers do not render markers.
- Selected marker gets a visible focus ring.
- Marker click calls registered handler with `placeId`.
- In share view, marker interaction opens read-only details only.

## Search Rules

- AMap provider uses provider search where available.
- Leaflet fallback may use provider-supported search only if available without backend; otherwise local keyword search remains available and provider search returns an empty array with a non-blocking message.
- Search result creation must prefill `name`, `address`, `city`, `longitude`, and `latitude` when available.

## Map Click Rules

- Workspace map click returns longitude and latitude.
- UI shows `在这里新增美食地点` confirmation before opening the editor.
- Share view ignores map click for creation.

## Acceptance

- With no `VITE_AMAP_KEY`, `#/map` renders Leaflet fallback.
- With `VITE_AMAP_KEY`, AMap provider initializes or falls back with visible message.
- Marker click opens correct details.
- Layer hide removes matching marker immediately.
- Provider failure never leaves a blank page.

