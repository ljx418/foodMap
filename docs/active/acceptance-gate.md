# FoodMap P19/P20-C/P21/P22/P23/P24/P25/P26/P27 Acceptance Gate

## P27 Gate Status

Current status: `Implementation in progress / not accepted`.

P27 is the mainland China public access stage after accepted P26. It can be accepted only when FoodMap is served from a stable public HTTPS mainland-facing static host URL that requires no private console login, no expiring preview token, no LAN/HDC routing, no temporary tunnel, and no GitHub Pages dependency for mainland production use.

P27 must preserve FoodMap's pure frontend, local-first, static WebApp architecture. It must not be described as a HarmonyOS native app, AppGallery release, account system, cloud sync, backend service, offline map product, public permanent social share platform, automatic data repair product, or external realtime POI search completion.

## P27 必过门槛

| Gate | Pass Criteria | Fail Criteria |
| --- | --- | --- |
| 文档与审计 | PRD、目标架构、计划、gate、roadmap、gap/drawio、mainland profile、P27 plan、P27 audit define the same P27 scope and non-goals | Docs conflict, over-promise native/cloud/backend/offline/realtime/public-share capability, or declare the P27 stage complete before final evidence |
| Drawio 架构 | Drawio <= 8 pages, Chinese, with concrete code/deploy/runtime/data/evidence entities, interaction relationships, status colors, plan, milestone, gate, and exit conditions | Diagram stays abstract, omits code entities, duplicates/conflicts content, or cannot support architecture assessment |
| 稳定大陆公网 URL | URL is not GitHub Pages, opens over HTTPS, and is reachable without private login, expiring preview token, LAN IP, HDC reverse forwarding, local preview, or temporary tunnel | Only GitHub Pages, LAN/HDC/local preview/tunnel, or EdgeOne protected preview evidence exists |
| 合规与外部条件 | ICP/custom-domain/HTTPS/provider status is recorded; paid or console-side operations have explicit user approval | Provider requires payment/domain/ICP/console changes and implementation proceeds without user approval |
| 构建与本地验证 | `npm run build:mainland`, `npm run build:edgeone`, and `npm run verify:mainland:deployment` pass or have documented non-product blocker | Static artifact cannot be verified or uses the wrong GitHub Pages base path |
| 部署门禁 | `EDGEONE_DRY_RUN=1 EDGEONE_PROJECT_NAME=foodmap npm run deploy:edgeone` is safe; real deploy does not print or persist secrets | Deploy command requires tracked credentials, prints tokens, or cannot be dry-run safely |
| 远端验证 | `FOODMAP_MAINLAND_DEPLOY_URL=<stable-url> npm run verify:mainland:deployment` passes against the public URL | Remote verifier fails, URL requires login/token, or route refresh/assets/manifest/service worker fail |
| 浏览器 smoke | Browser evidence covers `#/map`, refresh, missing-share fallback, manifest/service worker/static assets, and source-down/data-boundary clarity | Evidence is stale, desktop-only without deployed origin, or does not prove public URL behavior |
| Mate70 公网体验 | Mate70 opens the stable public URL and completes P26 accepted smoke paths: workspace, detail/filter, data package, share fallback or valid share, refresh recovery, status visibility | Only desktop emulation, local LAN, HDC-only, GitHub Pages, or protected preview is shown |
| P18-P26 回归边界 | Existing accepted scanlist, Agent, local data, share/import/export, governance, and release diagnostics boundaries remain green or have documented non-product blockers | P27 breaks accepted baseline or changes user-data semantics |
| Secret 安全 | Docs, drawio, reports, command logs, screenshots, and examples do not contain API tokens, cookies, SecretKey values, or full protected-preview query tokens | Any secret or full preview token is committed or quoted |
| 最终报告 | P27 final report records provider, URL, ICP/HTTPS status, command results, screenshots, PRD review, blockers, residual limits, and non-goals | P27 is claimed accepted without final report or with false/stale/protected-preview evidence |

