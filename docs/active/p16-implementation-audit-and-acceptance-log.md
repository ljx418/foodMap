# FoodMap P16 Implementation Audit And Acceptance Log

> Status note, 2026-06-11: this file is a historical phase log. Current acceptance evidence is maintained in `p16-final-acceptance-report.md`; older command counts inside this log should not be read as the current regression result.

## H0 Pre-Implementation Audit

Date: 2026-06-08

Status: `Go`.

### Scope

Continue P16 implementation from the active PRD, target architecture, acceptance gate, and P16 real place linking contract.

P16 must deliver:

1. Real place candidate model, provider aggregation, and editor candidate UI.
2. Browser location service, denial/failure fallback, and explainable ranking.
3. Agent structured candidate loop without automatic save.
4. External map handoff and copy fallback.
5. Map-like poster export driven by current filtered personal pins.
6. Total acceptance with PRD review, real-data scanlist regression, screenshots, and command evidence.

### Pre-Implementation Findings

| Area | Current State | Risk | Decision |
| --- | --- | --- | --- |
| Candidate model | `placeRecognition.ts` has basic local/Agent candidates but lacks `sourceLabel`, `coordinateAccuracy`, `distanceMeters`, provider aggregation, and blockers | Medium false-acceptance risk | Implement P16 candidate contract before UI expansion |
| Editor flow | `PlaceEditorModal` shows candidate cards and only saves after user action | Low | Extend fields and evidence display |
| Map click | PRD, architecture, and map provider contract now agree on direct editor open | Low | Keep direct editor flow |
| Agent Bridge | Has `recognizePlaceCandidates`; lacks `submitPlaceCandidates` and `getPlaceCandidateContext` | Medium | Implement in P16-4 after shared candidate provider |
| Location | No dedicated `UserLocationService` | Medium | Implement in P16-3 |
| External map links | Detail drawer has no map app/web handoff | Medium | Implement in P16-5 |
| Poster export | Uses filtered `posterPlaces` and generates PNG, but needs stronger P16 count/time/consistency evidence | Low to Medium | Harden in P16-6 |
| Real data | AMap scanlist baseline and verification command exist | Low | Run `npm run verify:scanlist` in subphase and final acceptance |

### Audit Opinion

No fatal or major specification deviation blocks coding. The stage may enter P16-2 implementation. The only high-risk boundary remains external real-time POI search: baseline acceptance must not claim real-time external provider search unless a real provider is configured and evidenced.

## P16-2 Candidate Recall Plan

### Development Tasks

1. Add `src/domain/placeSearch.ts` to normalize and aggregate candidates from text, history, scanlist, Agent, optional map provider, and manual sources.
2. Upgrade `PlaceCandidate` to include P16-required fields.
3. Add deterministic Wuhan same-name candidate fixtures for baseline acceptance without pretending to provide real-time provider search.
4. Update `PlaceEditorModal` candidate cards to show source, address, confidence, coordinate accuracy, distance when available, and reasons.
5. Keep save behavior unchanged: selected candidates only fill the draft; they do not create personal pins until Save.

### Acceptance Criteria

- Same-name Wuhan query returns multiple candidates with distinct addresses/sources.
- Candidates include `sourceLabel`, `coordinateAccuracy`, `confidence`, and `reasons`.
- Candidate selection changes draft fields but does not create a saved place.
- Unit tests cover normalization, blocker filtering, same-name multi-candidates, and source ordering.
- PRD review confirms P16 user journey steps 3-7 remain supported.

### Audit Gate

Proceed only if candidate output is explainable and no candidate is silently saved.

## P16-2 Candidate Recall Acceptance

Status: `Pass`.

### Implemented

- Added `src/domain/placeSearch.ts` with provider aggregation for history, scanlist, text, Agent, optional map provider, and blocker filtering.
- Upgraded `PlaceCandidate` fields in `src/domain/placeRecognition.ts` to include `sourceLabel`, `district`, `coordinateAccuracy`, `distanceMeters`, `rawInputRef`, and `blockers`.
- Updated `PlaceEditorModal` to show source, coordinate accuracy, confidence, distance, reasons, and blocked candidate summaries.
- Added unit coverage for same-name multi-candidate fixtures, real scanlist-backed candidates, and blocked incomplete Agent candidates.

### Evidence

- `npm test`: pass, 21 tests.
- `npm run build`: pass.
- `npx playwright test -g "place editor recognizes"`: pass on desktop and mobile, 2 tests.
- `npm run verify:scanlist`: pass, 50 entries, 50 manual verification overlays, guardrails include 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆.

### PRD Review

P16 PRD steps 3-7 are supported for this subphase: user input can produce multiple explainable candidates; selecting a candidate fills the draft; saving still requires the existing explicit Save action. No candidate is silently written to the personal map.

### Audit Opinion

No fatal or major deviation. P16-3 may start.

## P16-3 Location Ranking Plan

### Development Tasks

