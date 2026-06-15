# FoodMap P17 目标架构

## 1. 架构结论

FoodMap P17 继续采用**纯前端、本地优先、模块化单体**架构。用户个人记录、照片、图层、分享快照仍存储在浏览器本地 IndexedDB；高德扫街榜和钉图易分享数据作为可显隐参考图层保留；伴随式 Agent 只能通过受控的 `window.FoodMapAgentBridge` 调用能力，不能绕过领域校验、POI 准入、候选排序、坐标固化和导入导出规则。

P8-P14 的目标不是引入后端或做实时榜单，而是把现有 P1-P7 基线提升为可长期维护的产品化版本：

- 真实数据刷新可审计。
- 地点事实错误可被拦截。
- 图片/街景证据不伪装成已核验。
- 用户输入和查看更顺。
- Agent 调用边界清楚。
- 性能和验收证据可追踪。

P15 新增目标：

- 默认空个人图，扫街榜只作为显隐可控的参考图层。
- 点击地图直接进入新增模态窗。
- 简介文本本地识别，链接/网页内容由 Agent 辅助提交结构化候选。
- 候选排序在本地完成，并展示可解释理由。
- 结构化标签与旧 `tags` 兼容。
- 地图海报由前端自绘生成 PNG，不依赖远程瓦片截图。

P16 新增目标：

- 真实 POI 候选召回支持同名多门店选择。
- 浏览器定位参与候选排序，拒绝定位时可降级。
- 网页链接和复杂来源由 Agent 以结构化候选形式回填，FoodMap 本地排序和确认。
- 个人地点和推荐详情可跳转到手机地图 App 或网页地图。
- 海报导出更接近真实地图查看体验，并严格反映当前筛选结果。

P17 新增目标：

- 待确认/高风险地点进入可批量处理的确认工作台。
- 详情页信息架构从“表单堆叠”收束为状态、标签、核心操作、照片记录、校准与导航的稳定层级。
- 手动挪动图钉成为详情页常驻能力，移动端和窄屏同样可确认、取消、保存。
- 首页筛选栏、图钉视觉、分享图导出和移动端主路径在多尺寸下不截断、不遮挡、不误导。
- 真实数据量下扫街榜、参考层、个人收藏、待确认队列同时存在时仍可流畅缩放和筛选。

## 2. 架构原则

| 原则 | 说明 | 违反信号 |
| --- | --- | --- |
| 地图优先 | `#/map` 首屏必须是地图工作台，面板和工具围绕地图服务 | 首屏变成说明页、榜单页或复杂管理台 |
| 本地优先 | 个人记录、照片、快照不依赖账号和服务端 | 用户记录必须联网或登录才能保存 |
| 推荐隔离 | 扫街榜是推荐覆盖层，不是用户个人记录 | 榜单刷新直接修改用户记录 |
| POI 准入 | 未核验、冲突、低置信地点不能成为图钉 | 事实错误地点仍出现在地图上 |
| 单一写入路径 | UI 和 Agent 写入都必须走领域校验与持久化仓库 | Agent 直接写 IndexedDB 或生成数据文件 |
| 证据透明 | 图片、街景、来源、匹配状态必须可见 | 缺图、错图仍显示为“已核验” |
| 可验收 | 每个阶段必须有命令、真实数据、截图和规格复检证据 | 只凭主观体验宣称通过 |
| 纠错优先 | 坐标不确定时提供候选确认和手动挪动，而不是隐藏风险 | 水里、桥上、偏移点以普通地点展示 |
| 多尺寸同权 | 桌面、平板、手机都必须能完成主路径 | 只在 1440 宽屏可用，窄屏裁切或不可滚动 |

## 3. 技术栈

| 类别 | 目标选型 |
| --- | --- |
| 构建 | Vite |
| 前端 | React + TypeScript |
| 样式 | CSS custom properties + 应用级 CSS |
| 路由 | Hash Router，核心路由为 `#/map` 和 `#/share/:snapshotId` |
| 本地存储 | IndexedDB |
| 地图 | 当前基线为 Leaflet 适配器加载高德瓦片；远程瓦片失败时使用武汉本地示意 fallback；高德 Web JS Provider 属于后续可选增强，未配置并验收前不能宣称已具备 |
| 测试 | Vitest + Playwright |
| Agent | `window.FoodMapAgentBridge` |

## 3A. P15 新增目标模块

