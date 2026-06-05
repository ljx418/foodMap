# FoodMap Milestone Roadmap

## M0: Current-Stage Documentation Alignment

Goal:

- Make active docs and drawio reflect the implemented app and remaining current-stage work.

Deliverables:

- Updated target architecture.
- Updated current-vs-target gap.
- Updated development and acceptance plan.
- Updated acceptance gates.
- Updated drawio diagram.
- Under-20 ChatGPT audit document list.

Completion Conditions:

- Docs no longer describe the project as having no source code, map, persistence, or tests.
- Recommendation, POI verification, Agent Bridge, UX modes, and adaptive pins are in scope.

## M1: V1.0 Personal Map Regression Closure

Goal:

- Preserve the original PRD experience while current-stage changes continue.

Deliverables:

- Stable place CRUD.
- Stable layers, filters, photos, share snapshots, and import/export.
- Desktop and mobile layout regression checks.

Completion Conditions:

- User can complete create, view, edit, delete, filter, photo, share, export, and import loops.
- No modal, side panel, status bar, or bottom bar blocks the active task.

## M2: Wuhan Recommendation And POI Quality

Goal:

- Keep AMap scanlist pins factually defensible.

Deliverables:

- 50-entry scanlist data.
- Manual verified pin overlay.
- Semantic duplicate and branch handling.
- Refresh report with mappable/pending/conflict counts.
- Visible exact/approximate coordinate labeling.

Completion Conditions:

- Map pin count equals verified mappable count.
- Unverified or conflicting candidates are not rendered as pins.
- Same-name branches and user-reported factual errors are covered by the verification mechanism.

## M3: Recommendation Detail And Evidence UX

Goal:

- Make scanlist exploration useful without overwhelming the right panel or mobile sheet.

Deliverables:

- Selected-place-first recommendation detail.
- Collapsible ranking list.
- Score, rank, confidence, coordinate accuracy, source, review summary, and image evidence.
- Image fallback state.

Completion Conditions:

- Selecting a marker shows a focused detail rather than the entire ranking by default.
- Evidence is inspectable and truthful.
- Desktop and mobile screenshots show readable detail layouts.

## M4: Input Experience Upgrade

Goal:

- Reduce friction when recording a personal place.

Deliverables:

- Required-first editor.
- Clear map-click confirmation.
- Unsaved-close protection.
- Better pending photo preview and save feedback.
- Field-level validation.

Completion Conditions:

- A minimal record can be saved quickly.
- Dirty forms cannot be lost silently.
- Photos are understandable before and after save.

## M5: Map Pin Readability And Density

Goal:

- Make markers readable across zoom levels and viewport sizes.

Deliverables:

- Ranked recommendation pin style.
- Green adaptive pin mode for zoomed/low-density secondary recommendations.
- Compact dot mode for crowded map views.
- Screenshot evidence across zoom levels.

Completion Conditions:

- Zooming in upgrades eligible dots into green pin-style markers.
- Crowded views remain readable.
- Marker modes update after pan, zoom, and resize.

## M6: Agent Bridge Acceptance

Goal:

- Make FoodMap callable by companion agents without creating a second unsafe data path.

Deliverables:

- Bridge smoke coverage for context, list, focus, filter, save, recommendation load/list/focus/save, snapshot, and export.
- Rejection path for unverified recommendation save.
- Event evidence for command/result/state changes.

Completion Conditions:

- Agent commands use the same validation as UI flows.
- Verified recommendation save works.
- Unverified recommendation save fails with a readable error.

## M7: Final Current-Stage Acceptance

Goal:

- Prove the current-stage product can support the PRD and target architecture.

Deliverables:

- Passing `npm run build`.
- Passing `npm test`.
- Passing `npx playwright test`.
- Desktop/mobile screenshots.
- POI and scanlist evidence.
- Agent Bridge evidence.
- Final acceptance report.

Completion Conditions:

- All blocker gates pass.
- Any remaining non-blocker is listed with severity, owner area, and follow-up.
- Drawio and active docs still match implementation.
