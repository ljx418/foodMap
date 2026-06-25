# FoodMap P25 Final Acceptance Report

Date: 2026-06-25

## Decision

`Not accepted yet.`

P25 implementation, GitHub Pages deployment, deployed-origin browser acceptance, real scanlist verification, and P18-P24 automated regression passed. P25 cannot be accepted because Mate70 fixed-URL real-device evidence could not be captured in the current environment: `hdc` / `hdc.exe` is unavailable.

## Implemented Scope

- GitHub Pages stable URL: `https://ljx418.github.io/foodMap/`.
- Durable Pages source: `gh-pages` branch root.
- Vite Pages build profile for `/foodMap/`.
- P25 deployment verifier for local `dist/` and deployed URL.
- Playwright deployed-origin path using `FOODMAP_DEPLOY_URL`.
- P25 evidence screenshots for deployed workspace, readonly share, and hash-route refresh.

## Deployment Evidence

| Item | Result |
| --- | --- |
| Main branch commit | `c14cf896c2b2b185be80e4a3f3d414770a1711d5` |
| `gh-pages` commit | `9559f1993e976a4422b8759f31a797b96a16d094` |
| Pages status | `built` |
| URL | `https://ljx418.github.io/foodMap/` |
| HTTPS enforced | `true` |
| Build type | `legacy` branch source |

GitHub Actions workflow deployment was not used because the available OAuth token cannot create or update workflow files without `workflow` scope. The durable `gh-pages` branch source is the accepted fallback for this run.

## Automated Acceptance

| Gate | Result |
| --- | --- |
| `npm run build` | Passed |
| `npm run build:pages` | Passed |
| `npm test -- --run` | Passed |
| `npm run verify:scanlist` | Passed |
| `npm run verify:p24:webapp` | Passed |
| `npm run verify:p25:deployment` | Passed locally and remotely |
| P18 + Agent negative | Passed |
| P19/P20-C/P21/P22/P23 targeted | Passed |
| P24 targeted | Passed |
| P25 deployed browser E2E | Passed |
| Full desktop workspace Playwright | Passed, 58 passed / 6 skipped |

## Screenshot Evidence

| Evidence | Path |
| --- | --- |
| Deployed workspace | `docs/active/evidence/p25/github-pages-workspace.png` |
| Deployed readonly share | `docs/active/evidence/p25/github-pages-share.png` |
| Hash route refresh | `docs/active/evidence/p25/hash-route-refresh.png` |

## PRD Review

P25 satisfies the automated portions of PRD 4L:

- Stable static URL exists.
- `#/map` and valid `#/share/:snapshotId` work in browser E2E.
- IndexedDB and `.foodmap.json` remain the only persistence and portability model.
- No backend, account, cloud sync, native HarmonyOS package, AppGallery release, permanent public share platform, offline map tiles, or realtime POI completion is claimed.

P25 does not yet satisfy the Mate70 real-device gate. Desktop/browser evidence cannot replace Mate70 fixed-URL screenshots or recording.

## Blocking Item

| Blocker | Severity | Required Closure |
| --- | --- | --- |
| `hdc` / `hdc.exe` unavailable in current shell | Release blocker | Install or expose HDC tooling, then capture Mate70 fixed-URL workspace, detail/import/export/share/refresh/fallback evidence |

## Exit Decision

P25 remains `Implemented / deployed / automated-regression passed / blocked on Mate70 real-device evidence`.

Do not mark P25 accepted until the Mate70 fixed-URL evidence is captured and this report is updated.