| 模块 | 职责 | 代码位置 |
| --- | --- | --- |
| `LayerController` | 控制个人图层和扫街榜参考图层显隐，保证扫街榜默认隐藏 | `src/features/workspace/MapWorkspace.tsx`, `LayerPanel.tsx` |
| `PinCreationFlow` | 地图点击直接打开新增模态窗，带入点击坐标 | `MapWorkspace.tsx`, `PlaceEditorModal.tsx` |
| `PlaceRecognitionInput` | 从简介文本提取店名、地址、标签和候选备注 | `src/domain/placeRecognition.ts` |
| `AgentRecognitionBridge` | 接收外部 Agent 提交的结构化候选并返回本地排序结果 | `src/agent/FoodMapAgentBridge.ts` |
| `PlaceCandidateRanker` | 按距离、历史城市/标签、来源置信度和文本完整度排序 | `src/domain/placeRecognition.ts` |
| `TagGroupModel` | 结构化管理吃没吃过、评价、食物种类、自定义标签，并兼容旧 `tags` | `src/domain/tagGroups.ts` |
| `MapPosterExporter` | 生成朋友圈友好的 1080x1440 PNG 地图海报 | `src/domain/mapPoster.ts`, `ImportExportDialog.tsx` |

## 3B. P16 新增目标模块

| 模块 | 职责 | 目标代码位置 |
| --- | --- | --- |
| `PlaceSearchProvider` | 统一本地文本、历史地点、扫街榜参考、Agent 候选和未来地图 provider 候选 | `src/domain/placeSearch.ts`, `PlaceEditorModal.tsx` |
| `UserLocationService` | 封装浏览器 Geolocation，输出授权、拒绝、失败、成功状态 | `src/domain/userLocation.ts`, `MapWorkspace.tsx` |
| `PlaceCandidateRankerV2` | 按当前位置、点击点、历史偏好、来源置信度、字段完整度排序并生成理由 | `src/domain/placeRecognition.ts` 或 `placeSearch.ts` |
| `ExternalMapLinkBuilder` | 为高德、Apple Maps、通用 geo、网页地图构造跳转链接和 fallback 文案 | `src/domain/externalMapLinks.ts`, `PlaceDetailDrawer.tsx`, `RecommendationPanel.tsx` |
| `MapSnapshotExporter` | 生成当前筛选结果的真实地图感传播图，包含地图感背景、图钉、标题、标签摘要 | `src/domain/mapPoster.ts`, `ImportExportDialog.tsx` |
| `AgentCandidateIngest` | 允许 Agent 提交结构化候选，不允许直接静默保存 | `src/agent/FoodMapAgentBridge.ts` |

P16 的字段形状、provider 顺序、排序理由、Agent action、地图跳转和海报导出细则以 [P16 Real Place Linking Implementation Contract](./p16-real-place-linking-implementation-contract.md) 为准。开发时如果 PRD、架构和实施契约出现冲突，以 PRD 体验目标为最高优先级，架构和契约必须同步修订后再继续开发。

## 3C. P17 新增目标模块

| 模块 | 职责 | 目标代码位置 |
| --- | --- | --- |
| `PendingPlaceWorkbench` | 聚合待确认和高风险个人地点，支持候选确认、跳过、手动挪动、进度和审计状态 | `src/features/workspace/PlaceList.tsx`, `MapWorkspace.tsx`, 新增工作台组件 |
| `PlaceDetailInformationArchitecture` | 详情页分区：状态/标签、核心操作、照片、评分与记录、坐标校准、外部地图 | `src/features/workspace/PlaceDetailDrawer.tsx`, `src/styles/app.css` |
| `PinMoveController` | 在详情页和移动端统一管理挪动模式、确认、取消、保存和审计字段 | `src/domain/manualPinMove.ts`, `MapWorkspace.tsx`, `LeafletProvider.ts` |
| `FilterCommandBar` | 首页高频筛选和低频工具分层，保证多尺寸不截断 | `HomeMapControlDock.tsx`, `FilterPanel.tsx` |
| `PinVisualStateModel` | 统一已核验、待确认、选中、扫街榜、参考层、高密度状态的样式和行为 | `LeafletProvider.ts`, `src/styles/app.css` |
| `SharePosterPreview` | 导出前预览当前筛选/当前视野，生成地图感传播图 | `MapPosterDialog.tsx`, `src/domain/mapPoster.ts` |
| `PerformanceAcceptanceHarness` | 在真实数据量下验证缩放、筛选、详情打开和导出性能 | `e2e/workspace.spec.ts`, `e2e/visual-evidence.spec.ts` |
| `AgentPendingPlaceContext` | Agent 只读读取待确认队列、候选上下文和当前筛选，不直接固化坐标 | `src/agent/FoodMapAgentBridge.ts` |