1. Add `src/domain/userLocation.ts` to normalize browser geolocation states: `idle`, `granted`, `denied`, `unavailable`, and `timeout`.
2. Add a candidate-ranking input path that accepts granted location and denial/failure fallback state.
3. Update editor recognition to request or use location without blocking place creation.
4. Add unit tests and Playwright geolocation mock coverage for granted and denied flows.

### Acceptance Criteria

- Granted geolocation can affect ranking and candidate reasons.
- Denied/failed geolocation does not block candidate listing, candidate selection, or saving.
- UI communicates fallback without alarming copy.
- PRD review confirms P16 user journey step 6 remains supported.

### Audit Gate

Proceed only if denial and failure states continue the flow without hidden errors.

## P16-3 Location Ranking Acceptance

Status: `Pass`.

### Implemented

- Added `src/domain/userLocation.ts` with `idle`, `granted`, `denied`, `unavailable`, and `timeout` snapshots.
- Added explicit "使用当前位置排序" editor action to avoid surprise permission prompts during normal recognition.
- Candidate ranking now uses granted user location and shows location-based reasons.
- Denied/unavailable location states render fallback copy and keep candidate recognition usable.

### Evidence

- `npm test`: pass, 22 tests.
- `npm run build`: pass.
- `npx playwright test -g "current location|geolocation is denied"`: pass on desktop and mobile, 4 tests.

### PRD Review

P16 PRD step 6 is supported: when the user grants location, ranking can consider current location; when location is denied, the flow continues with clicked point/history/source confidence fallback.

### Audit Opinion

No fatal or major deviation. P16-4 may start.

## P16-4 Agent Candidate Loop Plan

### Development Tasks

1. Add `submitPlaceCandidates` and `getPlaceCandidateContext` to `FoodMapAgentBridge`.
2. Reuse `searchPlaceCandidates` so Agent candidates enter the same ranking and blocker path as manual/editor candidates.
3. Ensure Agent candidate submission returns ranked candidates and blocked candidates, but never saves a place.
4. Add E2E coverage for valid and invalid Agent candidates.

### Acceptance Criteria

- Agent can request safe candidate context.
- Agent can submit structured candidates and receive ranked selectable candidates.
- Invalid Agent candidates are blocked with structured output.
- Personal place count is unchanged after candidate submission.

### Audit Gate

Proceed only if Agent cannot bypass user confirmation or write directly through the candidate action.

## P16-4 Agent Candidate Loop Acceptance

Status: `Pass`.

### Implemented

- `FoodMapAgentBridge` exposes `recognizePlaceCandidates`, `submitPlaceCandidates`, and `getPlaceCandidateContext`.
- Agent-submitted candidates reuse `searchPlaceCandidates`, including shared ranking, blocker checks, and source labeling.
- Invalid Agent candidates are returned in `blockedCandidates`; the candidate submission action does not create or save personal places.
- Workspace bridge context includes clicked point and scanlist visibility for safe candidate context.

### Evidence

- `npm test`: pass, 22 tests.
- `npm run build`: pass.
- `npx playwright test -g "structured errors"`: pass on desktop and mobile, 2 tests.

### PRD Review

P16 Agent-adjacent journey is supported without over-claiming automation: an Agent can help recognize and submit structured candidates, but the user must still select and save through the same editor/domain path.

### Audit Opinion

No fatal or major deviation. P16-5 may start.

## P16-5 External Map Handoff Plan

### Development Tasks

1. Confirm `ExternalMapLinkBuilder` returns primary navigation, secondary map links, copy fallback, and disabled reason when coordinates are missing.
2. Confirm saved personal place details expose external map actions only after a place exists.
3. Confirm scanlist recommendation details expose map actions only for verified/mappable recommendation details.
4. Run desktop and mobile E2E for personal detail and scanlist detail links.

### Acceptance Criteria

- Saved place detail includes a clickable `amap.com` map handoff when coordinates exist.
- Scanlist detail includes a clickable `amap.com` map handoff for verified recommendations.
- Missing coordinates show copy fallback and do not imply exact navigation.
- PRD review confirms P16 mobile real-place handoff is supported.

### Audit Gate

Proceed only if missing coordinates cannot show misleading navigation.

## P16-5 External Map Handoff Acceptance

Status: `Pass`.

### Implemented

- `src/domain/externalMapLinks.ts` builds AMap web, AMap app URI, Apple Maps, Geo URI, copy fallback, and disabled state.
- `PlaceDetailDrawer` renders external map actions for saved personal places.
- `RecommendationPanel` renders external map actions for selected scanlist recommendations.
- Unit coverage checks `amap.com` links, secondary links, and missing-coordinate disabled fallback.

### Evidence

- `npm test`: pass, 22 tests.
- `npm run build`: pass.
- `npx playwright test -g "agent bridge can save|loads scanlist"`: pass on desktop and mobile, 4 tests.

### PRD Review

