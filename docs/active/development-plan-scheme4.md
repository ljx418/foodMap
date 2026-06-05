# FoodMap V1.0 具体开发计划

> 对应 PRD：方案四「旅行手账风」  
> 目标：在纯前端、本地优先范围内交付可创建、可编辑、可筛选、可上传照片、可分享快照、可导入导出的美食地图应用。

## 0. 开发原则

1. **先跑通核心闭环，再做视觉细节。**  
   核心闭环是：创建点位 → 保存 IndexedDB → 地图显示 → 查看详情 → 上传照片 → 分享快照 → 导出导入。

2. **UI 以 PRD 里的旅行手账风为准，但不要先写复杂装饰。**  
   第一阶段只实现色彩、圆角、边框、纸感卡片和基础图标。胶带、邮戳、纸夹等装饰必须后置。

3. **所有业务数据本地优先。**  
   V1.0 不引入账号、后端、云同步和公网链接。

4. **地图 provider 必须可替换。**  
   UI 不直接依赖 AMap 或 Leaflet，而是只依赖 `MapProviderAdapter`。

5. **移动端不是缩小版桌面端。**  
   桌面端使用左侧面板和右侧详情；移动端使用顶部搜索和底部抽屉。

---

## 1. 目标目录结构

建议目录：

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── AppShell.tsx
│
├── domain/
│   ├── types.ts
│   ├── filters.ts
│   ├── validators.ts
│   └── sampleData.ts
│
├── persistence/
│   ├── db.ts
│   ├── placeRepository.ts
│   ├── layerRepository.ts
│   ├── photoRepository.ts
│   ├── snapshotRepository.ts
│   └── importExportCodec.ts
│
├── map/
│   ├── MapProviderAdapter.ts
│   ├── createMapProvider.ts
│   ├── amap/
│   │   └── AMapProvider.ts
│   └── leaflet/
│       └── LeafletProvider.ts
│
├── features/
│   ├── workspace/
│   │   ├── MapWorkspace.tsx
│   │   ├── WorkspaceHeader.tsx
│   │   ├── LayerPanel.tsx
│   │   ├── MapCanvas.tsx
│   │   ├── MapTools.tsx
│   │   ├── PlaceDetailDrawer.tsx
│   │   ├── PlaceEditorModal.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── SearchBox.tsx
│   │   ├── ShareSnapshotDialog.tsx
│   │   └── ImportExportDialog.tsx
│   │
│   └── share/
│       ├── ShareView.tsx
│       ├── ShareHeader.tsx
│       ├── ShareLayerPanel.tsx
│       └── SharePlaceDrawer.tsx
│
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Drawer.tsx
│   ├── Modal.tsx
│   ├── RatingStars.tsx
│   ├── TagChips.tsx
│   ├── PhotoUploader.tsx
│   ├── PhotoStrip.tsx
│   ├── EmptyState.tsx
│   └── Toast.tsx
│
├── styles/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   └── travel-journal.css
│
└── tests/
    ├── unit/
    └── e2e/
```

---

## 2. Milestone M0：文档与设计基线

### 2.1 任务

- 将本 PRD 保存到：
  - `docs/active/product-requirements-document.md`
  - `docs/V1.0/product-requirements-document.md`
- 将开发计划保存到：
  - `docs/active/development-plan-scheme4.md`
  - `docs/V1.0/development-plan-scheme4.md`
- 将 Figma 提示词保存到：
  - `docs/active/figma-prompts-scheme4.md`
  - `docs/V1.0/figma-prompts-scheme4.md`
- 在 `docs/active/README.md` 增加三份文档链接。

### 2.2 交付物

- PRD 文档
- 开发计划文档
- Figma 提示词文档
- README 文档索引更新

### 2.3 验收标准

- 文档明确 V1.0 是纯前端、本地优先。
- 文档明确采用方案四：旅行手账风。
- 文档不引入后端、登录、实时同步、公网分享链接。

---

## 3. Milestone M1：前端工程初始化

### 3.1 任务

- 初始化 Vite + React + TypeScript。
- 安装并配置 Hash Router。
- 建立 `#/map` 和 `#/share/:snapshotId` 路由。
- 添加基础 AppShell。
- 添加 CSS tokens：颜色、间距、圆角、阴影、z-index。
- 配置 Vitest。
- 配置 Playwright。

### 3.2 关键实现点

- 默认路由重定向到 `#/map`。
- `#/share/:snapshotId` 即使数据不存在，也要展示“导入快照”的空状态。
- AppShell 不做营销导航，只为工作台和分享页提供基础容器。

### 3.3 交付物

- 可启动的前端项目
- 基础路由
- 空地图工作台 shell
- 空分享页 shell
- 基础 CSS tokens
- 初始测试配置

### 3.4 验收标准

