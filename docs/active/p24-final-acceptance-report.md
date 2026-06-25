# FoodMap P24 Final Acceptance Report

Date: 2026-06-25

## Decision

`Accepted.`

P24 WebApp implementation is accepted for the current scope. The final missing gates were closed on 2026-06-25 after the user unlocked the Mate70:

- A temporary public HTTPS static deployment profile was created with Cloudflare Tunnel over a static `dist/` server: `https://pour-bottom-offices-bluetooth.trycloudflare.com`.
- The user's Mate70 opened that public URL directly, completed `#/map`, created a personal place, generated a real `#/share/:snapshotId`, opened the valid read-only share route, and survived refresh with screenshots.
- Source-down failure behavior was verified non-destructively by stopping the static origin behind the public URL. After fixing the service worker, Mate70 showed FoodMap's own Chinese fallback page instead of Cloudflare 502 or a blank screen.

This is not a production hosting claim. The Cloudflare URL was a temporary acceptance tunnel and has no uptime guarantee. P24 still does not deliver a HarmonyOS native package, account sync, cloud backup, public permanent sharing, or AppGallery release.

The accepted failure-state scope is non-destructive: public-origin source outage, local-data preservation copy, map/external-copy fallback evidence, and service-worker fallback behavior. Phone airplane-mode or carrier/Wi-Fi toggling was not performed to avoid changing the user's device network state.

## Implemented Scope

| Area | Result |
| --- | --- |
| WebApp identity | `manifest.webmanifest`, SVG icon, theme color, viewport-fit, app-capable metadata, and app name are implemented |
| App shell fallback | Production service worker caches app shell and returns a Chinese FoodMap fallback page for source/network failures; it does not claim offline map tiles or cloud backup |
| Mobile fallback copy | Browser/WebApp status and offline notice explain local-first behavior and Mate70 evidence requirement |
| Map tile failure copy | Leaflet tile errors show that map tiles failed while local records remain preserved |
| Static smoke | `npm run verify:p24:webapp` checks built metadata, manifest, icon, and service worker in `dist/`; `vite preview` local static smoke passed on `127.0.0.1:53242` |
| Mate70 HDC workflow | HDC connected to `HUAWEI Mate 70` (`CLS-AL00`, OpenHarmony `6.1.0.115`, API `23`); `rport tcp:53242 tcp:53242` opened `#/map`, create/detail/export/share/refresh/installability paths were captured on device |
| Mate70 public static workflow | Temporary public HTTPS URL opened on Mate70; `#/map`, create, valid share, refresh, and source-down fallback were captured |
| E2E isolation | Playwright now uses default port `53241`, `--strictPort`, and `reuseExistingServer: false` to avoid false acceptance against another local app |

## Automated Evidence

| Command | Result |
| --- | --- |
| `npm ci` | Passed; npm reported 1 low-severity vulnerability |
| `npm run build` | Passed |
| `npm run verify:p24:webapp` | Passed |
| `npm test -- --run` | Passed, 46/46 |
| `npm run verify:scanlist` | Passed, 50 verified entries |
| `LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P24"` | Passed, 3/3 |
| `LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic\|P19\|P20-C\|P21\|P22\|P23"` | Passed, 16/16 |
| `LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts` | Passed, 78 passed / 48 skipped / 0 failed |
| `npm run preview -- --port 53242 --strictPort` + curl/screenshot smoke | Passed for local `http://127.0.0.1:53242/`, manifest, service worker, and existing map/missing-share screenshot smoke |
| `curl http://192.168.3.123:53242/manifest.webmanifest` | Timed out in current WSL/network environment; not counted as Mate70 evidence |
| `hdc list targets -v` after phone authorization | Passed; device `3AP0224B14092043` connected over USB |
| `hdc rport tcp:53242 tcp:53242` + `aa start -A ohos.want.action.viewData -U http://127.0.0.1:53242/#/map` | Passed; FoodMap map opened on Mate70 through HDC reverse forwarding |
| `hdc snapshot_display` + `hdc file recv` | Passed; Mate70 screenshots captured for map and missing-share fallback |
| Current rerun before unlock `hdc shell aa start -A ohos.want.action.viewData -U http://127.0.0.1:53242/#/map` | Blocked at first; device returned `The device screen is locked during the application launch, unlock screen failed`; no lock-screen screenshot was retained as product evidence |
| Current rerun after user unlocked the phone `hdc rport tcp:53242 tcp:53242` | Passed with an existing reverse-forwarding listener; the duplicate listen message was not a product blocker because `aa start` opened the app route |
| Current rerun after unlock `aa start ... #/map` + HDC screenshots | Passed; workspace entry, create/detail, export package, generated read-only share, refresh persistence, browser add-to-home entry, and external-map/copy fallback were captured |
| `npx -y cloudflared tunnel --url http://127.0.0.1:53242` + `npx -y http-server dist -p 53242 -a 127.0.0.1 -c-1` | Passed; temporary public HTTPS URL served built static assets and `sw.js` |
| Mate70 `aa start ... https://pour-bottom-offices-bluetooth.trycloudflare.com/#/map` | Passed; public static URL opened FoodMap map directly on Mate70 |
| Mate70 public URL create/share/refresh path | Passed; public origin created `PublicDeployNoodle`, generated `#/share/snapshot-9b0c9b38-3360-44bb-af60-11e2821bdb44`, opened read-only share, and survived refresh |
| Source-down fallback audit | Initially failed with Cloudflare 502, then blank app shell; fixed `public/sw.js` to return FoodMap Chinese fallback on non-OK navigation responses; final Mate70 source-down screenshot passed |

