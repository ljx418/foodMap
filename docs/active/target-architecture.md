# FoodMap P19/P20-C/P21/P22/P23/P24/P25 Target Architecture

## 1. Architecture Conclusion

FoodMap remains a **pure frontend, local-first, static-deployable modular monolith**. User places, layers, photos, snapshots, and governance history remain in browser IndexedDB. AMap scanlist and Dingtuyi data remain optional reference layers. Agent access remains limited to the controlled `window.FoodMapAgentBridge` surface.

P18 is accepted and becomes the regression baseline:

- Candidate search and no-key fallback.
- Candidate evidence model.
- Two-step manual pin move audit preview.
- Detail IA and filter explainability.
- Share poster composer for current filtered personal places.
- Agent negative boundaries and large deterministic performance smoke.

P22 adds interaction-shell work over the accepted P19/P20-C/P21 baselines. P23 corrects the remaining interaction evidence gaps found during human review and full PRD regression. P24 implements mobile-friendly WebApp deployment readiness and Mate70 usability evidence over the accepted baseline. P25 implements durable static deployment and release governance over the accepted P24 WebApp baseline, but is not accepted until Mate70 fixed-URL evidence is captured. No stage adds accounts, backend POI services, cloud sync, multiplayer collaboration, permanent public links, HarmonyOS native delivery, automatic coordinate correction, offline map tiles, or new external real-time POI claims.

## 0C. P25 Target Deployment Architecture

P25 turns the accepted P24 temporary tunnel evidence into a durable static deployment target. It remains a browser-delivered static WebApp, not a native HarmonyOS HAP package and not a backend application.

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `StaticHostProfile` | Define GitHub Pages as the primary durable host for `ljx418/foodMap`; record build output, deploy command, base path, route fallback, cache policy, rollback notes, and fallback host decision rules | `p25-static-deployment-profile.md`, `vite.config.ts`, `dist/`, `gh-pages` branch |
| `HashRouteRecovery` | Ensure direct open and refresh for `#/map` and `#/share/:snapshotId` on the static host | `src/app/App.tsx`, `index.html`, static host fallback |
| `WebAppShellRuntime` | Keep manifest, icon, viewport, service worker, and source-down fallback aligned with P24 accepted behavior | `index.html`, `public/manifest.webmanifest`, `public/sw.js`, `src/registerServiceWorker.ts` |
| `Mate70StaticReleaseHarness` | Capture fixed-URL Mate70 screenshots for workspace, create/import, valid share, refresh persistence, and fallback states | HDC commands, `docs/active/evidence/p25`, final report |
| `LocalDataPortabilityBoundary` | Preserve IndexedDB as local source of truth and `.foodmap.json` as only cross-device path | IndexedDB repositories, import/export codec, snapshot codec |
| `RegressionGatePack` | Prove P18-P24 accepted behavior remains green before release acceptance | Vitest, Playwright, `verify:scanlist`, P25 final report |

P25 runtime flow:

```text
Mate70 browser
  -> stable GitHub Pages URL (https://ljx418.github.io/foodMap/)
  -> dist/index.html + manifest.webmanifest + sw.js
  -> App hash router (#/map or #/share/:snapshotId)
  -> MapWorkspace or ShareView
  -> IndexedDB local facts and snapshots
  -> .foodmap.json import/export for portability
  -> FoodMap-owned fallback for source-down or unsupported browser states
```

P25 write-path rule: deployment work may change static hosting configuration, GitHub Actions workflow, Vite base handling, docs, verification scripts, and fallback behavior only when needed for release safety. It must not introduce a business backend, account identity, cloud synchronization, remote backup, multiplayer editing, public permanent share URLs, HarmonyOS native packaging, or hidden writes that change P18-P24 trust boundaries.

If GitHub Pages cannot be enabled for the repository or cannot produce a durable URL, the implementer may switch to Cloudflare Pages, Netlify, or a self-hosted static server only after recording the blocker and trade-off in the final report. The product architecture remains the same static WebApp architecture regardless of host.

## 0B. P24 Target WebApp Architecture

