# FoodMap Target Architecture

## Summary

FoodMap is a pure frontend, local-first food map. The V1.0 PRD defines the foundation: a travel-journal-style personal food map with photos, ratings, notes, visit dates, layers, filters, local sharing, and import/export. The current stage extends that foundation with a verified Wuhan recommendation overlay, AMap scanlist refresh data, POI verification, street-view/image evidence, adaptive pins, and a browser Agent Bridge.

The target architecture is a modular frontend. UI modules may depend on domain, persistence, map adapter, recommendation, and agent contracts, but external data and agent commands must not bypass validation or POI admission rules.

## Stack

- Build system: Vite
- UI runtime: React + TypeScript
- Styling: CSS custom properties and app-level CSS
- Routing: hash-based routing
- Storage: IndexedDB for user records, photos, snapshots, and metadata
- Map providers:
  - Primary target: AMap Web JS API when `VITE_AMAP_KEY` is configured
  - Current fallback: Leaflet + public raster tiles
  - Safety fallback: local schematic Wuhan map when remote tiles fail
- Tests: Vitest for domain/unit tests and Playwright for browser acceptance
- Agent surface: `window.FoodMapAgentBridge`

## Source Layout

```text
src/
├── agent/
├── app/
├── domain/
├── persistence/
├── map/
│   ├── amap/
│   └── leaflet/
├── recommendations/
├── features/
│   ├── workspace/
│   └── share/
├── components/
├── styles/
└── tests/
```

## Runtime Layers

| Layer | Responsibility | Key Files |
| --- | --- | --- |
| App shell | Route setup and app entry | `src/app`, `src/main.tsx` |
| Workspace UI | Header, map canvas, display panel, list/detail panels, editor, filters, share/import dialogs, mobile panels | `src/features/workspace` |
| Share UI | Local read-only snapshot route | `src/features/share` |
| Domain | Food place/layer/photo/snapshot types, filters, validation, defaults | `src/domain` |
| Persistence | IndexedDB repositories and import/export codec | `src/persistence` |
| Map adapter | Provider-independent map contract, AMap path, Leaflet fallback, marker rendering | `src/map` |
| Recommendation | AMap scanlist data, manual verified pins, semantic verification, recommendation conversion | `src/recommendations` |
| Agent Bridge | Browser API for companion agents and automation | `src/agent/FoodMapAgentBridge.ts` |
| Verification | Unit tests, Playwright tests, evidence docs | `src/tests`, `e2e`, `docs/active` |

## Core Routes

- `#/map`: personal editing workspace and verified recommendation exploration.
- `#/share/:snapshotId`: local read-only share view.

The default route redirects to `#/map`.

## Domain Model

The V1.0 personal record types remain canonical:

- `FoodPlace`: user-owned map record with name, coordinates, layer, rating, visit date, tags, notes, address/city, photo IDs, and timestamps.
- `FoodLayer`: user layer with color, icon, visibility, and sort order.
- `PhotoAsset`: local photo blob and generated thumbnail.
- `ShareSnapshot`: read-only exportable snapshot.
- `FoodFilterState`: keyword, city, layers, tags, rating, and visit date filters.

The current-stage recommendation types add:

- `AmapScanlistRecommendation`: source ranking item with rank, score, POI ID, address/district text, review summary, source URL, coordinate, accuracy, image evidence, and verification fields.
- `AmapImageEvidence`: public image/street-view evidence with URL, alt text, and source metadata.
- `RecommendationVerificationResult`: admission decision including status, confidence, mappable flag, duplicate group, coordinate trust, and warnings.

Recommendation items are not user records. They become `FoodPlace` records only through an explicit save action after verification passes.

## Data Flow

1. The workspace loads user places, layers, photos, and snapshots from IndexedDB.
2. Recommendation data loads from `AMAP_WUHAN_SCANLIST` only when the user or agent requests it.
3. `evaluateRecommendation` determines whether each recommendation is allowed on the map.
4. The map renders personal markers from visible user layers and recommendation markers from verified mappable recommendation items.
5. Selecting a personal marker opens personal detail; selecting a recommendation marker opens recommendation detail.
6. Saving a verified recommendation converts it through `recommendationToFoodPlace` and then uses the same persistence path as manual records.
7. Share snapshots and `.foodmap.json` exports include user records, not unsaved recommendation candidates unless saved first.
8. Agent commands call the same domain, persistence, recommendation, and validation functions as UI actions.

## Map Architecture

The UI depends on `MapProviderAdapter`, not directly on provider APIs. Provider requirements:

- Initialize with a Wuhan-centered view.
- Render personal markers and recommendation markers as distinct visual systems.
- Support marker click, map click, focus, layer visibility, and provider failure state.
- Keep Leaflet usable without `VITE_AMAP_KEY`.
- Render a local Wuhan fallback when remote tiles fail.
- For recommendation density, render top ranks as ranked pins and lower-density visible items as adaptive green pins; crowded secondary items may stay as small dots.

## POI Verification Architecture

Recommendation pins must pass the data admission gate:

- Normalize names and branch names before matching.
- Preserve branch, district, road, POI ID, and coordinate trust in the candidate.
- Group semantic duplicates before deciding map admission.
- Require multi-source agreement or documented manual overlay.
- Mark exact and approximate coordinates separately.
- Hide conflicts and unverified candidates from the map.
- Show verification status and confidence in the detail panel.

The canonical mechanism is [poi-verification-mechanism-v1.md](./poi-verification-mechanism-v1.md). The latest current-stage evidence is [amap-scanlist-refresh-report.md](./amap-scanlist-refresh-report.md).

## UX State Architecture

The workspace should maintain one primary task surface at a time:

- `idle/display/list/detail/recommendation/tools/create/edit/filter/importExport/share` are the effective UI modes.
- Side panels are collapsed by default on desktop and exposed through half-round floating buttons.
- Mobile panels are mutually exclusive and use bottom-sheet behavior.
- Modal flows hide noisy map status bars and bottom action bars.
- Escape closes the current top layer before lower-priority UI.
- Recommendation detail should not show the full list by default after a place is selected; list expansion is a deliberate action.

## Agent Bridge Architecture

`window.FoodMapAgentBridge` is the current integration surface for companion agents. Required behavior:

- `getContext`, `listPlaces`, `getPlace`, `setFilter`, `focusPlace`.
- `createPlaceDraft`, `savePlace`, `updatePlace`, `deletePlace` using the same validation as UI flows.
- `createSnapshot` and `exportSnapshot` using the same snapshot/export path.
- `loadRecommendations`, `listRecommendations`, `focusRecommendation`.
- `saveRecommendationAsPlace` only for mappable verified recommendation items.
- Browser events: `foodmap:agent-command`, `foodmap:agent-result`, `foodmap:state-changed`.

Future agent panels may be added, but they must sit above this bridge instead of creating a second data path.

## Design Constraints

- The map is the first screen.
- The app keeps the Scheme 4 travel-journal tone, but controls remain compact and operational.
- Decorative elements are secondary to map readability.
- Recommendation marker styling must be legible: ranked pins for high-priority items, green adaptive pins when zoom/density allows, and unobtrusive dots only for crowded secondary items.
- Text and buttons must not overlap in desktop 1440x900 or mobile 390x844.

## Non-Goals

- Backend account system.
- Public permanent share links.
- Multi-user real-time collaboration.
- Server-side photo storage.
- Fabricating private or app-only AMap ranking entries.
- Rendering low-confidence POI candidates as map pins.
