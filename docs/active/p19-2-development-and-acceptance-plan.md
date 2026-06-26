# FoodMap P19-2 Development And Acceptance Plan - Current Viewport Poster

Date: 2026-06-23
Status: Plan Ready

## 1. Scope

P19-2 turns the share poster `当前视野` mode from a disabled promise into a real mode backed by the current map viewport bounds.

P19-2 must not:

- include AMap scanlist or Dingtuyi reference markers in personal poster source sets,
- silently fall back from `当前视野` to `当前筛选`,
- claim remote map-tile screenshot export,
- add backend, account, cloud sync, public permanent sharing, or external realtime POI search.

## 2. PRD-Derived Acceptance Standard

The V1.0 PRD requires local-first personal records, local sharing/export, map-first use, and responsive usability. P19 extends that with trustworthy current-viewport sharing.

Acceptance standard:

1. `当前筛选` exports the current filtered personal places.
2. `当前视野` exports only current filtered personal places inside real map bounds.
3. Preview mode label, source count, subtitle, and exported source set are identical.
4. If map bounds are unavailable, `当前视野` is disabled with a clear reason.
5. If bounds are available but no places are inside them, `当前视野` shows an explicit empty state and export is disabled.
6. Reference layers remain excluded.
7. Build, unit tests, scanlist verification, and targeted browser coverage must pass with real FoodMap data/fixtures.

## 3. Development Plan

| Step | Code Area | Work |
| --- | --- | --- |
| 1 | `src/map/MapProviderAdapter.ts` | Add `MapViewportBounds` type and optional `onViewportChange` contract |
| 2 | `src/map/leaflet/LeafletProvider.ts` | Emit WGS84 bounds after initialization, moveend, zoomend, and resize |
| 3 | `src/features/workspace/MapCanvas.tsx` | Accept `onViewportChange` prop and pass it to provider |
| 4 | `src/domain/mapPoster.ts` | Add `filterPlacesByViewport` and `buildPosterSourceSet` read-only helpers |
| 5 | `src/features/workspace/MapWorkspace.tsx` | Store latest bounds and pass them with `visiblePlaces` into poster dialog |
| 6 | `src/features/workspace/MapPosterDialog.tsx` | Add mode selection, source count, unavailable/empty state, and count-parity export |
| 7 | `src/tests/domain.test.ts` | Add unit tests for viewport filtering, missing bounds, and reference exclusion |
| 8 | `e2e/workspace.spec.ts` | Add targeted P19 current-viewport poster browser coverage |

## 4. Audit Before Development

| Risk | Severity | Mitigation |
| --- | --- | --- |
| False viewport mode exports the same set as current filter | Major | Use domain helper with explicit bounds intersection and mode labels |
| Reference pins pollute personal poster | Major | Source helper accepts only personal `visiblePlaces`; tests include reference-like ids/layers |
| Bounds are hardcoded to Wuhan | Major | Bounds come from active map adapter; no hardcoded export bounds |
| Empty viewport silently exports all places | Major | Explicit empty result disables export |
| Browser tests hit wrong app on port 5173 | Major | Ensure FoodMap dev server owns 5173 before Playwright; use P19-1 `LD_LIBRARY_PATH` workaround |

Audit opinion: no fatal or major unresolved specification risk remains before implementation. Proceed to P19-2 development.

## 5. Required Verification

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster"
```

P19-2 acceptance report must include a PRD specification review before the phase can exit.
