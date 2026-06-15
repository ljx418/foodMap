# FoodMap V1.0 Development And Acceptance Plan

## Summary

V1.0 development is organized around Scheme 4: travel journal style. A phase is complete only when its implementation, tests, and evidence are present. The canonical detailed implementation plan is [development-plan-scheme4.md](./development-plan-scheme4.md); this document is the acceptance-oriented summary.

Implementation-level contracts are part of the development baseline:

- [data-schema-and-import-export-contract.md](./data-schema-and-import-export-contract.md)
- [repository-and-domain-api-contract.md](./repository-and-domain-api-contract.md)
- [map-provider-contract.md](./map-provider-contract.md)
- [e2e-test-and-evidence-matrix.md](./e2e-test-and-evidence-matrix.md)
- [visual-acceptance-checklist.md](./visual-acceptance-checklist.md)

## Complete Development And Acceptance Outline

| Milestone | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| M0 | Freeze PRD, architecture, contracts, drawio, and audit list | Document checklist and drawio parse result | Active and V1.0 docs are aligned and audit list stays under 20 files |
| M1 | Initialize Vite React TS app, routes, tokens, Vitest, Playwright | Build/test command output and route smoke screenshots | `#/map` and `#/share/demo` render stable shells |
| M2 | Implement domain types, validators, filters, IndexedDB repositories, photo thumbnails, import/export codec | Unit tests and reload persistence evidence | Records, photos, layers, and invalid imports behave according to contracts |
| M3 | Implement MapProviderAdapter, Leaflet fallback, AMap provider, marker rendering, map click, marker click | Provider smoke tests and manual provider notes | Map is usable without AMap key and provider failures never blank the page |
| M4 | Build desktop/mobile workspace, CRUD, layer panel, filters, photo upload, detail drawer, editor modal | Playwright flows and desktop/mobile screenshots | User can complete the core record loop from creation through filtering |
| M5 | Build share snapshots, read-only share route, `.foodmap.json` export/import | Clean-profile import/export round-trip evidence | Share page is usable and contains no editing controls |
| M6 | Apply Scheme 4 visual system and responsive polish | Visual checklist and screenshots | Map remains primary and UI matches travel journal style without clutter |
| M7 | Run final acceptance and write report | `final-acceptance-report.md` with command summaries and evidence paths | All blocker gates pass or have documented non-blocking waiver |

## M0: Documentation And Design Baseline

Implementation:

- Preserve the Scheme 4 PRD, development plan, and Figma prompts under `docs/active` and `docs/V1.0`.
- Include target architecture, milestone roadmap, acceptance gate, gap analysis, and drawio diagram.
- Update document indexes to point at the standard PRD and Scheme 4 files.

Acceptance:

- `docs/active` and `docs/V1.0` both exist.
- Drawio file opens in diagrams.net and includes architecture, plan, milestone, gate, and feature pages.
- Documentation states V1.0 scope, non-goals, Scheme 4 visual direction, and local-first constraints.

## M1: Frontend Foundation

Implementation:

- Initialize Vite + React + TypeScript.
- Add hash router, app shell, CSS tokens, and base responsive layout.
- Configure Vitest and Playwright.
- Create empty `MapWorkspace` and `ShareView` shells.
- Add Scheme 4 CSS tokens and base layout styles.

Acceptance:

- `npm run dev` starts the app.
- `npm run build` completes.
- `npm test` runs unit tests.
- Browser smoke test reaches `#/map` and `#/share/demo`.

## M2: Domain And IndexedDB Data Core

Implementation:

- Define `FoodPlace`, `FoodLayer`, `PhotoAsset`, `ShareSnapshot`, `FoodFilterState`, filters, and validation helpers.
- Implement IndexedDB stores: `places`, `layers`, `photos`, `snapshots`, `meta`.
- Implement repositories for place, layer, photo, snapshot, and import/export.
- Create first-run default layers defined in the Scheme 4 PRD.

Acceptance:

- Create, read, update, and delete work for places and layers.
- Photos persist as blobs and thumbnails.
- Data survives page reload.
- Invalid import payloads are rejected with visible user feedback and do not mutate existing data.

## M3: Map Provider Layer

Implementation:

- Implement `MapProviderAdapter`.
- Add AMap provider selected when `VITE_AMAP_KEY` exists.
- Add Leaflet provider fallback when no key exists.
- Render markers from visible layers and filtered places.
- Implement readable provider error states.
- Marker color and icon must derive from layer config.

Acceptance:

- App runs without AMap key using Leaflet fallback.
- App runs with AMap key using AMap provider.
- Marker click opens the correct place.
- Layer visibility updates marker visibility.
- Map click can prefill a new place location.
- Hidden layers immediately remove matching markers.

## M4: Personal Workspace UI

Implementation:

- Build full-screen map layout.
- Add left layer panel, top city/search/filter controls, right floating map tools.
- Add place detail drawer and place editor modal.
- Support rating, visit date, tags, notes, address, coordinates, and photos.
- Implement desktop layout: 280px left panel, adaptive map, 380px detail drawer.
- Implement mobile layout: top search, full-screen map, bottom action bar, bottom sheets, full-screen editor.
- Add the full place creation flows: map click and search result.

Acceptance:

- User can create a food place from map click or search result.
- User can upload photos and see thumbnails in detail view.
- User can edit and delete a place.
- User can filter by keyword, city, tags, rating, and visit date.
- Desktop and mobile layouts have no incoherent overlap.
- Required fields validate correctly: name, coordinates, layer, rating, visit date.

## M5: Share View And Import/Export

Implementation:

- Generate local share snapshots.
- Add read-only route `#/share/:snapshotId`.
- Add export and import for `.foodmap.json` share packages.
- Allow snapshot generation from all places or current filtered result.
- Show missing snapshot state with import action.

Acceptance:

- Share snapshot opens in read-only view.
- Share view supports layer toggles, marker clicks, and detail viewing.
- Exported package can be imported into a clean browser profile.
- Share view does not expose editing controls.
- Import failure does not corrupt existing data.

## M6: Scheme 4 Visual Implementation

Implementation:

- Apply the travel journal visual system from the PRD and Figma prompts.
- Implement warm paper background, paper cards, muted map treatment, layer marker icons, star ratings, and restrained decoration.
- Verify that visual decoration does not reduce map readability or task efficiency.

Acceptance:

- Visual style reads as travel journal, while controls remain clear and tool-like.
- User can find search, add, filter, and layer controls within 3 seconds.
- Share page is visually quieter than the editing workspace and clearly read-only.
- Desktop 1440x900 and mobile 390x844 screenshots show no overlap.

## M7: Final Acceptance

Implementation:

- Run full test suite and manual acceptance checklist.
- Capture final evidence in `docs/V1.0/final-acceptance-report.md`.
- Fix all acceptance-gate blockers.

Acceptance:

- Build, unit tests, and browser smoke tests pass.
- Manual checklist is completed.
- Final acceptance report references evidence for every gate.

## Required Evidence

- Command output for build and tests.
- Browser screenshots for desktop and mobile.
- Manual verification notes for AMap and Leaflet provider behavior.
- Import/export round-trip evidence.
- Final acceptance report with pass/fail status.
- Visual evidence for Scheme 4 desktop and mobile states.

## Final Exit Conditions

FoodMap V1.0 can exit only when:

- `npm run build`, `npm test`, and `npx playwright test` pass.
- Leaflet fallback works without `VITE_AMAP_KEY`.
- AMap provider is verified when `VITE_AMAP_KEY` is available, or the final report records why AMap verification was unavailable.
- Core PRD loops pass: create, edit, delete, filter, photo thumbnail, share snapshot, export, clean-profile import.
- Desktop `1440x900` and mobile `390x844` screenshots show no incoherent overlap.
- `docs/V1.0/final-acceptance-report.md` references all required evidence.