P24 turns the accepted responsive frontend into a mobile-friendly, app-like WebApp target. It remains a browser-delivered application, not a HarmonyOS native HAP package.

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `WebAppShell` | Define app name, launch URL, theme color, display mode, viewport behavior, and static deployment assumptions | `index.html`, `public/manifest.webmanifest`, `public/icons/foodmap-icon.svg`, Vite build output |
| `AppShellRuntime` | Register app-shell-only offline fallback without claiming offline map tiles or cloud backup | `src/registerServiceWorker.ts`, `public/sw.js` |
| `InstallabilityFallbackStatus` | Show browser/WebApp mode, offline notice, and Mate70 installability limitation copy | `src/components/WebAppStatus.tsx`, `src/app/App.tsx`, `src/styles/app.css` |
| `WorkspaceMobileSurface` | Keep map, search, quick filters, bottom actions, sheets, dialogs, and keyboard states usable under browser chrome | `MapWorkspace`, `HomeMapControlDock`, `MapCanvas`, `src/styles/app.css` |
| `ShareMobileSurface` | Keep read-only share route, missing snapshot import fallback, and mobile detail summary usable on Mate70 | `ShareView`, `ImportExportDialog`, share/import codec |
| `MapFallbackAdapter` | Preserve local data and explain map tile failure without implying record loss | `LeafletProvider`, `MapCanvas`, `src/styles/app.css` |
| `LocalDataBoundary` | Keep personal data local and portable only through IndexedDB and `.foodmap.json` | IndexedDB repositories, import/export codec, snapshot codec |
| `AgentBoundary` | Keep assistant access behind read/guarded local actions, not deployment or cloud sync | `window.FoodMapAgentBridge` |
| `StaticDeploymentProfile` | Ensure built assets can be served from a static host and opened from Mate70 without a business backend | `package.json` build/preview scripts, `scripts/verify_p24_webapp.mjs`, final report |
| `Mate70AcceptanceHarness` | Combine Playwright evidence, HDC reverse workflow screenshots, static-deployment smoke, and final real-device evidence limits | `e2e/workspace.spec.ts`, HDC commands, `docs/active/evidence/p24`, final report |

P24 write-path rule: P24 may add WebApp packaging assets, layout fixes, deployment docs, and fallback UI only. It must not add account identity, cloud synchronization, remote backup, multiplayer editing, public permanent share URLs, native HarmonyOS packaging, or hidden writes that change P18-P23 trust boundaries.

P24 runtime flow:

```text
Mate70 browser
  -> index.html / manifest.webmanifest / sw.js
  -> App router (#/map or #/share/:snapshotId)
  -> MapWorkspace or ShareView
  -> MapCanvas + LeafletProvider for map rendering and tile fallback
  -> Domain helpers and IndexedDB repositories for local facts
  -> Import/export codec for .foodmap.json portability
  -> WebAppStatus for browser/offline/installability fallback copy
  -> Playwright/HDC evidence harness for acceptance only
```

HDC reverse forwarding is an acceptance transport, not a product architecture dependency. It can prove Mate70 workflow usability during development, but it does not replace a deployable static URL unless the final report explicitly accepts that limitation.

## 0A. P23 Target Interaction Correction

P23 is a correction and evidence gate over the accepted P22 direction. It makes the mobile and narrow-screen experience match the PRD promise that FoodMap remains map-first, understandable, local-first, and safe to verify.

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `MobileShareSummaryFirst` | Mobile read-only share marker/list selection opens a compact summary first; full details require an explicit expand action | `src/features/share/ShareView.tsx`, `src/styles/app.css` |
| `ResponsiveViewportState` | Shared mobile viewport detection keeps workspace and share controls in the correct mobile/desktop mode | `src/components/useIsMobileViewport.ts`, `HomeMapControlDock`, `ShareView` |
| `GovernanceActionReadability` | Health and governance tabs, queues, and action buttons wrap naturally instead of collapsing into narrow text strips | `GovernanceWorkbench`, `PersonalDataHealthCenter`, `src/styles/app.css` |
| `P23RegressionHarness` | Proves corrected mobile share, 320px quick-filter, health/governance readability, P21 responsive regression, and full workspace regression | `e2e/workspace.spec.ts`, `docs/active/evidence/p23`, `docs/active/evidence/full-acceptance-2026-06-25` |

