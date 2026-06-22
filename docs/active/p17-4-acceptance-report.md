# FoodMap P17-4 Acceptance Report

## Phase

P17-4 Mobile Main Path Optimization.

## Implementation Summary

Completed changes:

- Added a direct `导出分享图` action inside the place detail core action area.
- On mobile, the detail share action closes the detail sheet before opening the poster dialog, avoiding stacked panels.
- Kept pending/approximate map navigation guarded: direct navigation remains disabled until calibration, while copy fallback remains available.
- Added a mobile main-path E2E scenario using imported real personal-favorite data.

## PRD Specification Review

| Requirement | Result | Evidence |
| --- | --- | --- |
| Mobile can enter pending workbench from homepage | Pass | `mobile P17 main path reaches detail tags, map fallback and share poster` |
| Mobile can enter detail from pending workbench | Pass | Same E2E |
| Mobile detail supports tag editing | Pass | Same E2E plus existing persistent tag test |
| Mobile detail exposes map/copy fallback | Pass | Same E2E |
| Mobile detail exposes manual pin move | Pass | Same E2E plus `mobile manual pin move uses a map-first calibration mode` |
| Mobile can reach share poster preview from main path | Pass | New detail-level `导出分享图` action |
| Existing bottom action bar choreography remains stable | Pass | `closing selected detail restores mobile bottom actions` |

## Evidence

Visual evidence:

- `docs/active/evidence/p17/mobile-390x844-main-path.png`

Automated evidence:

- `e2e/workspace.spec.ts`
  - `mobile P17 main path reaches detail tags, map fallback and share poster`
  - `mobile manual pin move uses a map-first calibration mode`
  - `closing selected detail restores mobile bottom actions`
  - `mobile place detail drawer scrolls within the sheet`

## Commands

```text
npm run build
Result: pass

npm test
Result: pass, 33 tests

npm run verify:scanlist
Result: pass, 50 entries, 50 manual verification overlays

npx playwright test
Result: pass, 55 passed, 21 skipped
```

## Audit Opinion

P17-4 is accepted.

No fatal or major PRD deviation was found. The direct detail share entry improves the mobile main path without changing the pure frontend architecture or weakening pending-location navigation safeguards.

Residual risk moves to P17-5 and P17-6: homepage filtering, pin visual state, and share poster preview/export must continue using the same visible-place facts and remain stable under real data.
