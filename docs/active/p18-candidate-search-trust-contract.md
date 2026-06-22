# FoodMap P18 Candidate Search And Trust Calibration Contract

## 1. Binding Scope

P18 绑定范围是“地点候选搜索与可信校准体验增强”。实现、测试和验收必须同时满足：

- 用户能从待确认详情或工作台继续查找候选。
- 候选必须可解释、可追溯、可拒绝，不能静默固化坐标。
- 没有外部 provider Key 时流程仍可用，必须提供复制搜索词、打开网页地图或手动挪动 fallback。
- 手动挪动保存前必须展示新旧坐标和校准含义。
- Agent 只能辅助找候选和解释风险，不能替用户确认最终坐标。

P18 contract 同时约束以下开发工作流，不能只实现候选搜索入口后宣布阶段完成：

| Workstream | Binding Result |
| --- | --- |
| W18-A 坐标准确性与候选校准 | 不可信地点必须有候选搜索、候选确认、跳过、手动挪动的至少一种闭环路径 |
| W18-B 详情页和移动主路径 | 详情首屏必须能完成查看状态、编辑标签、校准位置、打开地图或复制 fallback |
| W18-C 首页筛选与图层解释 | 筛选摘要、地图、列表、详情和分享图必须共享同一筛选事实 |
| W18-D 分享传播体验 | 分享图必须支持用户确认导出范围，不能默认导出错误点集 |
| W18-E 数据健康与性能 | 不可信地点必须可见，且真实数据和大数据 smoke 都需要证据 |
| W18-F Agent 和验收治理 | Agent 只能辅助候选和解释，不能绕过用户确认改变地点事实 |

## 2. Candidate Data Contract

P18 候选必须兼容现有 `PlaceCandidate`，并补充以下可选字段：

```text
evidenceUrl
evidenceLabel
screenshotPath
providerQuery
riskReasons
matchSignals
lastCheckedAt
requiresUserConfirmation = true
```

最低展示字段：

- 名称。
- 地址或缺地址提示。
- 来源：历史、本地文本、扫街榜、钉图易参考、Agent、高德 Web 服务、网页地图 fallback、手动输入。
- 坐标精度：精确、近似、推断、未知。
- 置信度。
- 排序/风险理由。

## 3. Provider Order

候选来源按以下顺序汇聚：

```text
history
personal-pending-context
scanlist
dingtuyi-reference
text
agent
amap-web-service
external-map-link
manual
```

规则：

- `amap-web-service` 只有在用户本机配置 Key 时启用。
- `external-map-link` 只生成可点击或可复制 fallback，不得伪装成已解析 POI。
- `agent` 只能提交结构化候选，不能保存地点。
- `manual` 表示用户手动挪动或手动输入坐标，需要更明显的审计标记。

## 4. UI Contract

### 4.1 Candidate Search Entry

待确认工作台和详情页必须提供：

- 搜索更多候选。
- 复制搜索词。
- 打开外部地图搜索。
- 手动挪动图钉。
- Agent 可提交候选的说明或入口。

### 4.2 Candidate Cards

候选卡片必须展示：

- 名称和地址。
- 来源标签。
- 置信度和坐标精度。
- 排序理由。
- 证据链接/截图说明，如存在。
- “确认此门店”或“挪到此地点”动作。

禁止：

- 只展示店名。
- 候选点击即保存且无确认。
- 对未知/近似坐标展示精确导航暗示。

### 4.3 Manual Pin Move Audit Preview

保存前必须展示：

- 原坐标。
- 新坐标。
- 变更方式：手动拖动或候选确认。
- 保存后的状态：手动校准或已核验。
- 取消和确认动作。

如果当前数据模型暂不保存完整 audit history，必须至少在 `tags`、`mapAccuracy` 或 `notes` 中保留可见审计兜底。

### 4.4 Mobile Progressive Disclosure

390x844 和 430x932 下，详情页首屏优先级：

1. 状态和来源。
2. 店名。
3. 标签。
4. 核心动作：复制/地图 fallback、搜索候选、手动挪动、分享图。
5. 坐标可信度摘要。

照片、长笔记、候选历史和高级搜索可折叠，但不能完全不可达。

## 5. Agent Contract

允许 action：

```text
listPendingPlaces
getPendingPlaceContext
submitPlaceCandidates
explainPlaceRisk
focusPlace
setFilter
```

禁止 action：

```text
finalizeCandidateCoordinate
deletePendingPlace
hidePendingPlace
markPlaceVerifiedWithoutUserConfirmation
storeProviderKey
```

Negative acceptance:

- Agent 直接改坐标必须返回结构化错误。
- Agent 删除或隐藏待确认地点必须返回结构化错误。
- Agent 提交候选后，地点坐标、`mapAccuracy` 和待确认状态不得在用户确认前改变。

## 6. Performance Fixture Contract

P18 性能验收必须覆盖：

- 50 条扫街榜。
- 120 条钉图易参考。
- 32 条当前个人收藏真实 fixture。
- 10+ 条待确认地点。
- 500、1000、3000 点模拟个人地点。

最低 smoke：

- 地图缩放。
- 筛选切换。
- 待确认工作台打开。
- 详情打开。
- 分享图预览打开。

## 7. Exit Gates

P18 不得出门，若出现任一情况：

- 无 Key 时候选搜索流程中断，且没有 fallback。
- 候选缺少来源、置信度或坐标精度。
- 候选确认前已修改地点坐标。
- 手动挪动没有保存前确认。
- 移动端详情首屏核心动作不可见或不可达。
- 分享图模式选择与导出结果不一致。
- Agent 能绕过用户确认固化坐标。
- 500/1000/3000 点性能 smoke 没有证据。
