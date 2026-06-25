# FoodMap P25 Detailed Development And Acceptance Plan

Date: 2026-06-25

## Status

`Documentation-ready / implementation not started.`

P25 follows accepted P24. P24 proved that FoodMap can run as a mobile-friendly WebApp on Mate70 using HDC evidence and a temporary public HTTPS tunnel. P25 turns that temporary acceptance profile into a planned durable static deployment stage.

P25 is still pure frontend and local-first. It must not add account login, cloud sync, remote backup, collaboration, public permanent share links, FoodMap business backend APIs, HarmonyOS native HAP delivery, AppGallery release, offline map tiles, automatic coordinate repair, or completed external real-time POI search claims.

## Target User Experience

1. The user can open FoodMap on Mate70 through a stable static URL, not a temporary tunnel.
2. `#/map` opens the map workspace with search, quick filters, bottom actions, WebApp status, and local-first copy.
3. The user can create or import a personal place, open details, generate a read-only snapshot, open a valid `#/share/:snapshotId`, and refresh without data loss.
4. Static-host outages, source-down states, installability limits, tile failures, and external-map failures show FoodMap-owned fallback copy instead of misleading cloud or data-loss states.
5. The release evidence package records exact deployment profile, URL, commands, Mate70 screenshots, and residual limits.

## Development And Acceptance Sequence

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P25-1 | 文档审计与边界冻结 | PRD、架构、gap/drawio、gate、roadmap、matrix、visual checklist 指向 P25 | 无致命或重大规格偏差；P24 accepted 保持清楚 |
| P25-2 | GitHub Pages 静态托管方案实现 | 按 `p25-static-deployment-profile.md` 配置稳定静态 host profile；记录 build output、hash fallback、cache headers | Mate70 可访问固定 URL；不得依赖 HDC 或临时 tunnel |
| P25-3 | Mate70 主路径复验 | 固定 URL 上完成 map、create/import、detail、export、valid share、refresh | 截图或录屏证明主路径可用 |
| P25-4 | 失败态与本地边界复验 | source-down、tile/external-map/installability fallback；本地数据不误报云同步 | 失败态可理解且不宣称离线地图 |
| P25-5 | 回归与证据包 | build、unit、scanlist、P18-P24 targeted、P25 targeted、截图证据 | 回归全绿，真实 scanlist 通过 |
| P25-6 | Final acceptance report | `p25-final-acceptance-report.md` 记录 URL、命令、截图、残余限制 | 报告可将 P25 改为 accepted |

## Required Implementation Contracts

- Primary static host route is GitHub Pages for `ljx418/foodMap`, as defined in `p25-static-deployment-profile.md`.
- Static host must serve the Vite `dist/` build without a FoodMap business backend.
- Hash routes must open directly or recover through static fallback for `#/map` and `#/share/:snapshotId`.
- Vite deployment base must support the GitHub Pages subpath `/foodMap/` without breaking local development.
- Service worker behavior must preserve local-first wording and must not claim offline map tiles.
- `.foodmap.json` remains the only cross-device portability path.
- IndexedDB remains the user's local source of truth.
- HDC can support evidence capture, but cannot be counted as the static deployment URL.

## Required Evidence

| Evidence | Required Content |
| --- | --- |
| Deployment profile | GitHub Pages URL or documented fallback route, build command, deployment command or manual upload path, base path, and hash fallback policy |
| Mate70 workspace | Fixed URL on Mate70 showing map, search, quick filters, WebApp status, and bottom actions |
| Mate70 create/import | A user-owned place created or imported on the deployed origin |
| Mate70 valid share | Real `#/share/:snapshotId` opened from the deployed origin |
| Persistence | Refresh/reopen keeps personal data or snapshot readable |
| Failure state | Source-down or equivalent static host failure shows FoodMap fallback, not data loss or cloud behavior |
| Regression | build/unit/scanlist/P18-P24/P25 targeted commands |

## Initial Audit

Result: `Go for P25 implementation planning; no code implementation yet.`

Current docs now support P25 planning after synchronization. PRD, target architecture, development plan, roadmap, acceptance gate, gap document, drawio, evidence matrix, visual checklist, audit, and stage contract agree that P25 is a durable static deployment and release-governance stage. The remaining gap is implementation evidence, not documentation scope.

P25 implementation should start with GitHub Pages. If GitHub Pages is blocked by repository settings or account limitations, the implementer must use the fallback matrix in `p25-static-deployment-profile.md` and record the reason before accepting an alternate route.
