# FoodMap P19/P20-C/P21/P22/P23/P24/P25 Development And Acceptance Plan

## P25 Summary

P25 is the current durable static deployment and release-governance stage after accepted P24. It turns the P24 mobile-friendly WebApp proof into a durable static deployment target, while preserving FoodMap's pure frontend, local-first, no-account, no-cloud product boundary.

P25 focuses on:

1. A GitHub Pages primary deployment profile that can serve the built FoodMap app without a FoodMap business backend.
2. A durable user-facing URL that can be opened directly on the user's Mate70, including direct hash routes and browser refresh.
3. Hash-route recovery for `#/map` and `#/share/:snapshotId` on a static host.
4. Local IndexedDB persistence and `.foodmap.json` portability as the only cross-device data paths.
5. Honest source-down, tile failure, unavailable installability, and missing-share fallback behavior.
6. Release evidence and final reporting that distinguish durable static hosting from P24's temporary public tunnel.

Detailed implementation and acceptance are defined in [P25 Detailed Development And Acceptance Plan](./p25-detailed-development-and-acceptance-plan.md).

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P25-1 | 文档审计与部署边界冻结 | P25 audit, contract, active docs, drawio validation | No fatal or major unresolved spec risk |
| P25-2 | GitHub Pages 静态部署 profile | Build artifact profile, GitHub Pages config, direct-route smoke | FoodMap opens from `https://ljx418.github.io/foodMap/` or a documented fallback durable URL without backend API |
| P25-3 | Mate70 固定 URL 主路径 | Mate70 screenshots/recording for workspace, create/detail/filter, import/export, share, refresh | Real device proves core paths through the fixed URL |
| P25-4 | 失败态与发布安全 | Source-down, tile failure, missing-share, installability fallback evidence | Failures are understandable and do not imply cloud repair |
| P25-5 | 回归和证据包 | build/unit/scanlist/P18-P24 regression/P25 targeted evidence | Existing accepted baselines remain green |
| P25-6 | 总验收和 final report | P25 final report with host profile, URL, evidence, blockers, residual limits | P25 can be accepted only after evidence exists |

Current P25 status: implementation and deployed-origin browser acceptance are complete; final acceptance is not claimed because Mate70 fixed-URL real-device evidence is still blocked by missing HDC tooling in the current shell.

P25 must not claim HarmonyOS native HAP/AppGallery delivery, account login, cloud sync, remote backup, collaboration, backend API, offline map tiles, permanent public social sharing, or external realtime POI search.

## P24 Summary

P24 is the accepted implementation stage after accepted P23. It targets a mobile-friendly, app-like WebApp that can be statically deployed and used on the user's HarmonyOS Mate70, without changing FoodMap's local-first product boundary.

P24 focuses on:

1. WebApp installability assets and browser-supported app-like launch behavior.
2. Mate70-first mobile usability for map, detail, filters, import/export, and read-only share.
3. Static deployment without a FoodMap business backend.
4. Local IndexedDB persistence and `.foodmap.json` portability as the only cross-device data paths.
5. Weak-network, tile failure, installability-unavailable, and external-map fallback clarity.
6. Mate70 real-device evidence as a required final acceptance artifact.

Detailed implementation and acceptance are defined in [P24 Detailed Development And Acceptance Plan](./p24-detailed-development-and-acceptance-plan.md).

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P24-1 | 文档审计与边界收口 | P24 audit, contract, active docs, drawio | No fatal or major unresolved spec risk |
| P24-2 | WebApp 安装资产实现 | Manifest/icon/theme/launch URL, status fallback, service worker app shell | App-like assets implemented without native-app over-claim |
| P24-3 | Mate70 移动主路径实现 | Safe-area status, bottom controls, read-only share mobile path | Desktop mobile evidence and Mate70 real-device evidence pass |
| P24-4 | 静态部署与弱网 fallback 实现 | Static asset smoke, offline notice, tile failure copy | No backend/cloud dependency is introduced |
| P24-5 | 自动化和实机验收 | P24 E2E matrix, screenshot plan, Mate70 evidence protocol | Desktop simulation and Mate70 evidence are clearly separated |
| P24-6 | 总验收和 final report | Build/unit/scanlist/regression/static smoke/Mate70 final report | P24 can only be accepted with required evidence |