Current P27 gate result: not accepted. P27-1 through P27-4 can be locally verified through documentation, route classification, deployment dry-run, EdgeOne protected-preview deployment, real scanlist, P26 release gate, and P27 release verifier. Stable public mainland URL evidence, remote browser smoke, Mate70 public-URL evidence, and final report are still missing. Public domain registration, ICP filing, DNS binding, and HTTPS certificate setup are bypassed and blocked as external prerequisites in the current development run.

## P26 Gate Status

P26 is accepted after the accepted P25 fixed-URL baseline. P26 is now the latest accepted implementation baseline. P26 browser-scope implementation, automated regression, deployed fixed-URL checks, and Mate70 fixed-URL P26 evidence passed as recorded in `p26-final-acceptance-report.md`.

P26 must preserve FoodMap's pure frontend, local-first, static WebApp architecture. It must not be described as a HarmonyOS native app, AppGallery release, account system, cloud sync, backend service, offline map product, public permanent social share platform, automatic data repair product, or external realtime POI search completion.

## P26 必过门槛

| Gate | Pass Criteria | Fail Criteria |
| --- | --- | --- |
| 文档与审计 | PRD、目标架构、计划、gate、roadmap、gap/drawio、E2E matrix、visual checklist define the same P26 scope and non-goals | Docs conflict, over-promise native/cloud/backend/offline/realtime/public-share capability, or omit user-visible acceptance |
| Drawio 架构 | Drawio <= 8 pages, Chinese, with concrete code entities, interaction/layer relationships, module status colors, plan, milestone, gate, and exit conditions | Diagram stays abstract, duplicates/conflicts content, or cannot support architecture assessment |
| P25 回归基线 | P25 fixed URL, hash-route recovery, source-down fallback, real scanlist, P18-P25 accepted flows, and Agent boundaries remain green | P26 breaks accepted deployment, share/import/export, governance, candidate trust, or Agent constraints |
| 移动端发布体验 | Mate70 user sees clear fixed-URL entry, WebApp/browser mode, source-down, tile failure, missing share, and refresh behavior | Evidence is desktop-only, HDC-only, stale, or implies cloud/native/offline behavior |
| 发布门禁自动化 | Release verifier and evidence manifest make build/unit/scanlist/static deployment/hash route/regression checks repeatable | Gate relies on manual memory, temporary URL, untracked screenshots, or unrepeatable commands |
| Mate70 交互 | Real-device screenshots or recording prove create/detail/filter/import/export/share paths are readable, reachable, and not blocked by keyboard/safe-area/browser chrome | Key actions are hidden, clipped, overlapped, or only proven in desktop emulation |
| 本地数据维护 | Real data or fixtures prove health/governance/import/duplicate/conflict flows are preview-first, cancelable, user-confirmed, and local-only | Silent delete/merge/repair/finalize occurs, or cloud/account/backend writes are introduced |
| 证据与报告 | P26 final report records commands, screenshots/JSON, Mate70 evidence, PRD review, blockers, residual limits, and non-goals | P26 is claimed accepted without final report or with false/stale evidence |

Current P26 gate result: accepted. Mate70 fixed-URL P26 evidence exists for release state, missing share recovery, data health, governance workbench, data package, create, filter, detail, and refresh recovery. Import preview/cancel no-write is covered by P26 targeted Playwright evidence plus Mate70 data package/governance reachability screenshots.

## P25 Gate Status

Current status: `Accepted`.

P25 is the accepted durable static deployment and release-governance stage after accepted P24. P25 was the latest accepted implementation baseline until P26 acceptance; P26 is now the current latest baseline.

P25 was not accepted from HDC-only testing, local `vite preview`, a temporary tunnel, or desktop mobile emulation alone. It passed with a stable GitHub Pages URL, direct hash-route recovery, real Mate70 fixed-URL evidence, P18-P24 regression, and an accepted final report. The implemented URL target is GitHub Pages for `ljx418/foodMap`: `https://ljx418.github.io/foodMap/`.

