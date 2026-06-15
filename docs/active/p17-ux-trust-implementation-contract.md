# FoodMap P17 UX Trust Implementation Contract

## 1. Binding Scope

P17 绑定范围是“体验可信度与移动主路径收束”。任何实现、测试和验收都必须同时满足以下目标：

- 不可信地点必须可见、可解释、可处理。
- 详情页必须成为查看、标签、纠错、导航和记录的稳定入口。
- 移动端必须能完成主路径，而不是桌面功能的缩小版。
- 图钉、筛选、分享图必须使用同一可见状态，不能各自维护事实。
- Agent 只能读取和提交候选，不得绕过用户确认固化坐标。

## 2. Domain Contract

### 2.1 Pending Place State

P17 使用以下状态描述个人地点的坐标可信度：

```text
verified
pending
manual-adjusted
blocked
skipped
```

映射规则：

- `verified`：坐标精确，且无待校准标签或阻塞风险。
- `pending`：坐标近似、候选未确认、用户输入缺少具体门店，或包含待校准标签。
- `manual-adjusted`：用户手动挪动并确认保存。
- `blocked`：坐标明显落水、桥上、城市外、缺少必要证据，不能提供误导性导航。
- `skipped`：用户暂时跳过确认，仍保持待确认入口可见。

### 2.2 Pin Move Audit Fields

手动挪动保存时应保留可审计字段：

```text
previousLongitude
previousLatitude
newLongitude
newLatitude
updatedAt
method = "manual-drag" | "candidate-confirm"
reason
```

若当前数据模型暂未持久化完整 audit history，P17 最低要求是在地点标签、`mapAccuracy` 或备注字段中保留可见状态，不得把手动调整伪装成原始精确坐标。

### 2.3 Rating Normalization

用户输入的百分制评分必须按以下公式归一到五分制展示：

```text
fiveStar = clamp((rawScore - 65) / 35 * 5, 0, 5)
```

要求：

- 保留原始百分制分数用于详情说明。
- 五分制用于星级展示和评分筛选。
- “百分制82”这类内容不得作为普通自定义标签污染标签筛选。

## 3. UI Flow Contract

### 3.1 Pending Place Workbench

待确认工作台必须展示：

- 待确认总数和高风险数量。
- 原始店名、用户原始评分、原始补充信息。
- 当前地址、经纬度和坐标风险原因。
- 候选门店列表，最多先展示 10 个。
- 每个候选的名称、地址、来源、置信度、坐标精度、理由。
- 操作：确认此门店、手动挪动、跳过、打开详情。

禁止：

- 将待确认列表做成只读报告。
- 确认候选前自动覆盖坐标。
- 对 blocked 地点展示“立即导航”。

### 3.2 Detail Page IA

详情页必须按以下顺序组织：

1. 返回/关闭与编辑/删除。
2. 地点状态和来源：我的收藏、待确认、已校准、高风险等。
3. 店名。
4. 可编辑标签。
5. 核心操作：打开地图/复制地址/手动挪动。
6. 照片或暂无照片状态。
7. 评分、到访时间、城市、地址。
8. 坐标风险和校准候选。
9. 笔记。

要求：

- 桌面右栏内部滚动，不让页面或地图跟随滚动。
- 移动端抽屉内部滚动，底部栏不得遮挡确认按钮。
- 长店名、长地址、长标签必须换行或收束，不得横向裁切。

### 3.3 Filter Command Bar

首页筛选栏必须遵守：

- 高频常驻：扫街榜、参考、待确认、标签、更多。
- 低频动作：分享图、完整筛选、导入导出可进入更多或压缩为图标。
- 目标尺寸：2048x768、1440x900、1280x820、768x900、390x844。
- 所有可见控件必须完整在容器内，不得出现半截按钮。

### 3.4 Pin Visual State

图钉视觉含义：

| State | Visual Requirement |
| --- | --- |
| verified personal | 绿色主图钉 |
| pending personal | 橙色或暖色待确认图钉 |
| selected | 使用稳定颜色/描边变化，不使用闪烁或突兀阴影 |
| scanlist | 与个人收藏明显不同，可带榜单符号但不得遮挡数字 |
| reference | 低优先级参考样式，不与个人收藏混淆 |
| dense dot | 缩小时使用简化点，放大后恢复图钉 |

点击、缩放、打开详情时，不得出现图钉短暂变回默认色的闪烁。

### 3.5 Share Poster

分享图导出必须读取同一筛选状态：

- 当前可见个人图钉。
- 当前标签/状态/来源筛选。
- 标题。
- 地点数。
- 标签摘要。
- 生成时间。

若当前无个人图钉，应明确提示，不得导出空白成功状态。

## 4. Agent Contract

P17 可新增或增强以下 Agent action：

```text
listPendingPlaces
getPendingPlaceContext
focusPlace
setFilter
submitPlaceCandidates
```

限制：

- Agent 可读取待确认上下文。
- Agent 可提交结构化候选。
- Agent 不得直接固化候选坐标。
- Agent 不得直接删除或隐藏待确认地点。
- 坐标变更必须通过 UI/Domain 确认路径。

## 5. Acceptance Fixture Contract

P17 最小验收 fixture：

- 50 条扫街榜推荐。
- 100+ 条钉图易参考层。
- 30+ 条个人收藏。
- 10+ 条待确认地点。
- 3 条高风险坐标地点。
- 3 条候选可确认地点。
- 2 条可手动挪动地点。
- 2 条长店名/长地址地点。
- 5 条标签丰富地点。

验收时必须使用真实或确定性 fixture，不得用空地图通过 P17。

## 6. Blocker Rules

以下任一情况出现时，P17 不得出门：

- 待确认地点没有集中处理入口。
- 坐标明显不可信却仍提供精确导航。
- 详情页在目标尺寸下截断或不可滚动。
- 手动挪动没有取消路径。
- 图钉点击或缩放时闪烁。
- 筛选栏出现半截按钮。
- 分享图与当前筛选结果不一致。
- Agent 能绕过用户确认改坐标。
- 未使用真实数据组合进行验收。