P17 的阶段边界、用户历程、验收 fixture 和 blocker 条件以 [P17 UX Trust Implementation Contract](./p17-ux-trust-implementation-contract.md) 为准。

## 4. 模块分层

```text
Browser
  -> App Shell / Routes
    -> Workspace UI
    -> Share UI
    -> Agent Bridge
    -> Pending Place Workbench

Workspace UI
  -> Domain
  -> Persistence
  -> Map Provider Adapter
  -> Recommendation Read Model

Refresh Scripts
  -> Public Source Fetch
  -> POI Normalize / Verify / Diff
  -> Generated Recommendation Data
  -> Audit Reports

Acceptance
  -> Unit Tests
  -> Playwright E2E
  -> Real-data Reports
  -> Visual Screenshots
  -> Final Acceptance Report
```

| 层 | 职责 | 主要代码位置 |
| --- | --- | --- |
| App Shell | 应用入口、路由、全局初始化 | `src/app`, `src/main.tsx` |
| Workspace UI | 地图工作台、列表、详情、编辑、筛选、导入导出、分享入口 | `src/features/workspace` |
| Share UI | 本地只读分享页 | `src/features/share` |
| Domain | 类型、默认值、校验、过滤、转换规则 | `src/domain` |
| Persistence | IndexedDB 仓库、导入导出编解码 | `src/persistence` |
| Map Adapter | 统一地图接口、高德/Leaflet/fallback 适配、图钉渲染 | `src/map` |
| Recommendation | 扫街榜数据、POI 核验、推荐转个人记录 | `src/recommendations` |
| Agent Bridge | 供伴随式 Agent 调用的浏览器契约 | `src/agent/FoodMapAgentBridge.ts` |
| Verification | 单测、浏览器验收、证据文档 | `src/tests`, `e2e`, `docs/active` |
| UX Trust Layer | 待确认工作台、详情页信息架构、图钉视觉状态、移动主路径 | `src/features/workspace`, `src/styles/app.css`, `src/domain` |

## 5. 允许依赖关系

| 发起方 | 可以依赖 | 禁止依赖 |
| --- | --- | --- |
| Workspace UI | Domain、Persistence、Map Adapter、Recommendation、Agent 注册 | 地图 provider 内部实现承载业务规则 |
| Share UI | Snapshot 仓库、Map Adapter、只读展示 helper | 新增、编辑、删除等写入流程 |
| Domain | 纯类型、校验、过滤、转换 | UI、IndexedDB、地图 SDK、网络请求 |
| Persistence | Domain 类型、浏览器 IndexedDB | UI 组件状态 |
| Map Adapter | 领域形状的 marker 数据、地图 provider SDK | IndexedDB 仓库、Agent 命令 |
| Recommendation | 生成数据、核验逻辑、转换 helper | UI 临时状态、直接修改个人记录 |
| Refresh Scripts | 公开来源抓取、标准化、核验、报告 | 浏览器 UI 状态 |
| Agent Bridge | Domain、Persistence、Recommendation、Snapshot codec | 绕过校验的直接写入 |
| Acceptance | 测试、报告、截图、真实数据证据 | 无证据的人工口头通过 |
| UX Trust Layer | Domain 状态、Map Adapter 状态、Persistence 仓库 | 自行维护一套与领域模型不一致的事实状态 |

## 6. 核心数据模型

### 6.1 个人记录模型

- `FoodPlace`：用户拥有的美食地点，包含名称、经纬度、图层、评分、到访时间、标签、笔记、地址、城市、照片 ID、创建/更新时间。
- `FoodLayer`：用户图层，包含名称、颜色、图标、显隐和排序。
- `PhotoAsset`：本地照片 blob 和缩略图。
- `ShareSnapshot`：本地只读分享快照。
- `FoodFilterState`：关键词、城市、图层、标签、评分、到访时间等筛选状态。

### 6.2 推荐覆盖层模型

- `AmapScanlistRecommendation`：高德扫街榜推荐项，包含排名、评分、POI ID、地址/区县、评价摘要、来源、经纬度、坐标精度、图片证据、核验字段。
- `AmapImageEvidence`：公开图片或街景证据，包含图片 URL、来源 URL、alt、观测名称、匹配状态、观测时间。
- `RecommendationVerificationResult`：核验结果，包含状态、置信度、是否可上图、重复组、坐标可信度和风险提示。

