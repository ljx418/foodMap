# FoodMap P19/P20-C/P21/P22/P23/P24/P25/P26 E2E Test And Evidence Matrix

## P26 Evidence Addendum

P26 adds mobile release hardening, release-gate automation, Mate70 interaction polish, local data maintenance enhancement, and evidence governance over accepted P25. It must prove the fixed static WebApp remains usable and honest on Mate70 without claiming HarmonyOS native delivery, account sync, cloud backup, backend API, offline map tiles, automatic repair, realtime POI completion, collaboration, or permanent public social sharing.

Required P26 command evidence:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
npm run verify:p24:webapp
npm run build:pages
npm run verify:p25:deployment
npm run verify:p26:release
FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ npm run verify:p25:deployment
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=mobile
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P26"
FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25 deployed"
```

The P26-specific release verifier writes `docs/active/evidence/p26/release-gate-manifest.json`. Final acceptance still requires Mate70 fixed-URL P26 build evidence; desktop/mobile viewport automation remains supporting evidence.

Required P26 evidence:

| Scenario | Required Assertion |
| --- | --- |
| Fixed URL release state | Mate70 opens `https://ljx418.github.io/foodMap/` and clearly shows browser/WebApp/source-down/tile-failure states without cloud/native/offline-map implication |
| Release gate automation | Command bundle and evidence manifest prove build, unit, scanlist, static deployment, hash route, regression, and P26 targeted checks are repeatable |
| Mate70 workspace polish | Search, quick filters, bottom actions, create entry, detail, keyboard states, and safe areas are readable and reachable |
| Mate70 import/export | `.foodmap.json` import/export remains local-first and does not imply remote backup or sync |
| Mate70 share polish | Valid read-only share and missing-share recovery remain clear, local, read-only, and refresh-safe |
| Local maintenance | Health, governance, duplicate/conflict/import/skipped/pending flows are preview-first, cancelable, user-confirmed, and local-only |
| Agent negative | Agent Bridge cannot finalize coordinates, delete, merge, import, hide risk, or bypass confirmation |
| PRD consistency | Evidence and reports do not claim native HAP/AppGallery, backend, account/cloud, offline map, realtime POI completion, or public permanent sharing |

P26 evidence output path:

```text
docs/active/evidence/p26/
```

P26 final report must distinguish Mate70 real-device fixed-URL evidence from desktop mobile viewport evidence and from any HDC-assisted development evidence.

## P25 Evidence Addendum

P25 adds durable static deployment and release-governance evidence over accepted P24. It proves FoodMap can be opened from the GitHub Pages target `https://ljx418.github.io/foodMap/` or a documented fallback stable static URL on Mate70 without claiming HarmonyOS native delivery, account sync, cloud backup, backend API, offline map tiles, collaboration, or permanent public social sharing.

Required P25 command evidence:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
npm run verify:p24:webapp
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic|P19|P20-C|P21|P22|P23|P24"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25"
FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25 deployed"
```

`npm run verify:p24:webapp` remains valid as the current WebApp static metadata check until a P25-specific deployment verifier is implemented. If a P25 verifier is added, the final report must list both the old baseline command and the P25 successor command.

Required P25 evidence:

| Scenario | Required Assertion |
| --- | --- |
| Durable static URL smoke | The built app opens from GitHub Pages at `https://ljx418.github.io/foodMap/`, or a documented fallback stable HTTPS static host URL, not local preview, HDC-only, or temporary tunnel |
| Direct hash route | `#/map` and a generated `#/share/:snapshotId` open directly and survive refresh |
| Mate70 fixed URL workspace | HarmonyOS Mate70 opens the stable URL and shows map, search, quick filters, status, and bottom actions |
| Mate70 create/detail/filter | A personal place can be created or imported and then opened in detail with filters/layers reachable |
| Mate70 import/export | `.foodmap.json` import/export path remains visible and local-first copy is preserved |
| Mate70 valid share | A valid read-only share route opens from the fixed URL and does not expose edit controls |
| Refresh persistence | Local IndexedDB data or imported snapshot remains readable after refresh/reopen |
| Failure states | Source-down, tile failure, missing-share, external-map/copy fallback, and installability fallback are honest |
| Regression | P18-P24 accepted baseline tests and scanlist remain green |
| Final report | `p25-final-acceptance-report.md` records URL, host profile, commands, screenshots, blockers, and residual limits |

