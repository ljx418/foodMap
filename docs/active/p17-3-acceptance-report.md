# FoodMap P17-3 Acceptance Report

## Phase

P17-3 Detail Information Architecture.

## Implementation Summary

Completed changes:

- Reordered `PlaceDetailDrawer` to follow the P17 detail IA contract:
  1. return/edit/delete;
  2. status and source;
  3. place name;
  4. editable tags;
  5. core actions: map/copy/manual pin move;
  6. photos;
  7. rating, visited time, city, address;
  8. coordinate risk and calibration candidates;
  9. notes.
- Moved external map actions and manual pin move above photos and record metadata.
- Made all user-saved `FoodPlace` records eligible for manual pin move; readonly recommendation/reference details remain disabled by the caller.
- Adjusted detail CSS so long tags, names, addresses, and action labels wrap without horizontal scrolling.
- Added P17-3 browser test coverage and visual evidence.

## PRD Specification Review

| Requirement | Result | Evidence |
| --- | --- | --- |
| Detail prioritizes status, editable tags, core operations, and coordinate trust | Pass | `PlaceDetailDrawer` order and `place detail follows P17 information architecture order` E2E |
| Detail allows tag add/remove/persistence | Pass | Existing `place detail can add and remove custom tags persistently` E2E still passes |
| Detail always exposes manual pin move for user-saved places | Pass | `manualPinMove` eligibility updated; P17-3 E2E sees the action in core actions |
| Pending/approximate places do not expose misleading precise navigation | Pass | External map primary action remains disabled until calibration |
| Desktop and mobile detail do not horizontally clip | Pass | E2E checks `scrollWidth <= clientWidth`; screenshots generated |
| Percent-score normalized star display remains intact | Pass | `npm test` domain tests still pass |

## Evidence

Visual evidence:

- `docs/active/evidence/p17/desktop-1280x900-place-detail-ia.png`
- `docs/active/evidence/p17/mobile-390x844-place-detail-ia.png`

Automated evidence:

- `e2e/workspace.spec.ts`:
  - `place detail follows P17 information architecture order`
  - `desktop detail panel stays inside compact browser viewport`
  - `mobile place detail drawer scrolls within the sheet`
- `e2e/visual-evidence.spec.ts`:
  - `captures P17 detail information architecture evidence`

## Commands

```text
npm run build
Result: pass

npm test
Result: pass, 33 tests

npm run verify:scanlist
Result: pass, 50 entries, 50 manual verification overlays

npx playwright test
Result: pass, 54 passed, 20 skipped
```

## Audit Opinion

P17-3 is accepted.

No fatal or major PRD deviation was found after implementation. The main residual risk moves to P17-4/P17-5: mobile bottom-panel choreography and homepage filter command density must remain stable when detail, filter, pending workbench, map move mode, and share entry compete for the same small viewport.
