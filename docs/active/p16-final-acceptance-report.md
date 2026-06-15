# FoodMap P16 Final Acceptance Report

Date: 2026-06-11

Status: `Pass`.

## 1. Scope

This report is the dedicated final acceptance artifact required by the active P16 acceptance gate and milestone roadmap. It covers the P16 pure-frontend baseline:

- empty personal map with optional verified Wuhan scanlist reference layer
- explicit import of the user's personal Wuhan favorites list without polluting clean profile state
- direct map click/add place editor
- real-place multi-candidate confirmation with explainable source, confidence, coordinate accuracy, and reasons
- browser location ranking with denial/failure fallback
- Agent structured candidate ingestion without automatic save
- external map handoff and copy fallback
- tag/filter-driven personal map and poster export
- real scanlist data regression

## 2. Command Evidence

| Command | Result |
| --- | --- |
| `npm run build` | Pass. TypeScript project build and Vite production build completed. |
| `npm test` | Pass. Vitest completed 25 tests. |
| `npm run verify:scanlist` | Pass. 50 entries, 50 manual verification overlays, 38 approximate-but-admitted pins, guardrails include 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆. |
| `npx playwright test` | Pass. 36 Playwright tests passed across desktop and mobile; 12 project-scoped tests were intentionally skipped outside their target viewport/project. |

## 3. Visual Evidence

P16 screenshot evidence regenerated on 2026-06-11:

| View | Path |
| --- | --- |
| Desktop workspace | `docs/active/evidence/p16/desktop-1440x900-workspace.png` |
| Desktop candidate editor | `docs/active/evidence/p16/desktop-1440x900-place-editor-candidates.png` |
| Desktop detail map link | `docs/active/evidence/p16/desktop-1440x900-place-detail-map-link.png` |
| Desktop poster export | `docs/active/evidence/p16/desktop-1440x900-poster-export.png` |
| Mobile workspace | `docs/active/evidence/p16/mobile-390x844-workspace.png` |
| Mobile candidate editor | `docs/active/evidence/p16/mobile-390x844-place-editor-candidates.png` |
| Mobile detail map link | `docs/active/evidence/p16/mobile-390x844-place-detail-map-link.png` |
| Mobile poster export | `docs/active/evidence/p16/mobile-390x844-poster-export.png` |

Spot check: desktop candidate evidence shows readable candidate cards with source, confidence, distance, and reasons; mobile poster-export evidence shows the import/export bottom sheet without bottom-bar overlap.

## 4. PRD Acceptance Matrix

| P16 PRD Requirement | Acceptance Evidence | Result |
| --- | --- | --- |
| Empty personal map and optional scanlist layer | Playwright clean-profile scenario confirms 0 personal pins; scanlist toggle remains available | Pass |
| Explicit personal favorites import | Playwright import scenario restores 32 user-supplied Wuhan pins with a split of 1 exact pin and 31 calibration pins | Pass |
| Map click/add opens editor | Playwright direct map-click and add scenarios | Pass |
| Edit/delete/photo workflow | Playwright creates a photo-backed place, verifies edit discard guard, saves edit, then deletes | Pass |
| Multi-candidate confirmation | Candidate editor E2E and visual screenshot | Pass |
| Location ranking and denial fallback | Geolocation grant/deny Playwright scenarios | Pass |
| Agent candidate loop without direct save | Agent Bridge Playwright scenario | Pass |
| External map handoff | Saved detail map-link Playwright scenario and screenshot | Pass |
| Import/export handoff | Playwright imports `.foodmap.json` and opens the imported read-only share snapshot | Pass |
| Tag/filter and poster export | Domain tests verify all filtered pins are rendered; Playwright verifies PNG download | Pass |
| Scanlist real-data baseline | `npm run verify:scanlist` | Pass |

## 5. Known Boundaries

- P16 does not claim a stable external real-time POI search API. `map-provider` remains optional until configured and separately evidenced.
- The accepted map baseline is Leaflet rendering with AMap raster tiles and local fallback. AMap Web JS Provider is not accepted as complete in this report.
- P16 does not implement arbitrary webpage crawling. Links are input clues or Agent-assisted structured candidate sources.
- Mobile map app launch cannot be guaranteed across all installed apps; acceptance is based on generated AMap/Apple/Geo/Web links and copy fallback.

## 6. Final Decision

P16 is accepted for the documented pure-frontend baseline. The remaining boundaries above are explicit non-claims, not blockers for the current stage.