P25 evidence output path:

```text
docs/active/evidence/p25/
```

P25 final report must distinguish durable static URL evidence from the accepted P24 temporary public deployment smoke. Desktop mobile emulation can support development but cannot replace Mate70 fixed-URL evidence.

## P24 Evidence Addendum

P24 adds WebApp and real-device evidence over accepted P23. It proves FoodMap can become a mobile-friendly, app-like WebApp without claiming HarmonyOS native delivery, account sync, cloud backup, collaboration, or public permanent sharing.

Required P24 command evidence:

```bash
npm run build
npm run verify:p24:webapp
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic|P19|P20-C|P21|P22|P23"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P24"
```

The P24 Playwright config uses default port `53241`, `--strictPort`, and `reuseExistingServer: false` so that browser tests fail fast instead of reusing an unrelated local app on `5173` or `5174`.

Required P24 evidence:

| Scenario | Required Assertion |
| --- | --- |
| Static deployment smoke | Built app opens from a static host URL with `#/map` and `#/share/:snapshotId` routes |
| WebApp identity | App name, icon, theme color, launch URL, display mode, and unsupported-install fallback are evidenced |
| P24 browser metadata | `P24 WebApp metadata, offline notice and hash routes are present` passes and captures `01-webapp-offline-notice.png` |
| P24 mobile shell | `P24 mobile WebApp shell keeps controls inside the Mate-style viewport` passes and captures `02-mobile-webapp-shell.png` |
| P24 mobile persistence/share | `P24 mobile readonly share and local data remain usable after refresh` passes and captures `03-mobile-share-and-refresh.png` |
| P24 local static preview | `vite preview` serves `dist/` on `127.0.0.1:53242` and captures `04-static-preview-map.png` plus `05-static-preview-missing-share.png` |
| P24 Mate70 HDC route smoke | HDC reverse forwarding opens `#/map` and missing-share fallback on Mate70; captures `06-mate70-hdc-map.jpeg` and `07-mate70-hdc-missing-share.jpeg` |
| Mate70 real device | HarmonyOS Mate70 opens deployed URL and completes map/detail/filter/import/export/share paths |
| Mobile safe area | Search, quick filters, bottom actions, dialogs, sheets, keyboard states, and share panels are not hidden by browser/system bars |
| Local persistence | IndexedDB personal data and share snapshots survive refresh/reopen on Mate70 or documented equivalent |
| Portability | `.foodmap.json` export/import remains the only cross-device path and does not imply cloud sync |
| Weak-network fallback | Tile failure, external-map failure, installability unavailable, and offline/weak states show clear copy |
| Regression | P18-P23 accepted baseline tests and scanlist remain green |

P24 evidence output path:

```text
docs/active/evidence/p24/
```

P24 final report must include Mate70 screenshot or recording references. Desktop mobile emulation can support development but cannot replace Mate70 evidence.

Required Mate70 completion evidence:

| Evidence file | Required content |
| --- | --- |
| `08-mate70-workspace-entry.*` | Map workspace route with map, search, quick filters, WebApp status, and bottom actions visible on Mate70 |
| `09-mate70-filter-detail.*` | Filter/layer action and one place detail visible and reachable on Mate70 |
| `10-mate70-import-or-create.*` | Import personal data or create a personal place without cloud-sync wording |
| `11-mate70-export-package.*` | `.foodmap.json` export path visible and local-first wording preserved |
| `12-mate70-valid-share.*` | Valid local read-only share route, not only missing snapshot fallback |
| `13-mate70-refresh-persistence.*` | Refresh/reopen evidence that local data or imported snapshot remains readable |
| `14-mate70-installability.*` | Install/add-to-home behavior or unsupported fallback evidence |
| `15-mate70-failure-states.*` | Offline/weak-network/tile/external-map fallback evidence or documented blocker |

---

## P23 Evidence Addendum

