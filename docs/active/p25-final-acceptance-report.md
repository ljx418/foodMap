# FoodMap P25 Final Acceptance Report

Date: 2026-06-25

## Decision

`Accepted.`

P25 implementation, GitHub Pages deployment, deployed-origin browser acceptance, real scanlist verification, P18-P24 automated regression, and Mate70 fixed-URL real-device evidence passed. FoodMap can now be described as a pure-frontend, local-first WebApp served from a stable GitHub Pages URL, with the limits recorded below.

## Implemented Scope

- GitHub Pages stable URL: `https://ljx418.github.io/foodMap/`.
- Durable Pages source: `gh-pages` branch root.
- Vite Pages build profile for `/foodMap/`.
- P25 deployment verifier for local `dist/` and deployed URL.
- Playwright deployed-origin path using `FOODMAP_DEPLOY_URL`.
- Mate70 fixed-URL evidence for workspace, create, detail, data package, local read-only snapshot, share refresh, and missing-share fallback.

## Deployment Evidence

| Item | Result |
| --- | --- |
| Main implementation commit | `c14cf896c2b2b185be80e4a3f3d414770a1711d5` |
| P25 evidence sync commit | `da9b9b883b8f4e306c8b223fe523a7e402692fcf9` |
| `gh-pages` commit | `9559f1993e976a4422b8759f31a797b96a16d094` |
| Pages status | `built` |
| URL | `https://ljx418.github.io/foodMap/` |
| HTTPS enforced | `true` |
| Build type | `legacy` branch source |

GitHub Actions workflow deployment was not used because the available OAuth token cannot create or update workflow files without `workflow` scope. The durable `gh-pages` branch source is the accepted fallback for P25.

## Automated Acceptance

| Gate | Result |
| --- | --- |
| `npm run build` | Passed on 2026-06-25 after Mate70 evidence |
| `npm test -- --run` | Passed, 46 tests |
| `npm run verify:scanlist` | Passed, 50 entries |
| `FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ npm run verify:p25:deployment` | Passed |
| `npm run build:pages` | Passed before Pages publish |
| `npm run verify:p24:webapp` | Passed before final P25 evidence |
| P18 + Agent negative | Passed before final P25 evidence |
| P19/P20-C/P21/P22/P23 targeted | Passed before final P25 evidence |
| P24 targeted | Passed before final P25 evidence |
| P25 deployed browser E2E | Passed before final P25 evidence |
| Full desktop workspace Playwright | Passed before final P25 evidence, 58 passed / 6 skipped |

## Mate70 Evidence

| Scenario | Result | Evidence |
| --- | --- | --- |
| HDC tooling and device | Passed: `hdc.exe` Ver `3.2.0c`, Huawei-signed, device `3AP0224B14092043` USB connected | Command output in session; model `CLS-AL00`, API version `23` |
| Fixed URL workspace | Passed: Mate70 browser opened `ljx418.github.io` and displayed FoodMap `#/map` workspace | `docs/active/evidence/p25/01-mate70-fixed-url-workspace.jpeg` |
| Create personal place | Passed: `P25Mate70TestPlace` was entered and saved from the fixed URL | `03`, `04`, `06`, `07` Mate70 screenshots |
| Detail path | Passed: saved place detail opened with map/navigation/copy actions visible | `docs/active/evidence/p25/08-mate70-detail.jpeg` |
| Data package | Passed: `.foodmap.json` export/import options are visible and local-first | `docs/active/evidence/p25/10-mate70-data-package.jpeg` |
| Local read-only snapshot | Passed: generated snapshot shows one place and states it is not a permanent public link | `docs/active/evidence/p25/11-mate70-snapshot-dialog.jpeg`, `12-mate70-snapshot-generated.jpeg` |
| Valid share route | Passed: generated `https://ljx418.github.io/foodMap/#/share/...` opened on Mate70 | `docs/active/evidence/p25/13-mate70-share-open.jpeg` |
| Share detail | Passed: read-only share detail shows `P25Mate70TestPlace` | `docs/active/evidence/p25/14-mate70-share-detail.jpeg` |
| Refresh persistence | Passed: browser refresh preserved the read-only share route and marker | `docs/active/evidence/p25/15-mate70-share-refresh.jpeg` |
| Failure fallback | Passed: missing share route shows FoodMap-owned `.foodmap.json` recovery copy | `docs/active/evidence/p25/16-mate70-missing-share-fallback.jpeg` |

## PRD Review

P25 satisfies PRD 4L:

- Mate70 opens the stable GitHub Pages URL directly.
- `#/map` and valid `#/share/:snapshotId` work from the stable URL.
- A personal place can be created on Mate70 and remains visible after saving.
- Data portability stays local through IndexedDB and `.foodmap.json`.
- Read-only snapshot sharing is local and explicitly not a public permanent link.
- Refresh preserves the local share view.
- Failure fallback is FoodMap-owned and does not imply cloud repair or data loss.
- Build, unit tests, real scanlist, deployed-origin verifier, and regression evidence are recorded.

P25 does not claim account login, cloud sync, remote backup, multiplayer collaboration, FoodMap backend API, HarmonyOS native HAP, AppGallery release, offline map tiles, permanent public social sharing, or completed external realtime POI search.

## Residual Limits

- The accepted deployment route is GitHub Pages through the `gh-pages` branch, not GitHub Actions automation.
- Mate70 evidence was captured through HDC-controlled browser interaction and screenshots, but the product URL itself was the stable GitHub Pages URL, not HDC reverse forwarding, local preview, or a temporary tunnel.
- Source-down service-worker fallback remains covered by automated verifier and prior browser evidence; the phone-level failure evidence in this run covers missing-share recovery.

## Exit Decision

P25 exits as `Accepted` on 2026-06-25.