P23 write-path rule: all changes remain presentation, routing, responsive-state, validation, or evidence changes. P23 must not bypass P18 coordinate confirmation, P20-C governance confirmation, P21 import validation, or P22 local-only share boundaries.

## 0. P22 Target Interaction Shell

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `ReadOnlyShareShell` | Standalone read-only share layout with map, layer panel, detail panel, mobile share nav, and local-only notice | `src/features/share/ShareView.tsx`, `src/styles/app.css` |
| `MissingSnapshotRecovery` | Direct `.foodmap.json` import from missing snapshot route with validation and no-op error handling | `ShareView.tsx`, `importExportCodec.ts` |
| `WorkspacePanelReadability` | Wider health/governance/pending right panel classes and deterministic E2E width checks | `MapWorkspace.tsx`, `app.css`, `e2e/workspace.spec.ts` |
| `MobileControlCompactness` | Compact mobile map dock that preserves map-first workflow | `HomeMapControlDock.tsx`, `app.css` |
| `ActionIntentLanguage` | Clarify header/dialog language: `数据包`, `分享图`, `快照` | `WorkspaceHeader.tsx`, `ImportExportDialog.tsx`, `ShareSnapshotDialog.tsx` |
| `P22RegressionHarness` | P21 share regression, core P19/P20 regression, P22 targeted readability test, screenshots, final report | `e2e`, `docs/active/evidence/p22` |

P22 write-path rule: all changes are presentation, routing, validation, or read-only import recovery changes. No P22 component may bypass P18 coordinate confirmation, P20-C governance confirmation, or P21 import validation.

## 2. Current Architecture

```text
Browser
  -> React App Shell / Hash Router
    -> #/map Workspace
    -> #/share/:snapshotId Read-only Share
    -> FoodMapAgentBridge

Workspace UI
  -> Domain helpers
  -> IndexedDB repositories
  -> Map Provider Adapter
  -> Recommendation read model
  -> External reference layers

Acceptance
  -> Vitest domain tests
  -> Playwright E2E
  -> scanlist verification script
  -> screenshot / JSON evidence
```

| Layer | Current Responsibility | Main Code Area |
| --- | --- | --- |
| App Shell | Route parsing and app composition | `src/app`, `src/main.tsx` |
| Workspace UI | Map, detail, editor, pending workbench, filters, poster, import/export | `src/features/workspace` |
| Share UI | Local read-only snapshot view | `src/features/share` |
| Domain | Coordinates, filters, candidates, manual move, location status, poster SVG | `src/domain` |
| Persistence | IndexedDB wrappers and repositories | `src/persistence` |
| Map Adapter | Leaflet/AMap tile rendering and marker interactions | `src/map` |
| Recommendation | AMap scanlist data, verification, conversion helpers | `src/recommendations` |
| External Reference | Dingtuyi 120 read-only markers | `src/externalShares` |
| Agent | Controlled browser bridge and structured errors | `src/agent/FoodMapAgentBridge.ts` |
| Acceptance | Unit and browser tests | `src/tests`, `e2e`, `scripts` |

## 3. P19 Target Modules

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `AcceptanceEnvironmentBaseline` | Document and verify local browser dependencies, targeted Playwright commands, and restore checks | docs + `e2e` notes |
| `ViewportPosterComposer` | Track map bounds, derive viewport-contained personal places, enable `当前视野` poster mode | `MapWorkspace.tsx`, `MapCanvas.tsx`, `MapPosterDialog.tsx`, `mapPoster.ts` |
| `PersonalDataHealthCenter` | Group personal places by verified, pending, high-risk, manual-adjusted, skipped and expose next actions | workspace UI + `locationStatus.ts` |
| `LocationWorkflowDomainService` | Centralize candidate confirmation, manual move, pending derivation, and audit fallback | `src/domain`, `src/persistence` |
| `RepositoryContractAlignment` | Align documented repository APIs with actual implementation or staged expansion | `src/persistence`, docs |
| `ResponsiveRegressionHarness` | Cover poster, health, detail, and filters across required viewports | `e2e/workspace.spec.ts`, visual evidence |
| `P19GovernancePack` | Keep PRD, architecture, gap, gates, roadmap, drawio, tests, and final report synchronized | `docs/active` |

## 4. P19 Workstream Mapping

