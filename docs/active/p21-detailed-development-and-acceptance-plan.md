# FoodMap P21 Detailed Development And Acceptance Plan

Status: Implementation-ready after this plan and audit remain free of fatal or major PRD deviation.

Date: 2026-06-24

## Summary

P21 is the local share and data portability release stage. It does not add backend sync, accounts, cloud backup, public permanent links, editable restore, or new POI search. It closes the original V1.0 PRD release experience around local read-only share snapshots and `.foodmap.json` portability.

P21 starts from the accepted P20-C baseline. P18 candidate trust, P19 viewport/data-health behavior, and P20-C governance/import conflict behavior are regression gates.

## Preimplementation Audit

| Audit Item | Status | Opinion |
| --- | --- | --- |
| PRD support | Pass | PRD sections 6.4, 9, 10.8, 10.9, 11.7, 11.8, 16.3, and 17 support a P21 stage focused on local share and import/export release readiness. |
| Architecture support | Pass | Target architecture defines snapshot portability, package validation, read-only share guard, clean profile import, invalid import no-op, and evidence pack modules. |
| Stage boundary | Pass | P21 does not redo P18/P19/P20-C and does not expand into cloud sharing or editable restore. |
| False acceptance risk | Controlled | P21 requires clean-profile browser evidence, invalid import no-op evidence, exported JSON evidence, and final report before acceptance. |

Audit decision: `Go for P21 implementation after drawio/user direction review`.

## Development Phases

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P21-1 | 文档冻结与审计基线：PRD、架构、gate、gap/drawio、测试矩阵、视觉清单指向 P21 | 文档审计、drawio XML 校验、audit report | P21 可开发，无重大规格偏差 |
| P21-2 | 分享快照生成复核：生成前/后展示只读、本地、标题、地点数、图层数、照片缩略图数、生成时间 | Unit + E2E: snapshot summary and generated metadata consistency | 用户知道分享不是公网链接，且知道包里有什么 |
| P21-3 | `.foodmap.json` 导出包完整性：schema/version、snapshot metadata、places、layers、thumbnail-only photos 校验 | Unit: codec validator; E2E: downloaded JSON inspected | 导出包可支撑分享页迁移查看 |
| P21-4 | clean profile 导入与只读分享页：空 IndexedDB 导入后打开 `#/share/:snapshotId`，只读详情可用 | Playwright clean profile import, share route, no edit controls | 跨浏览器/clean profile 可查看快照 |
| P21-5 | 失败安全与 Agent 边界：无效包、缺失 snapshot、Agent 越权调用均不污染数据 | IndexedDB diff, error UI, Agent negative | 错误路径明确且 atomic no-op |
| P21-6 | 响应式与真实数据证据：移动/平板/桌面截图，真实 scanlist 和个人记录参与验收 | 390/430/768/1280 screenshots, scanlist, fixture summary | 发布路径在多尺寸可完成 |
| P21-7 | 总验收与 final report：命令、回归、targeted E2E、证据、PRD/架构复核全部记录 | build/unit/scanlist/P18-P20C regression/P21 targeted/full or scoped Playwright/final report | P21 可声明发布候选基线 |

## Required User Experience

- User can generate a local share snapshot from real personal places.
- User can export a `.foodmap.json` package containing snapshot metadata, places, layers, and thumbnails.
- A clean browser profile can import that package and open the read-only share route.
- Share route allows layer toggling, pin selection, and detail viewing, but does not expose create, edit, delete, upload, save, account, or cloud controls.
- Invalid import and missing snapshot states explain what happened and how to recover without mutating local data.

## Required Test Data

| Fixture | Purpose |
| --- | --- |
| 32+ personal Wuhan favorites | Snapshot/export/share content |
| Places with tags, ratings, visit dates, notes | Detail parity in share route |
| Places with photo thumbnails | Thumbnail portability |
| Multiple layers with visibility states | Read-only layer toggling |
| Invalid JSON package | Import failure no-op |
| Unsupported schema/version package | Import rejection copy |
| Missing snapshot id route | Share fallback copy |
| 50 scanlist entries | Real-data recommendation regression |
| P20-C governance records | Regression that import/export work does not corrupt governance baseline |

## Required Commands

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster|P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20-C|P20 governance|P20 import conflict|P20 agent governance"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P21 share portability|P21 import safety|P21 read only share"
```

## Acceptance Scenarios

1. Generate snapshot with a user title and verify summary counts match exported snapshot facts.
2. Export `.foodmap.json` and inspect schema/version, snapshot metadata, place count, layer count, and thumbnail count.
3. Start from clean IndexedDB, import the exported file, and navigate to the generated share route.
4. Verify read-only share page renders map, layers, pins, details, thumbnails, ratings, visit dates, tags, address, and notes.
5. Verify share page does not expose create, edit, delete, upload, save, account, cloud, or public-link controls.
6. Visit a missing snapshot route and verify local-only recovery copy.
7. Import invalid JSON and unsupported schema fixtures; verify error copy and IndexedDB no-op.
8. Verify Agent cannot claim public sharing or perform direct import writes.
9. Capture responsive evidence for share generation/export/import/share/fallback on required viewports.
10. Re-run P18/P19/P20-C regression gates before final report.

## Exit Decision Rule

P21 can exit only after every phase has an acceptance report or final acceptance evidence, no fatal or major PRD/architecture deviation remains, and `docs/active/p21-final-acceptance-report.md` records command results, browser evidence, real-data evidence, known boundaries, and PRD/architecture review.
