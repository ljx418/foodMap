# FoodMap P18 Development And Acceptance Plan

## P18 Summary

P18 的当前阶段目标是把 P17 已完成的“可见、可处理、可移动端完成”的可信体验，继续推进到“更容易找到正确候选、更安全地校准坐标、更适合传播”的产品体验。

P18 不引入账号、后端、云同步或公网永久分享链接。P16/P17 的真实地点候选、外部地图跳转、扫街榜 50 条、钉图易参考层、待确认工作台、详情页 IA、移动主路径、分享图预览和 Agent 安全边界均作为回归基线保留。

## P18 Planning Baseline Decision

Current audit decision: `Plan Ready for P18-2 development after document review`.

Allowed claim:

- P18 planning, architecture, implementation contract, and acceptance baseline are ready.

Disallowed claim:

- P18 implementation is complete.
- FoodMap already guarantees external realtime POI search without configured provider or Agent evidence.
- FoodMap can automatically correct every uncertain location without user confirmation.

## P18 Workstream Orchestration

P18 的开发不能只按单一线性任务理解。候选搜索是入口能力，其他体验目标必须同步编排到阶段计划、E2E 和出门门槛中。

| Workstream | Development Goal | Planned Phases | Acceptance Focus | Blocking Risk |
| --- | --- | --- | --- | --- |
| W18-A 坐标准确性与候选校准 | 从不可信地点进入候选搜索、确认、跳过、手动挪动闭环 | P18-2, P18-3, P18-4 | 10+ 待确认地点端到端处理；确认前不改坐标；刷新后状态保留 | 错点继续上图且无可用纠错路径 |
| W18-B 详情页和移动主路径 | 解决详情拥挤、截断、滚动、核心动作不可达 | P18-4, P18-5 | 390x844、430x932、768x900 截图；详情内标签、评分、校准、地图跳转可达 | 移动端看得到信息但完不成操作 |
| W18-C 首页筛选与图层解释 | 解释当前可见点、筛选原因、图层状态和恢复路径 | P18-5, P18-8 | 地图、列表、详情、分享图点数一致；清空筛选可恢复 | 用户误以为数据丢失或筛选失效 |
| W18-D 分享传播体验 | 分享图从导出能力升级为可编辑、可预览、可传播 | P18-6, P18-8 | 标题、模式、地点数、标签摘要、生成时间一致 | 传播图导出错集或空白 |
| W18-E 数据健康与性能 | 真实个人收藏和大数据量下仍可诊断、筛选和查看 | P18-7, P18-8 | 真实数据 + 500/1000/3000 点 smoke；数据体检截图 | 只在小数据下可用 |
| W18-F Agent 和验收治理 | Agent 可辅助候选和风险解释，但不能污染事实 | P18-3, P18-8 | negative E2E；PRD 规格检视；最终验收报告 | Agent 绕过用户确认改坐标 |

每个子阶段开始前必须从上表选定关联工作流，并写明本阶段验收标准。若某个工作流验收失败，必须回到该工作流计划阶段修订，而不是用其他工作流通过结果抵消。

## P18 Development And Acceptance Outline

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P18-1 | 文档冻结：PRD、目标架构、计划、里程碑、验收门槛、gap drawio、P18 contract 更新 | 文档审计、drawio XML 校验、审计路径清单 | 文档完整支撑 P18 开发与验收 |
| P18-2 | 候选搜索入口和 provider fallback | 待确认详情/工作台 E2E、无 Key fallback E2E | 用户能搜索更多候选，且无 Key 时流程不中断 |
| P18-3 | 候选证据模型和候选卡片重构 | 单测 + 详情/工作台 E2E | 候选展示来源、置信度、坐标精度、证据和风险理由 |
| P18-4 | 手动挪动审计预览 | 移动/桌面挪动 E2E | 保存前展示新旧坐标、确认/取消、审计兜底 |
| P18-5 | 移动详情渐进披露和首页筛选摘要 | 390x844、430x932、768x900 截图 | 首屏核心动作可见；筛选原因和可见点数可解释 |
| P18-6 | 分享图 composer 升级 | PNG 非空、标题/模式/点数一致 E2E | 支持标题编辑、当前视野/当前筛选结果模式 |
| P18-7 | 个人数据体检和大数据性能验收 | 真实数据 + 500/1000/3000 点 smoke | 数据体检可见；真实和模拟数据下性能可用 |
| P18-8 | Agent 边界、总验收与 PRD 规格检视 | build/test/e2e/verify:scanlist + final report | 无 blocker，无重大规格偏差或虚假验收风险 |

## P18 Detailed Development And Acceptance Plan