| Workstream | Lead Modules | Dependencies | Architecture Boundary |
| --- | --- | --- | --- |
| W19-A 验收环境可复现 | `AcceptanceEnvironmentBaseline`, Playwright config/docs | Vite dev server, Chromium/system deps | Acceptance blockers must be explicit; no browser evidence may be faked |
| W19-B 当前视野分享图 | `ViewportPosterComposer`, Map Adapter | Filter state, map bounds, poster renderer | `当前视野` must use real bounds, not silently reuse current filter |
| W19-C 个人数据健康中心 | `PersonalDataHealthCenter`, `locationStatus` | Places, tags, mapAccuracy, audit fallback | Health views cannot mutate coordinates or hide uncertainty |
| W19-D Domain/Repository 收口 | `LocationWorkflowDomainService`, repositories, Agent | Candidate confirmation, manual move, pending state | UI and Agent must share confirmation guardrails |
| W19-E 多尺寸回归 | `ResponsiveRegressionHarness`, workspace UI | CSS tokens, panels, bottom sheets | New panels must not cover map-first core actions |
| W19-F 文档和治理 | `P19GovernancePack` | All active docs, drawio, final report | Active docs must describe the same stage and exit conditions |

## 5. Core Data And State Rules

P19 keeps schema version 1 compatible:

- `FoodPlace` remains the user-owned record.
- `mapAccuracy`, system tags, coordinate risk, and audit notes remain accepted compatibility fields.
- Future persisted audit fields may be added only with backward-compatible import/export behavior.
- Reference pins are not personal records until explicitly saved.
- Current viewport poster mode filters only personal places unless a future stage explicitly adds reference-layer poster modes.
- Data health groups are derived read models; opening or filtering from the health center does not change facts.

## 6. Write Path Rules

| Flow | Required Path | Forbidden Shortcut |
| --- | --- | --- |
| Candidate confirmation | Domain validation -> explicit user confirmation -> repository save -> UI reload | Clicking a candidate directly mutates coordinates |
| Manual pin move | Preview old/new coordinates -> explicit confirmation -> audit fallback -> repository save | Map click/drag saves immediately |
| Health center action | Focus/filter/open detail/workbench | Auto-fix, auto-verify, delete, or hide uncertain places |
| Agent action | Read, focus, filter, submit candidates, explain risk | Finalize coordinates, delete pending, hide uncertainty |
| Poster export | Derive source set -> preview count -> PNG export | Export a different set than preview |

## 7. P19 Target User Flows

### 7.1 Current Viewport Poster

1. Workspace receives current map bounds from the map adapter.
2. Poster composer offers `当前筛选` and `当前视野`.
3. `当前筛选` uses current filtered personal places.
4. `当前视野` intersects current filtered personal places with map bounds.
5. Preview shows mode, count, title, tag summary, and empty state if no places match.
6. Exported PNG uses the same source set as preview.

### 7.2 Personal Data Health

1. Workspace derives health groups from personal places.
2. Health center shows counts and representative records for verified, pending, high-risk, manual-adjusted, skipped.
3. User can focus a place, apply a filter, or open the pending workbench.
4. The health center never changes coordinates or status automatically.

### 7.3 Domain/Repository Consolidation

1. Existing UI behavior remains visible.
2. Candidate confirmation and manual move logic are extracted toward shared domain helpers.
3. Repository APIs are updated only where they reduce partial-write risk.
4. Agent negative tests verify the same guardrails after extraction.

## 8. Acceptance Architecture

P19 acceptance requires:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

P19 implementation must add targeted browser coverage for:

- Current viewport poster mode.
- Empty viewport fallback.
- Data health center grouping and action paths.
- Domain/repository guardrail regression.
- 390x844, 430x932, 768x900, 1280x820 responsive paths.

## 9. Non-Goals

- No backend account system.
- No cloud sync or public permanent share link.
- No server-side POI correction service.
- No claim that external realtime POI search works without configured provider key or Agent evidence.
- No direct Agent coordinate finalization.
- No admin-dashboard redesign that demotes the map.

## 10. Governance

P19 is complete only when:

- Active docs and drawio describe P19 consistently.
- P18 accepted gates remain green.
- P19 final acceptance report records command results, screenshots, known residual risks, and PRD/architecture deviation review.