P25 must not be described as a HarmonyOS native app, AppGallery release, account system, cloud sync, backend service, offline map product, public permanent social share platform, or external realtime POI search completion.

## P25 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档与审计 | PRD、目标架构、计划、gate、roadmap、gap/drawio、matrix、visual checklist define P25 as durable static deployment and release governance | Docs claim native HAP/AppGallery, cloud sync, backend API, permanent social share, or P25 accepted before evidence |
| 稳定静态部署 | Built `dist/` is served by GitHub Pages at `https://ljx418.github.io/foodMap/`, or an approved fallback static host if GitHub Pages is blocked, without FoodMap backend API | Only local preview, USB reverse, or temporary tunnel evidence exists; fallback host is used without documenting why GitHub Pages failed |
| Hash route fallback | Direct open and refresh work for `#/map` and generated `#/share/:snapshotId` | Static host returns 404/blank page on direct hash routes or refresh |
| Mate70 固定 URL | HarmonyOS Mate70 opens the stable URL and completes workspace, create/detail/filter, import/export, read-only share, and refresh persistence | Only Playwright/mobile emulation exists, or real-device evidence is missing |
| 本地持久化与可携带 | IndexedDB and `.foodmap.json` remain the only persistence/portability model and survive refresh/reopen | UI implies cloud backup/sync, account recovery, or remote shared state |
| 失败态 | Source-down, tile failure, missing-share, external-map/copy fallback, and installability-unavailable states are understandable and non-destructive | Failure copy looks like data loss, cloud repair, or successful native/offline capability |
| 回归 | build/unit/scanlist/P18-P24 targeted or full regression remain green | P25 breaks accepted candidate, governance, share/import/export, mobile, or Agent boundaries |
| 最终报告 | P25 final report records GitHub Pages profile or fallback rationale, durable URL, screenshots, Mate70 evidence, commands, blockers, and residual limits | P25 is claimed accepted without final report or without fixed-URL Mate70 evidence |

## P24 Gate Status

Current status: `Accepted`.

P24 has WebApp app-like assets, mobile-safe layout improvements, offline/tile fallback copy, static build metadata checks, local `vite preview` smoke, HDC-connected Mate70 workflow screenshots, temporary public HTTPS static deployment smoke, valid public `#/share/:snapshotId` evidence, targeted P24 browser evidence, and full local `workspace.spec.ts` regression. P24 is accepted with the documented limitation that the public URL was a temporary acceptance tunnel, not a permanent hosting endpoint.

P24 must not be described as a HarmonyOS native app, AppGallery release, cloud sync, public permanent sharing, or offline map product.

## P24 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档与审计 | PRD、目标架构、计划、gate、roadmap、gap/drawio、matrix、visual checklist define P24 as WebApp-first Mate70 usability | Docs describe P24 as HarmonyOS native app, cloud sync, account system, collaboration, or public permanent sharing |
| WebApp 资产 | App name, icon, theme color, launch URL, display mode, and viewport policy are implemented or explicitly blocked with fallback | No app identity exists, or installability is claimed without browser support evidence |
| 静态部署 | Built app can be served by a static host and opened on mobile without FoodMap backend API | Any required P24 path depends on account, cloud, or custom backend service |
| Mate70 实机 | HarmonyOS Mate70 opens deployed URL and completes required main paths with screenshot/recording evidence | Only Playwright/mobile emulation exists, or real-device evidence is missing |
| 移动安全区 | Map, search, quick filters, bottom actions, sheets, dialogs, and keyboard states remain usable with browser chrome/safe area | Core actions are hidden behind system/browser bars or keyboard |
| 本地持久化 | IndexedDB data and share snapshots survive refresh/reopen; `.foodmap.json` remains the cross-device path | UI implies cloud backup/sync, or local data loss is unexplained |
| 弱网和失败态 | Tile failure, external-map failure, installability unavailable, and weak/offline states show understandable fallback | Failure states look like data loss or successful cloud behavior |
| 回归 | build/unit/scanlist/P18-P23 targeted/full workspace gates remain green | P24 breaks accepted candidate, governance, share, import/export, or Agent boundaries |
| 最终报告 | P24 final report records commands, static deployment URL/profile, screenshots, Mate70 evidence, blockers, and residual limits | P24 is claimed done without final report or without Mate70 evidence |

