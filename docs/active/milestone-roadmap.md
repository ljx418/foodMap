# FoodMap P19/P20-C/P21/P22 Milestone Roadmap

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