P19 acceptance status: completed on 2026-06-23. `docs/active/p19-7-final-acceptance-report.md` is the latest accepted stage baseline.

## 11. P20 Target Architecture Extension

P20 keeps the same pure frontend, local-first, modular monolith architecture. It extends P19's personal data health and location workflow boundaries into a **Personal Data Governance** layer. The goal is not a backend admin system; the goal is a safer local workflow for maintaining a long-lived personal food map.

Architecture audit on 2026-06-24 found that the current P20 core implementation is narrower than the original PRD target. The implemented core can be treated as a regression baseline for governance workbench, merge preview, import preview, journal, Agent boundary, and responsive evidence. It must not be described as full P20 PRD completion until P20-C closes the remaining architecture capabilities below.

### 11.1 P20 Target Modules

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `GovernanceWorkbench` | Show grouped personal data issues, processing queue, progress, and safe bulk previews | `src/features/workspace` |
| `DuplicateSuggestionService` | Derive possible duplicate personal places from name/address/distance/tags/photos/time | `src/domain` |
| `ImportConflictPlanner` | Compare incoming `.foodmap.json` data with local records before writes | `src/domain`, `src/persistence` |
| `GovernanceActionJournal` | Record user-readable audit entries for skip, tag, merge, import conflict, candidate confirmation, and manual move | `src/domain`, `src/persistence` |
| `GovernanceRepositoryAlignment` | Add atomic helpers only where needed to prevent partial governance writes | `src/persistence` |
| `P20ResponsiveHarness` | Cover governance workbench, duplicate comparison, import conflict preview, and history on required viewports | `e2e/workspace.spec.ts`, visual evidence |
| `P20GovernancePack` | Keep PRD, architecture, gap, gates, roadmap, tests, and final report synchronized | `docs/active` |

### 11.1A P20-C Completion Modules

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `GovernanceBatchActionService` | Provide at least three low-risk batch operations with preview, cancel no-op, confirmation, repository write, and journal append | `src/domain/governance.ts`, `src/persistence/governanceRepository.ts`, `GovernanceWorkbench.tsx` |
| `DuplicateDecisionService` | Support ignore, keep-separate, and merge decisions with evidence comparison and history; only merge may delete after explicit confirmation | `src/domain/governance.ts`, `GovernanceWorkbench.tsx` |
| `ImportConflictStrategyPlanner` | Classify new/update/duplicate/risk/skipped rows and allow user strategy selection before writes | `src/domain/governance.ts`, `ImportExportDialog.tsx`, `GovernanceWorkbench.tsx` |
| `StaleReferenceIssueDetector` | Derive stale-reference governance issues from reference mismatch, stale audit tags, import conflict fallback, or obsolete candidate evidence | `src/domain/governance.ts`, data health/governance UI |
| `GovernanceReportExporter` | Export local JSON/text governance report with grouped counts, pending actions, duplicate decisions, import summaries, and journal entries | `src/domain/governance.ts`, workspace UI |
| `P20CRegressionHarness` | Add PRD-complete browser coverage for batch operations, duplicate decisions, import strategies, stale-reference, report export, and cancel no-op | `e2e/workspace.spec.ts`, `src/tests/domain.test.ts` |

### 11.2 P20 Data And Write Rules

- `FoodPlace` remains the user-owned record in IndexedDB.
- Governance groups are derived from local records, existing tags, `mapAccuracy`, risk helpers, audit fallback, import plans, and duplicate suggestions.
- Duplicate suggestions are advisory read models until the user explicitly confirms a merge.
- Import conflict plans must be computed before writes; canceling the preview leaves local data unchanged.
- Bulk operations may modify low-risk metadata such as tags or queue status only after preview and confirmation.
- Coordinate changes, verification changes, deletes, and merges are high-risk writes and require explicit per-record confirmation or an equivalent review step that lists every affected record.
- Governance journal entries must be appended as part of the same logical write as the action they describe.

### 11.3 P20 Architecture Boundaries

