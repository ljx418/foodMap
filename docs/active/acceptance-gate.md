# FoodMap P18 Acceptance Gate

## P18 Gate Status

Current status: `Planning Baseline Ready`.

This gate allows P18-2 development to start after documentation review. It does not certify that P18 is implemented or accepted. P18 can be declared complete only after all blocker gates, real-data evidence, mobile screenshots, large-dataset performance smoke, Agent negative tests, and final acceptance reporting are complete.

## P18 工作流验收编排

P18 必须按工作流收口，不能只验收候选搜索后宣布阶段完成。

| Workstream | Required Evidence | Must Pass Before |
| --- | --- | --- |
| W18-A 坐标准确性与候选校准 | 待确认工作台、详情候选搜索、候选确认、跳过、手动挪动、刷新持久化 E2E | P18-4 出门、P18 总验收 |
| W18-B 详情页和移动主路径 | 390x844、430x932、768x900 详情截图；标签/评分/校准/地图跳转可达 E2E | P18-5 出门、P18 总验收 |
| W18-C 首页筛选与图层解释 | 多筛选组合下地图、列表、详情、分享图点数一致；清空筛选可恢复 | P18-5 出门、P18 总验收 |
| W18-D 分享传播体验 | 标题编辑、当前视野/当前筛选模式、PNG 非空和点数一致 E2E | P18-6 出门、P18 总验收 |
| W18-E 数据健康与性能 | 个人数据体检截图；真实数据与 500/1000/3000 点性能 JSON | P18-7 出门、P18 总验收 |
| W18-F Agent 和验收治理 | Agent negative E2E；PRD 规格检视；最终验收报告 | P18-8 出门 |

## P18 必过门槛

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| 文档一致 | PRD、目标架构、计划、里程碑、验收门槛、gap drawio、P18 contract 均指向 P18 六条工作流和阶段门槛 | 文档仍只描述 P17、只描述候选搜索或互相矛盾 |
| 候选搜索入口 | 待确认工作台和详情页能发起搜索更多候选、复制搜索词、打开地图搜索和手动挪动 | 用户只能关闭详情或手动猜位置 |
| Provider fallback | 无高德 Key 或搜索失败时，流程继续并展示复制/网页地图/manual fallback | 无 Key 时流程中断，或假装已完成实时搜索 |
| 候选证据 | 候选卡显示来源、地址、置信度、坐标精度、风险理由和证据说明 | 候选只显示店名或缺少可信度信息 |
| 候选确认 | 用户确认前不得修改坐标；确认后状态同步到地图、列表、详情、筛选摘要和分享图 | 候选点击即静默保存，或确认后事实不一致 |
| 手动挪动预览 | 保存前展示原坐标、新坐标、变更方式、确认/取消和校准含义 | 拖动即保存，或用户不知道保存后状态 |
| 审计持久化 | 候选确认或手动挪动后刷新仍保留 `mapAccuracy`、标签或 notes 审计兜底 | 刷新后校准状态丢失 |
| 移动详情 | 390x844、430x932 下状态、标签、核心动作、校准入口可见；长内容可展开 | 核心动作被折叠隐藏、截断或不可滚动 |
| 筛选摘要 | 首页解释当前可见点数、启用筛选、待确认数和图层状态，并可清空 | 用户不知道为什么图钉消失 |
| 分享图 composer | 支持标题编辑和当前视野/当前筛选模式，导出与选择一致 | PNG 空白、点数错误或模式不生效 |
| 数据体检 | 个人收藏能按已核验、待确认、高风险、手动校准分组展示 | 不可信地点被隐藏或无法定位 |
| 大数据性能 | 500、1000、3000 点下缩放、筛选、详情打开、分享预览有 smoke 证据 | 只用小数据或空数据验收 |
| Agent 边界 | Agent 可读上下文、提交候选和解释风险，但不能固化坐标、删除、隐藏待确认 | Agent 绕过用户确认污染地点事实 |
| 回归基线 | P16/P17 已验收主路径仍通过 | 旧能力被破坏 |
| 命令回归 | `npm run build`, `npm test`, `npx playwright test`, `npm run verify:scanlist` 全部通过 | 任一命令失败 |

## P18 Required Commands

```bash
npm run build
npm test
npx playwright test
npm run verify:scanlist
```

## P18 Required Fixtures

P18 验收必须包含以下真实或确定性样例：

| Fixture | Purpose |
| --- | --- |
| 扫街榜 50 条 | 验证推荐参考层和真实数据回归 |
| 钉图易参考层 120 条 | 验证参考层、候选参考和性能 |
| 个人收藏 30+ 条 | 验证详情、标签、筛选、分享图和数据体检 |
| 待确认个人地点 10+ 条 | 验证候选搜索、确认、跳过和手动挪动 |
| 高风险坐标地点 3 条 | 验证风险说明和导航降级 |
| 有候选地点 3 条 | 验证候选证据卡和确认路径 |
| 无 provider Key 场景 2 条 | 验证复制/网页地图/manual fallback |
| 手动挪动地点 2 条 | 验证新旧坐标预览和审计兜底 |
| 长店名/长地址/长标签地点 3 条 | 验证移动详情渐进披露 |
| 500/1000/3000 点模拟数据 | 验证大数据性能 smoke |

## P18 Manual And Evidence Scenarios

1. 在 clean profile 打开 `#/map`，确认 P17 基线仍成立。
2. 导入真实个人收藏，打开待确认工作台。
3. 在待确认详情中点击“搜索更多候选”，无 Key 时检查 fallback。
4. 使用 provider mock 或 Agent 候选提交，检查候选卡证据字段。
5. 确认候选前后对比坐标、`mapAccuracy`、标签和筛选摘要。
6. 手动挪动图钉，取消一次、确认一次，刷新后检查审计兜底。
7. 移动端检查详情首屏和折叠内容可达。
8. 启用多条件筛选，检查筛选摘要和一键清空。
9. 编辑分享图标题，分别导出当前视野和当前筛选结果。
10. 运行 500、1000、3000 点性能 smoke，保存 JSON。
11. 通过 Agent Bridge 验证直接固化坐标、删除或隐藏 pending place 被拒绝。
12. 运行扫街榜基线，确认 50 条核验数据未被破坏。

## P18 Exit Conditions

P18 只有在以下条件全部满足时才能出门：

- 所有 P18 blocker gate 通过。
- 完整候选搜索和可信校准用户历程可端到端验收。
- 无 provider Key、provider 失败、Agent 候选、手动挪动等风险路径均有可见 fallback。
- 移动详情、筛选摘要、分享图 composer 和大数据性能均有截图或 JSON 证据。
- Agent 边界和外部地图降级路径清楚。
- active 文档和 drawio 与实现一致。
- P18 final acceptance report 或阶段验收摘要已创建。

Historical P1-P17 gates and reports are archived or retained as completed baseline documents; this active gate describes P18 blocker conditions.
