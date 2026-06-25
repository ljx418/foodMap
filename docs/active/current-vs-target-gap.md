# FoodMap P19/P20-C/P21/P22/P23 Current vs Target Gap

## P23 差异总览

P22 established the interaction-shell direction, but full PRD review and screenshot inspection found remaining real-use friction: mobile share detail could cover context too aggressively, narrow workspace controls could still crowd the map, and health/governance actions needed stronger readable wrapping. P23 closes those correction gaps without changing accepted data trust boundaries.

| 维度 | 当前已具备 | P23 目标 | 缺口处理 |
| --- | --- | --- | --- |
| 移动只读分享 | P22 mobile share navigation exists | Marker/list selection first shows a compact summary, then explicit full detail | `MobileShareSummaryFirst` |
| 窄屏工作台 | P22 compact dock exists | 320px/390px search, quick filters, map, and bottom actions remain reachable | `ResponsiveViewportState` |
| 健康/治理可读性 | P19/P20/P22 panels exist | Tabs, queue rows, explanations, and action buttons wrap cleanly | `GovernanceActionReadability` |
| 全量验收 | P18-P22 targeted evidence exists | Original-PRD code/doc/function/E2E review plus human-readable HTML report | `P23RegressionHarness` |
| 文档一致 | Active docs describe P22 accepted | PRD, architecture, gate, gap, visual checklist, final report, and HTML report describe P23 consistently | `P23GovernancePack` |

## P23 Target State

1. Mobile share keeps map context visible and makes full detail an explicit user choice.
2. Narrow workspace controls preserve the map-first experience rather than crowding it.
3. Data health and governance remain readable tools inside the personal map, not collapsed admin panels.
4. Full PRD acceptance is evidenced by commands, targeted and full Playwright, real scanlist data, screenshots, and a Chinese HTML report.
5. No P23 document or UI implies cloud sharing, account sync, public links, automatic data repair, or completed external real-time POI search.

P23 acceptance status: accepted by `docs/active/p23-final-acceptance-report.md`; full automated evidence is recorded in `docs/active/automated-acceptance-report-2026-06-25-p23-full.html`.

---

## P22 差异总览

P21 proved local share/data portability, but human review found the interaction shell still did not feel release-ready. P22 closes that usability gap without changing accepted data trust boundaries.

| 维度 | 当前已具备 | P22 目标 | 缺口处理 |
| --- | --- | --- | --- |
| 只读分享页 | Share route and read-only data exist | Standalone viewer with visible layer/map/detail and mobile share navigation | `ReadOnlyShareShell` |
| 缺失快照 | Missing route explains failure | Missing route directly imports `.foodmap.json` and reports validation errors | `MissingSnapshotRecovery` |
| 数据健康/治理 | P19/P20-C features exist | Desktop panels are wide enough for scanning and action text | `WorkspacePanelReadability` |
| 移动主路径 | Mobile header/dock/actions exist | Top dock is compact and does not crowd map-first workflow | `MobileControlCompactness` |
| 操作文案 | Import/export/share labels exist | User-facing labels distinguish package, poster, snapshot | `ActionIntentLanguage` |
| 验收 | P21 release evidence exists | P22 targeted E2E plus P21/core regression prove interaction changes did not break accepted baselines | `P22RegressionHarness` |

## P22 Target State

1. A read-only share viewer can inspect the shared map without editable workspace mental model.
2. Missing snapshot states are recoverable from the same page by importing a package.
3. Health and governance work remains subordinate to the map but readable on desktop.
4. Mobile controls are compact enough for real use on 390x844.
5. Action names reduce user confusion between data package, poster image, and local snapshot.
6. No P22 document or UI implies cloud sharing, account sync, public links, or automatic data repair.

P22 acceptance status: accepted by `docs/active/p22-final-acceptance-report.md`.

---

## P19 差异总览