| Subphase | Development Tasks | Acceptance Standard | Audit Focus |
| --- | --- | --- | --- |
| P18-2A 搜索入口 | 在待确认工作台和详情页增加“搜索更多候选/复制搜索词/打开地图搜索/手动挪动”入口 | E2E 覆盖待确认地点发起搜索和 fallback | 无 provider 时不能中断流程 |
| P18-2B Provider fallback | 高德 Web 服务 Key 仍本地保存；无 Key 展示复制和网页地图搜索 | E2E 覆盖有 Key mock、无 Key、搜索失败 | 不得伪装成实时 POI 搜索 |
| P18-3A 候选证据模型 | 扩展候选字段：证据、风险、match signals、lastCheckedAt | 单测覆盖字段映射和默认值 | 候选必须可追溯 |
| P18-3B 候选卡片 | 候选卡显示来源、置信度、坐标精度、风险理由和证据入口 | 桌面/移动截图 + E2E | 防止“只显示店名”的假候选 |
| P18-4A 挪动预览 | 保存前展示原坐标、新坐标、方式、风险说明 | E2E 覆盖取消和确认 | 防止误触保存 |
| P18-4B 审计持久化 | 保存后保留 `mapAccuracy`、标签或 notes 审计兜底 | 刷新后 E2E 检查 | 防止刷新后校准状态丢失 |
| P18-5A 移动详情折叠 | 照片、长笔记、候选历史、高级搜索按需展开 | 390x844/430x932 截图 | 核心动作不能被折叠隐藏 |
| P18-5B 筛选摘要 | 首页显示筛选原因、可见点数、待确认数、图层状态和清空入口 | 多尺寸 E2E | 用户必须知道为什么点变少 |
| P18-6A 分享图 composer | 支持标题编辑、当前视野/当前筛选模式 | PNG 非空、点数和模式一致 | 防止传播图错集 |
| P18-7A 数据体检 | 导入/历史个人收藏按可信状态生成摘要和下一步建议 | E2E + 报告截图 | 不可信地点不能被隐藏 |
| P18-7B 大数据性能 | 500/1000/3000 点模拟数据验证缩放、筛选、详情、分享预览 | 性能 JSON 证据 | 防止只在小数据可用 |
| P18-8A Agent 边界 | Agent 可提交候选和解释风险，不能固化坐标/删除/隐藏 | Negative E2E | 防止 Agent 污染地点事实 |
| P18-8B 总验收 | 命令、截图、真实数据、PRD 规格检视、架构偏差检视 | 最终验收报告 | 无新增致命或重大风险 |

## P18 Required Acceptance Scenarios

1. 清洁状态进入 `#/map`，P17 基线仍成立。
2. 导入真实个人收藏后，待确认数量、详情和工作台仍可用。
3. 在待确认详情中点击“搜索更多候选”，无高德 Key 时展示复制搜索词和打开外部地图搜索 fallback。
4. 有 provider mock 时返回候选，候选卡展示来源、置信度、坐标精度、风险理由和证据。
5. 用户确认候选前，地点坐标、`mapAccuracy` 和待确认状态不变。
6. 用户确认候选后，地图、列表、详情、筛选摘要和分享图使用同一事实。
7. 用户手动挪动图钉，保存前能看到新旧坐标和确认/取消。
8. 移动端详情首屏展示状态、标签、核心动作和校准入口，长内容可展开。
9. 首页筛选摘要解释当前可见点数和启用条件，一键清空可恢复。
10. 分享图支持标题编辑和模式选择，导出与当前视野或当前筛选一致。
11. 500、1000、3000 点模拟数据下缩放、筛选、详情打开和分享预览可用。
12. Agent 直接固化坐标、删除地点、隐藏待确认状态会被拒绝。
13. `npm run verify:scanlist` 仍证明 50 条扫街榜基线有效。

## P18 Required Commands

```bash
npm run build
npm test
npx playwright test
npm run verify:scanlist
```

## P18 Audit Opinion

- 审计状态：`Plan Ready`。P18 目标已从体验候选、详情移动、筛选图层、分享传播、数据性能、Agent 治理六条工作流拆成可开发、可验收、可审计的阶段目标。
- 阶段判定：可进入 P18-2 开发，但不得声明 P18 已实现完成。
- 编码前必须确认：PRD、目标架构、计划、里程碑、验收门槛、gap drawio 和 P18 contract 均描述同一范围。
- P18 的高风险点是：无 provider 时伪装搜索成功、候选证据不足、候选点击静默改坐标、移动详情再次拥挤、筛选摘要与地图事实不一致、分享图模式和导出事实不一致、性能只用小数据验收、Agent 绕过确认。

Historical P1-P17 plans and reports are archived or retained as completed baseline documents; this active plan describes the current P18 stage.
