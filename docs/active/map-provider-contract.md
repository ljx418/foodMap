# FoodMap P16/P17 Map Provider Contract

## Summary

FoodMap supports map rendering behind one UI-facing adapter. The current baseline uses `LeafletProvider` with AMap tile URLs and a local Wuhan schematic fallback when remote tiles fail. `AMapProvider` is currently only a compatibility wrapper over `LeafletProvider`; it must not be described as a completed AMap Web JS implementation until script loading, initialization failure handling, and provider search are implemented and evidenced.

P16 keeps map provider search optional; baseline P16 acceptance cannot claim external real-time POI search unless a real provider is configured and evidenced.

P17 adds UX-trust requirements for marker state, manual pin movement, zoom stability, detail/popup coordination, and real-data performance. These requirements apply to every map provider implementation.

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
  provider: string;
}

export interface MapProviderAdapter {
  name: string;
  initialize(container: HTMLElement, options: MapInitializeOptions): Promise<void>;
  destroy(): void;
  setPlaces(places: FoodPlace[]): void;
  setSelectedPlace(placeId?: string): void;
  focusPlace(placeId: string): void;
  setDraggablePlaces?(placeIds: string[]): void;
  resize?(): void;
  setLayerVisibility(layerId: string, visible: boolean): void;
  searchPlaces(query: string): Promise<MapSearchResult[]>;
  locateByCoordinates(longitude: number, latitude: number): Promise<MapSearchResult | undefined>;
  onPlaceClick(handler: (placeId: string) => void): void;
  onMapClick(handler: (point: { longitude: number; latitude: number }) => void): void;
  onPlaceMove?(handler: (placeId: string, point: { longitude: number; latitude: number }) => void): void;
}
```

## Provider Selection

- Current P16 baseline uses Leaflet rendering regardless of `VITE_AMAP_KEY`.
- The baseline tile source is AMap raster tiles through Leaflet, with a local Wuhan schematic overlay/fallback when remote tiles do not load.
- A future AMap Web JS provider must add script loading, initialization timeout, visible fallback messaging, and separate acceptance evidence before it can replace the baseline.
- If map rendering fails completely, render map error state: `地图暂时无法加载，请检查网络或稍后重试。`

## Marker Rules

- Personal markers use the current FoodMap pin style and selected-state color tokens.
- Recommendation markers use the scanlist pin style and adaptive small-dot mode at low visual priority.
- Hidden layers do not render markers.
- Selected marker is distinguished by color and selected class without shadow/flicker.
- Marker click calls registered handler with `placeId`.
- In share view, marker interaction opens read-only details only.
- When a desktop side detail or mobile detail is open, provider popup for the same marker must close or stay hidden so the UI does not show duplicate floating details.

## P17 Pin Visual State Rules

Every provider must represent these states with stable, testable classes or equivalent provider-specific state:

| State | Requirement |
| --- | --- |
| verified personal | Green personal pin, primary ownership signal |
| pending personal | Orange/warm pending pin, visually distinct from verified |
| selected | Stable color/outline difference; no flicker, no transient fallback color |
| scanlist | Recommendation style distinct from personal pins |
| reference | Low-priority reference style distinct from personal and scanlist |
| dense dot | Low-zoom/high-density simplified dot, restored after zoom settles |

Zoom behavior:

- During zoom, provider may simplify markers to reduce visual noise.
- Provider must not recreate all marker DOM on every minor state change when update-in-place is possible.
- After zoom ends, selected marker and pending/verified state must remain correct.
- E2E must verify that selected markers do not temporarily flash to the wrong color after click or zoom.

## P17 Manual Pin Move Rules

- Only personal places can become draggable.
- Scanlist and reference pins are read-only; users must save them to personal records before moving.
- Entering pin-move mode must clearly mark the active draggable pin.
- Drag end reports the new point through `onPlaceMove`.
- UI confirmation controls own persistence; provider must not persist coordinates directly.
- Cancel must restore the marker to its previous persisted location.
- Confirm must route through Domain/Persistence audit logic before the provider treats the point as final.
- Mobile pin move must expose the same confirm/cancel semantics as desktop.

## Search Rules

- A future AMap Web JS provider may use provider search when separately implemented and evidenced.
- Leaflet fallback may use provider-supported search only if available without backend; otherwise local keyword search remains available and provider search returns an empty array with a non-blocking message.
- Search result creation must prefill `name`, `address`, `city`, `longitude`, and `latitude` when available.
- P16 place creation must not save `MapSearchResult` directly. Provider search results must be adapted into `PlaceCandidate` objects and pass the same candidate ranking, blocker, and user-confirmation flow as history, scanlist, text, and Agent candidates.
- If map provider search is unavailable, the app must continue with deterministic P16 candidate sources: history, scanlist, text, Agent, and manual input.

## P16 MapSearchResult To PlaceCandidate Adapter

When a browser-side map provider is enabled, implement an explicit adapter:

```ts
function mapSearchResultToPlaceCandidate(
  result: MapSearchResult,
  context: CandidateContext
): PlaceCandidate
```

Required mapping:

| PlaceCandidate Field | Mapping Rule |
| --- | --- |
| `id` | `map-provider:${result.provider}:${result.id}` |
| `name` | `result.name` |
| `address` | `result.address` when available |
| `city` | `result.city` or current map/search context city |
| `longitude` / `latitude` | `result.longitude` / `result.latitude` |
| `source` | `map-provider` |
| `sourceLabel` | `高德地图` for AMap, otherwise `地图搜索` |
| `confidence` | `0.70` to `0.90`; higher when name, address, city, and coordinates are complete |
| `coordinateAccuracy` | `exact` when provider marks a precise POI; `approximate` when only address/area-level match is known; `unknown` when precision is not exposed |
| `distanceMeters` | computed from user location or clicked point when available |
| `reasons` | at least `来自地图搜索`; add `地址和坐标完整` or a missing-field reason |
| `rawInputRef` | original search query or URL summary, not full scraped content |

Adapter blockers:

- Missing `name`.
- Missing coordinates when the candidate is being used for navigation.
- Coordinates outside the expected Wuhan area without explicit evidence.
- Provider result lacks enough information to explain source and confidence.

## Map Click Rules

- Workspace map click returns longitude and latitude.
- P16 workspace map click opens the place editor directly and passes the clicked longitude and latitude into the draft.
- The UI must not show the legacy `在这里新增美食地点` confirmation bubble in the P16 creation path.
- Share view ignores map click for creation.

## P17 Detail And Resize Rules

- Provider must expose `resize` or equivalent invalidation so map tiles stay aligned when desktop side panels open/close.
- Opening a side detail must not cause map canvas blank areas during detail scrolling.
- Bottom sheets and right panels must not steal map drag unless the user is interacting with the panel.
- Marker focus should center the point enough for context, but should not push the selected marker under a fixed panel when avoidable.

## Acceptance

- `#/map` renders the Leaflet baseline with AMap tiles or local Wuhan schematic fallback.
- No acceptance report may claim completed AMap Web JS provider behavior until that provider is separately implemented and evidenced.
- Marker click opens correct details.
- Workspace map click opens the editor directly with clicked coordinates.
- Layer hide removes matching marker immediately.
- Provider failure never leaves a blank page.
- P17 acceptance additionally requires manual pin move callback, selected-state stability, no duplicate popup/detail, and real-data marker performance under scanlist + reference + personal + pending layers.