## P24 Mate70 Completion Gate

The current evidence proves that Mate70 can complete FoodMap's required main paths through USB reverse forwarding and through a temporary public HTTPS static deployment smoke. It does not prove durable production hosting.

| User-visible path | Required evidence |
| --- | --- |
| Workspace entry | Passed through HDC evidence: `08-mate70-workspace-entry.jpeg` shows `#/map` with map, search, quick filters, and bottom actions |
| Detail and filtering | Passed through HDC evidence: `09-mate70-filter-detail.jpeg` shows a real created place detail and mobile actions |
| Import/export | Passed through HDC evidence: `11-mate70-export-package.jpeg` shows `.foodmap.json` data package actions without cloud-sync copy |
| Valid read-only share | Passed through HDC evidence: `12-mate70-valid-share.jpeg` shows an actual generated `#/share/:snapshotId` route, not only missing-share fallback |
| Local persistence | Passed through HDC evidence: `13-mate70-refresh-persistence.jpeg` shows the generated read-only share remains readable after refresh |
| Installability | Passed with limitation: `14-mate70-installability.jpeg` shows the Mate70 browser `添加至桌面` entry; no native HarmonyOS package is claimed |
| Public static deployment | Passed: `16` through `19` show Mate70 opening the temporary public HTTPS URL, creating a place, opening valid share, and refreshing successfully |
| Failure states | Passed with scoped evidence: `15` shows external-map/copy fallback actions and `22` shows source-down FoodMap fallback after service-worker fix; phone network toggles were not performed |

---

## P23 Gate Status

Current status: `Accepted`.

P23 is a correction gate over P22 interaction evidence. It can be declared complete only after the corrected mobile share path, 320px quick-filter path, health/governance readability, screenshot evidence, P21 responsive regression, and full workspace regression pass.

P23 acceptance status: accepted by `docs/active/p23-final-acceptance-report.md`.

## P23 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档与审计 | P23 plan/audit/final report describe correction scope without new feature over-claim | P23 is described as cloud share, backend governance, or automatic repair |
| 移动只读分享 | Marker/list/detail actions open a selected-place summary first; full detail requires explicit expand | Detail is covered by bottom nav or user cannot reach full detail |
| 面板层级 | Share mobile nav is hidden while panel is open and panel stays inside viewport | Bottom nav/header obscures summary or full detail |
| 320px 快捷筛选 | Dock, quick-filter sheet, and bottom action bar do not horizontally overflow | Controls are clipped or unreachable at 320px |
| 健康/治理可读 | Data health and governance panels have readable width; governance action text wraps cleanly | Narrow strip, clipped buttons, or vertical action text appears |
| 回归 | P21 responsive share and full workspace Playwright pass | P23 breaks accepted share/import/governance/candidate flows |
| 真实数据 | `npm run verify:scanlist` passes with 50 verified entries | Scanlist verification is skipped or fails |
| 最终报告 | P23 final report records commands, screenshots, issues found, and residual boundaries | P23 is claimed accepted without browser evidence |

---

## P22 Gate Status

Current status: `Accepted`.

P22 can be declared complete only after interaction-shell changes pass code review, PRD review, browser regression, screenshot evidence, and final acceptance reporting.

P22 acceptance status: accepted by `docs/active/p22-final-acceptance-report.md`; P23 supersedes P22 interaction evidence for the corrected mobile share and governance/data-health readability paths.