P24 is accepted because full automated regression, temporary public static deployment smoke, Mate70 real-device evidence, non-destructive failure-state evidence, and an accepted `p24-final-acceptance-report.md` now exist.

## P24 Completion Addendum

Current P24 code, local automation, temporary public deployment smoke, and Mate70 evidence are complete. The real-device acceptance loop closed as follows:

| Phase | Development / Evidence Scope | Exit Condition |
| --- | --- | --- |
| P24-C1 | Write and follow the Mate70 real-device acceptance script | Script maps PRD 4K.3 steps to screenshots or recording names |
| P24-C2 | Capture Mate70 complete workflow | Map, filters, details, import/export, valid read-only share, and refresh persistence are evidenced |
| P24-C3 | Capture installability behavior | Browser install/add-to-home support or unsupported fallback is recorded honestly |
| P24-C4 | Capture failure states | External-map/copy fallback and source-down FoodMap fallback are evidenced; phone network toggles were not performed |
| P24-C5 | Update final report | P24 final report is accepted and records the temporary deployment profile and residual limits |

---

## P23 Summary

P23 is accepted as the current interaction-quality correction after P22. It fixes P22 evidence and usability risks without expanding FoodMap's product boundary.

P23 focuses on:

1. Mobile read-only share opens a map-preserving selected-place summary before full detail.
2. Share mobile panels are not covered by the bottom navigation.
3. 320px workspace quick filters remain reachable without horizontal overflow.
4. Data health and governance panels are readable and action text is not clipped.
5. P21 responsive share regression is updated to the new summary-then-expand mobile path.
6. Full workspace E2E proves P18-P22 accepted baselines still pass.

Detailed implementation and acceptance are defined in [P23 UX Correction Plan](./p23-ux-correction-plan.md).

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P23-1 | UX evidence audit and correction plan | P23 plan/audit | No fatal or major unresolved spec risk |
| P23-2 | Mobile share and workspace readability fixes | P23 targeted E2E/screenshots | Mobile share, quick filters, health/governance readable |
| P23-3 | Regression and final acceptance | build/unit/scanlist/P21 responsive/full Playwright/final report | Accepted by `p23-final-acceptance-report.md` |

---

## P22 Summary

P22 is accepted as an interaction experience refactor after accepted P21. P23 supersedes P22's interaction evidence for corrected mobile share and readable governance/data-health paths.

P22 focuses on:

1. Standalone read-only share layout.
2. Direct missing snapshot `.foodmap.json` recovery.
3. Wider desktop health/governance/pending panels.
4. Compact mobile map controls.
5. Clear action labels for data package, poster, and snapshot.
6. Browser evidence proving P21/P20/P19 accepted baselines still work.

Detailed implementation and acceptance are defined in [P22 Detailed Development And Acceptance Plan](./p22-detailed-development-and-acceptance-plan.md).

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P22-1 | 文档与审计基线 | P22 plan/audit/docs/drawio updated | No fatal or major unresolved spec risk |
| P22-2 | 只读分享页和缺失快照恢复 | P21 targeted E2E and screenshots | Share page and fallback are self-contained |
| P22-3 | 工作台面板和移动 dock 可读性 | P22 targeted E2E | Health/governance readable; mobile dock compact |
| P22-4 | 回归和证据 | build/unit/scanlist/core targeted/P22 targeted/final report | Accepted by `p22-final-acceptance-report.md` |

---

## P19 Summary

P19 is accepted after the accepted P18 baseline. It keeps FoodMap pure frontend, local-first, and map-first, while turning the P18 accepted baseline into a more maintainable and reproducible product baseline.

P19 does not redo P18 candidate search, manual pin move, detail IA, filter explanation, share poster composer, Agent boundary, or large-dataset acceptance. Those are accepted regression baselines. P19 focuses on five gaps left after handoff:

1. Browser acceptance must be reproducible on the current development machine.
2. Share poster `当前视野` mode must become real, backed by map viewport bounds.
3. Personal data health must become a first-class workflow, not scattered status hints.
4. Location-changing workflows should be consolidated into Domain/Persistence-oriented services instead of being mostly UI orchestration.
5. Mobile, tablet, and narrow desktop regressions must remain controlled after the above changes.