| 维度 | 当前已具备 | P19 目标 | 缺口处理 |
| --- | --- | --- | --- |
| P18 验收基线 | P18 final report accepted; build/unit/scanlist pass in current restore | Browser acceptance also reproducible after restore | P19-1 acceptance environment baseline |
| 浏览器验收 | Playwright tests exist, but current local Linux browser dependencies are missing | Documented dependency setup or accepted alternate runner | `AcceptanceEnvironmentBaseline` |
| 分享海报 | `当前筛选` works; `当前视野` remains disabled | Current viewport mode uses real map bounds and exports matching pins | `ViewportPosterComposer` |
| 数据健康 | Pending/high-risk/manual states are visible in different places | One health center summarizes trust state and next actions | `PersonalDataHealthCenter` |
| Repository/Domain | Domain helpers exist; repository is thin CRUD; UI orchestrates key location writes | Candidate confirmation, manual move, pending status use shared domain/repository paths | `LocationWorkflowDomainService` |
| Agent 边界 | Agent negative guardrails exist for pending direct writes | Guardrails remain green after domain consolidation | Agent regression gates |
| 多尺寸体验 | P17/P18 responsive baseline accepted | New health/poster flows remain usable on mobile/tablet/narrow desktop | `ResponsiveRegressionHarness` |
| 文档治理 | Active docs still largely describe P18 as current stage | Active docs and drawio describe P19 while preserving P18 as accepted baseline | P19 docs sync |

## P19 Target State

P19 target state:

1. A new developer can restore the repo and know exactly how to run build, unit, scanlist, and browser acceptance.
2. P18 accepted functionality remains stable and is not reimplemented.
3. Share poster supports both `当前筛选` and real `当前视野` modes with consistent preview/export facts.
4. Users can see the health of personal data in one place and navigate to pending/high-risk/manual/skipped records.
5. Coordinate-changing flows share one domain truth and continue requiring user confirmation.
6. Agent assistance remains bounded and cannot mutate uncertain coordinates directly.
7. Mobile, tablet, and narrow desktop layouts remain map-first and non-overlapping.
8. Active docs, drawio, tests, and final report fully describe architecture, specs, function, and acceptance.

## P19 Development Path

1. P19-1: 文档冻结与验收环境基线。
2. P19-2: 当前视野分享海报。
3. P19-3: 个人数据健康中心。
4. P19-4: Repository/Domain 收口。
5. P19-5: 移动/窄屏回归。
6. P19-6: 文档同步复检。
7. P19-7: 总验收和 final report。

## P19 Risks And Controls

- False acceptance risk: browser tests must be runnable or the blocker must be documented before claiming acceptance.
- Poster wrong-set risk: current viewport must use actual map bounds, not reuse current filter silently.
- Hidden uncertainty risk: health center cannot hide pending/high-risk/manual/skipped records or auto-mark them verified.
- Architecture drift risk: UI, Agent, and tests must not maintain separate location-status truth.
- Regression risk: current P18 candidate/search/manual move/Agent gates remain required.
- Responsive risk: new panels must not crowd mobile or narrow desktop workflows.
- Documentation drift risk: PRD, architecture, plan, gates, roadmap, gap, drawio, and contracts must be updated together.

Historical P1-P18 gaps and acceptance reports are archived or retained as accepted baseline documents; this active gap document describes P19.

P19 acceptance status: accepted by `docs/active/p19-7-final-acceptance-report.md`.

---

# FoodMap P20-C Current vs Target Gap

## P20-C 差异总览

Current P20 core passed the narrower implemented governance regression. P20-C then closed the remaining original P20 PRD governance gaps and is now accepted.

| 维度 | 当前已具备 | P20-C 目标 | 缺口处理 |
| --- | --- | --- | --- |
| 数据健康 | P19 health center and P20 core workbench expose common issue groups | Governance workbench also exposes stale-reference and complete PRD groups | `StaleReferenceIssueDetector` |
| 批量处理 | Current batch path is narrower than PRD | At least three low-risk batch actions can be previewed, canceled, confirmed, persisted, and journaled | `GovernanceBatchActionService` |
| 重复地点 | Merge preview exists as core path | Duplicate suggestions support ignore, keep separate, and merge with evidence and history | `DuplicateDecisionService` |
| 导入安全 | Import conflict preview exists and readonly share snapshot import was restored | Dry-run import plan classifies new/update/duplicate/risk/skipped and supports strategy selection before writes | `ImportConflictStrategyPlanner` |
| 维护历史 | Governance journal exists for implemented core writes | Journal covers batch, duplicate decisions, import strategies, candidate/manual workflows touched by P20-C | `GovernanceActionJournal` |
| 报告导出 | No complete governance report export | User exports local report matching workbench groups, decisions, imports, and journal | `GovernanceReportExporter` |
| Agent 边界 | Agent negative prevents direct coordinate finalization and invalid writes | Agent also cannot bulk modify, merge, delete, or hide governance risks | P20 Agent negative tests |
| 多尺寸体验 | P19 health/poster paths and P20 core governance paths are responsive | Governance workbench, duplicate compare, import preview, report export, and history remain reachable | `P20CResponsiveHarness` |
| 文档治理 | Some active docs previously over-claimed P20 full acceptance | Active docs preserve P20-C as accepted baseline with plan, gates, fixtures, and evidence without over-claiming | P20-C docs sync |