## P22 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档一致 | PRD、目标架构、计划、gap/drawio、矩阵和 final report 描述 P22 为交互体验收口 | 文档仍把 P22 误写成云分享、后台治理或实时 POI 阶段 |
| 只读分享页 | 桌面端图层、地图、详情、只读提示同时可见；移动端图层/清单/详情可切换 | 分享页仍像编辑工作台，或详情/图层不可见 |
| 缺失快照恢复 | 缺失 snapshot route 可直接导入 `.foodmap.json`，错误导入 no-op | 用户只能返回工作台，或失败写入 partial data |
| 工作台面板可读 | 数据健康/治理宽面板达到可读阈值，操作文案不纵向挤压 | 面板被压成窄条或按钮文字不可读 |
| 移动控制可达 | 390x844 顶部 dock 紧凑且不遮挡主地图路径 | dock 或底部操作遮挡核心流程 |
| 文案一致 | `数据包`、`分享图`、`快照` 在 UI 和 E2E 中一致 | 用户仍难区分导入导出、海报、快照 |
| 回归 | P21 targeted、P19/P20 core targeted、build/unit/scanlist 通过 | 任一 accepted baseline 破坏 |
| 最终报告 | P22 final acceptance report 记录截图、命令、边界和残余风险 | 没有 final report 就宣称接受 |

---

## P19 Gate Status

Current status: `Accepted`.

P18 is accepted and becomes the regression baseline. P19 can be declared complete only after documentation consistency, acceptance-environment reproducibility, current-viewport poster mode, personal data health, domain/repository consolidation, responsive regression, real-data verification, Agent negative boundaries, and final reporting all pass.

## P19 工作流验收编排

| Workstream | Required Evidence | Must Pass Before |
| --- | --- | --- |
| W19-A 验收环境可复现 | Restore notes, Playwright dependency path, build/unit/scanlist, targeted browser tests | P19 feature acceptance and P19 total acceptance |
| W19-B 当前视野分享图 | Map bounds source, preview count, export count, PNG non-empty, empty viewport fallback | P19-2 and P19 total acceptance |
| W19-C 个人数据健康中心 | Health summary groups, drill-in/filter actions, no hidden uncertainty | P19-3 and P19 total acceptance |
| W19-D Domain/Repository 收口 | Unit tests for location workflows, UI/Agent shared guardrails, no direct pending finalization | P19-4 and P19 total acceptance |
| W19-E 多尺寸回归 | 390x844, 430x932, 768x900, 1280x820 screenshots/E2E | P19-5 and P19 total acceptance |
| W19-F 文档和治理 | PRD, architecture, plan, gate, roadmap, gap, drawio, contract, final report aligned | P19-1, P19-6, P19-7 |

## P19 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档一致 | Active docs all describe P19 as current stage and P18 as accepted baseline | Active docs still describe P18 as current unfinished scope |
| Drawio 完整 | `current-vs-target-gap.drawio` contains overview, architecture gap, development plan, milestones, gates/exit conditions | Diagram omits architecture, acceptance, or exit conditions |
| 验收环境 | Browser dependency setup is documented and targeted Playwright can run in the accepted environment | Playwright cannot launch and no documented fix/alternate runner exists |
| P18 回归 | P18 large deterministic and Agent negative tests remain part of required gate | P19 bypasses P18 regression evidence |
| 当前视野模式 | Poster composer uses real viewport bounds and exports the same set shown in preview | Current viewport remains disabled or exports wrong places |
| 空视野 fallback | Empty viewport shows clear empty state and does not export misleading pins | Empty viewport silently exports current filter or all places |
| 数据健康 | Personal places are grouped by verified, pending, high-risk, manual-adjusted, skipped | Uncertain or high-risk places are hidden or auto-marked verified |
| 健康处理路径 | Health summary can focus/filter/open detail/workbench without changing facts | Health panel mutates coordinates or status without user confirmation |
| Domain 收口 | Candidate confirmation/manual move/pending status use shared domain paths and tests | UI and Agent maintain separate truth or write coordinates directly |
| Agent 边界 | Agent cannot finalize coordinates, delete pending places, or hide uncertainty | Any prohibited action succeeds |
| 多尺寸主路径 | Detail, filters, data health, and poster composer remain usable on required viewports | Core actions are clipped, overlapped, or unreachable |
| 真实数据 | `npm run verify:scanlist` passes with 50 verified scanlist entries | Scanlist baseline fails or is skipped |
| 命令回归 | Build, unit tests, scanlist, targeted Playwright pass | Any required command fails without documented blocker severity |
| 最终报告 | P19 final acceptance report records evidence and residual boundaries | P19 is declared done without final report |