P23 adds corrective evidence over P22. It proves that the accepted share and governance paths are usable instead of merely present.

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P23"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P21 responsive"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts
```

Required P23 evidence:

| Scenario | Required Assertion |
| --- | --- |
| Mobile read-only marker detail | Marker click opens selected-place summary, not an obscured full sheet |
| Mobile read-only full detail | Explicit expand shows full read-only detail and no edit controls |
| 320px quick filters | Dock, sheet, and bottom action bar fit within viewport |
| Data health panel | Panel opens at readable width with real imported personal data |
| Governance panel | Tabs/actions wrap without clipped or vertical action text |
| Regression | P21 responsive and full workspace E2E pass |

P23 evidence output path:

```text
docs/active/evidence/p23/
```

---

## P22 Evidence Addendum

P22 adds interaction-shell evidence over accepted P21/P20/P19 baselines.

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P22 workspace shell"
```

Required P22 evidence:

| Scenario | Required Assertion |
| --- | --- |
| Desktop read-only share | Share page shows map, layer panel, detail panel, readonly notice |
| Mobile read-only share | Share page exposes 图层/清单/详情 navigation |
| Missing snapshot recovery | Missing route shows direct `.foodmap.json` import action and no-op errors |
| Wide health/governance panels | Data health and governance width meet readable threshold |
| Mobile map dock | 390x844 top dock stays compact and summary text is hidden |
| Regression | P21 targeted and core P19/P20 scenarios stay green |

P22 evidence output path:

```text
docs/active/evidence/p22/
```

---

Updated: 2026-06-23

## Summary

This matrix defines the browser and command evidence needed to prove P19 satisfies the PRD, target architecture, P19 stage contract, P18 accepted regression baseline, and pure-frontend product boundary.

Additional real-data command gate:

- `npm run verify:scanlist` must pass and verify the 50-entry scanlist baseline.

## Required Commands

```bash
npm run build
npm test -- --run
npm run verify:scanlist
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

P19 implementation added targeted Playwright cases for the new stage work:

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 responsive"
```

## P19 Workstream Evidence Map

| Workstream | Required Evidence |
| --- | --- |
| W19-A 验收环境可复现 | Restore notes, browser dependency setup, targeted P18 regression tests runnable |
| W19-B 当前视野分享图 | Current filter vs current viewport mode, bounds-backed count, PNG non-empty, empty viewport fallback |
| W19-C 个人数据健康中心 | Health grouping counts, drill-in/filter/detail/workbench actions, no hidden mutation |
| W19-D Domain/Repository 收口 | Unit tests for shared location transforms, Agent negative regression |
| W19-E 多尺寸回归 | 390x844, 430x932, 768x900, 1280x820 screenshots/E2E |
| W19-F 文档和治理 | P19 final acceptance report with PRD/architecture/gate review |

## Required Test Data

| Fixture | Purpose |
| --- | --- |
| Clean profile | Empty personal map and first-run behavior |
| 32 personal Wuhan favorites | Detail, filters, health, poster source sets |
| 10+ pending personal places | Pending workbench and health grouping |
| 3+ high-risk places | Health grouping and navigation downgrade |
| 2+ manual-adjusted places | Audit visibility and health grouping |
| skipped confirmation sample | Health grouping and next actions |
| 50 scanlist entries | Real-data recommendation regression |
| 120 Dingtuyi reference pins | Reference layer and density regression |
| 500/1000/3000 simulated personal points | Large deterministic performance regression |

## P19 Browser Scenarios

