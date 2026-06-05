# FoodMap V1.0 Target Architecture

## Summary

FoodMap V1.0 is a pure frontend single-page application. It should feel close to the reference map-marking experience, but the product direction is now fixed by the Scheme 4 PRD: a travel-journal-style personal food map with warm paper texture, map-first interaction, and low-interruption recording.

The current architecture has design documents and PRD assets, but no application source code, no package manifest, no persistence implementation, no map integration, and no test harness. The target architecture introduces a local-first frontend stack, an explicit module structure, and enough interface boundaries to support a map provider fallback.

## Target Stack

- Build system: Vite
- UI runtime: React + TypeScript
- Styling: CSS custom properties and component-scoped CSS files
- Routing: hash-based routing
- Storage: IndexedDB for records and photo blobs
- Map providers:
  - Primary: AMap Web JS API when `VITE_AMAP_KEY` is configured
  - Fallback: Leaflet + OpenStreetMap when no AMap key is available
- Tests: Vitest for unit tests and Playwright for browser smoke tests

## Target Source Layout

```text
src/
├── app/
├── domain/
├── persistence/
├── map/
│   ├── amap/
│   └── leaflet/
├── features/
│   ├── workspace/
│   └── share/
├── components/
├── styles/
└── tests/
    ├── unit/
    └── e2e/
```

The detailed file list is defined in [development-plan-scheme4.md](./development-plan-scheme4.md). Implementation should follow that structure unless a later design revision explicitly changes it.

Implementation contracts:

- Data and import/export details: [data-schema-and-import-export-contract.md](./data-schema-and-import-export-contract.md)
- Repository and domain APIs: [repository-and-domain-api-contract.md](./repository-and-domain-api-contract.md)
- Map provider behavior: [map-provider-contract.md](./map-provider-contract.md)
- E2E evidence requirements: [e2e-test-and-evidence-matrix.md](./e2e-test-and-evidence-matrix.md)
- Visual acceptance: [visual-acceptance-checklist.md](./visual-acceptance-checklist.md)

## Runtime Architecture

The application is organized into six layers:

- App shell: route setup, layout shell, and route-specific containers. It must not become a marketing navigation shell.
- UI feature layer: map workspace, layer panel, search/filter bar, map tools, place detail drawer, place editor modal, share snapshot dialog, import/export dialog, share view.
- Domain layer: food place, food layer, photo asset, share snapshot, food filter state, filters, validation, default sample data.
- Map adapter layer: provider-independent map interface with AMap and Leaflet implementations.
- Persistence layer: IndexedDB repositories, import/export codecs, local share snapshot storage, metadata store.
- Verification layer: unit tests, browser smoke tests, and manual acceptance checklist.

## Core Routes

- `#/map`: personal editing workspace.
- `#/share/:snapshotId`: local read-only share view.

The default route redirects to `#/map`.

## Public Types

```ts
export type FoodRating = 1 | 2 | 3 | 4 | 5;

export interface FoodPlace {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  address?: string;
  city?: string;
  layerId: string;
  tags: string[];
  rating: FoodRating;
  visitedAt: string;
  notes: string;
  photoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FoodLayer {
  id: string;
  name: string;
  color: string;
  icon: "pin" | "star" | "bowl" | "coffee" | "heart";
  visible: boolean;
  sortOrder: number;
}

export interface PhotoAsset {
  id: string;
  placeId: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  thumbnailDataUrl: string;
  createdAt: string;
}

export interface ShareSnapshot {
  id: string;
  title: string;
  places: FoodPlace[];
  layers: FoodLayer[];
  photos: Pick<PhotoAsset, "id" | "placeId" | "fileName" | "mimeType" | "thumbnailDataUrl" | "createdAt">[];
  exportedAt: string;
}

export interface FoodFilterState {
  keyword: string;
  city?: string;
  layerIds: string[];
  tags: string[];
  minRating?: FoodRating;
  visitedFrom?: string;
  visitedTo?: string;
}
```

## IndexedDB Contract

Database name: `foodmap-db`.

Stores:

- `places`: `keyPath: id`
- `layers`: `keyPath: id`
- `photos`: `keyPath: id`, index `placeId`
- `snapshots`: `keyPath: id`
- `meta`: `keyPath: key`

First-run default layers:

- `必吃餐厅` / `star` / `#C76A32`
- `咖啡馆` / `coffee` / `#8A5A3B`
- `小吃快餐` / `bowl` / `#6F7F47`
- `甜品饮品` / `heart` / `#D98A7A`
- `想去清单` / `pin` / `#8C7AA9`

The canonical IndexedDB and `.foodmap.json` contracts are defined in [data-schema-and-import-export-contract.md](./data-schema-and-import-export-contract.md).

## Map Provider Interface

```ts
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

The UI must depend on this interface, not directly on AMap or Leaflet APIs.

The canonical map provider contract, including `MapInitializeOptions` and `MapSearchResult`, is defined in [map-provider-contract.md](./map-provider-contract.md).

Provider requirements:

- Map initialization failure must render a readable error state, not a blank screen.
- Marker style uses `FoodLayer.color` and `FoodLayer.icon`.
- Marker click returns `placeId`.
- Map click returns longitude and latitude and starts the "add here" flow after confirmation.
- Hidden layers immediately remove matching markers from the map.
- If `VITE_AMAP_KEY` is unavailable or invalid, the app must still run in Leaflet fallback mode and surface "当前使用备用地图模式".

## Data Flow

1. The workspace loads layers, places, photos, and share snapshots from IndexedDB.
2. UI actions update domain state first, then persist through repositories.
3. Map markers are derived from visible layers and filtered places.
4. Clicking a marker selects a place and opens the detail drawer.
5. Sharing creates a `ShareSnapshot` from all places or the currently filtered result, based on the user's choice.
6. Export serializes snapshot metadata, places, layers, and photo thumbnails to `.foodmap.json`; import validates before writing and must not corrupt existing data on failure.

## Design Constraints

- The map is the first screen, not a landing page.
- Scheme 4 visual tokens are authoritative: paper background `#F6EBD6`, card `#FFF8EA`, ink `#3B2B1F`, muted text `#8B7B68`, line `#D8C5A5`, primary orange `#C76A32`, olive `#6F7F47`, gold `#D99A2B`, danger `#B94A3A`.
- Cards use warm paper texture, 16-22px radius, thin warm borders, and light shadows.
- Decoration is restrained: at most one decorative paper/tape/stamp element per main view.
- Panels should be compact and operational, keeping the map as the primary surface.
- Desktop layout: left layer panel, top search controls, right map tools, detail drawer.
- Mobile layout: full map, top search, bottom detail drawer, collapsible layer/filter controls.

## UX State Requirements

- First-run empty state: "还没有美食图钉", with actions for search, map add, and `.foodmap.json` import.
- Filter empty state: "没有找到符合条件的地点。试试放宽评分、标签或到访时间范围。"
- Missing share snapshot state: explain that the local snapshot was not found and offer import plus return-to-map actions.
- Loading states cover map loading, data loading, thumbnail generation, and import validation.
- Error states cover provider failure, AMap key fallback, oversized photos, invalid import format, and storage quota failure.

## Non-Goals For V1.0

- Backend API
- Account login
- Public hosted share links
- Multi-user collaboration
- Server-side photo storage
- Real-time sync
