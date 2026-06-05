# FoodMap Development And Acceptance Plan

## Summary

The original V1.0 work delivered a local-first personal food journal map. The current stage must preserve that PRD experience while finishing the verified Wuhan scanlist, POI quality, recommendation detail, adaptive map pins, mobile/desktop interaction cleanup, and Agent Bridge readiness.

This plan is the current implementation and acceptance baseline. A phase exits only when implementation, tests, and evidence are present.

## Development And Acceptance Outline

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P0 | Align active docs, drawio, target architecture, gap, roadmap, and gates to current-stage reality | Updated docs and drawio parse/open result | Docs no longer claim missing implemented features and audit set stays under 20 files |
| P1 | Stabilize personal workspace regression baseline | Build/unit/e2e pass; manual create/edit/filter/photo/share checks | V1.0 PRD core loops still work after recommendation/UX changes |
| P2 | Harden POI verification and scanlist refresh | Refresh report with 50 entries, duplicate groups, source groups, coordinate trust, hidden conflicts | Only verified/mappable items render as pins; all future items require verification |
| P3 | Improve recommendation viewing experience | Desktop/mobile screenshots showing selected detail, image evidence, collapsed list, clear status | User can inspect one place without seeing a noisy full ranking list |
| P4 | Improve input experience | Required-first editor, photo preview, unsaved-close handling, map-click confirmation evidence | User can create or save a place quickly without accidental data loss |
| P5 | Improve map pin readability | Screenshot and Playwright evidence for zoom/density marker thresholds | Crowded views stay readable and zoomed views show green pin-style markers |
| P6 | Agent Bridge readiness | Browser smoke tests for bridge commands and rejection of unverified recommendation save | Companion agents can call the app without bypassing validation or POI gates |
| P7 | Final acceptance closure | `npm run build`, `npm test`, `npx playwright test`, screenshots, final report | All blocker gates pass or have documented non-blocking waiver |

## P0: Documentation Baseline

Implementation:

- Update `target-architecture.md` to include recommendations, POI verification, images, adaptive pins, UX modes, and Agent Bridge.
- Update `current-vs-target-gap.md` to reflect the implemented app, not the pre-code baseline.
- Update `development-and-acceptance-plan.md`, `milestone-roadmap.md`, `acceptance-gate.md`, and `README.md`.
- Update `current-vs-target-gap.drawio` so the diagram includes current architecture, target architecture, remaining plan, milestones, gates, and exit conditions.

Acceptance:

- Drawio opens in diagrams.net.
- Active docs describe the same current state and target state.
- Audit document list remains below 20 files.

## P1: Personal Workspace Regression Baseline

Implementation:

- Keep personal place CRUD, layers, filters, photos, local share, and import/export stable.
- Ensure modal flows hide persistent bars that do not belong above modal content.
- Keep desktop side panels collapsed by default and mobile panels mutually exclusive.

Acceptance:

- User can create from map click and save required fields.
- User can edit, delete, filter, and clear filters.
- User can upload photos and see thumbnails after reload.
- User can generate a read-only share snapshot and import/export `.foodmap.json`.
- Desktop 1440x900 and mobile 390x844 show no incoherent overlap.

## P2: POI Verification And Scanlist Refresh

Implementation:

- Keep `scripts/refresh_amap_scanlist.mjs` as the refresh entrypoint.
- Persist generated recommendation data in `src/recommendations/amapWuhanScanlist.generated.ts`.
- Maintain manual overlay in `src/recommendations/manualVerifiedPins.ts`.
- Extend refresh reporting with duplicate group, source group, coordinate trust, and admission decision when new data is added.
- Treat public page ranking, POI page, open web, and manual overlay as separate evidence groups.

Acceptance:

- At least 50 scanlist entries are present.
- Mappable count equals the number of pins rendered on the map.
- Unverified, single-source, low-confidence, or conflicting candidates do not render as pins.
- Every recommendation detail shows verification status and coordinate accuracy.
- Fact-risk examples such as same-name branch confusion are covered by semantic duplicate logic.

## P3: Recommendation Viewing Experience

Implementation:

- Default right/mobile recommendation detail to the selected item, not the full list.
- Keep the list collapsed behind an explicit toggle after selection.
- Show ranking, score, district/address, confidence, exact/approximate status, review summary, source, and image/street-view evidence.
- Provide graceful image fallback when evidence is absent or fails to load.

Acceptance:

- Selecting a recommendation marker opens a single-place detail.
- The user can expand/collapse the ranking list deliberately.
- Detail image/evidence appears for the 50 verified entries or shows a truthful fallback.
- Mobile bottom sheet remains readable and does not cover navigation controls.

## P4: Input Experience

Implementation:

- Keep editor required-first: name, layer, city/address, rating, visit date before secondary metadata.
- Keep coordinates in a lower-priority section unless the user clicked a map point.
- Preserve unsaved-close confirmation.
- Improve pending photo preview and save feedback.
- Ensure search wording reflects local search unless provider search is actually available.

Acceptance:

- New users can complete a minimal place save with only required fields.
- Closing a dirty editor asks for confirmation.
- Uploaded photo names/previews are visible before save and thumbnails after save.
- Validation messages identify the missing field.

## P5: Map Pin Readability

Implementation:

- Keep personal pins and recommendation pins visually distinct.
- Top-ranked recommendations use ranked pin styling.
- Lower-ranked recommendations become green pin-style markers when zoom and visible-density thresholds allow.
- Crowded views can use compact dots to protect map readability.

Acceptance:

- Screenshot evidence at low and high zoom shows the marker mode transition.
- Marker labels or rank indicators remain legible.
- Map panning/zooming does not leave stale marker modes.

## P6: Agent Bridge Readiness

Implementation:

- Add or maintain bridge commands for context, list, get, draft, save, update, delete, filter, focus, snapshot, export, load recommendations, list recommendations, focus recommendation, and save recommendation as place.
- Route all save/update actions through domain validation.
- Route recommendation saves through `evaluateRecommendation`.
- Emit command/result/state events for companion agents.

Acceptance:

- Agent can list places and recommendations.
- Agent can focus a place and a recommendation.
- Agent can save a valid manual place.
- Agent can save a verified recommendation as a personal place.
- Agent cannot save an unverified recommendation as a personal place.
- Agent can create/export a snapshot.

## P7: Final Acceptance

Required commands:

```bash
npm run build
npm test
npx playwright test
```

Required evidence:

- Command summaries.
- Desktop and mobile screenshots.
- Recommendation marker density screenshots.
- Scanlist refresh report.
- POI verification report.
- Agent Bridge smoke evidence.
- Import/export round-trip evidence.
- Final acceptance report.

Final exit condition:

- The V1.0 PRD experience remains intact.
- Current-stage recommendation and agent requirements pass.
- No known POI candidate with unresolved conflict appears as a map pin.
- Drawio and active docs still match implementation.