| Flow | Required Path | Forbidden Shortcut |
| --- | --- | --- |
| Bulk tag/skip | Derive selected set -> preview affected records -> explicit confirmation -> domain transform -> repository save -> journal append | One-click hidden mutation from summary counts |
| Duplicate decision | Suggest duplicates -> compare evidence -> user chooses ignore/keep/merge -> preview affected records -> explicit confirmation -> repository transaction -> journal append | Auto-merge or delete based only on name similarity |
| Import conflict | Parse package -> build conflict plan -> user selects strategy for new/update/duplicate/risk/skipped classes -> repository transaction -> journal append | Import writes before preview or ignores conflicts |
| Governance history | Read journal entries and legacy audit fallback | Editing history as if it were source facts |
| Governance report export | Derive report from current issues, decisions, import plans, and journal -> local file download | Claiming report export without the same facts shown in UI |
| Agent governance | Read summaries, suggest candidates, explain conflicts | Execute bulk writes, merge, delete, finalize coordinates, or hide risk |

### 11.4 P20 Acceptance Architecture

P20 final acceptance must include:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 governance"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 import conflict"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 agent negative"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 responsive"
```

P20 must also include visual evidence for governance workbench, duplicate comparison, import conflict preview, and maintenance history on required responsive viewports.

## 12. P20-C Architecture Exit Conditions

P20-C is the architecture-complete target for the original P20 PRD. It exits only when:

- Governance workbench exposes pending, high-risk, manual-adjusted, skipped, duplicate, import-conflict, and stale-reference groups.
- At least three low-risk batch operations share a domain preview model and have cancel no-op coverage.
- Duplicate suggestions support ignore, keep separate, and merge, with history for each decision and no automatic delete.
- Import conflict preview supports strategy selection across new, update, duplicate, risk, and skipped classes.
- Governance report export is derived from the same domain read models shown in the UI.
- Agent remains read/suggest only for governance and cannot execute batch writes, merge, delete, hide risk, import, or coordinate finalization.
- Build, unit, scanlist, P18/P19 regression, P20 core regression, and P20-C targeted browser tests all pass with real-data fixtures.

P20-C acceptance status: accepted by `docs/active/p20-c-final-acceptance-report.md`.

## 13. P21 Target Architecture Extension

P21 keeps FoodMap as a pure frontend, local-first, modular monolith. It does not add a backend, account system, cloud sync, or public permanent share links. P21 turns the V1.0 share/import/export requirements into a release-candidate architecture: a user can generate a local read-only snapshot, export a `.foodmap.json` package, import it in a clean profile, and view the same snapshot through `#/share/:snapshotId` without editing or data pollution.

P21 builds on the accepted P20-C governance baseline. It must treat P18 candidate trust, P19 viewport/data-health behavior, and P20-C governance/import conflict rules as regression gates.

### 13.1 P21 Target Modules

| Module | Responsibility | Target Location |
| --- | --- | --- |
| `SnapshotPortabilityComposer` | Show title, read-only boundary, place/layer/photo counts, exported time, and generated snapshot id before export/open | `ShareSnapshotDialog`, `ImportExportDialog`, domain helpers |
| `FoodMapPackageValidator` | Validate `.foodmap.json` schema/version, snapshot metadata, places, layers, thumbnail-only photos, and error messages before writes | `src/persistence/importExportCodec.ts`, `src/domain` |
| `CleanProfileImportHarness` | Verify importing a package into an empty IndexedDB creates a local read-only snapshot and opens `#/share/:snapshotId` | `e2e/workspace.spec.ts`, test fixtures |
| `ReadOnlyShareGuard` | Ensure share page renders layers, map pins, details, thumbnails, and fallback copy without edit/delete/create/upload/save controls | `src/features/share`, shared detail components |
| `ImportFailureNoOpGuard` | Prove invalid or unsupported packages leave existing places, layers, photos, snapshots, and governance journal unchanged | domain tests + Playwright |
| `P21ReleaseEvidencePack` | Store P21 screenshots, exported JSON evidence, IndexedDB diff evidence, command logs, PRD/architecture review, and final report | `docs/active/evidence/p21`, `docs/active` |

### 13.2 P21 Data Flow

```text
#/map personal workspace
  -> create snapshot from current local data
  -> validate snapshot summary and read-only boundary
  -> export .foodmap.json
  -> clean profile import
  -> validate package
  -> write local ShareSnapshot only
  -> #/share/:snapshotId read-only view
```