## P19 Stage Boundary

Allowed claims:

- P18 is accepted and is the regression baseline.
- P19 is accepted and is now the latest regression baseline.
- P19 improves poster viewport mode, data health, repository/domain contracts, and acceptance reproducibility within the pure-frontend boundary.

Forbidden claims:

- FoodMap has backend sync, accounts, cloud sharing, or permanent public links.
- External realtime POI search works without a configured provider key or Agent-submitted evidence.
- Coordinates can be finalized without user confirmation.
- `当前视野` poster mode is complete before map bounds, preview count, export count, and E2E evidence are all aligned.

## P19 Workstream Orchestration

| Workstream | Development Goal | Planned Phases | Acceptance Focus | Blocking Risk |
| --- | --- | --- | --- | --- |
| W19-A 验收环境可复现 | Make build/unit/scanlist/targeted Playwright repeatable after restore | P19-1, P19-7 | Browser dependency note, targeted P18/P19 Playwright green | Browser tests cannot run, causing false acceptance risk |
| W19-B 当前视野分享图 | Enable real viewport-bounded poster mode | P19-2, P19-7 | Current filter vs current viewport counts, preview, PNG non-empty | Poster exports wrong set or disabled promise remains |
| W19-C 个人数据健康中心 | Make uncertain, high-risk, manual, skipped, and verified states visible with next actions | P19-3, P19-7 | Health summary, drill-in/filter actions, no hidden uncertainty | Users cannot find or resolve unhealthy data |
| W19-D Domain/Repository 收口 | Move location status and coordinate updates toward a single domain path | P19-4, P19-7 | Unit tests, Agent/UI behavior consistency, no direct pending finalization | UI and Agent drift into different truth models |
| W19-E 多尺寸回归 | Preserve map-first daily use across mobile/tablet/narrow desktop | P19-5, P19-7 | 390x844, 430x932, 768x900, 1280x820 screenshots/E2E | New panels crowd or clip the existing main path |
| W19-F 文档和治理 | Keep active docs, drawio, contracts, and final report aligned | P19-1, P19-6, P19-7 | PRD/architecture/gap/gates/drawio consistency | P19 implementation outruns design docs |

## P19 Detailed Development And Acceptance Plan

Implementation-level tasks, interface shapes, test names, and evidence paths are specified in [P19 Detailed Development And Acceptance Plan](./p19-detailed-development-and-acceptance-plan.md). The table below is the stage-level gate summary; implementers must use the detailed plan when coding each phase.

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P19-1 | 文档冻结与验收环境基线：active docs 指向 P19，P18 标记为 accepted baseline；记录 Playwright 依赖和当前本机阻塞 | 文档审计、drawio XML 校验、build/test/scanlist 复核 | P19 可开发，验收环境缺口有明确处理路径 |
| P19-2 | 分享海报 `当前视野`：从 Map Adapter/Workspace 读取 bounds，composer 启用当前视野模式 | Unit + Playwright：当前筛选/当前视野点数和导出一致，PNG 非空 | `当前视野` 不再是 disabled 占位 |
| P19-3 | 个人数据健康中心：按 verified、pending、high-risk、manual-adjusted、skipped 分组展示，并提供筛选/详情/工作台入口 | E2E + 截图：健康摘要可见，不可信地点可进入处理路径 | 不确定性可见且可行动 |
| P19-4 | Repository/Domain 收口：候选确认、手动挪动、pending 查询和状态派生收口到领域服务与 repository 边界 | Unit tests + Agent negative：UI/Agent 共享同一确认边界 | 关键坐标状态不再主要依赖分散 UI 逻辑 |
| P19-5 | 移动/窄屏回归：详情、筛选摘要、数据健康、海报 composer 在多视口下不遮挡、不截断 | 390x844、430x932、768x900、1280x820 screenshots/E2E | 主路径仍可在多尺寸完成 |
| P19-6 | 文档同步复检：PRD、架构、计划、门槛、gap、drawio、contracts 与实现对齐 | 文档审计清单、drawio 校验 | 不存在重大规格漂移 |
| P19-7 | 总验收：回归 P18 baseline，执行 P19 targeted tests，创建 final acceptance report | build、unit、verify:scanlist、targeted Playwright、截图/JSON、final report | P19 可出门 |

