# FoodMap P19/P20-C/P21/P22/P23/P24/P25 Milestone Roadmap

## P25 里程碑

P25 is the current durable static deployment and release-governance stage. It builds on the accepted P24 WebApp/Mate70 baseline and targets a stable static URL plus honest release evidence. It does not implement or claim a HarmonyOS native package, AppGallery release, account system, cloud sync, backend API, offline map tiles, or permanent public social sharing.

| Milestone | Completion Definition | Evidence |
| --- | --- | --- |
| M25-1 文档与审计基线 | Active docs and drawio define P25 durable static deployment scope without native/cloud over-claim | P25 plan, audit, contract, drawio validation |
| M25-2 GitHub Pages 稳定静态部署 profile | Built `dist/` can be hosted at `https://ljx418.github.io/foodMap/` with hash route fallback and no FoodMap backend API, or a fallback route is justified | Static-host profile, direct `#/map` smoke, direct `#/share/:snapshotId` smoke |
| M25-3 Mate70 固定 URL 主路径 | Mate70 opens the durable URL and completes workspace, create/detail/filter, import/export, share, and refresh persistence | Real-device screenshots or recording under `docs/active/evidence/p25/` |
| M25-4 发布失败态 | Source-down, tile failure, missing-share, installability-unavailable, and copy/external-map fallback are honest and non-destructive | Failure-state screenshots plus no-write evidence where relevant |
| M25-5 回归和证据包 | P18-P24 accepted baselines, scanlist, build, unit tests, and P25 targeted browser checks remain green | Command logs, Playwright artifacts, screenshots, JSON evidence |
| M25-6 总验收 | Final report records host profile, durable URL, Mate70 evidence, blocker status, and residual limits | `docs/active/p25-final-acceptance-report.md` after implementation |

## P25 出门条件

- P24 accepted baseline remains green.
- FoodMap is served from the GitHub Pages target `https://ljx418.github.io/foodMap/`, or a documented fallback durable static URL, rather than a temporary tunnel, HDC-only address, or local-only preview.
- Direct entry and refresh work for `#/map` and generated `#/share/:snapshotId` routes.
- Mate70 real-device evidence proves the fixed URL main paths.
- IndexedDB and `.foodmap.json` remain the only user-data persistence and portability model.
- Failure states do not imply cloud recovery, automatic POI repair, backend sync, or native-app capability.
- `npm run build`, `npm test -- --run`, `npm run verify:scanlist`, P18-P24 regression, and P25 targeted checks pass or have documented non-product blockers.
- P25 final acceptance report is created before declaring accepted.

P25 acceptance status: accepted. GitHub Pages deployment, automated browser/regression evidence, real scanlist verification, Mate70 fixed-URL evidence, and final report passed.

## P24 里程碑

| Milestone | Completion Definition | Evidence |
| --- | --- | --- |
| M24-1 文档与审计基线 | Active docs and drawio define P24 WebApp-first Mate70 scope without native/cloud over-claim | P24 plan, audit, contract, drawio validation |
| M24-2 WebApp 身份资产 | App name, icon, theme color, manifest/display/launch policy are implemented or blocked with fallback | Implemented; manifest/icon/static verification pass |
| M24-3 Mate70 移动主路径 | Mate70 can complete map, detail, filters, import/export, and read-only share | HDC workflow and public static URL workflow screenshots pass |
| M24-4 静态部署和弱网 fallback | Static host smoke passes; tile/external-map/installability failures have clear copy | Local static preview, temporary public URL smoke, external-map fallback, and source-down FoodMap fallback pass |
| M24-5 回归和证据包 | build/unit/scanlist/P18-P23 regression/P24 mobile tests pass | Full local automated regression passed |
| M24-6 总验收 | Final report records static deployment profile, Mate70 evidence, blockers, and residual limits | P24 final report accepted with residual limits |

## P24 出门条件

- P23 accepted baseline remains green.
- FoodMap can be served as static build output without a FoodMap backend API.
- WebApp identity is present or browser limitation is recorded with fallback.
- Mate70 real-device evidence proves the core mobile paths.
- Local IndexedDB and `.foodmap.json` remain the only persistence and portability model.
- No account, cloud sync, collaboration, public permanent share, HarmonyOS native app, or AppGallery release is claimed.
- P24 final acceptance report is created before declaring accepted.

P24 acceptance status: accepted; full local automated gates, local static preview, Mate70 HDC workflow, temporary public HTTPS static deployment smoke, valid public share route, installability evidence, and non-destructive source-down fallback evidence pass.

