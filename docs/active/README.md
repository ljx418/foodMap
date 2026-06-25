# FoodMap Active Design Docs

This directory is the active documentation baseline for FoodMap. It keeps the V1.0 PRD as the product foundation, records the accepted implementation baseline, and now records the P25 durable static deployment and release-governance stage after the accepted P24 WebApp/Mate70 baseline.

## Current Version

- Active baseline: V1.0 PRD plus accepted P1-P19 implementation scope, P20 core regression scope, accepted P20-C governance completion scope, accepted P21 local share/data portability release scope, accepted P22 interaction experience refactor scope, accepted P23 interaction-quality correction scope, accepted P24 WebApp/Mate70 implementation scope, and P25 durable static deployment implementation scope.
- Current project state: runnable Vite React TypeScript frontend with IndexedDB persistence, Leaflet/AMap-tile map, share/import/export, Agent Bridge, mobile filter controls, editable tags, manual pin move with audit preview, external map links, map-poster export, current-viewport poster mode, personal data health center, pending-place workbench, P17 detail IA, P18 candidate search and evidence, P19 acceptance evidence, P20 core personal data governance workbench, duplicate merge preview, import conflict preview, maintenance history, Agent governance boundary, responsive governance evidence, and 50 verified AMap Wuhan scanlist pins as a toggleable reference layer.
- Current-stage focus: P25 implements durable static deployment and release governance: GitHub Pages static host profile, fixed URL entry on Mate70, hash-route recovery, source-down fallback, regression evidence, and final release reporting.
- Current-stage acceptance status: P25 code, GitHub Pages deployment, deployed-origin browser checks, and automated regression have been implemented and verified, but P25 is not accepted because Mate70 fixed-URL real-device evidence is still blocked by missing HDC tooling in the current shell. P24 remains the latest accepted implementation baseline after full local automated checks, local static preview, Mate70 HDC workflow evidence, temporary public HTTPS static deployment smoke, valid public `#/share/:snapshotId` evidence, and non-destructive source-down fallback verification.
- Primary constraint: pure frontend first, static-deployable, no backend dependency for user records or share snapshots.
- Product direction: map-first personal food journal with a verified recommendation overlay, not a generic admin panel or public social product.

## Current-Stage Boundary

Allowed claims:

- P18 accepted capabilities remain preserved inside the P19 regression baseline.
- P19 accepted capabilities include acceptance-environment baseline, current-viewport poster, data health, domain/repository consolidation, responsive regression, and final governance evidence.
- P19 browser reproducibility uses the documented local `LD_LIBRARY_PATH` workaround unless the machine has Playwright system dependencies installed.
- P20 core regression capabilities include local personal data governance workbench, duplicate merge preview, import conflict preview, maintenance history, Agent governance boundaries, and responsive governance evidence.
- P20-C accepted capabilities include at least three safe batch operations, duplicate ignore/keep/merge decisions, import strategy selection, stale-reference grouping, governance report export, and P20-C E2E gates.
- P21 accepted capabilities include local snapshot portability review, complete `.foodmap.json` export, clean profile import to read-only share, invalid import no-op, read-only share guardrails, Agent share/import boundary, and release evidence gates.
- P22 allowed work is limited to interaction clarity and responsive readability over accepted P21/P20/P19 flows.
- P23 supersedes P22's interaction evidence for mobile share and readable governance/data-health paths; it does not add new product capability claims.
- P24 may claim accepted WebApp installability assets, mobile safe-area work, weak-network fallback, temporary public static smoke, and Mate70 real-device acceptance within the limits recorded by its final report.
- P25 may implement durable static hosting, stable URL entry, hash-route recovery, fixed-URL Mate70 verification, release evidence, and final release governance.

Forbidden claims:

- P19 introduced backend POI calibration, account sync, cloud sharing, or automatic correction of every wrong coordinate.
- All uncertain real-world POIs can be finalized without user confirmation.
- External realtime POI search is guaranteed without a configured provider or Agent-submitted evidence.
- A future stage may claim new capabilities before its own PRD-derived plan, audit, implementation, real-data acceptance, and final report are complete.
- A future stage is complete or accepted before its own evidence and final report exist.
- P20-C adds backend sync, cloud governance, automatic merge/delete, automatic coordinate finalization, or Agent bulk mutation.
- Claiming current P20 core as full original PRD completion before P20-C final acceptance exists.
- P21 adds cloud sync, accounts, public permanent links, or editable restore from import.
- Future stages treat P21 as a regression baseline before changing local share/import/export behavior.
- P22 may not claim new cloud/public share capability, automatic data repair, or new external real-time POI search.
- P24 may not claim HarmonyOS native HAP/AppGallery delivery, account login, cloud sync, remote backup, collaboration, or public permanent sharing.
- P25 may not claim durable static deployment acceptance until a stable URL, Mate70 fixed-URL evidence, regression evidence, and `p25-final-acceptance-report.md` exist.
- P25 may not turn FoodMap into a native HAP/AppGallery release, account/cloud product, backend service, offline map product, or permanent public social sharing platform.

## Document Index

- [Product Requirements Document](./product-requirements-document.md)
- [Target Architecture](./target-architecture.md)
- [Development And Acceptance Plan](./development-and-acceptance-plan.md)
- [P19 Detailed Development And Acceptance Plan](./p19-detailed-development-and-acceptance-plan.md)
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
- [P19 Stage Implementation Contract](./p19-stage-implementation-contract.md)
- [P19-1 Preimplementation Audit](./p19-1-preimplementation-audit.md)
- [P19-1 Acceptance Report](./p19-1-acceptance-report.md)
- [P19-2 Development And Acceptance Plan](./p19-2-development-and-acceptance-plan.md)
- [P19-2 Acceptance Report](./p19-2-acceptance-report.md)
- [P19-3 Development And Acceptance Plan](./p19-3-development-and-acceptance-plan.md)
- [P19-3 Acceptance Report](./p19-3-acceptance-report.md)
- [P19-4 Development And Acceptance Plan](./p19-4-development-and-acceptance-plan.md)
- [P19-4 Acceptance Report](./p19-4-acceptance-report.md)
- [P19-5 Development And Acceptance Plan](./p19-5-development-and-acceptance-plan.md)
- [P19-5 Acceptance Report](./p19-5-acceptance-report.md)
- [P19-6 Documentation Sync Acceptance Report](./p19-6-acceptance-report.md)
- [P19-7 Final Acceptance Plan](./p19-7-development-and-acceptance-plan.md)
- [P19-7 Final Acceptance Report](./p19-7-final-acceptance-report.md)
- [P19 Acceptance Environment](./p19-acceptance-environment.md)
- [P20 Detailed Development And Acceptance Plan](./p20-detailed-development-and-acceptance-plan.md)
- [P20-C Completion Development And Acceptance Plan](./p20-completion-development-and-acceptance-plan.md)
- [P20 Stage Implementation Contract](./p20-stage-implementation-contract.md)
- [P20 Preimplementation Audit](./p20-preimplementation-audit.md)
- [P20-7 Final Acceptance Report](./p20-7-final-acceptance-report.md)
- [P20-C Final Acceptance Report](./p20-c-final-acceptance-report.md)
- [P21 Detailed Development And Acceptance Plan](./p21-detailed-development-and-acceptance-plan.md)
- [P21 Preimplementation Audit](./p21-preimplementation-audit.md)
- [P21 Stage Implementation Contract](./p21-stage-implementation-contract.md)
- [P22 Detailed Development And Acceptance Plan](./p22-detailed-development-and-acceptance-plan.md)
- [P22 Preimplementation Audit](./p22-preimplementation-audit.md)
- [P22 Final Acceptance Report](./p22-final-acceptance-report.md)
- [P23 UX Correction Plan](./p23-ux-correction-plan.md)
- [P23 Preimplementation Audit](./p23-preimplementation-audit.md)
- [P23 Final Acceptance Report](./p23-final-acceptance-report.md)
- [P24 Detailed Development And Acceptance Plan](./p24-detailed-development-and-acceptance-plan.md)
- [P24 Preimplementation Audit](./p24-preimplementation-audit.md)
- [P24 Stage Implementation Contract](./p24-stage-implementation-contract.md)
- [P24 Mate70 Real Device Acceptance Script](./p24-mate70-real-device-acceptance-script.md)
- [P24 Final Acceptance Report](./p24-final-acceptance-report.md)
- [P25 Detailed Development And Acceptance Plan](./p25-detailed-development-and-acceptance-plan.md)
- [P25 Preimplementation Audit](./p25-preimplementation-audit.md)
- [P25 Stage Implementation Contract](./p25-stage-implementation-contract.md)
- [P25 Static Deployment Profile](./p25-static-deployment-profile.md)
- [P25-1 Acceptance Report](./p25-1-acceptance-report.md)
- [P25-2 Acceptance Report](./p25-2-acceptance-report.md)
- [P25-3 Acceptance Report](./p25-3-acceptance-report.md)
- [P25-4 Acceptance Report](./p25-4-acceptance-report.md)
- [P25-5 Acceptance Report](./p25-5-acceptance-report.md)
- [P25 Final Acceptance Report](./p25-final-acceptance-report.md)
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