## P19 Required Acceptance Scenarios

1. Clean restore 后 `npm ci`、`npm run build`、`npm test -- --run`、`npm run verify:scanlist` 可复核。
2. Playwright 运行依赖可复现；若本机缺系统库，文档必须给出明确安装/替代执行方式。
3. P18 large deterministic 和 Agent negative targeted tests 可运行并作为回归基线。
4. Share poster composer 可在 `当前筛选` 与 `当前视野` 之间切换。
5. `当前视野` 模式使用真实 map bounds，预览点数和导出点数一致。
6. 当前视野为空时必须显示明确空态，不能导出误导性地点集。
7. 数据健康中心展示 verified、pending、high-risk、manual-adjusted、skipped 分组及数量。
8. 数据健康入口能跳转到筛选、详情或待确认工作台，不自动修改地点事实。
9. 候选确认和手动挪动继续需要用户显式确认。
10. Agent 直接固化坐标、删除 pending、隐藏不确定性仍被拒绝。
11. 390x844、430x932、768x900、1280x820 下核心路径可用。
12. 扫街榜 50 条和钉图易参考层仍是可显隐参考层，不污染个人记录。

## P19 Required Commands

```bash
npm run build
npm test -- --run
npm run verify:scanlist
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

P19 implementation should add targeted Playwright grep labels for current-viewport poster, data health center, and responsive regression before final acceptance.

## P19 Go / No-Go Statement

Current documentation status: P19 accepted.

This means the active PRD, target architecture, detailed development plan, acceptance gate, milestone roadmap, gap documents, drawio, contracts, E2E matrix, visual checklist, phase acceptance reports, and final report define the accepted P19 stage boundary, evidence path, and exit decision.

## P19 Audit Opinion

Current decision: `P19 accepted after final acceptance`.

P19 remained a refinement and governance stage. It avoided broad UI reshuffling and did not change the pure-frontend product boundary. The highest-risk item was false acceptance caused by unavailable browser test dependencies; P19 closed that risk with a documented local library workaround, targeted browser tests, and final acceptance evidence.

---

# FoodMap P20 Development And Acceptance Plan

## P20-C Summary

P20 core was implemented after P19 and provides governance workbench, duplicate merge preview, import conflict preview, governance journal, Agent negative boundaries, responsive evidence, and passing full Playwright regression. A PRD-based audit on 2026-06-24 found that this was not yet the full original P20 governance experience.

P20-C completed the implemented P20 core into the complete PRD target: at least three safe batch operation types, duplicate ignore/keep/merge decisions, import strategy selection for all conflict classes, stale-reference grouping, governance report export, and full PRD-targeted E2E coverage.

P20-C must not become a backend admin system. It must preserve the map-first personal food journal experience, P18/P19 trust boundaries, and the no-backend/no-account/no-cloud product constraint.

## P20 Stage Boundary

Allowed claims:

- P19 is accepted and remains the regression baseline.
- P20 core is a regression baseline for currently implemented governance workbench, merge preview, import preview, history, Agent boundary, and responsive evidence.
- P20-C may improve local personal data governance, duplicate handling, import conflict strategies, maintenance history, report export, and domain/repository write consistency.
- P20-C may add advisory read models, safe batch previews, stale-reference grouping, and local governance report export.

Forbidden claims:

- FoodMap has backend governance, cloud sync, accounts, public permanent links, or automatic multi-device repair.
- Duplicate suggestions are automatically merged.
- Import conflict preview writes data before the user confirms a strategy.
- Agent can execute bulk writes, delete, merge, finalize coordinates, or hide risk.
- P20-C completes external realtime POI search without provider keys or Agent-submitted evidence.
- Current P20 core can be described as full original PRD completion before P20-C gates pass.

## P20 Workstream Orchestration

| Workstream | Development Goal | Planned Phases | Acceptance Focus | Blocking Risk |
| --- | --- | --- | --- | --- |
| W20C-A 文档和审计基线 | Freeze P20-C completion scope from original PRD gaps | P20C-1 | PRD/architecture/gate readiness, no fatal audit findings | P20 core remains over-claimed as full completion |
| W20C-B 治理工作台补齐 | Add stale-reference group and at least three safe batch operation previews | P20C-2 | Groups, batch preview/confirm/cancel, report-visible effects | Health UI mutates facts or batch types are under-scoped |
| W20C-C 重复地点决策补齐 | Support ignore, keep separate, and merge decisions | P20C-3 | Evidence comparison, three decisions, history, no auto-delete | Auto-merge or delete without confirmation |
| W20C-D 导入冲突策略补齐 | Classify and select strategies for new/update/duplicate/risk/skipped rows | P20C-4 | Dry-run plan, strategy selection, cancel no-op | Import writes before preview or ignores risk rows |
| W20C-E 维护历史与报告导出 | Make governance actions auditable and exportable | P20C-5 | Journal entries, detail history, governance report export | History/report diverges from UI facts |
| W20C-F Agent/响应式/回归补齐 | Preserve Agent boundaries and multi-size usability under completed flows | P20C-6 | Agent negative, 390/430/768/1280 screenshots/E2E | Agent bypass or mobile clipped flows |
| W20C-G 总验收 | Prove original P20 PRD completion with command, browser, screenshot, real-data evidence | P20C-7 | Build/unit/scanlist/P18/P19/P20 regression/P20-C targeted/final report | False acceptance without browser evidence |

## P20 Detailed Development And Acceptance Plan

Implementation-level tasks, interface shapes, test names, and evidence paths are specified in [P20 Detailed Development And Acceptance Plan](./p20-detailed-development-and-acceptance-plan.md) and [P20-C Completion Development And Acceptance Plan](./p20-completion-development-and-acceptance-plan.md).

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P20C-1 | 文档冻结和补齐审计 | PRD/architecture/gate/gap/drawio review, fixture list, no fatal audit findings | P20-C 可开发 |
| P20C-2 | 治理工作台和批量操作补齐 | Unit + Playwright: stale-reference group, 3 batch actions, preview/cancel/confirm | 用户能处理问题队列且无隐藏写入 |
| P20C-3 | 重复地点决策补齐 | Unit + Playwright: duplicate candidates, evidence compare, ignore/keep/merge | 不自动合并，三类决策可追溯 |
| P20C-4 | 导入冲突策略补齐 | Unit + Playwright: dry-run import plan, strategy selection, cancel no-op | 导入前不会污染本地数据 |
| P20C-5 | 维护历史和报告导出 | Unit + E2E: journal entries, report export, legacy audit fallback | 关键动作可追溯且可导出 |
| P20C-6 | Agent 和响应式回归 | Agent negative + multi-viewport screenshots | Agent 不越权，移动端可完成主路径 |
| P20C-7 | 总验收 | build、unit、verify:scanlist、P18/P19/P20 regression、P20-C targeted、截图、final report | 原始 P20 PRD 治理闭环可出门 |

## P20 Required Acceptance Scenarios

1. P19 current viewport poster and data health targeted tests remain green.
2. Data governance workbench opens from the P19 health entry.
3. Pending/high-risk/manual/skipped/duplicate/import-conflict groups are visible when fixtures contain those states.
4. At least three safe batch actions list affected records before writing and support cancel no-op.
5. Duplicate suggestions show evidence and support ignore, keep separate, and merge decisions without automatic delete.
6. Import conflict preview classifies new/update/duplicate/risk/skipped rows, supports strategy selection, and can be canceled without IndexedDB mutation.
7. Confirmed governance actions append user-readable journal entries.
8. Governance report export contains the same issue groups, decisions, import summaries, and history facts shown in the UI.
9. Agent attempts to bulk modify, delete, merge, import, hide risk, or finalize coordinates are rejected.
10. 390x844, 430x932, 768x900, 1280x820 keep governance workbench, duplicate compare, import preview, report export, and history reachable.
11. `npm run verify:scanlist` continues to pass with the 50-entry real-data scanlist baseline.

## P20 Audit Opinion

Current decision: `P20-C accepted after final acceptance`.

This decision means current code passes build, unit, scanlist, P18/P19/P20 regression, P20-C targeted Playwright, full Playwright, and final PRD/architecture review. P20-C can now be treated as the regression baseline for original P20 personal data governance completion.

---

# FoodMap P21 Development And Acceptance Plan

## P21 Summary

P21 is the local share and data portability release stage. It uses P20-C as the latest accepted implementation baseline and returns to the original V1.0 PRD requirements for local read-only share snapshots, `.foodmap.json` import/export, clean profile portability, invalid import safety, and release evidence.

P21 does not add backend sync, accounts, cloud backup, public permanent links, editable import restore, or new POI search. It proves that FoodMap can be used as a local-first personal food map whose read-only snapshot can be exported, imported, and viewed safely.

## P21 Stage Boundary

Allowed claims:

- P20-C is accepted and is the personal data governance regression baseline.
- P21 may improve local snapshot generation, `.foodmap.json` validation, clean profile import, read-only share guardrails, invalid import no-op behavior, Agent share/import boundaries, and release evidence.
- P21 may add tests, selectors, validation helpers, and copy needed to prove V1.0 share/import/export trust.

Forbidden claims:

- FoodMap has cloud sharing, account sync, backend backup, or public permanent links.
- `#/share/:snapshotId` works across devices without importing the matching `.foodmap.json`.
- P21 restores imported data into editable personal records.
- Invalid import may partially write before validation.
- Agent can bypass import confirmation or create public links.