## P24 关闭记录

| Milestone | Completion Definition | Evidence |
| --- | --- | --- |
| M24-7 Mate70 完整主路径 | 地图、筛选、详情、导入导出、有效只读分享、刷新持久化全部在 Mate70 上可见 | `docs/active/evidence/p24/08` through `19` |
| M24-8 安装与失败态 | 安装/快捷入口能力、外部地图 fallback、源站不可用 fallback 被真实记录 | `14`, `15`, `22` |
| M24-9 最终接受 | 所有 P24 blocker 关闭，final report 为 `Accepted` | `docs/active/p24-final-acceptance-report.md` |

---

## P22 里程碑

| Milestone | Completion Definition | Evidence |
| --- | --- | --- |
| M22-1 文档与审计基线 | Active docs and drawio define P22 interaction scope without over-claim | P22 plan and audit |
| M22-2 只读分享页独立化 | Share page exposes layer, map, detail, readonly copy, mobile nav | P21/P22 E2E and screenshots |
| M22-3 缺失快照恢复 | Missing snapshot route imports `.foodmap.json` directly and safely | Missing fallback screenshot/E2E |
| M22-4 工作台可读性 | Health/governance/pending wide panel and compact mobile dock pass browser checks | P22 shell E2E |
| M22-5 回归总验收 | build/unit/scanlist/P21/core/P22 tests pass; final report exists | P22 final acceptance report |

## P22 出门条件

- Accepted P21 local share/import/export behavior remains green.
- Accepted P19/P20 health/governance behavior remains green.
- Desktop share, data health, and governance views are readable.
- Mobile map controls remain compact and reachable.
- No new backend/cloud/public-share/automatic-repair claims are introduced.
- P22 final acceptance report is created.

P22 acceptance status: accepted by `docs/active/p22-final-acceptance-report.md`.

---

## P19 里程碑

| Milestone | Completion Definition | Evidence |
| --- | --- | --- |
| M19-1 文档冻结与验收环境基线 | Active docs and drawio describe P19; P18 is accepted baseline; Playwright dependency risk is documented | Docs audit, drawio XML validation, build/test/scanlist |
| M19-2 当前视野分享图 | Poster composer enables current viewport using real map bounds | Viewport/filter count E2E, PNG non-empty, empty viewport fallback |
| M19-3 个人数据健康中心 | Verified, pending, high-risk, manual-adjusted, skipped groups are visible and actionable | Health center E2E and screenshots |
| M19-4 Domain/Repository 收口 | Location workflow writes and pending state derivation use shared domain/repository paths | Unit tests, Agent negative regression |
| M19-5 多尺寸回归 | Detail, filters, health center, and poster composer remain usable on mobile/tablet/narrow desktop | 390x844, 430x932, 768x900, 1280x820 screenshots |
| M19-6 文档同步复检 | PRD, architecture, plan, gate, gap, contract, E2E matrix, visual checklist match implementation | Documentation audit log |
| M19-7 总验收 | Required commands and browser gates pass; final report records evidence and residual risks | P19 final acceptance report |

## P19 工作流覆盖

| Workstream | Covered Milestones | Completion Definition |
| --- | --- | --- |
| W19-A 验收环境可复现 | M19-1, M19-7 | Restore and targeted browser acceptance can be repeated |
| W19-B 当前视野分享图 | M19-2, M19-5, M19-7 | Poster preview/export uses either current filter or real viewport bounds without ambiguity |
| W19-C 个人数据健康中心 | M19-3, M19-5, M19-7 | Uncertain data is visible, grouped, and linked to next actions |
| W19-D Domain/Repository 收口 | M19-4, M19-7 | UI and Agent share coordinate confirmation guardrails |
| W19-E 多尺寸回归 | M19-5, M19-7 | Required responsive viewports remain usable |
| W19-F 文档和治理 | M19-1, M19-6, M19-7 | Active documents and drawio remain decision-complete |

## P19 出门条件

- P18 accepted baseline remains green.
- Browser acceptance dependencies are documented and runnable in the accepted environment.
- `当前视野` poster mode is enabled, real-bounds-backed, and count-consistent.
- Data health center exposes uncertain and calibrated personal data without hiding risk.
- Candidate confirmation and manual pin move still require explicit user confirmation.
- Agent cannot finalize coordinates, delete pending places, or hide uncertainty.
- Repository/domain contract documents match implemented boundaries.
- Required responsive screenshots/E2E pass.
- `npm run build`, `npm test -- --run`, `npm run verify:scanlist`, and required Playwright gates pass.
- P19 final acceptance report is created.