| ID | Scenario | Evidence |
| --- | --- | --- |
| P19-E2E-01 | Acceptance environment restore | Required commands run or blocker is documented with exact missing dependency |
| P19-E2E-02 | P18 large deterministic regression | Existing P18 large deterministic test passes |
| P19-E2E-03 | Agent negative regression | Existing Agent structured-error test passes |
| P19-E2E-04 | Poster current-filter mode remains stable | Preview count and exported PNG match current filtered personal places |
| P19-E2E-05 | Poster current-viewport mode uses map bounds | Pan/zoom changes source count; exported PNG uses visible-place set |
| P19-E2E-06 | Poster empty viewport fallback | Empty viewport shows empty state and blocks/makes explicit export behavior |
| P19-E2E-07 | Data health summary appears | Verified, pending, high-risk, manual-adjusted, skipped counts are visible |
| P19-E2E-08 | Data health next actions are non-mutating | Health actions focus/filter/open detail/workbench without changing coordinates |
| P19-E2E-09 | Domain/repository guardrail regression | Candidate confirmation and manual move still require explicit confirmation |
| P19-E2E-10 | Mobile health and poster path | 390x844 and 430x932 can open health/poster without clipped core actions |
| P19-E2E-11 | Tablet/narrow desktop path | 768x900 and 1280x820 keep map/detail/filter/poster usable |
| P19-E2E-12 | Scanlist/reference regression | Scanlist and Dingtuyi remain optional reference layers |

## Stable Selector Strategy

Existing selectors remain required:

- `workspace-map`
- `workspace-search`
- `workspace-add-place`
- `layer-panel`
- `place-editor`
- `place-detail`
- `filter-panel`
- `share-snapshot-dialog`
- `import-export-dialog`
- `share-view`

P19 implementation should add selectors for:

- `poster-mode-current-filter`
- `poster-mode-current-viewport`
- `poster-source-count`
- `poster-empty-viewport`
- `data-health-center`
- `data-health-group`
- `data-health-action`

## Evidence Output

Save P19 evidence under:

```text
docs/active/evidence/p19/
```

Required final report fields:

- Build output summary.
- Unit test output summary.
- Scanlist verification summary.
- Playwright output summary.
- Browser dependency/environment notes.
- Screenshot paths.
- Current viewport poster evidence.
- Data health evidence.
- Agent negative evidence.
- Known issues and severity.

Current P19 screenshot evidence:

- `docs/active/evidence/p19/mobile-390-data-health.png`
- `docs/active/evidence/p19/mobile-390-poster.png`
- `docs/active/evidence/p19/mobile-430-data-health.png`
- `docs/active/evidence/p19/mobile-430-poster.png`
- `docs/active/evidence/p19/tablet-768-data-health.png`
- `docs/active/evidence/p19/tablet-768-poster.png`
- `docs/active/evidence/p19/desktop-1280-data-health.png`
- `docs/active/evidence/p19/desktop-1280-poster.png`

---

# FoodMap P20-C E2E Test And Evidence Matrix

## Summary

P20 core E2E evidence proves the currently implemented governance baseline. P20-C E2E evidence must prove the original P20 PRD completion: multiple safe batch actions, duplicate ignore/keep/merge decisions, import strategy selection, stale-reference grouping, governance report export, and cancel no-op paths, without breaking P19 accepted flows or overstepping pure-frontend boundaries.