P24 screenshot evidence:

- `docs/active/evidence/p24/01-webapp-offline-notice.png`
- `docs/active/evidence/p24/02-mobile-webapp-shell.png`
- `docs/active/evidence/p24/03-mobile-share-and-refresh.png`
- `docs/active/evidence/p24/04-static-preview-map.png`
- `docs/active/evidence/p24/05-static-preview-missing-share.png`
- `docs/active/evidence/p24/06-mate70-hdc-map.jpeg`
- `docs/active/evidence/p24/07-mate70-hdc-missing-share.jpeg`
- `docs/active/evidence/p24/08-mate70-workspace-entry.jpeg`
- `docs/active/evidence/p24/09-mate70-filter-detail.jpeg`
- `docs/active/evidence/p24/10-mate70-import-or-create.jpeg`
- `docs/active/evidence/p24/11-mate70-export-package.jpeg`
- `docs/active/evidence/p24/12-mate70-valid-share.jpeg`
- `docs/active/evidence/p24/13-mate70-refresh-persistence.jpeg`
- `docs/active/evidence/p24/14-mate70-installability.jpeg`
- `docs/active/evidence/p24/15-mate70-failure-states.jpeg`
- `docs/active/evidence/p24/16-mate70-public-deploy-map.jpeg`
- `docs/active/evidence/p24/17-mate70-public-deploy-create-detail.jpeg`
- `docs/active/evidence/p24/18-mate70-public-deploy-valid-share.jpeg`
- `docs/active/evidence/p24/19-mate70-public-deploy-share-refresh.jpeg`
- `docs/active/evidence/p24/20-mate70-origin-down-refresh.jpeg`
- `docs/active/evidence/p24/21-mate70-origin-down-app-shell.jpeg`
- `docs/active/evidence/p24/22-mate70-origin-down-readable-fallback.jpeg`

Evidence note: `08` through `14` are direct Mate70 browser screenshots of the required main path over HDC reverse forwarding. `15` proves share-detail fallback actions including external map and copy affordances; it does not prove destructive weak/offline/tile-failure behavior.
Evidence note: `16` through `19` prove public HTTPS static deployment smoke on Mate70. `20` and `21` are retained as failed audit evidence for source-down handling before the final service-worker fix. `22` proves the corrected source-down fallback page.

## Required Gates

| Gate | Status | Reason |
| --- | --- | --- |
| Full regression | Passed | Build, unit, scanlist, P18-P23 targeted, P24 targeted, and full `workspace.spec.ts` passed locally |
| Local static preview | Passed | `vite preview` served `dist/` on `127.0.0.1:53242`; map and missing-share hash routes captured |
| Mate70 HDC workflow evidence | Passed | USB HDC reverse port forwarding opened FoodMap routes and captured workspace, create/detail, export, share, refresh, installability, and fallback screenshots on Mate70 |
| Externally reachable static deployment | Passed with temporary profile | `https://pour-bottom-offices-bluetooth.trycloudflare.com` served built static assets through a temporary Cloudflare Tunnel and was opened directly on Mate70 |
| Mate70 complete main path | Passed as HDC evidence | `08` through `13` capture workspace, create/detail, export package, valid read-only share, and refresh persistence on the user's Mate70 |
| Installability behavior | Passed with limitation | `14` captures the Mate70 browser menu exposing `添加至桌面`; this is not a native HarmonyOS package or guaranteed system-level PWA installation |
| Failure/fallback states | Passed with scoped evidence | External map/copy fallback is captured in `15`; public source-down fallback was fixed and captured in `22`; phone network toggles were intentionally not performed |

## PRD Review

The implementation remains aligned with the PRD boundary:

- It does not add accounts, cloud sync, collaboration, public permanent share links, or HarmonyOS native packaging.
- It preserves IndexedDB as local source of truth and `.foodmap.json` as the only cross-device portability path.
- It does not claim offline maps; only app-shell fallback and local-data preservation are implemented.
- It does not claim completed external real-time POI search.
- It does not claim the temporary Cloudflare URL is a permanent public share link or production deployment.

## Residual Limits

- The public URL was a temporary acceptance tunnel, not a durable hosting endpoint.
- Airplane mode, carrier data disable, Wi-Fi disable, and other phone-level destructive network toggles were not executed.
- Offline map tiles are not supported; only local app/fallback behavior and local-data preservation messaging are accepted.
- A future production deployment stage should use a durable static host such as GitHub Pages, Cloudflare Pages, Netlify, or an internal static server and repeat the Mate70 smoke path.
