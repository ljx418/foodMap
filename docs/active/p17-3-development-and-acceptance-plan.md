# FoodMap P17-3 Development And Acceptance Plan

## Phase Scope

P17-3 focuses on the place detail information architecture. It does not change the pure frontend boundary, persistence model, map provider, or P17-2 pending workbench behavior.

The implementation must make the detail drawer a stable entry for:

- location status and source understanding;
- editable user tags;
- core actions: open/copy map link and manual pin move;
- photos and personal record review;
- coordinate risk and candidate calibration.

## PRD Baseline

The binding PRD sections are:

- `docs/active/product-requirements-document.md` section `4D.1` item 4 and item 5.
- `docs/active/product-requirements-document.md` section `4D.4`.
- `docs/active/p17-ux-trust-implementation-contract.md` section `3.2 Detail Page IA`.

Required order:

1. return/close and edit/delete;
2. place status and source;
3. place name;
4. editable tags;
5. core actions: open map, copy address, manual pin move;
6. photos or empty photo state;
7. rating, visited time, city, address;
8. coordinate risk and calibration candidates;
9. notes.

## Pre-Implementation Audit

| Item | Result | Opinion |
| --- | --- | --- |
| Existing detail supports editable tags | Pass | Keep current tag persistence path and only move layout. |
| Existing detail supports percent-score normalized star display | Pass | Existing domain tests cover the formula. |
| Existing detail supports external map and manual pin move | Pass with IA issue | Actions exist but appear too low in the hierarchy. |
| Existing desktop/mobile scroll tests | Pass | Keep tests and add P17-3 visual evidence. |
| Major spec deviation risk | Low | Change is mostly layout order and CSS containment. |

Audit decision: `Go for P17-3 implementation`.

## Development Tasks

| Task | Implementation Target | Acceptance |
| --- | --- | --- |
| P17-3A Status/source first | Move status badges and layer/source above the place name | Detail DOM and screenshots show state before title. |
| P17-3B Tags before media | Keep editable user-facing tags directly below title | Add/remove tag E2E remains passing. |
| P17-3C Core actions before photos | Move external map/copy and manual pin move before photos/rating | Map link and manual move remain discoverable without scrolling. |
| P17-3D Record section | Keep photos, stars, visited time, city, address as the record section | Desktop and mobile screenshots have no horizontal clipping. |
| P17-3E Calibration section | Coordinate risk, live search, and candidate confirmation stay after record basics | Pending places do not expose misleading navigation. |
| P17-3F Evidence | Capture P17-3 desktop and mobile detail screenshots | Evidence saved under `docs/active/evidence/p17/`. |

## Acceptance Commands

```bash
npm run build
npm test
npx playwright test
npm run verify:scanlist
```

## Exit Criteria

- Detail page order follows the P17 contract.
- Tags can still be added, removed, and persisted.
- Percent-score normalized star display remains covered by tests.
- Desktop `1280x900` and mobile `390x844` detail screenshots have no horizontal truncation or dead scroll area.
- External map action is disabled for pending/approximate locations and copy fallback remains available.
- Manual pin move remains available from the detail page.

## Audit Opinion

P17-3 can proceed. No fatal or major spec deviation is present before coding. The main risk is visual regression in narrow detail drawers, so browser screenshots are required before declaring this phase accepted.
