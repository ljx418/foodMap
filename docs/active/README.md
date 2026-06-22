# FoodMap Active Design Docs

This directory is the active documentation baseline for FoodMap. It keeps the V1.0 PRD as the product foundation, records the accepted implementation baseline, and now defines the P18 stage: candidate search, trustworthy calibration, provider fallback, manual pin-move audit preview, mobile detail simplification, filter-state explanation, share-poster composer, personal data health, and large-dataset performance acceptance.

## Current Version

- Active baseline: V1.0 PRD plus accepted P1-P17 implementation scope.
- Current project state: runnable Vite React TypeScript frontend with IndexedDB persistence, Leaflet/AMap-tile map, share/import/export, Agent Bridge, mobile filter controls, editable tags, manual pin move, external map links, map-poster export, pending-place workbench, P17 detail IA, and 50 verified AMap Wuhan scanlist pins as a toggleable reference layer.
- Current-stage focus: P18 candidate search and trustworthy calibration, organized into six workstreams: coordinate/candidate calibration, detail and mobile path, homepage filter/layer explanation, share-poster communication, data health/performance, and Agent/acceptance governance.
- Current-stage planning status: P18 planning and implementation baseline is ready for review. This does not mean P18 implementation or acceptance is complete.
- Primary constraint: pure frontend first, no backend dependency for user records or share snapshots.
- Product direction: map-first personal food journal with a verified recommendation overlay, not a generic admin panel or public social product.

## Current-Stage Boundary

Allowed claims:

- P18 planning baseline is ready for review.
- P18 implementation contracts are sufficient to start P18-2 after document review.
- P16/P17 accepted capabilities remain the regression baseline.

Forbidden claims:

- P18 introduced backend POI calibration, account sync, cloud sharing, or automatic correction of every wrong coordinate.
- All uncertain real-world POIs can be finalized without user confirmation.
- External realtime POI search is guaranteed without a configured provider or Agent-submitted evidence.

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
- [P17-2 Preimplementation Audit](./p17-2-preimplementation-audit.md)
- [P17-2 Acceptance Report](./p17-2-acceptance-report.md)
- [P17-3 Development And Acceptance Plan](./p17-3-development-and-acceptance-plan.md)
- [P17-3 Acceptance Report](./p17-3-acceptance-report.md)
- [P17-4 Development And Acceptance Plan](./p17-4-development-and-acceptance-plan.md)
- [P17-4 Acceptance Report](./p17-4-acceptance-report.md)
- [P17-5 Development And Acceptance Plan](./p17-5-development-and-acceptance-plan.md)
- [P17-5 Acceptance Report](./p17-5-acceptance-report.md)
- [P17-6 Development And Acceptance Plan](./p17-6-development-and-acceptance-plan.md)
- [P17-6 Acceptance Report](./p17-6-acceptance-report.md)
- [P17-7 Final Acceptance Report](./p17-7-final-acceptance-report.md)
- [P18 Candidate Search And Trust Calibration Contract](./p18-candidate-search-trust-contract.md)

Historical phase reports, older release packs, dated scanlist reports, UX audit snapshots, and old screenshot evidence are archived under `docs/history`.

## Product Definition

FoodMap delivers two first-class experiences:

- Personal workspace: create, edit, filter, and manage food places, layers, photos, ratings, visit dates, tags, and notes.
- Verified Wuhan recommendation overlay: show AMap scanlist restaurants as independently styled pins only after POI verification, with ranking, score, evidence, image, and confidence metadata. The overlay stays optional and must not pollute the user's empty personal map.

The app also supports a local read-only share view and `.foodmap.json` import/export. P18 work must preserve the accepted P16/P17 local-first baseline while making candidate search, coordinate calibration, mobile detail viewing, filtering, and sharing more trustworthy for daily use.

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
- P18 candidate search must provide fallback when provider keys are absent or external search fails.
- Candidate cards must expose source, confidence, coordinate accuracy, risk reasons, and evidence where available.
- Candidate selection cannot silently modify coordinates; coordinate changes require explicit user confirmation.
- Manual pin move must show old/new coordinate meaning before saving.
- Agent assistance cannot directly finalize coordinates, delete pending records, or hide uncertainty.
- P18 acceptance must cover all six workstreams; candidate search passing alone cannot certify the stage.

## ChatGPT Audit Document Set

Use these documents for external PRD/architecture/acceptance audit:

1. `docs/active/product-requirements-document.md`
2. `docs/active/target-architecture.md`
3. `docs/active/development-and-acceptance-plan.md`
4. `docs/active/acceptance-gate.md`
5. `docs/active/milestone-roadmap.md`
6. `docs/active/current-vs-target-gap.md`
7. `docs/active/current-vs-target-gap.drawio`
8. `docs/active/p18-candidate-search-trust-contract.md`
9. `docs/active/p17-ux-trust-implementation-contract.md`
10. `docs/active/p16-real-place-linking-implementation-contract.md`
11. `docs/active/data-schema-and-import-export-contract.md`
12. `docs/active/repository-and-domain-api-contract.md`
13. `docs/active/map-provider-contract.md`
14. `docs/active/e2e-test-and-evidence-matrix.md`
15. `docs/active/visual-acceptance-checklist.md`
16. `docs/active/poi-verification-mechanism-v1.md`
17. `docs/active/amap-scanlist-refresh-report.md`
18. `docs/active/p17-7-final-acceptance-report.md`