## P21 Workstream Orchestration

| Workstream | Development Goal | Planned Phases | Acceptance Focus | Blocking Risk |
| --- | --- | --- | --- | --- |
| W21-A 发布计划与审计基线 | Freeze P21 scope from original PRD share/import/export gaps | P21-1 | PRD/architecture/gate/drawio readiness | P21 drifts into cloud sharing or editable restore |
| W21-B 分享快照可信生成 | Make local/read-only snapshot content explicit before export/open | P21-2 | Title, counts, thumbnails, generated time, local-only copy | User mistakes local snapshot for public link |
| W21-C 导出包完整性 | Prove `.foodmap.json` includes all facts needed by share view | P21-3 | Schema/version, metadata, places, layers, thumbnails | Exported file cannot reconstruct read-only share |
| W21-D clean profile 导入与只读页 | Prove another local profile can view the snapshot safely | P21-4 | Clean IndexedDB import, share route, no edit controls | Import writes editable records or share leaks controls |
| W21-E 失败安全与 Agent 边界 | Prevent data pollution and over-claiming | P21-5 | Invalid import no-op, missing snapshot copy, Agent negative | Partial writes or false public-share claims |
| W21-F 多尺寸与证据包 | Prove release path across required viewports and real data | P21-6 | Screenshots, JSON evidence, scanlist, regression | Browser evidence skipped |
| W21-G 总验收 | Prove P21 can become release-candidate baseline | P21-7 | Build/unit/scanlist/P18-P20C regression/P21 targeted/final report | False acceptance without final report |

