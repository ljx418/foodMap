# P26 Stage Audit 2026-06-26

## Decision

Accepted with documented residual limits.

This audit reran the P26 stage against the original PRD, active target architecture, current code, documentation set, browser automation, deployed fixed URL, and existing Mate70 evidence. No fatal or major PRD drift remains after the documentation corrections recorded below.

## Scope

- Code review for P26 implementation files and current acceptance-sensitive flows.
- Documentation audit for PRD, target architecture, roadmap, acceptance gate, stage plan, P26 substage reports, and final acceptance report.
- Functional checks through build, unit tests, real scanlist verification, deployment verifiers, and Playwright browser acceptance.
- Screenshot-backed visual acceptance report at `docs/active/automated-acceptance-report-2026-06-26-p26-stage-audit.html`.

## Command Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| `npm run build` | Passed | Vite production build completed; bundle `index-CJAw3Sqq.js` generated. |
| `npm test -- --run` | Passed | 46 unit tests passed. |
| `npm run verify:scanlist` | Passed | 50 real Wuhan AMap scanlist entries verified. |
| `npm run verify:p24:webapp` | Passed | WebApp manifest, icon, service worker and metadata checks passed. |
| `npm run build:pages` | Passed | GitHub Pages profile build completed. |
| `npm run verify:p25:deployment` | Passed | Local `dist` Pages profile checks passed. |
| `FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ npm run verify:p25:deployment` | Passed | Remote fixed URL static checks passed. |
| `npm run verify:p26:release` | Passed | P26 release manifest written to `docs/active/evidence/p26/release-gate-manifest.json`. |
| `LD_LIBRARY_PATH=.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop` | Passed | 60 passed, 6 skipped. |
| `LD_LIBRARY_PATH=.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=mobile` | Passed | 20 passed, 46 skipped. |
| `LD_LIBRARY_PATH=.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25 deployed"` | Passed | 1 deployed-origin fixed URL test passed. |
| `git diff --check` | Passed | No whitespace errors. |

## PRD Coverage Review

| PRD Area | Current Evidence | Audit Result |
| --- | --- | --- |
| Local-first Wuhan food map | IndexedDB repositories, personal favorites, scanlist verification, map workspace E2E | Covered. |
| Real data acceptance | `verify:scanlist` passed with 50 AMap Wuhan entries | Covered. |
| Candidate/search trust boundary | P18/P19/P20 regression and Agent negative tests remain covered in desktop Playwright | Covered. |
| Read-only local share and `.foodmap.json` portability | P21/P23/P25/P26 tests and screenshots | Covered. |
| Mobile-friendly WebApp on Mate70 | P24/P25/P26 Mate70 screenshots, fixed URL evidence, mobile viewport regression | Covered within browser-delivered WebApp scope. |
| No account/cloud/permanent public share claim | PRD, README, target architecture, ShareView copy, data package copy | Covered. |
| Local maintenance preview/cancel/no-write | P20-C and P26 targeted E2E, governance/import screenshots | Covered. |
| Native HarmonyOS HAP/AppGallery delivery | Explicitly out of scope for P26 | Not implemented by design. |

## Code Review Findings

1. `WebAppStatus` correctly exposes release target, local IndexedDB state, service worker state, and offline copy without implying cloud sync or native installation.
2. `ShareView` missing-snapshot recovery correctly frames share routes as local snapshots and points users to `.foodmap.json`, not a public cloud copy.
3. `ImportExportDialog`, `GovernanceWorkbench`, and `MapWorkspace` preserve preview-first import behavior and provide a cancel/no-write path.
4. `scripts/verify_p26_release.mjs` provides a repeatable release gate manifest and is included in the npm script surface.
5. P26 Playwright tests cover honest mobile release diagnostics, missing share recovery, and import-preview cancel/no-write behavior.

No blocking code issue was found in this audit.

## Documentation Audit Findings

Resolved during this audit:

- `README.md` had stale wording that could still be read as "P26 not accepted"; corrected to the accepted P26 baseline.
- `README.md` audit list had duplicate numbering; corrected so the review set remains below 20 documents.
- `p26-2-acceptance-report.md`, `p26-4-acceptance-report.md`, and `p26-6-regression-and-prd-review.md` still contained historical Mate70 blocker language; updated with supersession notes pointing to final P26 evidence.
- `target-architecture.md` and `acceptance-gate.md` still contained a stale "P25 latest accepted baseline" statement; corrected to P26 as the current latest baseline.
- `development-and-acceptance-plan.md` P26-4 acceptance column still said real-device evidence was pending; corrected to final-report closure.

## Residual Limits

- The Mate70 acceptance evidence proves the P26 fixed URL, release diagnostics, missing share recovery, data health, governance workbench, data package, create sheet, filter sheet, detail sheet, and refresh recovery.
- HarmonyOS system file-picker import preview was not automated on the physical Mate70. Import preview/cancel no-write remains proven by targeted Playwright plus Mate70 reachability screenshots for data package and governance entry points.
- P26 remains a static WebApp stage. It does not claim HarmonyOS native HAP, AppGallery release, account login, cloud sync, backend APIs, offline map tiles, permanent public share links, automatic data repair, or completed external realtime POI search.

## Exit Assessment

P26 remains accepted. The current documentation, implementation, tests, screenshot evidence, and final acceptance report now align closely enough to support future development from the P26 baseline without additional high-risk clarification.