## P19 Required Fixtures

| Fixture | Purpose |
| --- | --- |
| 扫街榜 50 条 | Recommendation/reference regression |
| 钉图易参考层 120 条 | Reference layer and map density regression |
| 个人收藏 30+ 条 | Data health, filters, detail, poster source data |
| 待确认个人地点 10+ 条 | Pending workbench and Agent negative regression |
| 高风险地点 3+ 条 | Health grouping and navigation downgrade |
| 手动校准地点 2+ 条 | Audit visibility and health grouping |
| skipped/pending skipped 状态样例 | Health grouping and next action clarity |
| 500/1000/3000 点模拟数据 | Large dataset smoke regression |

## P19 Manual And Evidence Scenarios

1. Clean restore and dependency setup.
2. Confirm P18 accepted baseline still works through targeted Playwright.
3. Open share poster composer with current filter, verify count and PNG.
4. Pan/zoom map, switch to current viewport, verify bounds-backed count and PNG.
5. Use an empty viewport and verify empty-state behavior.
6. Open data health center and verify all trust groups.
7. Use health center to focus/filter/open a pending or high-risk place.
8. Confirm candidate and manual move flows still require user confirmation.
9. Run Agent negative boundary checks.
10. Capture required responsive screenshots.
11. Run scanlist baseline.
12. Create P19 final acceptance report.

## P19 Exit Conditions

P19 exits only when:

- All P19 blocker gates pass.
- P18 regression gates remain green.
- Current viewport poster mode is real and evidenced.
- Personal data health is visible and actionable without hidden mutation.
- Domain/repository contracts match implementation or documented staged changes.
- Browser acceptance can be reproduced.
- Active docs and drawio match the implemented scope.
- P19 final acceptance report exists.

P19 acceptance status: accepted by `docs/active/p19-7-final-acceptance-report.md`.

---

## P20 Gate Status

Current status: `P20-C Accepted`.

P20-C passed build, unit, scanlist, P18/P19/P20 regression, P20-C targeted Playwright, full Playwright, and final acceptance reporting on 2026-06-24. Future work must treat P20-C as the regression baseline for original P20 personal data governance completion.

## P20 工作流验收编排

| Workstream | Required Evidence | Must Pass Before |
| --- | --- | --- |
| W20C-A 计划与证据基线 | P20-C PRD/architecture/contract/gate review, fixtures, browser path | P20-C feature implementation |
| W20C-B 治理工作台补齐 | Grouped issue queues, stale-reference, at least three batch previews, no hidden mutation | P20C-2 and P20-C total acceptance |
| W20C-C 重复地点决策 | Duplicate evidence comparison and ignore/keep/merge decisions | P20C-3 and P20-C total acceptance |
| W20C-D 导入冲突策略 | Dry-run import plan, strategy selection, cancel no-op | P20C-4 and P20-C total acceptance |
| W20C-E 维护历史与报告 | Journal entries tied to governance writes and local report export | P20C-5 and P20-C total acceptance |
| W20C-F Agent/响应式回归 | Agent negative and 390/430/768/1280 screenshots/E2E | P20C-6 and P20-C total acceptance |
| W20C-G 总验收 | Build/unit/scanlist/P18/P19/P20 regression/P20-C targeted/final report | P20C-7 |