## P20-C Target State

P20-C target state:

1. Users can move from data health summary into a focused governance workbench.
2. Pending, high-risk, manual, skipped, stale-reference, duplicate, and import-conflict issues are grouped and actionable.
3. At least three safe batch actions show affected records before any write and can be canceled without mutation.
4. Duplicate suggestions provide evidence and support ignore, keep separate, and merge without automatic delete.
5. Import conflict preview supports strategy selection and can be canceled without mutating local data.
6. Governance actions leave readable history entries and can be exported in a local report.
7. Agent can suggest and explain but cannot execute high-risk governance writes.
8. P18/P19 accepted boundaries and P20 core regression remain green.

## P20 Risks And Controls

- Auto-fix risk: all merges, deletes, coordinate finalization, and verification changes require explicit confirmation.
- False acceptance risk: P20 must run browser tests with the documented Playwright dependency path or record a blocker.
- Import pollution risk: conflict planning must occur before repository writes.
- History drift risk: journal entries explain actions but do not replace source facts.
- Admin-dashboard drift risk: governance UI must remain subordinate to the map-first personal workspace.
- Over-claim risk: no document may call the original P20 PRD complete until P20-C final acceptance passes.

P20-C acceptance status: accepted by `docs/active/p20-c-final-acceptance-report.md`.

---

# FoodMap P21 Current vs Target Gap

## P21 差异总览

P20-C closed the original P20 governance gaps. P21 targets the remaining V1.0 release trust gap: local share snapshots and `.foodmap.json` portability must be proven end-to-end, especially in clean profile import and read-only share viewing.

| 维度 | 当前已具备 | P21 目标 | 缺口处理 |
| --- | --- | --- | --- |
| 分享快照 | Local snapshot and share route exist | Snapshot generation clearly shows local/read-only meaning, title, counts, thumbnails, generated time | `SnapshotPortabilityComposer` |
| 导出包 | `.foodmap.json` export exists | Package structure is validated and evidenced with schema/version, metadata, places, layers, thumbnails | `FoodMapPackageValidator` |
| clean profile 导入 | Import path exists and P20-C conflict preview exists | Empty browser profile can import package and open read-only share route | `CleanProfileImportHarness` |
| 分享页只读 | Share view has readonly components | Browser tests prove no create/edit/delete/upload/save/account/cloud controls appear | `ReadOnlyShareGuard` |
| 失败安全 | Import errors notify user | Invalid/unsupported packages and missing snapshots are no-op/fallback with IndexedDB evidence | `ImportFailureNoOpGuard` |
| Agent 边界 | Governance Agent negative exists | Agent cannot forge public links or bypass import confirmation | P21 Agent negative tests |
| 多尺寸发布路径 | P19/P20 responsive baselines exist | Export/import/share/fallback paths work on 390/430/768/1280 | `P21ResponsiveHarness` |
| 文档治理 | Active docs describe P20-C accepted | Active docs define P21 stage without over-claiming cloud/public sharing | P21 docs sync |

## P21 Target State

P21 target state:

1. Users can generate and export a local read-only share snapshot from real personal data.
2. Exported `.foodmap.json` is self-contained for read-only share viewing.
3. A clean profile can import the file and open the matching share route.
4. The share page displays map, layers, places, details, and thumbnails without editing controls.
5. Missing snapshots and invalid imports are clear and safe no-op states.
6. Agent assistance remains bounded and cannot create false public sharing or write imported data.
7. P18/P19/P20-C accepted baselines remain green.

## P21 Risks And Controls

- Cloud over-claim risk: all P21 copy must say local/read-only and require file import across devices.
- Import pollution risk: package validation must complete before writes; invalid packages are no-op.
- Read-only leak risk: share route must not expose workspace edit controls.
- Portability risk: exported package must include thumbnails and metadata, not depend on original blobs or backend.
- Regression risk: P21 must not break P20-C governance import conflict paths.
- False acceptance risk: clean-profile browser import and JSON evidence are mandatory.

P21 acceptance status: accepted by `docs/active/p21-final-acceptance-report.md`.