推荐项不是个人记录。只有用户显式保存，并且 `evaluateRecommendation` 判定为可上图时，才允许通过 `recommendationToFoodPlace` 转成 `FoodPlace`。

## 7. 核心业务链路

### 7.1 个人记录链路

1. 用户打开 `#/map`。
2. Workspace 从 IndexedDB 加载地点、图层、照片、快照。
3. 用户点击地图或搜索结果创建地点。
4. 编辑器只要求最小必填字段：名称、图层、评分、到访时间、坐标。
5. Domain 校验字段、坐标、评分和图层引用。
6. Persistence 写入 IndexedDB。
7. UI 根据筛选状态生成可见地点集合。
8. Map Adapter 渲染个人图钉。
9. 列表、地图、详情使用同一个 selected entity 状态同步。

验收重点：最小创建、脏表单关闭确认、照片预览、刷新后不丢失、地图/列表/详情一致。

### 7.2 推荐图钉链路

1. `AMAP_WUHAN_SCANLIST` 提供已生成的推荐数据。
2. `evaluateRecommendation` 对每条数据做准入判断。
3. 只有 `mappable=true` 且无阻塞冲突的项进入地图。
4. 推荐图钉和个人图钉使用不同视觉系统。
5. 点击推荐图钉打开推荐详情，展示排名、评分、地址、核验、证据。
6. 用户保存推荐项时，通过 `recommendationToFoodPlace` 转换。
7. 转换后的记录继续走个人记录链路。

验收重点：50 条基线可上图，未核验和冲突项不上图，保存推荐项不能绕过校验。

### 7.3 真实数据刷新治理链路

1. 刷新脚本读取公开榜单或已批准真实数据来源。
2. 候选 POI 按 POI ID、标准化名称、分店 token、区县/道路、坐标标准化。
3. 候选项与现有已核验基线对比。
4. 生成 diff 状态：`unchanged`、`new`、`removed`、`renamed`、`moved`、`conflict`、`pending`。
5. `moved`、`conflict`、`pending` 默认不修改生成数据，不成为图钉。
6. 只有通过准入且无阻塞风险的项才允许进入 apply。
7. 刷新报告必须和生成数据一起更新，不能只改数据不改报告。

验收重点：冲突不上图、迁址不自动覆盖、dry-run 不改地图数据、报告能解释每条变更。

### 7.4 图片与街景证据链路

1. 推荐详情读取 `AmapImageEvidence`。
2. UI 展示图片来源、观测名称、匹配状态、观测时间。
3. 图片缺失、加载失败、不匹配、过期时显示 fallback 和风险提示。
4. 只有 `evidenceStatus=verified` 且 `matched=true` 可以使用已核验视觉。
5. 用户上传的个人照片始终作为 `PhotoAsset`，不和公开证据混用。

验收重点：错图不被当成已核验，缺图不空白，公开证据和用户照片边界清楚。

### 7.5 Agent 调用链路

1. 伴随式 Agent 调用 `window.FoodMapAgentBridge`。
2. Bridge 校验 action 和 payload。
3. 只读命令可读取上下文、地点、推荐、筛选、导出数据。
4. 写入命令必须走 Domain 校验、Persistence 仓库、POI 准入。
5. 不支持或不安全命令返回结构化错误。
6. 浏览器派发 `foodmap:agent-command`、`foodmap:agent-result`、`foodmap:state-changed` 事件。

验收重点：Agent 可读可导出，不能保存未核验推荐，错误码稳定，事件可被 Playwright 观察。

### 7.6 P16 真实地点候选链路

1. 用户点击地图或底部新增，打开新增地点模态窗。
2. 用户输入店名、地址、简介文本或网页链接。
3. `PlaceSearchProvider` 合并本地文本解析、历史地点相似项、扫街榜参考项和 Agent 结构化候选。
4. `UserLocationService` 尝试获取当前位置；成功则参与排序，拒绝或失败则记录降级原因。
5. `PlaceCandidateRankerV2` 输出候选顺序、置信度和可读理由。
6. UI 展示多个候选，用户显式选择后才回填表单。
7. 保存继续走个人记录链路和 Domain 校验。

验收重点：多候选可解释、定位拒绝不阻断、候选不能静默落图、同名分店不能错误合并。

