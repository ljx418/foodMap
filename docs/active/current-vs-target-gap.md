# FoodMap Current vs Target Gap

## Assessment

The current documentation can support the original V1.0 personal food journal scope, but it cannot fully guide the current stage unless it also covers the implemented recommendation layer, POI verification pipeline, street-view image evidence, adaptive pin behavior, mobile UI state governance, and Agent Bridge. The active docs have now been updated to make those areas part of the formal architecture and acceptance baseline.

## Current State

The project now has:

- Vite + React + TypeScript app with hash routes.
- Personal workspace at `#/map` and local read-only share route.
- IndexedDB persistence for places, layers, photos, snapshots, and metadata.
- `.foodmap.json` export/import.
- Leaflet fallback map centered on Wuhan, with schematic offline fallback when map tiles fail.
- Map click create confirmation, place editor modal, detail/list panels, filters, and responsive mobile panels.
- AMap Wuhan scanlist recommendation layer with 50 loaded entries.
- Manual verified pin overlay and verification rules under `src/recommendations`.
- Recommendation details with score, review summary, verification status, and image evidence.
- Adaptive recommendation markers that switch from dots to green pin style based on zoom and visible density.
- `window.FoodMapAgentBridge` with commands for context, places, filters, snapshots, recommendations, and saving verified recommendations.
- Vitest and Playwright coverage that currently exercises desktop/mobile workspace and scanlist behavior.

## Target State

The target current-stage product is a pure frontend, local-first Wuhan food map that satisfies the V1.0 PRD and extends it with verified recommendation exploration:

- The personal food journal flow remains complete: create, edit, delete, filter, photo thumbnail, local share, export, and import.
- The Wuhan scanlist overlay displays 50 verified map pins and never renders unverified or conflicting candidates as pins.
- Each recommendation detail shows ranking, score, confidence, evidence, coordinate accuracy, and street-view/image evidence where available.
- Mobile and desktop controls are mutually exclusive enough that panels, bars, and modals do not fight for the same screen area.
- The Agent Bridge can be used by companion agents without bypassing domain validation, data safety, or POI verification rules.
- Documentation, drawio, acceptance gates, and evidence reports describe the same architecture.

## Gap Matrix

| Area | Current | Target | Remaining Work | Evidence |
| --- | --- | --- | --- | --- |
| PRD Scope | V1.0 PRD is stable | PRD plus current-stage recommendation and agent scope | Keep PRD as baseline and document extensions in architecture/gates | Active docs |
| App Foundation | Implemented | Stable pure frontend app | Keep build/test harness passing | `npm run build`, `npm test` |
| Personal Records | Implemented | Full local-first CRUD with photos and filters | Continue regression coverage as UX changes | Unit and Playwright tests |
| Share/Import/Export | Implemented | Read-only local share and safe file exchange | Verify clean-profile round trip after each change | E2E matrix |
| Map Provider | Leaflet fallback implemented; AMap path documented | Wuhan map remains usable without key and with tile failure fallback | Add provider failure evidence to final report | Map provider contract |
| Recommendation Layer | 50 scanlist entries visible and mappable | Verified-only map pins with clear approximate/exact labeling | Maintain refresh report and block low-confidence pins | Scanlist report |
| POI Verification | Semantic normalization and manual overlay exist | Every future recommendation must pass multi-source or manual evidence gate | Add refresh-time conflict summary and duplicate groups to report | `poi-verification-mechanism-v1.md` |
| Images | 50 image evidence entries reported | Detail page consistently shows verified image/street-view content | Keep image alt/name check in refresh pipeline | Refresh report |
| Adaptive Pins | Implemented in Leaflet provider | Pin readability scales with zoom and screen density | Tune thresholds with screenshot evidence | Playwright screenshots |
| UX State | Improved mobile/header/modal behavior | One primary task surface at a time | Add explicit modal/panel mutual-exclusion checks | UX audit and E2E |
| Agent Bridge | Implemented as browser bridge | Companion agents can query, focus, filter, save verified recommendations, export snapshots | Add bridge contract and smoke tests to acceptance | V1.1 report and E2E |
| Documentation | Previously stale for current stage | Active docs and drawio match implemented architecture | Keep under-20 audit set current | This document and drawio |

## Development Path

1. Lock current documentation and drawio to the current-stage baseline.
2. Harden POI verification reporting so every future scanlist item records duplicate group, source groups, coordinate trust, and admission decision.
3. Improve recommendation detail UX with clearer evidence blocks and image fallback states.
4. Improve personal input UX with faster required-first create flow, clearer unsaved states, and better photo preview.
5. Improve viewing UX with list/detail/map focus coordination on desktop and mobile.
6. Add Agent Bridge acceptance tests for read, focus, filter, save verified recommendation, reject unverified recommendation, snapshot, and export.
7. Run full build/unit/e2e/visual acceptance and update final evidence.

## Risks And Controls

- POI factual error: no candidate becomes a pin without verification metadata and visible accuracy label.
- Same-name branch confusion: semantic duplicate grouping must preserve branch, district, road, and POI ID.
- Public page instability: refresh script must report source URLs, hidden conflicts, and pending items instead of fabricating entries.
- Mobile clutter regression: modal and panel visibility must be governed by a single UI mode.
- Agent misuse: Agent Bridge commands must use the same validators and recommendation admission rules as the UI.