```bash
npm run dev
npm run build
npm test
npx playwright test
```

浏览器访问：

- `#/map` 能看到工作台壳。
- `#/share/demo` 能看到分享页壳或空状态。

---

## 4. Milestone M2：Domain + IndexedDB 本地数据核心

### 4.1 任务

- 定义核心类型：
  - `FoodPlace`
  - `FoodLayer`
  - `PhotoAsset`
  - `ShareSnapshot`
  - `FoodFilterState`
- 实现 validation helpers。
- 建立 IndexedDB stores：
  - `places`
  - `layers`
  - `photos`
  - `snapshots`
  - `meta`
- 实现 repository：
  - place CRUD
  - layer CRUD
  - photo save/load/delete
  - snapshot create/load/delete
- 实现导入导出 codec 初版。

### 4.2 IndexedDB store 建议

```text
foodmap-db
├── places      keyPath: id
├── layers      keyPath: id
├── photos      keyPath: id, indexes: placeId
├── snapshots   keyPath: id
└── meta        keyPath: key
```

### 4.3 默认数据

首次进入且没有用户数据时，创建默认图层：

```text
必吃餐厅 / star / #C76A32
咖啡馆 / coffee / #8A5A3B
小吃快餐 / bowl / #6F7F47
甜品饮品 / heart / #D98A7A
想去清单 / pin / #8C7AA9
```

### 4.4 交付物

- Domain 类型
- IndexedDB 存储
- Repository 单元测试
- 导入导出基础校验

### 4.5 验收标准

- 创建地点后刷新页面，地点仍存在。
- 创建图层后刷新页面，图层仍存在。
- 上传照片后刷新页面，缩略图仍存在。
- 导入错误 JSON 不破坏已有数据。

---

## 5. Milestone M3：地图 Provider 层

### 5.1 任务

- 定义 `MapProviderAdapter` 接口。
- 实现 `createMapProvider()`：
  - 有 `VITE_AMAP_KEY`：创建 AMap provider。
  - 无 `VITE_AMAP_KEY`：创建 Leaflet provider。
- Leaflet provider 接入 OpenStreetMap fallback。
- Provider 支持：
  - initialize
  - destroy
  - setPlaces
  - focusPlace
  - setLayerVisibility
  - searchPlaces
  - locateByCoordinates
  - onPlaceClick
  - onMapClick

### 5.2 行为要求

- 地图初始化失败时不白屏，展示可理解错误状态。
- marker 样式使用图层颜色和图标。
- 点击 marker 必须返回 placeId。
- 点击地图必须返回经纬度。
- 图层隐藏后，地图上对应 marker 消失。

### 5.3 交付物

- Map adapter
- AMap provider
- Leaflet provider
- 地图 marker 渲染
- 地图点击与 marker 点击事件

### 5.4 验收标准

- 没有 AMap Key 时，Leaflet 地图可用。
- 有 AMap Key 时，AMap provider 可用。
- marker 点击打开正确点位详情。
- 地图点击能进入新增流程。
- 图层显隐能即时反映到地图。

---

## 6. Milestone M4：个人工作台 UI

### 6.1 任务

实现以下组件：

| 组件 | 说明 |
| --- | --- |
| `MapWorkspace` | 工作台页面容器 |
| `WorkspaceHeader` | 顶部搜索、城市、筛选、分享、新增 |
| `LayerPanel` | 左侧图层面板 |
| `MapCanvas` | 地图容器，绑定 provider |
| `MapTools` | 定位、缩放、图层快捷入口 |
| `PlaceDetailDrawer` | 右侧或底部详情抽屉 |
| `PlaceEditorModal` | 新增/编辑点位表单 |
| `FilterPanel` | 筛选面板 |
| `SearchBox` | 地点搜索和本地搜索 |
| `PhotoUploader` | 图片上传和缩略图生成 |
| `ShareSnapshotDialog` | 生成快照 |
| `ImportExportDialog` | 导入导出 |

### 6.2 桌面端布局实现

- 使用 CSS Grid：左栏 280px，中间地图自适应，右侧详情 380px。
- 顶部搜索区固定在地图上方或浮在地图顶部。
- 右侧详情抽屉仅选中地点时展开。
- 左侧图层面板常驻，但可折叠。
- 地图工具固定在地图右侧。

### 6.3 移动端布局实现

- 顶部搜索固定。
- 地图全屏。
- 底部操作栏固定。
- 详情、图层、筛选全部用 bottom sheet。
- 新增/编辑表单用全屏 modal。

### 6.4 表单字段

新增/编辑点位表单字段：

- 名称：必填
- 经纬度：必填，可由地图点击或搜索结果带入
- 地址：可选
- 城市：可选
- 图层：必填
- 标签：可选，多标签
- 评分：必填，1-5 星
- 到访时间：必填
- 笔记：可选
- 照片：可选，多张

