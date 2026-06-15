# FoodMap Active Design Docs

This directory is the active documentation baseline for FoodMap. It keeps the V1.0 PRD as the product foundation, records the accepted implementation baseline, and now defines the P17 stage: experience trust hardening, pending-place confirmation workbench, detail-page information architecture, mobile main journey, filter/pin visual system, share-poster polish, and performance acceptance.

## Current Version

- Active baseline: V1.0 PRD plus accepted P1-P16 implementation scope.
- Current project state: runnable Vite React TypeScript frontend with IndexedDB persistence, Leaflet/AMap-tile map, share/import/export, Agent Bridge, mobile filter controls, editable tags, manual pin move, external map links, map-poster export, and 50 verified AMap Wuhan scanlist pins as a toggleable reference layer.
- Current-stage focus: P17 experience trust hardening, including pending-place confirmation workbench, safer coordinate correction, detail-page information architecture, mobile add/view/move/handoff journey, compact filter controls, unified pin visual states, share-poster polish, and performance acceptance under real data.
- Primary constraint: pure frontend first, no backend dependency for user records or share snapshots.
- Product direction: map-first personal food journal with a verified recommendation overlay, not a generic admin panel or public social product.

## Document Index

- [Product Requirements Document](./product-requirements-document.md)
- [Target Architecture](./target-architecture.md)
- [Development And Acceptance Plan](./development-and-acceptance-plan.md)
- [Milestone Roadmap](./milestone-roadmap.md)
- [Acceptance Gate](./acceptance-gate.md)
- [Current vs Target Gap](./current-vs-target-gap.md)
- [Drawio Gap Diagram](./current-vs-target-gap.drawio)
- [P16 Real Place Linking Implementation Contract](./p16-real-place-linking-implementation-contract.md)
- [POI Verification Mechanism](./poi-verification-mechanism-v1.md)
- [AMap Scanlist Refresh Report](./amap-scanlist-refresh-report.md)
- [Data Schema And Import/Export Contract](./data-schema-and-import-export-contract.md)
- [Repository And Domain API Contract](./repository-and-domain-api-contract.md)
- [Map Provider Contract](./map-provider-contract.md)
- [E2E Test And Evidence Matrix](./e2e-test-and-evidence-matrix.md)
- [Visual Acceptance Checklist](./visual-acceptance-checklist.md)
- [P16 Final Acceptance Report](./p16-final-acceptance-report.md)
- [P17 UX Trust Implementation Contract](./p17-ux-trust-implementation-contract.md)
- [P16 2026-06-09 Regression Plan And Audit](./p16-2026-06-09-regression-plan-and-audit.md)
- [P8-P14 Implementation Contract](./p8-p14-implementation-contract.md)

Historical phase reports, older release packs, dated scanlist reports, UX audit snapshots, and old screenshot evidence are archived under `docs/history`.

## Product Definition

FoodMap delivers two first-class experiences:

- Personal workspace: create, edit, filter, and manage food places, layers, photos, ratings, visit dates, tags, and notes.
- Verified Wuhan recommendation overlay: show AMap scanlist restaurants as independently styled pins only after POI verification, with ranking, score, evidence, image, and confidence metadata. The overlay stays optional and must not pollute the user's empty personal map.

The app also supports a local read-only share view and `.foodmap.json` import/export. P17 work must preserve local-first behavior while making real-place confirmation, detail viewing, pin movement, mobile handoff, filtering, and sharing feel trustworthy enough for daily use.

## Current-Stage Rules

- The map is always the primary surface.
- Recommendation pins are not personal records until the user saves them.
- A scanlist item may become a map pin only when `evaluateRecommendation` marks it mappable and the refresh/manual verification report has evidence.
- A refreshed POI that moved, conflicts, or loses confidence cannot overwrite the verified baseline automatically.
- Public image/street-view evidence must show source and match state; missing or mismatched evidence must render a fallback.
- Approximate coordinates must stay visibly labeled as approximate; the UI must not imply exactness.
- Mobile uses a compact header, bottom action bar, and mutually exclusive panels.
- Dialogs, status bars, side panels, and bottom bars must not persist over create/edit/share/import modal flows.
- Agent commands must preserve the same validation and POI admission rules as manual UI actions.
- Routine real-data acceptance must run `npm run verify:scanlist` before claiming the 50 verified pins are still valid.
- P16 place creation must never silently save an uncertain real-world POI; ambiguous results require a visible candidate list and user confirmation.
- Current location improves ranking when available, but rejecting location permission cannot block place creation.
- External map handoff must provide a safe fallback when app links fail or coordinates are missing.
- P17 must make pending-place confirmation visible and operable; uncertain coordinates cannot be hidden behind normal-looking details.
- Detail pages must prioritize status, editable tags, core actions, photos, notes, coordinate correction, and external map handoff in a predictable order.
- Mobile 390x844 and compact desktop widths must not show clipped controls, inaccessible detail panels, or persistent overlays over the main task.
- Pin visuals must distinguish verified personal, pending personal, selected, scanlist, and reference layers without flicker or misleading states.

## ChatGPT Audit Document Set

Use these documents for external PRD/architecture/acceptance audit:

1. `docs/active/product-requirements-document.md`
2. `docs/active/target-architecture.md`
3. `docs/active/development-and-acceptance-plan.md`
4. `docs/active/acceptance-gate.md`
5. `docs/active/milestone-roadmap.md`
6. `docs/active/current-vs-target-gap.md`
7. `docs/active/current-vs-target-gap.drawio`
8. `docs/active/p16-real-place-linking-implementation-contract.md`
9. `docs/active/poi-verification-mechanism-v1.md`
10. `docs/active/amap-scanlist-refresh-report.md`
11. `docs/active/data-schema-and-import-export-contract.md`
12. `docs/active/repository-and-domain-api-contract.md`
13. `docs/active/map-provider-contract.md`
14. `docs/active/e2e-test-and-evidence-matrix.md`
15. `docs/active/visual-acceptance-checklist.md`
16. `docs/active/p16-final-acceptance-report.md`
17. `docs/active/p16-2026-06-09-regression-plan-and-audit.md`
18. `docs/active/p8-p14-implementation-contract.md`
19. `docs/active/p17-ux-trust-implementation-contract.md`