### 7.7 P16 外部地图联动链路

1. 详情页读取地点名称、地址、经纬度。
2. `ExternalMapLinkBuilder` 生成多策略链接：优先高德 URI/网页地图，其次 Apple Maps 和通用 geo。
3. UI 展示“打开地图/导航”主动作和“复制地址/坐标”fallback。
4. 推荐详情仅对可上图或有可信坐标的项展示跳转入口。

验收重点：移动端可点击、桌面端可打开网页地图、缺坐标时不展示误导性导航。

### 7.8 P16 传播图导出链路

1. 用户打开导入/导出入口。
2. `MapSnapshotExporter` 读取当前筛选后的个人图钉。
3. 前端生成 1080x1440 PNG：地图感背景、图钉、标题、地点数、标签摘要和生成时间。
4. 导出失败时给出可见错误，不生成空白文件。

验收重点：海报非空、图钉数量和当前筛选一致、无个人图钉时明确提示。

### 7.9 P17 待确认工作台链路

1. `FoodPlace` 根据 `mapAccuracy`、`tags`、坐标风险、候选状态生成待确认状态。
2. 首页筛选栏展示待确认数量和高风险数量。
3. 用户进入待确认工作台，按风险、最近更新、距离或原始评分排序。
4. 每个待确认项展示原始输入、当前坐标、风险原因、候选列表、证据摘要、确认、跳过和手动挪动入口。
5. 用户确认候选或手动挪动后，Domain 更新坐标、`mapAccuracy`、校准标签和审计时间。
6. 处理完成后，地图、列表、详情、筛选计数和分享图使用同一状态。

验收重点：待确认入口可见、候选确认不静默、手动挪动可撤销、处理后状态一致。

### 7.10 P17 详情页与移动主路径链路

1. 点击图钉或列表项进入详情。
2. 详情页按固定优先级展示：状态、可编辑标签、核心操作、照片、评分/时间/地址、笔记、坐标校准、地图跳转。
3. 桌面右栏内部滚动，移动端底部抽屉内部滚动，地图不得跟随详情滚动造成空白。
4. 标签新增/删除、评分展示、挪动图钉、外部地图链接均在详情页内可发现。
5. 移动端 390x844 下可完成查看、编辑标签、挪动图钉、打开地图和返回地图。

验收重点：多尺寸无截断、无不可滚动区域、无持久遮挡、详情操作可发现。

### 7.11 P17 图钉视觉与性能链路

1. `PinVisualStateModel` 计算图钉类型：verified personal、pending personal、selected、scanlist、reference、dense dot。
2. Map Adapter 只接收稳定状态，不在缩放过程中频繁重建 DOM。
3. 选中态用颜色/描边区分，不加突兀阴影，不产生闪烁。
4. 缩放中使用简化样式，缩放结束后再恢复完整图钉。
5. 真实数据组合下验收缩放、筛选、详情打开和图层切换。

验收重点：图钉状态可读、缩放不卡顿到不可用、选中态不闪烁。

## 8. 已接受架构基线：P8-P14

| 阶段 | 架构增量 | 关联模块 | 验收证据 |
| --- | --- | --- | --- |
| P8 | 刷新 diff、冲突治理、禁止自动覆盖 | `scripts`, `src/recommendations` | 刷新审计报告、diff 单测 |
| P9 | 图片/街景证据状态和 fallback | `src/recommendations`, `src/features/workspace` | 详情截图、broken/mismatch 测试 |
| P10 | 输入流加速、重复提醒、照片预览 | `src/features/workspace`, `src/domain`, `src/persistence` | 创建流 E2E、脏表单和重复提醒证据 |
| P11 | 来源/商圈/评分/距离/核验筛选 | `src/domain`, `src/features/workspace`, `src/map` | 列表与图钉计数一致、移动端截图 |
| P12 | Agent 契约增强、结构化错误、审计事件 | `src/agent`, `src/domain`, `src/persistence` | Agent 测试、事件证据 |
| P13 | 懒加载、图片加载、bundle 风险收束 | `src/app`, `src/features`, `src/map` | build stats、核心 E2E |
| P14 | 产品化验收闭环 | `docs/active`, `e2e`, `src/tests` | 最终报告、PRD 复检、截图包 |

## 9. 地图架构

UI 只能依赖 `MapProviderAdapter`，不能把业务规则写进高德或 Leaflet 的 provider 内部。

