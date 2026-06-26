# P26-6 Regression And PRD Review

## Status

Regression passed. Supersession note: final P26 acceptance later passed after Mate70 P26 fixed-URL evidence was captured.

## Commands

| Command | Result |
| --- | --- |
| `npm run build` | Passed. |
| `npm test -- --run` | Passed. 46 tests passed. |
| `npm run verify:scanlist` | Passed. 50 real AMap Wuhan scanlist entries verified. |
| `npm run verify:p24:webapp` | Passed. |
| `npm run build:pages` | Passed. |
| `npm run verify:p25:deployment` | Passed against local Pages-profile `dist`. |
| `npm run verify:p26:release` | Passed and wrote the P26 manifest. |
| `LD_LIBRARY_PATH=.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P26"` | Passed. 2 tests passed. |
| `LD_LIBRARY_PATH=.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop` | Passed. 60 passed, 6 skipped. |
| `LD_LIBRARY_PATH=.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=mobile` | Passed. 20 passed, 46 skipped. |
| `FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ npm run verify:p25:deployment` | Passed for accepted P25 fixed URL. |
| `LD_LIBRARY_PATH=.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25 deployed"` | Passed. |

## Evidence

- `docs/active/evidence/p26/release-gate-manifest.json`
- `docs/active/evidence/p26/01-mobile-release-status.png`
- `docs/active/evidence/p26/02-missing-share-recovery.png`
- `docs/active/evidence/p26/03-local-maintenance-import-preview.png`
- `docs/active/evidence/p26/04-local-maintenance-cancelled.png`

## PRD Coverage Review

| PRD 4M Goal | Evidence | Status |
| --- | --- | --- |
| Mobile release experience hardening | P26 WebApp diagnostics, offline copy, missing share recovery screenshots and E2E | Passed automated scope |
| Release gate automation | `verify:p26:release` and manifest | Passed |
| Mate70 interaction polish | Mobile viewport screenshots, mobile Playwright regression, and Mate70 fixed-URL evidence in `p26-final-acceptance-report.md` | Passed |
| Local data maintenance enhancement | Governance/import write summaries and cancel/no-op E2E | Passed |
| Evidence governance | P26 reports and manifest | Passed automated scope |

## Supersession And Residual Limit

The earlier device-evidence blocker is closed by the final P26 Mate70 fixed-URL evidence. HDC recovered enough to open the deployed URL and capture P26 screenshots on Mate70. The remaining residual limit is not a P26 exit blocker: HarmonyOS file-picker import preview was not automated on the physical device, so import preview/cancel no-write is covered by targeted Playwright plus Mate70 data package/governance reachability evidence.
