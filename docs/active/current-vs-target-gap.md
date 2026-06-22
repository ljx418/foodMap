# FoodMap P18 Current vs Target Gap

## P18 差异总览

| 维度 | 当前已具备 | P18 目标 | 缺口处理 |
| --- | --- | --- | --- |
| 可信校准基线 | P17 已具备待确认工作台、详情 IA、手动挪动、移动主路径和 Agent 边界 | 用户能更容易找到正确候选并完成可信校准 | 新增候选搜索入口和证据模型 |
| 候选搜索 | 详情页已有高德搜索卡和候选确认能力，但入口和 fallback 仍分散 | 待确认详情/工作台统一搜索更多候选，支持无 Key fallback | `CandidateSearchWorkbench` |
| 候选证据 | 候选有来源、置信度、坐标精度等基础字段 | 候选显示证据、风险理由、match signals、lastCheckedAt | `CandidateEvidenceModel` |
| Provider 降级 | 高德 Web 服务 Key 可本地保存；无 Key 时体验仍偏技术 | 无 Key/失败时提供复制搜索词、外部地图网页和手动挪动 | `ExternalMapSearchFallback` |
| 手动挪动 | 可启动、取消、确认并保留审计兜底 | 保存前展示新旧坐标、校准含义和风险说明 | `PinMoveAuditPreview` |
| 移动详情 | P17 已修复滚动和横向截断 | 首屏更精简，高级内容渐进展开 | `MobileDetailProgressiveDisclosure` |
| 首页筛选 | 控件不截断，筛选能生效 | 用户能看到当前筛选原因、可见点数和清空入口 | `FilterStateExplainer` |
| 分享图 | 可预览、可导出并读取当前筛选 | 支持标题编辑、当前视野/当前筛选模式 | `SharePosterComposer` |
| 数据治理 | 待确认和高风险地点可见 | 对个人收藏生成可信度体检摘要和下一步建议 | `PersonalDataHealthReport` |
| 性能 | 真实数据 32+50+120 smoke 通过 | 500、1000、3000 点模拟数据 smoke | `LargeDatasetPerformanceHarness` |
| Agent | Agent 只读 pending context，不能直接固化坐标 | Agent 可解释风险和提交候选，但继续禁止确认/删除/隐藏 | 扩展 Agent negative tests |

## P18 工作流差距编排

| Workstream | Current Gap | Target Closure | Evidence Required |
| --- | --- | --- | --- |
| W18-A 坐标准确性与候选校准 | 用户仍可能看到错点，但继续找候选和判断候选的路径不够集中 | 待确认详情/工作台统一搜索、证据、确认、跳过、挪动 | 候选搜索 E2E、手动挪动 E2E、刷新持久化检查 |
| W18-B 详情页和移动主路径 | 详情信息多时仍容易出现拥挤、截断或操作入口分散 | 首屏只放状态、店名、标签、核心动作和校准入口 | 多尺寸截图和移动主路径 E2E |
| W18-C 首页筛选与图层解释 | 用户能筛选，但不一定知道当前显示结果的原因 | 显示筛选摘要、图层状态、待确认数、清空入口 | 多筛选组合一致性 E2E |
| W18-D 分享传播体验 | 分享图可导出，但编辑与模式选择不足 | 分享图 composer 支持标题、当前视野/当前筛选模式 | PNG 非空和事实一致检查 |
| W18-E 数据健康与性能 | 真实数据量可用，但超大数据量和个人体检证据不足 | 数据体检 + 500/1000/3000 点性能 smoke | 数据体检截图和性能 JSON |
| W18-F Agent 和验收治理 | Agent 边界已有基线，但 P18 新候选能力需继续防绕过 | Agent 只能提交候选和解释风险，总验收复核 PRD | Agent negative E2E 和 final report |

## P18 Target State

P18 的目标不是引入后端或自动替用户修正所有地点，而是在纯前端约束下让“找候选、判断候选、确认坐标、传播地图”更顺：

1. 用户在待确认详情和工作台内能继续找候选，不会卡在“只有一个错点”的状态。
2. 每个候选都有来源、置信度、坐标精度、风险理由和证据说明。
3. 没有高德 Key 或 provider 失败时，仍可复制搜索词、打开网页地图或手动挪动。
4. 手动挪动前后坐标和校准含义可见，防止误触保存。
5. 移动详情首屏只放核心内容，高级信息不再挤压主路径。
6. 首页筛选摘要解释地图为什么只显示当前这些点。
7. 分享图支持标题和模式选择，导出结果和用户选择一致。
8. 大数据量下地图、筛选、列表、详情和分享预览仍可用。
9. Agent 只能辅助候选和解释，不能绕过用户确认污染地点事实。

Current decision: P18 planning baseline is ready after documentation review. This is not an implementation-complete or acceptance-complete claim.

## P18 Development Path

1. P18-1：文档冻结和 drawio 校验。
2. P18-2：候选搜索入口和 provider fallback。
3. P18-3：候选证据模型和候选卡片重构。
4. P18-4：手动挪动审计预览。
5. P18-5：移动详情渐进披露和首页筛选摘要。
6. P18-6：分享图 composer 升级。
7. P18-7：个人数据体检和 500/1000/3000 点性能验收。
8. P18-8：Agent 边界、总验收和 PRD 规格检视。

## P18 Risks And Controls

- 伪搜索风险：无 provider Key 或 provider 失败时必须展示 fallback，不能宣称已完成实时搜索。
- 候选误导风险：候选缺少来源、置信度或坐标精度时不能显示为高可信。
- 静默固化风险：候选确认前不得改变地点坐标。
- 挪动误触风险：保存前必须展示新旧坐标和确认/取消。
- 移动端风险：核心动作不能被折叠到用户找不到的位置。
- 分享错集风险：当前视野和当前筛选模式必须明确，导出必须一致。
- 性能风险：必须用 500、1000、3000 点模拟数据验收。
- Agent 绕过风险：Agent 只能提交候选和解释风险，不能直接确认、删除或隐藏。
- 文档漂移风险：PRD、架构、计划、门槛和 drawio 必须同时更新。

Historical P1-P17 gaps and acceptance reports are archived or retained as completed baseline documents; this active gap document describes P18.