## Required Commands

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
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20-C"
```

## Required Test Data

| Fixture | Purpose |
| --- | --- |
| 32+ personal Wuhan favorites | Governance workbench, duplicate suggestions, history |
| 10+ pending personal places | Queue, batch skip/tag, workbench routing |
| 3+ high-risk places | Risk grouping and protected actions |
| 2+ manual-adjusted places | History and audit fallback |
| skipped sample | Skipped grouping and batch review |
| stale-reference sample | Stale-reference grouping and safe next actions |
| 3+ duplicate candidate pairs | Duplicate comparison and merge preview |
| import package with new/update/duplicate/risk/skipped rows | Import conflict dry-run |
| 50 scanlist entries | Real-data recommendation regression |
| 120 Dingtuyi reference pins | Reference-layer regression |

## P20 Browser Scenarios

| ID | Scenario | Evidence |
| --- | --- | --- |
| P20C-E2E-01 | Governance workbench opens from health center | Groups, queue, counts, and stale-reference visible |
| P20C-E2E-02 | Safe batch previews | At least three operation types list affected records before write |
| P20C-E2E-03 | Batch cancel no-op | Local records and journal unchanged after cancel |
| P20C-E2E-04 | Duplicate ignore | Evidence compare visible; ignore keeps records and writes history |
| P20C-E2E-05 | Duplicate keep separate | Keep decision keeps both records and writes history |
| P20C-E2E-06 | Duplicate merge | Merge preview requires confirmation and writes history |
| P20C-E2E-07 | Import conflict strategy | New/update/duplicate/risk/skipped plan visible with strategy selection before writes |
| P20C-E2E-08 | Import cancel no-op | Local records unchanged after cancel |
| P20C-E2E-09 | Governance report export | Downloaded report matches workbench counts and journal summaries |
| P20C-E2E-10 | Agent negative | Bulk modify/delete/merge/import/hide/finalize attempts fail |
| P20C-E2E-11 | Responsive governance | 390x844, 430x932, 768x900, 1280x820 paths reachable |
| P20C-E2E-12 | P18/P19/P20 regression | P19 poster/data health and P20 core tests pass |

## Evidence Output

Save P20 evidence under:

```text
docs/active/evidence/p20/
```

---

# FoodMap P21 E2E Test And Evidence Matrix

## Summary

P21 E2E evidence proves the original V1.0 local share and data portability release experience: a user can generate a local read-only snapshot, export `.foodmap.json`, import it in a clean profile, view the read-only share page, and recover safely from missing or invalid import states without cloud or account capabilities.

## Required Commands

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster|P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20-C|P20 governance|P20 import conflict|P20 agent governance"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P21 share portability|P21 import safety|P21 read only share"
```

## Required Test Data

| Fixture | Purpose |
| --- | --- |
| 32+ personal Wuhan favorites | Snapshot/export/share content |
| 3+ layers with visible/hidden states | Read-only layer toggle |
| Places with ratings, visit dates, tags, notes, addresses | Share detail parity |
| Places with thumbnails | Thumbnail portability |
| Exported `.foodmap.json` fixture | Clean profile import |
| Invalid JSON and unsupported schema packages | Failure no-op |
| Missing snapshot id route | Fallback copy |
| 50 scanlist entries | Real-data recommendation regression |
| P20-C governance sample | Regression baseline |

## P21 Browser Scenarios

| ID | Scenario | Evidence |
| --- | --- | --- |
| P21-E2E-01 | Snapshot generation summary | Local/read-only copy, title, counts, generated time visible |
| P21-E2E-02 | Export package inspection | Downloaded JSON contains schema/version, metadata, places, layers, thumbnails |
| P21-E2E-03 | Clean profile import | Empty IndexedDB imports package and opens `#/share/:snapshotId` |
| P21-E2E-04 | Read-only share detail | Share page renders map, layers, pins, details, thumbnails, rating, visit date, tags, notes |
| P21-E2E-05 | Read-only guard | No create/edit/delete/upload/save/account/cloud/public-link controls are present |
| P21-E2E-06 | Missing snapshot fallback | Missing id explains local-only import requirement and offers recovery path |
| P21-E2E-07 | Invalid import no-op | Bad package shows error and leaves IndexedDB facts unchanged |
| P21-E2E-08 | Agent share/import negative | Agent cannot forge public sharing or bypass import confirmation |
| P21-E2E-09 | Responsive share/export/import | 390x844, 430x932, 768x900, 1280x820 paths reachable |
| P21-E2E-10 | P18/P19/P20-C regression | Accepted baseline tests remain green |

## Stable Selector Strategy

P21 implementation should add or reuse selectors for:

- `share-snapshot-dialog`
- `snapshot-portability-summary`
- `export-foodmap-json`
- `import-export-dialog`
- `import-readonly-snapshot`
- `import-governance-preview`
- `import-error-message`
- `share-view`
- `share-readonly-notice`
- `share-missing-snapshot`
- `share-layer-toggle`
- `share-place-detail`

## Evidence Output

Save P21 evidence under:

```text
docs/active/evidence/p21/
```

Required final report fields:

- Build/unit/scanlist output summary.
- P18/P19/P20-C regression summary.
- P21 targeted Playwright summary.
- Exported JSON evidence path.
- Clean profile import evidence.
- Invalid import no-op evidence.
- Read-only share guard evidence.
- Responsive screenshot paths.
- PRD/architecture deviation review.
- Known issues and severity.