Historical milestones are archived under `docs/history`; this active roadmap tracks P19.

---

# FoodMap P20-C Milestone Roadmap

P20 core remains a regression baseline. P20-C closed the remaining original P20 personal data governance gaps and is now the latest accepted milestone baseline.

## P20-C 里程碑

| Milestone | Completion Definition | Evidence |
| --- | --- | --- |
| M20C-1 文档冻结与补齐审计 | Active docs define P20-C scope, boundaries, fixtures, risk controls, and acceptance commands | P20-C plan and audit section |
| M20C-2 治理工作台和批量操作补齐 | P19 health center opens governance queue with stale-reference and at least three safe batch previews | Workbench E2E, unit tests, cancel no-op evidence |
| M20C-3 重复地点决策补齐 | Possible duplicate places are detected and support ignore, keep separate, and merge decisions | Duplicate helper unit tests, decision E2E |
| M20C-4 导入冲突策略补齐 | Import dry-run classifies new/update/duplicate/risk/skipped records and supports strategy selection before writes | Import conflict E2E, cancel no-op test |
| M20C-5 维护历史和报告导出 | Governance writes create readable history and local report export matches UI facts | Journal/report unit tests, download E2E |
| M20C-6 Agent 和响应式回归 | Agent remains bounded and completed governance paths work on required viewports | Agent negative, screenshots |
| M20C-7 总验收 | Required commands and browser gates pass; final report records whether original P20 PRD is complete | P20-C final acceptance report |

## P20-C 出门条件

- P19 accepted baseline remains green.
- P20 core regression remains green.
- Governance workbench exposes issue queues including stale-reference without hidden mutation.
- At least three safe bulk actions require preview, cancel no-op, explicit confirmation, and journal append.
- Duplicate suggestions support ignore, keep separate, and merge, and never auto-merge or auto-delete.
- Import conflict preview supports strategy selection and cancel with no local mutation.
- Governance history records key actions and report export matches workbench/journal facts.
- Agent cannot execute prohibited governance writes.
- Required responsive screenshots/E2E pass.
- `npm run build`, `npm test -- --run`, `npm run verify:scanlist`, P19 regression, P20 core regression, and P20-C targeted Playwright gates pass.
- P20-C final acceptance report is created before claiming original P20 PRD completion.

P20-C acceptance status: accepted by `docs/active/p20-c-final-acceptance-report.md`.

---

# FoodMap P21 Milestone Roadmap

P21 is the local share and data portability release stage after accepted P20-C. It proves the original V1.0 local read-only share and `.foodmap.json` portability experience without adding cloud or account capabilities.

## P21 里程碑

| Milestone | Completion Definition | Evidence |
| --- | --- | --- |
| M21-1 文档冻结与审计 | PRD, architecture, gate, roadmap, gap, drawio, matrix, visual checklist define P21 consistently | P21 detailed plan, preimplementation audit |
| M21-2 分享快照可信生成 | Snapshot generation shows local/read-only boundary, title, counts, thumbnails, generated time | Unit + P21 share portability E2E |
| M21-3 导出包完整性 | `.foodmap.json` contains schema/version, metadata, places, layers, thumbnail-only photos | JSON inspection evidence |
| M21-4 clean profile 导入与只读页 | Empty profile imports package and opens `#/share/:snapshotId` without edit controls | Clean profile Playwright |
| M21-5 失败安全与 Agent 边界 | Invalid import and missing snapshot are safe no-op/fallback; Agent prohibited actions fail | IndexedDB diff + Agent negative |
| M21-6 多尺寸和真实数据证据 | Required viewports and real scanlist pass | Screenshots + scanlist |
| M21-7 总验收 | Required commands and browser gates pass; final report records whether P21 is accepted | P21 final acceptance report |

## P21 出门条件

- Local snapshot generation, export, clean import, read-only share, invalid import no-op, and missing snapshot fallback are browser-tested.
- Exported package evidence proves portable share data without backend or original photo blobs.
- P18/P19/P20-C regression gates remain green.
- `npm run build`, `npm test -- --run`, `npm run verify:scanlist`, P21 targeted Playwright, and final report pass.
- P21 final acceptance report is created before claiming release-candidate baseline.
