# FoodMap P19/P20-C/P21/P22/P23/P24/P25 Current vs Target Gap

## P25 差异总览

P24 accepted the mobile-friendly WebApp and Mate70 usability baseline with local automation, HDC workflow evidence, temporary public HTTPS static deployment smoke, valid read-only share evidence, and source-down fallback evidence. P25 targets the next gap: replacing the temporary acceptance deployment profile with a durable static URL and release-governance evidence without changing FoodMap into a native app, cloud product, backend service, or public social platform.

| 维度 | 当前已具备 | P25 目标 | 缺口处理 |
| --- | --- | --- | --- |
| 静态部署耐久性 | P24 has `dist/`, local preview, and temporary public static smoke | GitHub Pages serves FoodMap at `https://ljx418.github.io/foodMap/` without FoodMap backend API, or fallback host is justified | `StaticHostProfile` |
| 固定 URL 入口 | Mate70 can use HDC and temporary public URL evidence from P24 | Mate70 opens a durable URL directly and repeats workspace/share/refresh paths | `Mate70StaticReleaseHarness` |
| Hash route 恢复 | `#/map` and `#/share/:snapshotId` work in app routing and P24 smoke | Direct open and refresh for hash routes are release gates on the static host | `HashRouteRecovery` |
| 本地数据边界 | IndexedDB and `.foodmap.json` are accepted portability paths | Release copy and failure states keep local-first meaning visible | `LocalDataPortabilityBoundary` |
| 失败态发布安全 | Source-down, missing-share, external-map fallback have P24 evidence | Static host, tile, source-down, installability-unavailable states are rechecked on fixed URL | `ReleaseFailureStateHarness` |
| 回归与报告 | P18-P24 accepted reports exist | P25 final report ties host profile, Mate70 evidence, regression, blockers, and residual limits together | `P25ReleaseGovernancePack` |

## P25 架构评估实体关系

P25 架构评估必须落到具体代码实体、部署实体和证据实体，不能只用“可部署”“跨端”这类抽象词判断完成度。

| 分层 | 具体实体 | 与目标体验的关系 | P25 评估重点 |
| --- | --- | --- | --- |
| 构建产物层 | `npm run build`、`dist/`、`index.html`、`manifest.webmanifest`、`public/sw.js`、`src/registerServiceWorker.ts` | 生成可静态托管的浏览器应用壳、WebApp 元数据和 source-down fallback | 产物可被静态 host 直接服务，不依赖 Vite dev server 或 FoodMap backend |
| 静态托管层 | GitHub Pages profile, durable HTTPS URL, host fallback to `index.html` | 用户在 Mate70 输入固定 URL 后能进入同一 FoodMap 应用 | 首选 `https://ljx418.github.io/foodMap/`；不是 HDC-only、local preview 或临时 tunnel；fallback host 必须说明原因 |
| 路由层 | `src/main.tsx`、`src/app/App.tsx`、`#/map`、`#/share/:snapshotId` | 支撑地图工作台和本地只读分享的直接入口 | hash routes direct open、refresh、missing-share fallback 一致 |
| 工作台体验层 | `MapWorkspace`、`MapCanvas`、`HomeMapControlDock`、detail/filter/import/export entry | Mate70 用户完成地图、搜索、筛选、详情、创建、导入导出 | 固定 URL 下主路径截图或录屏证明可触达 |
| 分享与携带层 | `ShareView`、`ImportExportDialog`、snapshot codec、import/export codec、`.foodmap.json` | 跨设备靠本地文件携带，分享页只读且不暗示公网永久链接 | valid share、refresh persistence、invalid/missing fallback 通过 |
| 本地数据层 | IndexedDB repositories for places/layers/photos/snapshots/governance history | 本机数据留在浏览器本地，刷新/重开可读 | 不新增 account/cloud/backend remote state |
| Agent 与信任边界 | `window.FoodMapAgentBridge`、P18/P20 negative gates | 保留候选确认、坐标确认、治理写入边界 | P25 不新增 Agent 写权限，不绕过用户确认 |
| 验收证据层 | `scripts/verify_p24_webapp.mjs` or P25 successor, `e2e/workspace.spec.ts`, HDC/Mate70 screenshots, `docs/active/evidence/p25/`, `p25-final-acceptance-report.md` | 区分实现、浏览器自动化、实机证据和最终出门决定 | 证据必须能证明固定 URL，而不是复用 P24 临时隧道结论 |

## P25 Target State

1. 用户可以在 HarmonyOS Mate70 上打开 GitHub Pages URL `https://ljx418.github.io/foodMap/` 或有记录的 fallback 稳定 URL，并完成地图、筛选、详情、创建、导入导出、只读分享和刷新持久化路径。
2. `#/map` 和生成的 `#/share/:snapshotId` 可以直接打开和刷新，不出现静态 host 404 或空白页。
3. FoodMap 仍然是纯前端、本地优先应用；IndexedDB 和 `.foodmap.json` 是唯一用户数据持久化/携带模型。
4. 失败态诚实说明 source-down、瓦片失败、缺失快照、外部地图失败、安装不可用等限制，不暗示云端修复或原生能力。
5. P18-P24 已验收能力继续作为回归基线。
6. P25 final report 明确记录 host profile、稳定 URL、Mate70 证据、命令回归、阻塞项和残余限制。

