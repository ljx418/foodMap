# FoodMap P19-2 Acceptance Report - Current Viewport Poster

Date: 2026-06-23
Status: Passed

## 1. Scope

P19-2 enables real `当前视野` poster mode. The mode uses current map bounds reported by the active map adapter, intersects them with the current filtered personal places, shows the derived count in preview, and exports the same source set to PNG.

P19-2 does not add backend services, account sync, cloud sharing, public permanent links, remote map-tile screenshot export, or external realtime POI search.

## 2. Implementation Summary

| Area | Change |
| --- | --- |
| Domain type | Added `MapViewportBounds` to `src/domain/types.ts` |
| Map adapter | Added optional `onViewportChange` contract |
| Leaflet provider | Emits WGS84 viewport bounds after init, move, zoom, and resize |
| Workspace | Stores latest bounds and passes them to poster dialog |
| Poster domain | Added `buildPosterSourceSet` and `filterPlacesByViewport` |
| Poster UI | Added selectable `当前筛选` / `当前视野`, count parity, unavailable state, empty viewport state, and disabled export when source is empty |
| Tests | Added 3 unit tests and 1 targeted Playwright test |

## 3. PRD Specification Review

P19-2 remains aligned with the PRD and P19 target architecture:

- Map remains the primary surface.
- Personal records remain local in IndexedDB.
- Share poster export remains local PNG generation.
- Reference layers are excluded from personal poster source sets.
- `当前视野` uses real map bounds and does not silently reuse `当前筛选`.
- Empty viewport is visible and non-exportable.
- No backend, account, cloud sync, public permanent share, automatic POI correction, or realtime POI-search claim was added.

No fatal or major PRD/specification deviation remains.

## 4. Verification Results

| Command | Result | Notes |
| --- | --- | --- |
| `npm run build` | Passed | TypeScript and Vite production build passed after moving `MapViewportBounds` into Domain types |
| `npm test -- --run` | Passed | 37 tests passed |
| `npm run verify:scanlist` | Passed | 50 entries, 50 overlays, 38 approximate admitted pins |
| `P19 current viewport poster` Playwright | Passed | Current filter count, current viewport count, PNG download, and empty viewport state verified |
| `map poster export downloads` Playwright | Passed | Existing current-filter PNG regression remains green |
| `agent bridge returns structured errors` Playwright | Passed | P18 Agent negative regression remains green |
| `P18 large deterministic` Playwright | Passed on sequential rerun | First parallel rerun hit dev-server connection refusal; sequential rerun passed |

Browser commands used the P19-1 local library path:

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster"
```

## 5. Acceptance Data

The targeted browser test created deterministic local personal records through `window.FoodMapAgentBridge`:

- `P19 视野内热干面`: Wuhan coordinate, visible inside the initial map viewport.
- `P19 视野外小吃`: Beijing coordinate, included in current filter but outside the current Wuhan viewport.

Observed user-visible outcomes:

- `当前筛选`: 2 personal pins.
- `当前视野`: 1 personal pin.
- PNG download used `P19 当前视野海报.png`.
- Filtering to the outside-only record produced `0 个当前视野个人图钉`, visible empty state, and disabled export.

## 6. Environment Notes

The first P19 targeted run reused a wrong app because port `5173` was occupied by another project's Vite server. That process was stopped, FoodMap's own dev server started, and the test passed. Future Playwright runs must ensure `5173` is FoodMap or use an isolated port/config.

## 7. Audit Opinion

P19-2 passed.

The implementation is scoped to the approved P19 plan. It improves the existing local poster workflow without changing FoodMap's product boundary or over-claiming external map/search capabilities. No fatal or major false-acceptance risk remains for P19-2.