### 6.5 交付物

- 可用个人地图工作台
- 点位 CRUD
- 图层管理
- 搜索筛选
- 照片上传
- 响应式布局

### 6.6 验收标准

- 用户能从地图点击创建点位。
- 用户能从搜索结果创建点位。
- 用户能编辑所有字段。
- 用户能删除点位且有二次确认。
- 用户能上传至少两张照片并看到缩略图。
- 用户能按关键词、城市、标签、评分、到访时间筛选。
- 桌面端面板不重叠。
- 移动端底部抽屉不遮挡关键操作。

---

## 7. Milestone M5：分享视图与导入导出

### 7.1 任务

- 实现 `ShareSnapshotDialog`：
  - 输入标题
  - 选择是否包含当前筛选结果或全部点位
  - 生成 snapshot
  - 展示打开分享页按钮
  - 展示导出按钮
- 实现 `ShareView`：
  - 加载 snapshot
  - 展示地图
  - 展示只读图层
  - 展示只读点位详情
  - 无编辑入口
- 实现 `.foodmap.json` 导出：
  - 包含 snapshot metadata
  - places
  - layers
  - photo thumbnails
- 实现 `.foodmap.json` 导入：
  - 校验 schema
  - 写入 snapshots
  - 打开分享页

### 7.2 分享页只读检查

分享页不得包含以下 UI：

- 新增地点
- 编辑
- 删除
- 上传照片
- 修改图层
- 保存

### 7.3 交付物

- 分享快照生成
- `#/share/:snapshotId`
- `.foodmap.json` 导出
- `.foodmap.json` 导入
- 分享页空状态

### 7.4 验收标准

- 生成的快照可打开。
- 分享页 marker 可点击。
- 分享页详情可查看。
- 分享页无编辑入口。
- 导出文件可在 clean profile 中导入。
- 导入错误文件不会破坏现有数据。

---

## 8. Milestone M6：视觉落地与方案四打磨

### 8.1 任务

- 根据 Figma 原型整理 design tokens。
- 完成旅行手账风视觉实现：
  - 暖色纸感底色
  - 纸张卡片
  - 低饱和地图容器
  - 手账风图层图标
  - 星级评分样式
  - 少量胶带/邮戳装饰
- 检查页面是否变杂乱。
- 移除非必要装饰。
- 对齐桌面端和移动端视觉语言。

### 8.2 重点检查

- 一屏是否出现过多卡片？
- 详情是否遮挡地图？
- 移动端底部抽屉是否太高？
- 颜色是否过脏或对比不足？
- 装饰是否影响可读性？
- 分享页是否比工作台更简洁？

### 8.3 交付物

- 方案四主题 CSS
- 完整响应式 UI
- 桌面端截图
- 移动端截图

### 8.4 验收标准

- 视觉像旅行手账，但仍像工具产品。
- 地图区域不被过度装饰覆盖。
- 用户可在 3 秒内找到搜索、新增、筛选和图层入口。
- 分享页一眼可识别为只读。

---

## 9. Milestone M7：测试与验收闭环

### 9.1 Unit Tests

覆盖：

- domain validators
- filters
- import/export codec
- IndexedDB repositories
- photo thumbnail helpers
- snapshot creation

### 9.2 Playwright Tests

覆盖：

1. clean profile 打开 `#/map`。
2. 无 AMap Key 时 fallback 地图出现。
3. 创建点位。
4. 编辑点位。
5. 删除点位。
6. 上传照片后看到缩略图。
7. 刷新后数据仍存在。
8. 图层隐藏后 marker 消失。
9. 筛选后结果变化。
10. 生成分享快照。
11. 打开 `#/share/:snapshotId`。
12. 分享页无编辑按钮。
13. 导出 `.foodmap.json`。
14. clean profile 导入 `.foodmap.json`。
15. 桌面 1440×900 截图无重叠。
16. 移动 390×844 截图无重叠。

### 9.3 必跑命令

```bash
npm run build
npm test
npx playwright test
```

### 9.4 最终验收报告

生成：

```text
docs/V1.0/final-acceptance-report.md
```

报告需要包含：

- build 输出摘要
- unit test 输出摘要
- Playwright 输出摘要
- 手动验收结果
- 桌面截图路径
- 移动截图路径
- AMap provider 验证结果
- Leaflet fallback 验证结果
- 导入导出 round-trip 证据
- 未解决问题列表

---

## 10. 推荐开发顺序

```text
1. 文档落库
2. Vite React TS 初始化
3. 路由和 AppShell
4. CSS tokens：旅行手账风基础色
5. Domain types
6. IndexedDB repositories
7. 默认图层初始化
8. Leaflet provider fallback
9. MapWorkspace shell
10. 图层面板
11. 地图 marker 渲染
12. 地图点击新增草稿
13. 点位编辑 modal
14. 点位详情 drawer
15. 搜索与筛选
16. 照片上传与缩略图
17. 分享快照生成
18. 分享只读页
19. 导出 .foodmap.json
20. 导入 .foodmap.json
21. AMap provider 接入
22. 响应式打磨
23. Playwright 全链路测试
24. 最终验收报告
```

