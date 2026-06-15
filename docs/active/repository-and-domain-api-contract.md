# FoodMap V1.0 + P17 Repository And Domain API Contract

## Summary

This document defines the implementation-facing API contracts for domain helpers and IndexedDB repositories. UI components should call these APIs instead of touching IndexedDB directly. P17 extends this contract with pending-place, pin-move, rating-normalization, and Agent read-only context requirements.

## Domain Helpers

Required helpers:

```ts
validateFoodPlaceDraft(input: Partial<FoodPlace>): ValidationResult;
validateFoodLayer(input: Partial<FoodLayer>): ValidationResult;
validateSharePackage(input: unknown): ValidationResult<FoodMapSharePackage>;
filterPlaces(places: FoodPlace[], filters: FoodFilterState): FoodPlace[];
createDefaultLayers(): FoodLayer[];
createShareSnapshot(input: CreateShareSnapshotInput): ShareSnapshot;
deriveLocationStatus(place: FoodPlace): LocationStatus;
listPendingPlaces(places: FoodPlace[]): PendingPlaceSummary[];
normalizePercentScore(rawScorePercent: number): FoodRating;
getUserFacingTags(tags: string[]): string[];
applyManualPinMove(place: FoodPlace, point: { longitude: number; latitude: number }): FoodPlace;
applyCandidateConfirmation(place: FoodPlace, candidate: PlaceCandidate): FoodPlace;
createPinMoveAudit(input: PinMoveAuditInput): PinMoveAuditEntry;
```

Validation behavior:

- Return structured errors with `field`, `code`, and `message`.
- Do not throw for ordinary validation failures.
- Throw only for programmer errors or unavailable browser APIs.

P17 domain behavior:

- `deriveLocationStatus` must treat `位置待确认`, `位置高风险`, `待校准`, `mapAccuracy="approximate"`, water/bridge/out-of-city risk, and skipped confirmation as non-verified states.
- `listPendingPlaces` must include pending, blocked, skipped, and approximate personal places; verified scanlist/reference recommendations are excluded unless explicitly converted to personal records.
- `normalizePercentScore` must implement `clamp((rawScorePercent - 65) / 35 * 5, 0, 5)` and return a value compatible with the existing five-star UI.
- `getUserFacingTags` must remove system status tags and percent-score metadata from editable custom tags.
- `applyManualPinMove` must preserve previous coordinates in audit evidence and must not run for read-only scanlist/reference pins.
- `applyCandidateConfirmation` must update coordinates, address, confidence/status tags, `mapAccuracy`, and audit evidence only after user confirmation.

## Repository APIs

Place repository:

```ts
listPlaces(): Promise<FoodPlace[]>;
getPlace(id: string): Promise<FoodPlace | undefined>;
savePlace(place: FoodPlace): Promise<void>;
deletePlace(id: string): Promise<void>;
listPendingPlaces(): Promise<FoodPlace[]>;
updatePlaceLocation(id: string, update: PlaceLocationUpdate): Promise<FoodPlace>;
appendPinMoveAudit(id: string, entry: PinMoveAuditEntry): Promise<void>;
```

Layer repository:

```ts
listLayers(): Promise<FoodLayer[]>;
saveLayer(layer: FoodLayer): Promise<void>;
deleteLayer(id: string): Promise<void>;
ensureDefaultLayers(): Promise<void>;
```

Photo repository:

```ts
listPhotosByPlace(placeId: string): Promise<PhotoAsset[]>;
savePhoto(photo: PhotoAsset): Promise<void>;
deletePhoto(id: string): Promise<void>;
deletePhotosByPlace(placeId: string): Promise<void>;
createThumbnail(file: File): Promise<string>;
```

Snapshot repository:

```ts
listSnapshots(): Promise<ShareSnapshot[]>;
getSnapshot(id: string): Promise<ShareSnapshot | undefined>;
saveSnapshot(snapshot: ShareSnapshot): Promise<void>;
deleteSnapshot(id: string): Promise<void>;
```

Import/export codec:

```ts
exportSnapshotPackage(snapshot: ShareSnapshot): FoodMapSharePackage;
serializeSharePackage(pkg: FoodMapSharePackage): string;
parseSharePackage(json: string): ValidationResult<FoodMapSharePackage>;
importSharePackage(pkg: FoodMapSharePackage): Promise<ShareSnapshot>;
```

## Transaction Rules

- Place delete and photo cascade delete must run as one logical operation.
- Import validates first, then writes snapshot in a single transaction when possible.
- Repository methods must be idempotent where practical: saving the same record twice should not duplicate it.
- UI state updates should happen after repository success, except optimistic UI may be used only if rollback is implemented.
- P17 location updates must update coordinates, `mapAccuracy`, status tags, audit evidence, and `updatedAt` as one logical operation.
- Candidate confirmation and manual pin move must not partially update a place if audit preservation fails.
- Skipping a pending place must not remove the place from the map; it only changes the pending workbench ordering/status.

## Error Handling

Repository errors must map to user-facing states:

| Error | User Feedback |
| --- | --- |
| Validation failure | Field-level error |
| Storage quota exceeded | `保存失败，可能是浏览器存储空间不足。` |
| Invalid import | `文件格式不正确，未导入任何数据` |
| Missing snapshot | Missing share snapshot empty state |
| Browser API unavailable | Toast explaining local storage is unavailable |
| Pending confirmation required | `这个地点还没有确认具体门店，确认后再导航。` |
| Pin move in progress | `请先确认或取消当前挪动。` |
| Read-only pin | `参考图层不能直接挪动，请先保存到我的收藏。` |

## P17 Agent API Contract

Agent Bridge may expose:

```ts
listPendingPlaces(): Promise<PendingPlaceSummary[]>;
getPendingPlaceContext(placeId: string): Promise<PendingPlaceContext>;
submitPlaceCandidates(input: SubmitCandidatesInput): Promise<PlaceCandidate[]>;
focusPlace(placeId: string): Promise<void>;
setFilter(filter: FoodFilterState): Promise<void>;
```

Agent Bridge must not expose a direct coordinate finalization action that bypasses UI/Domain confirmation. If a future action is added for assisted confirmation, it must require the same validation and user-confirmed state transition as manual UI.

## Acceptance

- Unit tests cover validators, filters, default layers, repository CRUD, photo cascade delete, snapshot creation, import validation, and malformed package handling.
- UI code does not import `db.ts` directly outside repository modules.
- P17 tests cover `deriveLocationStatus`, `listPendingPlaces`, `normalizePercentScore`, `getUserFacingTags`, `applyManualPinMove`, candidate confirmation, and read-only Agent pending context.