## P20 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档一致 | Active docs define P20-C as active completion stage, P19 as accepted baseline, and P20 core as regression baseline | Docs claim full original P20 PRD completion before P20-C evidence |
| Drawio 完整 | Current diagram remains under 8 pages and reflects target experience, architecture gap, entities, plan, milestones, gates, and exit conditions | Diagram conflicts with PRD/architecture scope or omits acceptance conditions |
| 治理工作台 | Groups and queue show real personal data issues including stale-reference with safe next actions | Summary counts mutate facts or hide uncertainty |
| 批量预览 | At least three safe batch actions show affected records, write fields, cancel path, and confirmation before writing | Bulk action writes without preview or fewer than three PRD operation types exist |
| 重复建议 | Evidence comparison is visible and ignore/keep/merge decisions are supported | Auto-merge, auto-delete, similarity-only merge, or missing ignore/keep path |
| 导入冲突 | Import dry-run classifies new/update/duplicate/risk/skipped and supports strategy selection plus cancel no-op | Import writes before strategy confirmation or risk/skipped rows are silently ignored |
| 维护历史 | Governance writes append readable history entries for batch, duplicate decisions, import, candidate, and manual move actions touched by P20-C | Actions cannot be audited or history becomes editable source fact |
| 治理报告 | User can export a local governance report matching workbench groups, decisions, import summaries, and journal facts | Report is missing, stale, or diverges from UI facts |
| Agent 边界 | Agent cannot bulk modify, delete, merge, hide risk, or finalize coordinates | Any prohibited action succeeds |
| 多尺寸主路径 | Governance, duplicate compare, import preview, report export, and history are reachable on required viewports | Core actions are clipped, overlapped, or unreachable |
| 真实数据 | `npm run verify:scanlist` passes with 50 verified scanlist entries | Scanlist baseline fails or is skipped |
| P19 回归 | P19 current viewport poster and data health targeted tests remain green | P20 breaks P19 accepted user flows |
| P20 core 回归 | Existing P20 governance, import, journal, Agent, and responsive paths remain green | P20-C breaks previously implemented governance core |
| 最终报告 | P20-C final acceptance report records evidence and residual boundaries | Full P20 PRD completion is declared without P20-C final report |

## P20-C 出门条件

P20-C exits only when:

- P18 and P19 accepted baselines remain green.
- P20 core regression remains green after the completion work.
- Governance workbench exposes pending, high-risk, manual-adjusted, skipped, duplicate, import-conflict, and stale-reference groups.
- At least three safe batch operation types pass preview, cancel no-op, confirm, persistence, and journal tests.
- Duplicate suggestions support ignore, keep separate, and merge with user-visible evidence and no automatic delete.
- Import conflict preview supports strategy selection for new, update, duplicate, risk, and skipped classes; cancel leaves IndexedDB unchanged.
- Governance history and report export match the same domain facts shown in the UI.
- Agent cannot execute prohibited governance writes.
- Required responsive screenshots/E2E pass.
- `npm run build`, `npm test -- --run`, `npm run verify:scanlist`, P19 regression, P20 regression, P20-C targeted Playwright, and final report all pass.

P20-C acceptance status: accepted by `docs/active/p20-c-final-acceptance-report.md`.

---

## P21 Gate Status

Current status: `Accepted`.

P21 acceptance status: accepted by `docs/active/p21-final-acceptance-report.md`; P22 and P23 keep this local share/data portability baseline as regression coverage.

P21 was declared complete only after local share snapshot generation, `.foodmap.json` export package completeness, clean profile import, read-only share guardrails, invalid import no-op, Agent share/import boundaries, responsive evidence, P18/P19/P20-C regression, and final reporting passed.

## P21 工作流验收编排

