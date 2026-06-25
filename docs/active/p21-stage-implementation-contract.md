# FoodMap P21 Stage Implementation Contract

Status: Binding for P21 implementation.

## Binding Scope

P21 implements local share and data portability release readiness:

- local snapshot generation review;
- `.foodmap.json` export package completeness;
- clean profile import into local read-only snapshot;
- read-only share route guardrails;
- invalid import and missing snapshot no-op/fallback;
- Agent boundary for share/import/export;
- responsive and real-data release evidence.

## Non-Negotiable Boundaries

- No backend, account, cloud sync, or public permanent share link.
- No claim that `#/share/:snapshotId` works across devices without importing the matching `.foodmap.json`.
- No automatic import into editable personal records in P21.
- No partial write before package validation completes.
- No edit, delete, create, upload, save, or account controls on share page.
- No bypass of P20-C governance rules for risk, duplicate, delete, merge, or coordinate finalization.

## Minimum Interfaces

Recommended domain/runtime shapes:

```ts
interface SnapshotPortabilitySummary {
  snapshotId: string;
  title: string;
  exportedAt: string;
  placeCount: number;
  layerCount: number;
  thumbnailCount: number;
  readonly: true;
}

interface FoodMapPackageValidationResult {
  ok: boolean;
  schemaVersion?: number;
  snapshotId?: string;
  errors: string[];
  summary?: SnapshotPortabilitySummary;
}
```

Implementation may use equivalent shapes if tests prove the same behavior.

## Required Write Rules

- Snapshot creation writes a local `ShareSnapshot` only after user confirmation.
- Clean profile import writes only local snapshot data required by the read-only share route.
- Invalid import, unsupported schema, missing required fields, and parse errors must leave existing IndexedDB state unchanged.
- Error feedback must be visible to the user and must not imply recovery happened if it did not.

## Required Browser Selectors

P21 implementation should add or reuse stable selectors for:

- `share-snapshot-dialog`
- `snapshot-portability-summary`
- `export-foodmap-json`
- `import-export-dialog`
- `import-readonly-snapshot`
- `import-governance-preview`
- `import-error-message`
- `share-view`
- `share-readonly-notice`
- `share-missing-snapshot`
- `share-layer-toggle`
- `share-place-detail`

## Acceptance Binding

P21 cannot be accepted unless:

- build, unit, scanlist, P18/P19/P20-C regression, P21 targeted Playwright, and final report pass;
- exported JSON evidence is inspected;
- clean profile import is browser-tested;
- invalid import no-op is proven;
- share page read-only controls are browser-tested;
- PRD and target architecture review finds no major deviation.