地图 provider 必须支持：

- 初始化到武汉视角。
- 渲染个人图钉和推荐图钉。
- 地图点击创建地点。
- 图钉点击打开详情。
- 聚焦指定地点或推荐项。
- 响应图层显隐和筛选。
- provider 失败时降级到可用地图。

图钉策略：

- 高优先级推荐使用可读排名图钉。
- 地图放大且屏幕内点数低于阈值时，小点进化为绿色图钉。
- 高密度场景保留小点或聚合式弱化展示，避免遮挡。
- 个人记录和推荐覆盖层不能混淆。

## 10. UX 状态架构

Workspace 同一时间只能突出一个主要任务面：

- `idle`
- `display`
- `list`
- `detail`
- `recommendation`
- `tools`
- `create`
- `edit`
- `filter`
- `importExport`
- `share`
- `pendingWorkbench`
- `movePin`
- `posterPreview`

桌面端左右面板默认收起，只露出半圆悬浮按钮。移动端使用互斥底部面板。打开新增、编辑、分享、导入导出、待确认工作台、挪动图钉等流程时，底部状态条和无关工具条必须隐藏或降级，避免遮挡主任务。详情页打开时地图 popup 不应继续叠加显示同一地点信息。

## 11. Agent Bridge 契约方向

本阶段允许增强以下能力：

- `getContext`
- `listPlaces`
- `getPlace`
- `setFilter`
- `focusPlace`
- `createPlaceDraft`
- `savePlace`
- `updatePlace`
- `deletePlace`
- `createSnapshot`
- `exportSnapshot`
- `loadRecommendations`
- `listRecommendations`
- `focusRecommendation`
- `saveRecommendationAsPlace`
- `recognizePlaceCandidates`
- `submitPlaceCandidates`
- `getPlaceCandidateContext`
- `listPendingPlaces`
- `getPendingPlaceContext`
- `startPinMove`
- `cancelPinMove`

结构化错误码必须稳定：

- `INVALID_PAYLOAD`
- `PLACE_NOT_FOUND`
- `UNVERIFIED_RECOMMENDATION`
- `POI_CONFLICT`
- `IMPORT_VALIDATION_FAILED`
- `EXPORT_FAILED`
- `UNSUPPORTED_ACTION`
- `PENDING_CONFIRMATION_REQUIRED`
- `PIN_MOVE_IN_PROGRESS`

P8-P14 详细实现以 [P8-P14 Implementation Contract](./p8-p14-implementation-contract.md) 为准。P16 真实地点联动、候选排序、地图跳转和传播图导出以 [P16 Real Place Linking Implementation Contract](./p16-real-place-linking-implementation-contract.md) 为准。P17 待确认工作台、详情页信息架构、移动主路径、图钉视觉、分享图预览和性能验收以 [P17 UX Trust Implementation Contract](./p17-ux-trust-implementation-contract.md) 为准。

## 12. 验收架构

每个阶段完成后必须同时完成：

- PRD 规格检视。
- 架构偏差检视。
- 真实数据证据检视：P17 必须覆盖扫街榜 50 条、钉图易参考层、个人收藏、待确认队列、候选校准、手动挪动、外部地图链接 fallback 和海报导出结果一致性。
- 命令验收：`npm run build`、`npm test`、`npx playwright test`。
- 截图验收：桌面 2048x768、1440x900、1280x820，平板 768x900，移动 390x844 和 430x932。
- 风险审计：事实错误、虚假验收、Agent 绕过、性能回退、详情截断、移动端不可滚动、图钉闪烁。

如果出现以下情况，必须停止进入下一阶段：

- 冲突或未核验 POI 出现在地图上。
- Agent 能绕过 UI/Domain/POI 准入。
- 缺失或不匹配证据被展示为已核验。
- 文档目标和实现目标不一致。
- 自动化测试通过但真实数据或截图证据无法支撑验收。
- 待确认地点无法被用户确认、跳过或手动纠错。
- 多尺寸截图出现半截控件、不可见详情区域或主路径遮挡。

## 13. 非目标

- 不做账号系统。
- 不做后端数据服务。
- 不做公网永久分享链接。
- 不做多人实时协作。
- 不做服务端照片存储。
- 不伪造高德私有榜单或不可核验来源。
- 不让低置信候选 POI 作为图钉展示。
- 不允许刷新脚本自动覆盖冲突坐标。
- 不允许 Agent 绕过领域校验和 POI 准入。
