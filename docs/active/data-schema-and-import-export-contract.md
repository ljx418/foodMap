# FoodMap V1.0 + P19/P21 Data Schema And Import/Export Contract

## Summary

This document makes the local data and `.foodmap.json` contracts implementation-ready for FoodMap V1.0, the accepted P19/P20-C baselines, and the active P21 local share portability stage. FoodMap remains local-first, pure frontend, and does not depend on backend storage.

## IndexedDB Contract

Database:

- Name: `foodmap-db`
- IndexedDB version: `2`
- `.foodmap.json` package version: `1`

Stores:

| Store | Key | Indexes | Purpose |
| --- | --- | --- | --- |
| `places` | `id` | `layerId`, `city`, `visitedAt`, `updatedAt` | Food place records |
| `layers` | `id` | `sortOrder` | Layer metadata and visibility |
| `photos` | `id` | `placeId`, `createdAt` | Original photo blobs and thumbnails |
| `snapshots` | `id` | `exportedAt` | Local read-only share snapshots |
| `meta` | `key` | none | App metadata, schema version, first-run flags |
| `governanceJournal` | `id` | `createdAt` | Local personal-data governance audit entries |

Migration rules:

- Create all stores if missing.
- Insert default layers only when `layers` is empty.
- IndexedDB version `2` adds `governanceJournal` for the accepted P20-C governance baseline.
- `.foodmap.json` remains package version `1` for P21 portability; this is intentionally separate from IndexedDB `DB_VERSION`.

Default layers:

| Name | Icon | Color |
| --- | --- | --- |
| 必吃餐厅 | `star` | `#C76A32` |
| 咖啡馆 | `coffee` | `#8A5A3B` |
| 小吃快餐 | `bowl` | `#6F7F47` |
| 甜品饮品 | `heart` | `#D98A7A` |
| 想去清单 | `pin` | `#8C7AA9` |

## Entity Validation

`FoodPlace` required fields:

- `id`: non-empty string
- `name`: non-empty string
- `longitude`: finite number, `-180 <= longitude <= 180`
- `latitude`: finite number, `-90 <= latitude <= 90`
- `layerId`: existing layer id
- `rating`: integer `1..5`
- `visitedAt`: valid ISO date or datetime string
- `createdAt`, `updatedAt`: valid ISO datetime strings

`FoodPlace` P17 optional fields:

| Field | Type | Purpose | Compatibility Rule |
| --- | --- | --- | --- |
| `coordinateSystem` | `wgs84 | gcj02` | Distinguish stored coordinate system from provider coordinate system | Missing value is treated as `wgs84` for legacy records |
| `mapAccuracy` | `exact | approximate` | Current persisted coordinate precision flag | Missing value is derived from tags and coordinate risk |
| `tagGroups` | structured visit/review/cuisine/custom groups | Keep user-facing tags separate from system status tags | Legacy `tags` remains the import/export compatibility source |
| `originalRatingText` | string | Preserve raw user rating text such as `90` or `待补` when available | Optional; if absent, derive only from `rating` |
| `rawScorePercent` | number `0..100` | Preserve user-supplied percent score before five-star normalization | Optional; never required for legacy imports |
| `pinMoveAudit` | latest audit object or audit array | Preserve manual/candidate coordinate correction history | Optional in schema version 1; notes-based audit remains accepted fallback |

P17 derived place states:

```text
verified
pending
manual-adjusted
blocked
skipped
```

These states do not have to be stored as a separate required field in schema version 1. They may be derived from:

- `mapAccuracy`
- system tags such as `位置待确认`, `位置高风险`, `手动校准`
- coordinate risk assessment
- candidate confirmation state
- latest pin move audit

If a future schema version persists `locationStatus`, it must remain import-compatible with schema version 1 and must not silently mark uncertain legacy records as `verified`.

## P17 Rating Contract

Percent score normalization:

```text
fiveStar = clamp((rawScorePercent - 65) / 35 * 5, 0, 5)
```

Rules:

- `rating` remains the normalized five-star value used by current UI and filters.
- `rawScorePercent` and `originalRatingText` preserve user intent when the source input is percent-based.
- Percent score labels such as `百分制82` are system-derived metadata, not user-facing custom tags.
- Imports that contain only `rating` remain valid.
- Exports should include `rawScorePercent` when present, but imported packages lacking it must still pass validation.

## P17 Pin Move Audit Contract

Recommended audit shape:

```ts
interface PinMoveAuditEntry {
  previousLongitude: number;
  previousLatitude: number;
  newLongitude: number;
  newLatitude: number;
  updatedAt: string;
  method: "manual-drag" | "candidate-confirm";
  reason?: string;
}
```

Minimum compatibility rule for schema version 1:

- If `pinMoveAudit` is not persisted, the app must still preserve a visible audit note in `notes` and mark the place as `mapAccuracy = "exact"` plus a visible `手动校准` or equivalent status tag after user confirmation.
- Automatic candidate confirmation must never erase an existing manual audit without a visible user action.

## P19 Personal Data Health Contract

P19 data health is a derived read model over schema version 1 records. It must not require an IndexedDB migration to start.

Minimum derived groups:

| Group | Derivation Source | Mutation Rule |
| --- | --- | --- |
| `verified` | exact coordinates without pending/high-risk/manual/skipped risk markers | Read-only grouping |
| `pending` | `mapAccuracy="approximate"`, `位置待确认`, candidate/pending risk helpers | Read-only grouping |
| `high-risk` | `位置高风险`, coordinate risk, suspicious water/bridge/out-of-city flags | Read-only grouping |
| `manual-adjusted` | `手动校准`, manual audit fallback in notes/tags/mapAccuracy | Read-only grouping |
| `skipped` | skipped confirmation tags or notes | Read-only grouping |

