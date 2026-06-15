# FoodMap V1.0 Repository And Domain API Contract

## Summary

This document defines the implementation-facing API contracts for domain helpers and IndexedDB repositories. UI components should call these APIs instead of touching IndexedDB directly.

## Domain Helpers

Required helpers:

```ts
validateFoodPlaceDraft(input: Partial<FoodPlace>): ValidationResult;
validateFoodLayer(input: Partial<FoodLayer>): ValidationResult;
validateSharePackage(input: unknown): ValidationResult<FoodMapSharePackage>;
filterPlaces(places: FoodPlace[], filters: FoodFilterState): FoodPlace[];
createDefaultLayers(): FoodLayer[];
createShareSnapshot(input: CreateShareSnapshotInput): ShareSnapshot;
```

Validation behavior:

- Return structured errors with `field`, `code`, and `message`.
- Do not throw for ordinary validation failures.
- Throw only for programmer errors or unavailable browser APIs.

## Repository APIs

Place repository:

```ts
listPlaces(): Promise<FoodPlace[]>;
getPlace(id: string): Promise<FoodPlace | undefined>;
savePlace(place: FoodPlace): Promise<void>;
deletePlace(id: string): Promise<void>;
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

## Error Handling

Repository errors must map to user-facing states:

| Error | User Feedback |
| --- | --- |
| Validation failure | Field-level error |
| Storage quota exceeded | `保存失败，可能是浏览器存储空间不足。` |
| Invalid import | `文件格式不正确，未导入任何数据` |
| Missing snapshot | Missing share snapshot empty state |
| Browser API unavailable | Toast explaining local storage is unavailable |

## Acceptance

- Unit tests cover validators, filters, default layers, repository CRUD, photo cascade delete, snapshot creation, import validation, and malformed package handling.
- UI code does not import `db.ts` directly outside repository modules.

