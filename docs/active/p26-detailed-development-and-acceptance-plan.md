# P26 Detailed Development And Acceptance Plan

## Status

Implementation and final acceptance are complete. Mate70 fixed-URL evidence for the P26 build has been captured and recorded in `p26-final-acceptance-report.md`.

P26 follows the accepted P25 fixed-URL static WebApp baseline. P26 implements mobile release experience hardening, release-gate automation, Mate70 interaction support, local data maintenance enhancement, and evidence governance.

P26 must not claim HarmonyOS native HAP/AppGallery delivery, account login, cloud sync, backend API, offline map tiles, permanent public social sharing, automatic data repair, or external realtime POI completion.

## Target User Experience

After P26 implementation and acceptance, a Mate70 user can open the fixed FoodMap URL, understand whether the app is running normally or in a fallback state, complete the core map/create/detail/filter/import/export/share paths with fewer mobile interaction failures, and maintain local data with clear previews and explicit confirmations. Automated browser evidence and Mate70 fixed-URL evidence now support this direction.

The project maintainer should be able to run a repeatable release gate that proves the fixed URL, hash routes, real scanlist, accepted P18-P25 flows, and P26 targeted paths are still valid before claiming release readiness.

## Phase Plan

| Phase | Development Scope | Acceptance Evidence | PRD Review Focus |
| --- | --- | --- | --- |
| P26-1 文档审计与边界冻结 | Align PRD, target architecture, development plan, roadmap, gate, gap/drawio, stage contract, E2E matrix, and visual checklist | `p26-1-acceptance-report.md` | Closed |
| P26-2 移动端发布体验硬化 | Improve WebApp runtime state, offline copy, missing share recovery, and local storage transparency | `p26-2-acceptance-report.md`, P26 screenshots, Mate70 fixed-URL screenshots | Closed |
| P26-3 发布门禁自动化 | Create verifier command, evidence manifest, route checks, and regression bundle | `verify:p26:release`, `release-gate-manifest.json` | Closed |
| P26-4 Mate70 交互精修 | Improve mobile release/data package/share/governance flows for phone-sized interaction | `p26-4-acceptance-report.md`, P26 screenshots, Mate70 fixed-URL screenshots | Closed |
| P26-5 本地数据维护增强 | Improve governance/import write summaries and cancel/no-op clarity | `p26-5-acceptance-report.md`, P26 targeted E2E | Closed |
| P26-6 回归与证据包 | Run full regression, collect screenshots/JSON, verify docs consistency, and review PRD coverage | `p26-6-regression-and-prd-review.md` | Automated scope closed |
| P26-7 总验收 | Create final acceptance report only after implementation evidence exists | `p26-final-acceptance-report.md` | Accepted |

## Development Contracts

- P26 work starts from the accepted P25 GitHub Pages URL and must not replace it with HDC-only, local preview, or temporary tunnel acceptance.
- Desktop mobile viewport evidence can support development but cannot replace Mate70 real-device evidence.
- Release gate automation must include real `npm run verify:scanlist` before claiming recommendation layer validity.
- Local maintenance changes must keep IndexedDB and `.foodmap.json` as the only persistence and portability routes.
- Any duplicate merge, conflict handling, import write, coordinate update, or cleanup operation must show preview, support cancel/no-op, and require explicit user confirmation.
- Agent Bridge must remain unable to finalize coordinates, delete, merge, import, hide risk, or bypass confirmation.

## Required Evidence

| Evidence | Required Before Acceptance |
| --- | --- |
| Commands | `npm ci` if dependencies changed or environment is rebuilt; `npm run build`; `npm test -- --run`; `npm run verify:scanlist`; static deployment verifier; P18-P25 regression; P26 targeted checks |
| Real device | Mate70 fixed-URL screenshots or recording for entry, workspace, create/detail/filter, import/export, share, refresh, and fallback states |
| Real data | 50 verified AMap Wuhan scanlist pins, personal places, pending/high-risk/manual/skipped records, duplicates, and import conflict fixtures |
| Docs | PRD, target architecture, plan, roadmap, gate, gap/drawio, E2E matrix, visual checklist, stage contract, audit, final report |
| Reports | Per-substage acceptance notes or evidence manifest plus final acceptance report |

## Initial Audit Opinion

Go for P26 implementation after user review of the drawio direction and completion of this documentation set. The current plan is intentionally bounded: it improves the accepted static WebApp release and local maintenance experience without creating native, cloud, backend, offline map, realtime POI, or public social-share obligations.
