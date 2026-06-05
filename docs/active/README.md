# FoodMap Active Design Docs

This directory is the active documentation baseline for the current FoodMap stage. It keeps the V1.0 PRD as the product foundation, and adds the implemented V1.1/V1.2 scope: Agent Bridge, Wuhan real-map experience, AMap scanlist recommendation layer, POI verification, street-view image evidence, adaptive pins, and mobile interaction cleanup.

## Current Version

- Active baseline: V1.0 PRD plus current-stage implementation scope.
- Current project state: runnable Vite React TypeScript frontend with IndexedDB persistence, Leaflet fallback map, share/import/export, Agent Bridge, and AMap Wuhan scanlist pins.
- Current-stage focus: improve input/viewing UX, maintain verified Wuhan POI quality, and prepare the app to be called by companion agents.
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
- [POI Verification Mechanism](./poi-verification-mechanism-v1.md)
- [AMap Scanlist Refresh Report](./amap-scanlist-refresh-report.md)
- [UX Audit](./ux-audit-2026-06-04.md)
- [V1.1 Implementation Report](./v1.1-implementation-report.md)
- [V1.2 Implementation Report](./v1.2-implementation-report.md)
- [Data Schema And Import/Export Contract](./data-schema-and-import-export-contract.md)
- [Repository And Domain API Contract](./repository-and-domain-api-contract.md)
- [Map Provider Contract](./map-provider-contract.md)
- [E2E Test And Evidence Matrix](./e2e-test-and-evidence-matrix.md)
- [Visual Acceptance Checklist](./visual-acceptance-checklist.md)

## Product Definition

FoodMap delivers two first-class experiences:

- Personal workspace: create, edit, filter, and manage food places, layers, photos, ratings, visit dates, tags, and notes.
- Verified Wuhan recommendation overlay: show AMap scanlist restaurants as independently styled pins only after POI verification, with ranking, score, evidence, image, and confidence metadata.

The app also supports a local read-only share view and `.foodmap.json` import/export. Current-stage work must preserve local-first behavior while making the app more useful to users and callable by companion agents.

## Current-Stage Rules

- The map is always the primary surface.
- Recommendation pins are not personal records until the user saves them.
- A scanlist item may become a map pin only when `evaluateRecommendation` marks it mappable and the refresh/manual verification report has evidence.
- Approximate coordinates must stay visibly labeled as approximate; the UI must not imply exactness.
- Mobile uses a compact header, bottom action bar, and mutually exclusive panels.
- Dialogs, status bars, side panels, and bottom bars must not persist over create/edit/share/import modal flows.
- Agent commands must preserve the same validation and POI admission rules as manual UI actions.

## ChatGPT Audit Document Set

Use these 19 documents for external PRD/architecture/acceptance audit:

1. `docs/active/product-requirements-document.md`
2. `docs/active/target-architecture.md`
3. `docs/active/development-and-acceptance-plan.md`
4. `docs/active/acceptance-gate.md`
5. `docs/active/current-vs-target-gap.md`
6. `docs/active/current-vs-target-gap.drawio`
7. `docs/active/poi-verification-mechanism-v1.md`
8. `docs/active/amap-scanlist-refresh-report.md`
9. `docs/active/stage-p1-development-and-acceptance.md`
10. `docs/active/stage-p1-acceptance-report.md`
11. `docs/active/stage-p2-development-and-acceptance.md`
12. `docs/active/stage-p2-acceptance-report.md`
13. `docs/active/stage-p3-development-and-acceptance.md`
14. `docs/active/stage-p4-development-and-acceptance.md`
15. `docs/active/stage-p5-development-and-acceptance.md`
16. `docs/active/stage-p6-development-and-acceptance.md`
17. `docs/active/stage-p6-acceptance-report.md`
18. `docs/active/stage-p7-acceptance-report.md`
19. `docs/active/final-acceptance-report.md`