P16 external map handoff is supported for both saved personal places and the verified scanlist reference layer. The implementation does not expose misleading navigation when coordinates are unavailable.

### Audit Opinion

No fatal or major deviation. P16-6 may start.

## P16-6 Poster Export Plan

### Development Tasks

1. Confirm export reads the same `visiblePlaces` collection as the filtered map/list.
2. Harden `mapPoster.ts` so SVG/PNG poster includes title, current filtered count, tags, and generated time.
3. Keep poster self-contained and independent from remote map tiles.
4. Run unit, build, and desktop/mobile export-entry E2E.

### Acceptance Criteria

- Poster export is blocked when current filtered personal pins are empty.
- Poster SVG contains title, filtered personal place count, tag summary, and generated time.
- Poster SVG contains no remote image/tile dependency.
- PRD review confirms export supports the propagation-oriented single-image journey.

### Audit Gate

Proceed only if poster content is derived from current filtered personal pins and does not export unrelated scanlist-only data.

## P16-6 Poster Export Acceptance

Status: `Pass`.

### Implemented

- `ImportExportDialog` receives `posterPlaces={visiblePlaces}`, so poster export uses the current filtered personal-pin set.
- `mapPoster.ts` now includes explicit generated time in the poster footer.
- Unit coverage now asserts title, filtered count, tag summary, generated time, and absence of remote tiles.

### Evidence

- `npm test`: pass, 22 tests.
- `npm run build`: pass.
- `npx playwright test -g "place editor recognizes intro text and export dialog exposes map poster"`: pass on desktop and mobile, 2 tests.

### PRD Review

P16 propagation journey is supported at this subphase: after creating a filtered personal map, the user can open export and generate a map-like PNG backed by the same visible personal places, not by unrelated scanlist data.

### Audit Opinion

No fatal or major deviation. P16-7 total acceptance may start.

## P16-7 Total Acceptance Plan

### Development Tasks

1. Run full unit, production build, full Playwright E2E, and scanlist verification.
2. Review active PRD and P16 implementation contract against final implementation.
3. Record total acceptance evidence and remaining risk.

### Acceptance Criteria

- `npm test`, `npm run build`, `npx playwright test`, and `npm run verify:scanlist` pass.
- PRD user journey remains supported: empty map, click/add, candidate confirmation, manual tags, filters, scanlist toggle, external map handoff, and poster export.
- Real scanlist data remains 50 verified/mappable entries with guardrail shops covered.
- No known fatal or major false-acceptance risk remains.

### Audit Gate

Stop for human confirmation if full E2E fails in a way that suggests the main mobile journey is blocked or if scanlist verification regresses.

## P16-7 Total Acceptance

Status: `Pass`.

Date: 2026-06-08

### Evidence

- `npm test`: pass, 22 tests.
- `npm run build`: pass, TypeScript project build and Vite production build completed.
- `npx playwright test`: pass, 24 tests across desktop and mobile.
- `npm run verify:scanlist`: pass, 50 entries, 50 manual verification overlays, 38 approximate-but-admitted pins, guardrails include 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆.

### PRD Specification Review

| P16 PRD Requirement | Implementation Evidence | Result |
| --- | --- | --- |
| Empty personal map with optional scanlist layer | Workspace defaults to personal map; scanlist toggle remains explicit and verified by E2E | Pass |
| Map click/add opens editor | Direct map click and bottom add open `PlaceEditorModal`; E2E covers real Wuhan coordinates | Pass |
| Candidate recall and confirmation | `searchPlaceCandidates` aggregates history, scanlist, text, Agent, optional map provider; editor shows explainable selectable candidates | Pass |
| Location-aware ranking with fallback | `UserLocationService` covers granted, denied, unavailable, timeout; E2E covers granted and denied flows | Pass |
| Agent candidate loop without direct save | Agent actions return ranked/blocked candidates and do not change personal-place count | Pass |
| Manual tags and filtering | Existing structured tag and filter tests remain green; full E2E covers mobile/desktop filter surfaces | Pass |
| External map handoff | Saved personal details and verified recommendation details expose AMap map links plus copy fallback | Pass |
| Poster export | Poster export uses filtered personal pins and includes title, count, tags, generated time, and self-contained map-like SVG/PNG path | Pass |
| Real scanlist data | `verify:scanlist` and domain tests keep all 50 verified/mappable entries and guardrail shops | Pass |

### Final Audit Opinion

P16 is accepted for the pure-frontend baseline described in the active PRD and P16 implementation contract. No fatal or major specification deviation remains after automated unit, build, E2E, PRD review, and real scanlist verification.

### Remaining Boundaries

- This acceptance does not claim stable external real-time POI search. `map-provider` remains an optional future provider unless configured and separately evidenced.
- Ordinary webpage links are treated as input clues or Agent-assisted structured candidates; the product does not include arbitrary webpage crawling.
- Navigation success in every phone map app is not guaranteed; acceptance is based on generated AMap/Apple/Geo/web links plus copy fallback.