Rules:

- Snapshot import for P21 writes only local snapshot data needed by `#/share/:snapshotId`.
- P21 does not restore imported records as editable personal places unless a future stage explicitly defines that workflow.
- Photo portability depends on thumbnails in the package; original photo blobs and remote assets are not required for share viewing.
- Invalid import must be atomic no-op: no partial place, layer, photo, snapshot, or governance journal writes.
- Missing snapshot route must explain the local-only nature and direct users to import `.foodmap.json`.

### 13.3 P21 Architecture Boundaries

| Flow | Required Path | Forbidden Shortcut |
| --- | --- | --- |
| Snapshot generation | Derive snapshot -> show summary and read-only boundary -> user confirms -> repository save/export | Generate ambiguous share without title/counts/boundary |
| Export package | Encode schema/version, snapshot metadata, places, layers, thumbnails -> download local file | Depend on backend or remote original photo blobs |
| Clean import | Parse -> validate -> plan no-op safety -> write local snapshot -> navigate share route | Write editable personal places without explicit restore scope |
| Share view | Read snapshot -> render map/layers/details/thumbnails -> no edit controls | Reuse workspace controls that expose create/edit/delete/upload/save |
| Invalid import | Reject with message -> preserve IndexedDB facts | Partial writes before validation completes |
| Agent | Read package facts, explain errors, suggest backup steps | Forge public links, bypass import confirmation, bulk modify imported data |

### 13.4 P21 Acceptance Architecture

P21 final acceptance must include:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster|P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20-C|P20 governance|P20 import conflict|P20 agent governance"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P21 share portability|P21 import safety|P21 read only share"
```

P21 also requires visual evidence for share generation/export, clean profile import, read-only share page, missing snapshot fallback, and invalid import no-op across 390x844, 430x932, 768x900, and 1280x820 where applicable.

## 14. P21 Architecture Exit Conditions

P21 exits only when:

- Share snapshot generation exposes local-only/read-only meaning, title, counts, and generated time.
- Exported `.foodmap.json` can be imported into a clean profile and opened as a read-only share snapshot.
- Share page displays places, layers, thumbnails, ratings, visit dates, tags, address, and notes without edit controls.
- Invalid imports and missing snapshots produce clear fallback copy and leave current data unchanged.
- Agent cannot claim public sharing, bypass import confirmation, or mutate imported data.
- P18/P19/P20-C regression gates remain green.
- Build, unit, scanlist, P21 targeted browser tests, visual evidence, PRD/architecture review, and P21 final report all pass.

## 15. P23 Architecture Exit Conditions

P23 exits only when:

- Mobile read-only share selection preserves map context by showing a summary before full detail.
- 320px and 390px workspace controls keep search, quick filters, map inspection, and bottom actions reachable.
- Data health and governance workbench actions remain readable on desktop, tablet, and mobile evidence paths.
- Missing share, invalid import, clean-profile import, share snapshot, current viewport poster, health, governance, and detail paths have screenshot evidence.
- Build, unit, real scanlist, P18/P19/P20/P21/P22 targeted regression, full workspace Playwright, PRD/document review, and P23 final report all pass.
- The final acceptance report does not claim cloud sharing, backend sync, automatic repair, or external real-time POI completion.

## 16. P24 Architecture Exit Conditions

P24 exits only when:

- A static deployment of the Vite build can be opened on HarmonyOS Mate70.
- WebApp metadata, icon, theme, launch URL, and viewport behavior are implemented or explicitly blocked by target browser support with fallback copy.
- Mobile safe-area, browser chrome, keyboard, bottom action, and panel interactions keep map-first workflows usable on 320px, 390px, 430px, and Mate70 evidence.
- IndexedDB local persistence and `.foodmap.json` portability remain the only cross-device data paths.
- Weak-network, tile failure, external-map failure, and installability-unavailable states are visible and do not imply cloud loss or data loss.
- Build, unit, real scanlist, P18-P23 regression, P24 mobile E2E, static deployment smoke, PRD/document review, Mate70 evidence, and P24 final report all pass.
- The final report does not claim HarmonyOS native app delivery, AppGallery release, account sync, cloud backup, collaboration, or public permanent sharing.