The health report may include counts, place ids, representative names, and recommended next actions. It must not auto-change `mapAccuracy`, tags, coordinates, or notes.

## P19 Current Viewport Poster Contract

Current viewport poster mode is a view/export selection rule, not a new persistent schema.

Recommended runtime shape:

```ts
interface MapViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  coordinateSystem?: "wgs84" | "gcj02";
}

interface PosterSourceResult {
  mode: "current-filter" | "current-viewport";
  placeIds: string[];
  count: number;
}
```

Rules:

- `current-filter` uses the current filtered personal-place set.
- `current-viewport` uses the current filtered personal-place set intersected with map bounds.
- Exported PNG and preview must use the same `placeIds`.
- Empty viewport state must not silently export a different place set.
- No additional fields are required in `.foodmap.json` for P19.

## P21 Local Share Portability Contract

P21 treats `.foodmap.json` as the local package required to move a read-only share snapshot between browser profiles. It does not define account sync, cloud backup, public permanent links, or editable restore.

Minimum package evidence:

| Field | Requirement |
| --- | --- |
| `schema` + `version` | Must be `foodmap.share` version `1`; unsupported versions must be rejected before writes |
| `snapshot.id` | Non-empty id used by `#/share/:snapshotId` after import |
| `snapshot.title` | Non-empty title visible on the share page |
| `snapshot.exportedAt` | Valid timestamp visible or inspectable as snapshot time |
| `places` | Valid share-view place records with required `FoodPlace` fields |
| `layers` | Valid share-view layer records referenced by places |
| `photos` | Thumbnail-only share assets; original blobs are not required for P21 portability |

P21 import rules:

- Package parsing and validation must finish before any IndexedDB write.
- Clean profile import writes only the local `ShareSnapshot` needed by `#/share/:snapshotId`.
- P21 import must not silently restore editable `places`, `layers`, or `photos` into the personal workspace.
- Invalid JSON, unsupported schema/version, missing required fields, invalid coordinates, invalid layer references, or malformed thumbnail data must leave existing `places`, `layers`, `photos`, `snapshots`, and governance journal state unchanged.
- Missing snapshot route must explain that the snapshot is local and requires importing the matching `.foodmap.json`.

Recommended runtime validation shape:

```ts
interface FoodMapPackageValidationResult {
  ok: boolean;
  schemaVersion?: number;
  snapshotId?: string;
  errors: string[];
}
```

Equivalent shapes are acceptable if P21 unit and browser tests prove the same validation, no-op, and share-view behavior.

`FoodLayer` required fields:

- `id`, `name`: non-empty string
- `color`: hex color string
- `icon`: `pin | star | bowl | coffee | heart`
- `visible`: boolean
- `sortOrder`: finite number

`PhotoAsset` required fields:

- `id`, `placeId`, `fileName`, `mimeType`: non-empty string
- `blob`: `Blob`
- `thumbnailDataUrl`: data URL string
- `createdAt`: valid ISO datetime string

`ShareSnapshot` required fields:

- `id`, `title`: non-empty string
- `places`, `layers`, `photos`: arrays
- `exportedAt`: valid ISO datetime string

## Delete And Consistency Rules

- Deleting a place must also delete photos with the same `placeId`.
- Deleting a layer is allowed only after user confirms how to handle assigned places.
- V1.0 default behavior for deleting a non-empty layer: block deletion and ask user to move or delete places in a later workflow.
- Import failure must not write partial data.
- Snapshot import writes only `snapshots` and thumbnail-only snapshot content; it must not overwrite the user's editable `places`, `layers`, or `photos` unless a future version explicitly adds backup restore.

## `.foodmap.json` Contract

File extension:

- `.foodmap.json`

Top-level shape:

```json
{
  "schema": "foodmap.share",
  "version": 1,
  "exportedAt": "2026-06-03T00:00:00.000Z",
  "snapshot": {
    "id": "snapshot_...",
    "title": "上海周末咖啡地图",
    "places": [],
    "layers": [],
    "photos": [],
    "exportedAt": "2026-06-03T00:00:00.000Z"
  }
}
```

Rules:

- `schema` must equal `foodmap.share`.
- `version` must equal `1`.
- Export includes snapshot metadata, places, layers, and photo thumbnails.
- P17/P18/P19 export includes optional compatibility fields when present; older packages without them remain valid.
- Export does not include original photo blobs.
- Imported snapshots receive a new local id if the incoming id already exists.
- Import must validate the full payload before writing to IndexedDB.
- Invalid files show: `这个文件不是有效的 FoodMap 数据包。`
- Import errors show no partial imported snapshot.

Recommended file name:

```text
foodmap-{slug}-{yyyy}.foodmap.json
```

Example:

```text
foodmap-shanghai-cafe-2026.foodmap.json
```

## Acceptance

- Unit tests cover valid export, invalid schema, unsupported version, missing required fields, duplicate snapshot id, and malformed JSON.
- Clean-profile import opens `#/share/:snapshotId`.
- Invalid import leaves existing stores unchanged.
- P17/P18 tests cover percent-score normalization, system tag filtering, pending-state derivation, manual pin move audit preservation, and backward-compatible import of legacy schema version 1 packages.
- P19 tests must cover derived health grouping and current-viewport poster source selection without requiring a schema migration.