| Workstream | Required Evidence | Must Pass Before |
| --- | --- | --- |
| W21-A 发布计划与审计基线 | P21 PRD/architecture/contract/gate/gap/drawio review and audit | P21 feature implementation |
| W21-B 分享快照可信生成 | Snapshot summary, local/read-only copy, title/count/time metadata | P21-2 and total acceptance |
| W21-C 导出包完整性 | Downloaded JSON schema/version, metadata, places, layers, thumbnails | P21-3 and total acceptance |
| W21-D clean profile 导入与只读页 | Empty IndexedDB import, share route open, no edit controls | P21-4 and total acceptance |
| W21-E 失败安全与 Agent 边界 | Invalid import no-op, missing snapshot fallback, Agent negative | P21-5 and total acceptance |
| W21-F 多尺寸与证据包 | 390/430/768/1280 screenshots, JSON/IndexedDB evidence, scanlist | P21-6 and total acceptance |
| W21-G 总验收 | Build/unit/scanlist/P18/P19/P20-C regression/P21 targeted/final report | P21-7 |

## P21 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档一致 | Active docs define P21 as the accepted local share/data portability baseline and keep P20-C as the accepted governance baseline | Docs still describe P21 as planned/unfinished current work, P20-C as unfinished, or over-claim cloud/public sharing |
| Drawio 完整 | Diagram remains under 8 pages and reflects target experience, architecture gap, entities, plan, milestones, gates, and exit conditions | Diagram omits share/import/export architecture or over-claims cloud sharing |
| 分享快照生成 | User sees local-only/read-only meaning, title, place/layer/photo counts, generated time | Snapshot generation hides what will be exported |
| 导出包完整 | `.foodmap.json` includes schema/version, snapshot metadata, places, layers, thumbnail-only photos | Export cannot reconstruct read-only share or depends on remote/original blobs |
| clean profile 导入 | Empty profile import opens the matching `#/share/:snapshotId` | Import requires existing profile state or silently fails |
| 只读分享页 | Share page displays map/layers/details/thumbnails and no create/edit/delete/upload/save/account/cloud controls | Any edit or write control is visible or usable |
| 缺失/错误安全 | Missing snapshot and invalid import show clear copy and do not mutate IndexedDB | Partial writes occur before validation or error copy is absent |
| Agent 边界 | Agent cannot forge public links, bypass import confirmation, or mutate imported data | Any prohibited action succeeds |
| 多尺寸主路径 | Export, import, share route, fallback copy usable on required viewports | Core actions are clipped, overlapped, or unreachable |
| 真实数据 | `npm run verify:scanlist` passes with 50 verified scanlist entries | Scanlist baseline fails or is skipped |
| 回归 | P18/P19/P20-C accepted gates remain green | P21 breaks candidate trust, viewport poster, data health, or governance |
| 最终报告 | P21 final acceptance report records evidence and residual boundaries | P21 is declared done without final report |

## P21 Required Fixtures

| Fixture | Purpose |
| --- | --- |
| 32+ personal Wuhan favorites | Snapshot/export/share content |
| Multiple layers | Read-only layer toggle and counts |
| Places with ratings, visit dates, tags, notes, addresses | Share detail parity |
| Places with thumbnails | Photo portability |
| Invalid JSON package | Import failure no-op |
| Unsupported schema package | Schema rejection copy |
| Missing snapshot id | Share fallback copy |
| 50 scanlist entries | Real-data recommendation regression |
| P20-C governance sample | Regression that import/export does not corrupt governance baseline |

## P21 Exit Conditions

P21 exits only when:

- All P21 blocker gates pass.
- P18/P19/P20-C accepted baselines remain green.
- Exported `.foodmap.json` can be imported into a clean profile and opened as a read-only share snapshot.
- Invalid import and missing snapshot fallback are evidenced as no-op/safe states.
- Agent boundary remains read/suggest only for share/import/export.
- Active docs and drawio match the implemented scope.
- P21 final acceptance report exists.
