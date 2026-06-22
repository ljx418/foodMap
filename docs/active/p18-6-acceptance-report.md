# P18-6 Acceptance Report - Share Poster Composer

Date: 2026-06-17
Status: Accepted

## Implemented Scope

- Added editable poster title input.
- Added explicit poster mode controls:
  - `当前筛选` is enabled and used by export.
  - `当前视野` is disabled with a clear note because viewport-bounded data is not yet passed to the composer.
- Added visible point count and tag summary before export.
- Kept export scoped to current filtered personal places; scanlist and reference layers are excluded.

## Validation Commands

```text
npm run build
npm test -- --run
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "map poster export downloads"
npm run verify:scanlist
```

## Evidence

- Build passed.
- Unit tests passed: 34 tests.
- Poster export E2E passed and verified custom title in the downloaded PNG filename.
- Scanlist baseline passed: 50 entries, 50 manual verification overlays, 38 approximate admitted pins.

## PRD Spec Review

- The composer now explains the relationship between the poster and current map filters.
- The export remains local-first and browser-only.
- The implementation avoids a false viewport-mode claim until the map view bounds are actually supplied.

## Audit Opinion

No fatal or major specification deviation found. P18-6 can be treated as accepted and P18-7 total acceptance can start.
