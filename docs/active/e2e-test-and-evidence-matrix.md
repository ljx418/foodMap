# FoodMap P17 E2E Test And Evidence Matrix

Updated: 2026-06-15

Additional real-data command gate:

- `npm run verify:scanlist` passes and verifies the 50-entry scanlist baseline, manual verification overlays, image evidence, refresh report summary, and disputed-location guardrails.

## Summary

This matrix defines the browser-level evidence needed to prove P17 satisfies the PRD, target architecture, [P16 Real Place Linking Implementation Contract](./p16-real-place-linking-implementation-contract.md), and [P17 UX Trust Implementation Contract](./p17-ux-trust-implementation-contract.md).

## Required Commands

```bash
npm run build
npm test
npm run verify:scanlist
npx playwright test
```

## Test Data

Use deterministic fixture data for E2E tests:

- Clean profile: no personal places; `我的收藏` layer may exist but contains no pins.
- Explicit personal-favorites import: 32 user-supplied Wuhan candidates are imported as personal pins; exact pins and calibration pins must be distinguishable. Current expected split is 1 exact pin and 31 calibration pins.
- Scanlist reference layer: 50 verified Wuhan recommendation entries, hidden by default.
- One small test image fixture for thumbnail generation.
- P16 place candidates:
  - two same-name Wuhan candidates in different districts
  - one candidate near the clicked map point
  - one candidate near mocked user location
  - one scanlist-backed candidate
  - one valid Agent candidate and one invalid Agent candidate
  - one saved history place for duplicate/history ranking
- P17 UX trust data:
  - 30+ personal favorites
  - 10+ pending personal places
  - 3 high-risk coordinates
  - 3 confirmable candidate places
  - 2 manually movable places
  - 2 long name/address places
  - 5 tag-rich places

## Selector Strategy

Use stable `data-testid` attributes for E2E-critical controls:

- `workspace-map`
- `workspace-search`
- `workspace-add-place`
- `layer-panel`
- `place-editor`
- `place-detail`
- `photo-uploader`
- `filter-panel`
- `share-snapshot-dialog`
- `import-export-dialog`
- `share-view`

## Playwright Scenarios

| ID | Scenario | Evidence |
| --- | --- | --- |
| E2E-01 | Clean profile opens `#/map` | Route visible, map shell rendered |
| E2E-02 | Leaflet fallback renders without `VITE_AMAP_KEY` | Fallback map visible |
| E2E-03 | Create place from map click | Marker and detail visible |
| E2E-04 | Create place from search result | Prefilled draft saved |
| E2E-05 | Edit place fields with unsaved-change guard | Closing an edited draft prompts before discarding; saved edit appears in detail |
| E2E-06 | Delete place | Marker/list item disappears and empty state returns when no places remain |
| E2E-07 | Upload photo | Thumbnail visible in saved detail |
| E2E-08 | Reload persistence | Place and thumbnail remain |
| E2E-09 | Toggle layer visibility | Matching markers disappear |
| E2E-10 | Apply and clear filters | Marker/result count changes and restores |
| E2E-11 | Generate share snapshot | `#/share/:snapshotId` opens |
| E2E-12 | Share page read-only | No edit/create/delete/upload/save controls |
| E2E-13 | Export `.foodmap.json` and map poster | File/poster download exists |
| E2E-14 | Import package in clean profile | Imported share snapshot opens automatically |
| E2E-15 | Desktop workspace screenshot | Historical evidence: `docs/history/p8-p14/evidence/p8-p14/desktop-1440x900-workspace.png`; P16 evidence should be captured under `docs/active/evidence/p16/` when produced |
| E2E-16 | Mobile workspace screenshot | Historical evidence: `docs/history/p8-p14/evidence/p8-p14/mobile-390x844-workspace.png`; P16 evidence should be captured under `docs/active/evidence/p16/` when produced |
| E2E-17 | Desktop recommendation detail screenshot | Historical evidence: `docs/history/p8-p14/evidence/p8-p14/desktop-1440x900-recommendation-detail.png`; P16 evidence should be captured under `docs/active/evidence/p16/` when produced |
| E2E-18 | Mobile recommendation detail screenshot | Historical evidence: `docs/history/p8-p14/evidence/p8-p14/mobile-390x844-recommendation-detail.png`; P16 evidence should be captured under `docs/active/evidence/p16/` when produced |
| E2E-19 | Desktop filter and create screenshots | Historical evidence: `docs/history/p8-p14/evidence/p8-p14/desktop-1440x900-filter-panel.png`, `docs/history/p8-p14/evidence/p8-p14/desktop-1440x900-place-editor.png`; P16 evidence should be captured under `docs/active/evidence/p16/` when produced |
| E2E-20 | Mobile filter and create screenshots | Historical evidence: `docs/history/p8-p14/evidence/p8-p14/mobile-390x844-filter-panel.png`, `docs/history/p8-p14/evidence/p8-p14/mobile-390x844-place-editor.png`; P16 evidence should be captured under `docs/active/evidence/p16/` when produced |
| E2E-21 | Agent structured errors, export, events, and no-write invalid save | `npx playwright test` H3 Agent readiness scenario |

