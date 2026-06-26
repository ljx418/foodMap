# P26 Stage Implementation Contract

## Binding Scope

P26 implementation is limited to these workstreams:

1. Mobile release experience hardening for the accepted fixed static URL.
2. Release gate automation and evidence manifest.
3. Mate70 interaction polish for the existing WebApp workflows.
4. Local data maintenance enhancement for existing health/governance/import/duplicate/conflict workflows.
5. Evidence governance and final acceptance reporting.

## Non-Goals

P26 must not implement or claim:

- HarmonyOS native ArkTS/HAP package.
- AppGallery release.
- Account login, identity system, cloud sync, remote backup, or automatic multi-device sync.
- FoodMap business backend or backend POI calibration service.
- Offline map tiles.
- Public permanent share links or social map publishing.
- External realtime POI search completion without provider configuration and evidence.
- Automatic data repair, silent merge, silent delete, silent coordinate finalization, or hidden import writes.

## Required User Confirmation Boundaries

- Duplicate merge, keep-separate, ignore, cleanup, import conflict handling, coordinate change, skipped/pending resolution, and high-risk record handling must show a preview before mutation.
- Cancel/no-op must leave places, layers, photos, snapshots, and governance history unchanged.
- Agent actions must not bypass the same preview and confirmation steps required by manual UI.
- Health and governance surfaces may focus, filter, open details, or open workbench items, but they must not silently rewrite facts.

## Architecture Boundaries

- FoodMap remains a pure frontend, local-first, static-deployable modular monolith.
- IndexedDB remains the local source of truth for user places, layers, photos, snapshots, and governance history.
- `.foodmap.json` remains the only cross-device portability route.
- GitHub Pages fixed URL remains the primary P25/P26 release target unless a final report documents a static-host fallback.
- HDC reverse forwarding and desktop mobile viewport runs are acceptance helpers, not product architecture dependencies.

## Acceptance Requirements

P26 cannot be called accepted until:

1. PRD, target architecture, roadmap, gate, gap/drawio, E2E matrix, visual checklist, stage plan, and final report are aligned.
2. `npm run build`, `npm test -- --run`, `npm run verify:scanlist`, static deployment verifier, P18-P25 regression, and P26 targeted checks pass or have documented non-product blockers.
3. Mate70 fixed-URL evidence proves the mobile release experience and interaction paths.
4. Real data or fixtures prove local maintenance flows remain preview-first, cancelable, explicit, and local-only.
5. Final report records commands, screenshots/JSON, real-device evidence, blockers, residual limits, and non-goals.

Current status: all five acceptance requirements are closed by `docs/active/p26-final-acceptance-report.md`. This contract remains the binding trace for what P26 had to prove before acceptance; it is no longer an open blocker list.
