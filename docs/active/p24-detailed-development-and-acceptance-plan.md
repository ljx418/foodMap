# FoodMap P24 Detailed Development And Acceptance Plan

Date: 2026-06-25

## Decision

`P24 implementation in progress: automated WebApp implementation passed; final acceptance blocked by real static deployment URL and Mate70 evidence.`

P24 targets a mobile-friendly, app-like WebApp that can be statically deployed and used on a HarmonyOS Mate70. It does not introduce accounts, cloud sync, remote backup, multiplayer collaboration, public permanent share links, native HarmonyOS packaging, AppGallery release, backend services, automatic data repair, or completed external real-time POI search.

## Stage Goal

After P24 implementation, a user should be able to open a deployed FoodMap URL on Mate70 and complete the accepted personal map workflows:

1. Open `#/map` and inspect the map.
2. Search/filter and open place details.
3. Add or import personal places.
4. Export/import `.foodmap.json`.
5. Generate and view a local read-only share snapshot.
6. Refresh or reopen and see local data preserved.
7. Understand fallback states when installability, map tiles, external map handoff, or network conditions fail.

## Workstreams

| Workstream | Development Scope | Acceptance Evidence |
| --- | --- | --- |
| P24-1 文档审计与边界收口 | Align PRD, architecture, plan, gate, roadmap, gap/drawio, E2E matrix, visual checklist, README | Audit report, `git diff --check`, no forbidden future-route language |
| P24-2 WebApp 身份与安装资产 | Add manifest, app name, icons, theme color, display mode, launch URL, unsupported-install fallback copy | Implemented; `npm run verify:p24:webapp` and P24 metadata E2E pass |
| P24-3 Mate70 移动主路径 | Safe-area layout, browser chrome tolerance, touch targets, keyboard behavior, bottom actions, modal/sheet stacking | Desktop mobile E2E/screenshots pass; Mate70 screenshots/recording still required |
| P24-4 静态部署与弱网 fallback | Static host deployment profile, route handling, tile failure, external-map failure, weak/offline copy | Built asset smoke, local static preview, and offline notice E2E pass; Mate70-reachable deployed URL smoke still required |
| P24-5 本地数据和可携带回归 | IndexedDB persistence after refresh/reopen, `.foodmap.json` export/import, read-only share portability | P24 refresh/share E2E passes with local fixture data |
| P24-6 总验收和报告 | Build/unit/scanlist/P18-P23 regression/P24 E2E/static smoke/Mate70 evidence/final report | `p24-final-acceptance-report.md` exists but records not accepted until missing evidence is supplied |

## Technical Route

| Area | Required Direction |
| --- | --- |
| Application form | Browser-delivered WebApp using the existing Vite React app |
| Deployment | Static build output served from a normal static host |
| Data model | IndexedDB remains source of truth; `.foodmap.json` remains cross-device portability |
| WebApp identity | Manifest, icon set, theme color, launch URL, and display policy when browser-supported |
| Install fallback | If Mate70 browser does not expose install/add-to-home behavior, show accurate fallback guidance and record limitation |
| Offline/weak network | P24 may add app-shell level fallback, but it must not claim offline map tiles or cloud backup |
| Native path | HarmonyOS ArkTS/ArkWeb native shell is out of scope for P24 and must be planned separately if pursued |

## Acceptance Commands

```bash
npm run build
npm run verify:p24:webapp
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic|P19|P20-C|P21|P22|P23"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P24"
```

The Playwright config uses `FOODMAP_E2E_PORT` or default `53241` with `--strictPort` and `reuseExistingServer: false` to avoid testing an unrelated local app. P24 final acceptance also requires static deployment smoke and Mate70 real-device evidence. Desktop Playwright mobile viewports are not sufficient for acceptance. The execution-level Mate70 checklist is `docs/active/p24-mate70-real-device-acceptance-script.md`.

## Evidence Requirements

Save P24 evidence under:

```text
docs/active/evidence/p24/
```

Minimum evidence:

- WebApp metadata/manifest inspection.
- Static deployment smoke screenshot or log; local preview evidence does not replace Mate70-reachable URL evidence.
- 320/390/430 mobile viewport screenshots.
- Mate70 `#/map` screenshot or recording matching M70-1 in the real-device script.
- Mate70 filter/detail/import/export/read-only share screenshots or recording matching M70-2 through M70-5.
- Refresh/reopen local persistence proof matching M70-6.
- Failure fallback evidence for installability unavailable, tile failure, external-map failure, and weak/offline states.

## Exit Decision Rule

P24 can be accepted only if all blocker gates pass and `docs/active/p24-final-acceptance-report.md` records:

- Commands and results.
- Static deployment URL/profile.
- Mate70 device/browser version when available.
- Screenshot or recording references.
- Known limitations.
- Explicit statement that P24 did not deliver account/cloud/collaboration/public-share/native-app capabilities.