## P16 Required Browser Scenarios

| ID | Scenario | Evidence |
| --- | --- | --- |
| P16-E2E-01 | Clean profile opens empty personal map | No personal markers; scanlist layer is hidden but can be toggled on |
| P16-E2E-02 | Map click opens place editor directly | Editor receives clicked coordinates; no intermediate add bubble |
| P16-E2E-03 | Same-name query shows multiple candidates | Candidate cards show name, address, source, confidence, coordinate accuracy, distance when available, and reasons |
| P16-E2E-04 | Candidate selection does not auto-save | Personal marker count is unchanged until the user clicks save |
| P16-E2E-05 | Geolocation granted changes ranking | Mock near candidate ranks higher and reason references location distance |
| P16-E2E-06 | Geolocation denied keeps flow usable | Candidate list still sorts by clicked point/history/source confidence and can be saved |
| P16-E2E-07 | Agent submits candidates into same flow | `submitPlaceCandidates` returns ranked candidates and does not create a place |
| P16-E2E-08 | Invalid Agent candidate is blocked | Missing address/coordinate candidate returns structured error or blocker reason |
| P16-E2E-09 | Saved place detail opens external map handoff | Detail shows map/navigation action plus copy fallback |
| P16-E2E-10 | Missing coordinate does not show misleading navigation | UI disables navigation and offers copy fallback only |
| P16-E2E-11 | Tag filtering drives map, list, and poster | Marker/list count and poster source count match current filter |
| P16-E2E-12 | Poster export is non-empty | Exported PNG/SVG contains title, count, tag summary, generated time, and filtered pins |
| P16-E2E-13 | Mobile 390x844 completes main path | Add -> candidates -> save -> detail map link -> filter -> export entry without overlapping panels |
| P16-E2E-14 | Scanlist baseline still passes | `npm run verify:scanlist` passes and scanlist remains a reference layer |

## P17 Required Browser Scenarios

| ID | Scenario | Evidence |
| --- | --- | --- |
| P17-E2E-01 | Homepage filter dock does not clip controls | 2048x768, 1440x900, 1280x820, 768x900, 390x844 screenshots and bounding-box assertions |
| P17-E2E-02 | Pending workbench opens from homepage | Pending count visible; workbench lists pending/high-risk places |
| P17-E2E-03 | Candidate confirmation resolves pending place | Confirmed place updates coordinates/status and list/detail/map counts |
| P17-E2E-04 | Manual pin move supports cancel and confirm | Cancel leaves coordinates unchanged; confirm persists new coordinates |
| P17-E2E-05 | Detail page tags are editable | Add/remove tags persist after refresh |
| P17-E2E-06 | Rating normalization is correct | Percent scores map to five-star display and raw score remains visible |
| P17-E2E-07 | Detail drawer fits compact desktop | 1280x900 long name/address detail has no horizontal scroll or clipped right edge |
| P17-E2E-08 | Mobile detail remains scrollable | 390x844 long detail scrolls internally; map does not move into blank area |
| P17-E2E-09 | Pin selected state is stable | Selected marker color changes, no flicker class remains after click/zoom |
| P17-E2E-10 | Scanlist/reference/personal pin states differ | Verified, pending, scanlist, reference and selected pins have distinguishable styles |
| P17-E2E-11 | Mobile main path completes | Pending -> detail -> edit tags -> move pin -> map link fallback -> share entry |
| P17-E2E-12 | Share poster preview matches filter | Preview/export count equals current filtered personal pins |
| P17-E2E-13 | Agent pending context is read-only | Agent can list pending contexts but cannot directly confirm coordinates |
| P17-E2E-14 | Real-data performance smoke | With scanlist, reference, personal and pending layers enabled, zoom/filter/detail remain usable |

## Manual Evidence

- Current map baseline verified with Leaflet rendering, AMap raster tiles, and local fallback behavior.
- AMap Web JS Provider is not part of accepted baseline until separately implemented and evidenced.
- Visual review confirms Scheme 4 style and no over-decoration.
- Import failure verified with malformed JSON.

## Final Report Requirements

The P17 final acceptance report or acceptance summary should be created under `docs/active/` and must include:

- Build output summary.
- Unit test output summary.
- Playwright output summary.
- Desktop, tablet, and mobile screenshot paths.
- AMap and Leaflet verification notes.
- Import/export round-trip result.
- Pending workbench, manual pin move, detail IA, filter dock, pin visual, share poster and performance evidence.
- Known issues and severity.