P25 acceptance status: implemented and deployed to GitHub Pages with automated browser/regression evidence; not accepted because Mate70 fixed-URL real-device evidence remains blocked.

---

## P24 差异总览

P23 accepted the interaction-quality correction baseline. P24 accepted the next product gap: the app works responsively in browsers, has WebApp identity, local static preview, automated regression, HDC-connected Mate70 workflow evidence, temporary public static deployment smoke, valid share evidence, and source-down fallback evidence. P25 supersedes P24's temporary deployment limitation with durable static deployment planning.

| 维度 | 当前已具备 | P24 目标 | 缺口处理 |
| --- | --- | --- | --- |
| WebApp 身份 | `index.html`、manifest、SVG icon、theme color、service worker app shell 已实现 | Mate70 上能识别浏览器/WebApp fallback，不误认作原生 App | `WebAppShell` / `InstallabilityFallbackStatus` |
| Mate70 可用性 | HDC workflow 和临时公网 URL 主路径证据已通过 | Mate70 完成 map/detail/filter/import/export/valid share/persistence 主路径 | `Mate70AcceptanceHarness` |
| 移动安全区 | P23/P24 自动化覆盖移动布局，Mate70 证据已记录 | 完整主路径不被浏览器栏、安全区、键盘或底部操作遮挡 | `WorkspaceMobileSurface` / `ShareMobileSurface` |
| 静态部署 | `vite preview` local smoke 和临时公网 HTTPS smoke 通过 | 可部署 URL 证据完成；长期稳定 URL 作为 P25 新目标 | `StaticDeploymentProfile` |
| 弱网失败态 | WebApp/offline/tile/source-down/external-map fallback 已有证据 | Mate70 和发布失败态被 final report 记录限制 | `WeakNetworkFallbacks` |
| 文档治理 | P24 final report accepted | PRD、架构、gap、drawio、gate 和 final report 记录 P24 边界与残余限制 | `P24GovernancePack` |

## P24 架构评估实体关系

P24 架构评估必须落到具体代码实体和证据实体，不能只用抽象模块名判断完成度。

| 分层 | 具体实体 | 与目标体验的关系 | 当前评估结论 |
| --- | --- | --- | --- |
| 静态入口层 | `index.html`、`manifest.webmanifest`、`public/icons/foodmap-icon.svg`、`src/registerServiceWorker.ts`、`public/sw.js` | 让 Mate70 浏览器识别应用名称、图标、主题色、启动 URL 和应用壳 fallback | P24 自动化、HDC 证据和安装/快捷入口证据已记录 |
| 应用路由层 | `src/main.tsx`、`src/app/App.tsx`、`WebAppStatus`、`#/map`、`#/share/:snapshotId` | 用户能进入地图工作台或只读分享，并看到准确的 WebApp/本地优先状态说明 | `#/map`、缺失分享 fallback 和有效分享路径均有 P24 证据 |
| 地图工作台层 | `MapWorkspace`、`HomeMapControlDock`、`MapCanvas`、`LeafletProvider` | 支撑地图、搜索、筛选、详情、底部操作、地图瓦片失败说明 | 桌面移动自动化和 Mate70 主路径证据已通过 |
| 携带与分享层 | `ImportExportDialog`、`ShareView`、import/export codec、snapshot codec、`.foodmap.json` | 支撑本地导入导出、clean profile restore、只读分享查看 | P21/P24 自动化和 Mate70 有效 share/refresh 证据已通过 |
| 本地数据层 | IndexedDB repositories for places/layers/photos/snapshots/governance history | 保证刷新或重开后本地数据仍可读，不依赖账号或云同步 | P24 refresh persistence 证据已通过；长期固定 URL 复验转入 P25 |
| Agent 边界 | `window.FoodMapAgentBridge` | 保持 P18-P23 的受控写入边界，不允许直接固化坐标、删除或隐藏不确定性 | 作为回归边界保留；P24 不新增 Agent 权限 |
| 验收证据层 | `scripts/verify_p24_webapp.mjs`、`e2e/workspace.spec.ts`、HDC `rport tcp:53242 tcp:53242`、`docs/active/evidence/p24/` | 区分桌面模拟、本地静态预览、HDC workflow、临时公网 smoke 和完整 Mate70 验收 | P24 final report accepted；稳定长期 URL 证据转入 P25 |

## P24 Target State

1. A user can open deployed FoodMap on HarmonyOS Mate70 and use it as an app-like mobile WebApp.
2. The product has a clear browser-delivered identity: name, icon, theme, launch URL, and installability/fallback policy.
3. Map, detail, filters, import/export, and read-only share remain usable under mobile safe areas and browser chrome.
4. Local IndexedDB and `.foodmap.json` portability remain the only data persistence/cross-device model.
5. Weak-network and unsupported browser capabilities are explained honestly.
6. No P24 document or UI implies HarmonyOS native delivery, AppGallery release, account sync, cloud backup, collaboration, or public permanent sharing.

P24 acceptance status: accepted by `docs/active/p24-final-acceptance-report.md`. Its documented residual limit is that the public static URL was a temporary acceptance tunnel, not durable production hosting.

---

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