---

## 11. 给 Codex 的分阶段开发提示词

### 11.1 阶段一：初始化

```text
请基于 FoodMap V1.0 文档初始化一个 Vite + React + TypeScript 项目。
要求：使用 Hash Router，默认路由跳转到 #/map，另有 #/share/:snapshotId。
先实现空的 MapWorkspace 和 ShareView 页面，添加 CSS custom properties，风格采用方案四“旅行手账风”：暖色纸感、地图优先、克制卡片。
配置 Vitest 和 Playwright，保证 npm run build、npm test、npx playwright test 可以运行。
不要引入后端、账号、云同步或公网分享链接。
```

### 11.2 阶段二：本地数据

```text
请实现 FoodMap V1.0 的 domain 和 IndexedDB 持久化层。
包含 FoodPlace、FoodLayer、PhotoAsset、ShareSnapshot、筛选状态、校验 helper、repository。
首次启动时创建默认图层。照片使用 Blob 存储，并生成 thumbnailDataUrl。
实现 .foodmap.json 的导入导出 codec 初版，导入时必须校验结构，错误文件不能污染现有数据。
为 validators、filters、repositories、importExportCodec 添加 Vitest 单元测试。
```

### 11.3 阶段三：地图 Provider

```text
请实现 FoodMap 的 MapProviderAdapter 层。
当 VITE_AMAP_KEY 存在时使用 AMap provider；否则使用 Leaflet + OpenStreetMap fallback。
UI 只能依赖 MapProviderAdapter，不允许直接依赖 AMap 或 Leaflet API。
地图需要支持 initialize、destroy、setPlaces、focusPlace、setLayerVisibility、searchPlaces、locateByCoordinates、onPlaceClick、onMapClick。
marker 样式使用 FoodLayer 的 color 和 icon。
点击 marker 打开对应地点详情；点击地图可创建新地点草稿。
```

### 11.4 阶段四：工作台 UI

```text
请实现 FoodMap V1.0 的个人工作台 UI，采用方案四“旅行手账风”。
桌面端：左侧图层面板、顶部搜索/城市/筛选/导入导出/分享/新增、中间地图、右侧详情抽屉、右侧地图工具。
移动端：顶部搜索、全屏地图、底部操作栏、底部详情抽屉、底部图层/筛选抽屉、全屏新增编辑表单。
实现创建、编辑、删除、查看详情、图层显隐、关键词/城市/标签/评分/到访时间筛选。
视觉必须克制：暖色纸感、低饱和地图、圆角纸张卡片、轻阴影，不要堆过多装饰。
```

### 11.5 阶段五：分享和导入导出

```text
请实现 FoodMap V1.0 的本地只读分享体验。
用户可以在工作台生成 ShareSnapshot，输入标题后打开 #/share/:snapshotId。
分享页必须只读，支持地图点位、图层切换、点位详情，但不能出现新增、编辑、删除、上传、保存入口。
支持导出 .foodmap.json，内容包含 snapshot metadata、places、layers、photo thumbnails。
支持在 clean profile 中导入 .foodmap.json 并打开分享页。
添加 Playwright 测试验证分享页只读、导出导入 round-trip 和响应式布局。
```

### 11.6 阶段六：验收闭环

```text
请根据 FoodMap V1.0 acceptance gate 执行最终验收。
运行 npm run build、npm test、npx playwright test。
补充 Playwright 截图：桌面 1440x900、移动 390x844。
手动验证：无 AMap Key 时 Leaflet fallback 可用；有 AMap Key 时 AMap provider 可用；创建、编辑、删除、筛选、照片缩略图、分享快照、导入导出均可用。
生成 docs/V1.0/final-acceptance-report.md，记录命令输出摘要、手动验收结果、截图路径和未解决问题。
```

---

## 12. 最终 Definition of Done

V1.0 完成条件：

- 文档完整且版本快照存在。
- `npm run build` 通过。
- `npm test` 通过。
- `npx playwright test` 通过。
- 无 AMap Key 时地图可用。
- 有 AMap Key 时 AMap provider 可用。
- 可创建、编辑、删除、查看、筛选美食点位。
- 可上传照片并显示缩略图。
- 数据刷新后不丢失。
- 可生成本地只读分享快照。
- 可导出和导入 `.foodmap.json`。
- 分享页不显示编辑入口。
- 桌面端和移动端无明显遮挡或重叠。
- 最终验收报告落到 `docs/V1.0/final-acceptance-report.md`。