## P21 Detailed Development And Acceptance Plan

Implementation-level tasks, interface shapes, test names, and evidence paths are specified in [P21 Detailed Development And Acceptance Plan](./p21-detailed-development-and-acceptance-plan.md).

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P21-1 | 文档冻结与审计基线 | PRD/architecture/gate/gap/drawio review, audit report | P21 可开发 |
| P21-2 | 分享快照生成复核 | Unit + E2E: summary counts, local/read-only copy, snapshot metadata | 用户理解分享包事实 |
| P21-3 | 导出包完整性 | Unit + E2E JSON inspection | `.foodmap.json` 可迁移查看 |
| P21-4 | clean profile 导入与只读页 | Playwright clean profile import and share route | 只读分享可跨本地 profile 查看 |
| P21-5 | 失败安全与 Agent 边界 | IndexedDB no-op diff, error UI, Agent negative | 无效输入不污染事实 |
| P21-6 | 响应式与真实数据证据 | 390/430/768/1280 screenshots, scanlist, regression | 发布路径多尺寸可用 |
| P21-7 | 总验收 | build、unit、verify:scanlist、P18/P19/P20-C regression、P21 targeted、final report | P21 可出门 |

## P21 Audit Opinion

Current decision: `P21 accepted after final acceptance`.

The active documentation and final report now record P21 as the accepted local share and `.foodmap.json` portability release baseline. P22 builds on that accepted baseline as an interaction experience refactor.