The app also supports a local read-only share view and `.foodmap.json` import/export. P25 work preserves the accepted P16-P24 local-first baseline while turning the P24 temporary deployment proof into a stable static-host release profile with fixed-URL Mate70 evidence and honest fallback behavior.

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
- P19 current-viewport poster mode must use real map bounds and must not silently fall back to current-filter export.
- P19 data health must expose uncertainty and next actions without auto-marking records verified.
- P19 acceptance must cover all six P19 workstreams; a single feature passing alone cannot certify the stage.
- P20 governance workbench must preview affected records before low-risk batch writes.
- P20-C must support at least three safe batch operation types before claiming full original P20 PRD completion.
- P20-C duplicate suggestions must remain advisory until explicit user decision and support ignore, keep separate, and merge.
- P20-C import conflict preview must support strategy selection and be cancelable without mutating local data.
- P20-C governance report export must match the workbench, import, duplicate, and journal facts shown in the UI.
- P20-C Agent actions must not bulk modify, delete, merge, import, hide risk, or finalize coordinates.
- P21 share snapshots must clearly remain local and read-only.
- P21 exported `.foodmap.json` must be importable in a clean profile and open a read-only `#/share/:snapshotId`.
- P21 invalid imports must not partially write places, layers, photos, snapshots, or governance history.
- P21 share pages must not expose create, edit, delete, upload, save, account, cloud, or public-link controls.
- P23 mobile read-only share opens a selected-place summary first, then requires an explicit expand action for full detail.
- P23 evidence supersedes stale P22 screenshots where interaction screenshots were unreadable, clipped, or obscured.
- P24 WebApp work must remain browser-delivered and static-deployable; native HarmonyOS packaging is a future separate stage if ever pursued.
- P24 final acceptance requires Mate70 real-device screenshot or recording evidence.
- P25 durable static deployment must use the GitHub Pages target `https://ljx418.github.io/foodMap/` or a documented fallback stable static URL, not HDC-only routing, local-only preview, or a temporary tunnel, before it can be accepted.
- P25 direct `#/map` and generated `#/share/:snapshotId` routes must open and refresh correctly on the static host.
- P25 must keep IndexedDB and `.foodmap.json` as the only user-data persistence and portability paths.
- P25 final acceptance requires fixed-URL Mate70 evidence, P18-P24 regression evidence, and a final report.

## ChatGPT Audit Document Set

Use these documents for external PRD/architecture/acceptance audit:

This audit set is intentionally below 20 documents. `docs/active/p24-final-acceptance-report.md` is the latest accepted implementation baseline. P25 implementation and deployment evidence exists, but `docs/active/p25-final-acceptance-report.md` currently records a not-accepted decision because Mate70 fixed-URL evidence is blocked.

1. `docs/active/product-requirements-document.md`
2. `docs/active/target-architecture.md`
3. `docs/active/development-and-acceptance-plan.md`
4. `docs/active/acceptance-gate.md`
5. `docs/active/milestone-roadmap.md`
6. `docs/active/current-vs-target-gap.md`
7. `docs/active/current-vs-target-gap.drawio`
8. `docs/active/visual-acceptance-checklist.md`
9. `docs/active/p25-detailed-development-and-acceptance-plan.md`
10. `docs/active/p25-stage-implementation-contract.md`
11. `docs/active/p25-static-deployment-profile.md`
12. `docs/active/p25-final-acceptance-report.md`
13. `docs/active/p24-final-acceptance-report.md`
14. `docs/active/p21-final-acceptance-report.md`
15. `docs/active/p20-c-final-acceptance-report.md`
16. `docs/active/p18-candidate-search-trust-contract.md`
17. `docs/active/data-schema-and-import-export-contract.md`
18. `docs/active/e2e-test-and-evidence-matrix.md`
19. `docs/active/p25-5-acceptance-report.md`
