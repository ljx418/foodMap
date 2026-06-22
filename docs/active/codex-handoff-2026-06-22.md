# Codex Handoff - FoodMap

Date: 2026-06-22
Repository: `https://github.com/ljx418/foodMap`
Branch: `main`

## Purpose

This file preserves the working context needed to continue development from another computer and another Codex terminal. It does not preserve the literal terminal session process, but it records the project state, accepted stage context, verification commands, and a ready-to-use prompt for the next Codex session.

## Current Product State

FoodMap is a pure-frontend, local-first Wuhan food map built with Vite, React, TypeScript, Leaflet, IndexedDB, Vitest, and Playwright.

Accepted baseline:

- Personal map workspace at `#/map`.
- Local read-only share route at `#/share/:snapshotId`.
- Local IndexedDB persistence.
- Import/export `.foodmap.json`.
- Editable personal food pins with photos, text, rating, tags, visit time, and map coordinates.
- AMap Wuhan scanlist as a 50-entry verified reference layer.
- Dingtuyi reference layer with 120 read-only imported reference pins.
- Pending-place workbench for uncertain personal locations.
- Candidate search and fallback links for map-provider assisted confirmation.
- Manual pin movement with preview and explicit save confirmation.
- Editable detail-page tags.
- Mobile and desktop responsive paths.
- Share-poster composer using current filtered personal places.
- Agent Bridge with read/query/filter/candidate submission paths and negative guards against direct pending-coordinate finalization.

## Most Recent Stage

P18 has been accepted through:

- P18-2 candidate search fallback and pending workbench search.
- P18-3 candidate evidence and confirmation transparency.
- P18-4 two-step manual pin move with audit preview.
- P18-5 detail IA and filter explainability.
- P18-6 share poster composer.
- P18-7 governance, Agent boundary, and performance acceptance.

Read these first:

- `docs/active/README.md`
- `docs/active/product-requirements-document.md`
- `docs/active/target-architecture.md`
- `docs/active/development-and-acceptance-plan.md`
- `docs/active/acceptance-gate.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/active/p18-candidate-search-trust-contract.md`
- `docs/active/p18-7-final-acceptance-report.md`

## Important Implementation Files

- `src/features/workspace/MapWorkspace.tsx`
- `src/features/workspace/PendingPlaceWorkbench.tsx`
- `src/features/workspace/PlaceDetailDrawer.tsx`
- `src/features/workspace/HomeMapControlDock.tsx`
- `src/features/workspace/MapPosterDialog.tsx`
- `src/domain/placeRecognition.ts`
- `src/domain/placeSearch.ts`
- `src/domain/liveMapSearch.ts`
- `src/domain/externalMapLinks.ts`
- `src/domain/manualPinMove.ts`
- `src/domain/locationStatus.ts`
- `src/agent/FoodMapAgentBridge.ts`
- `e2e/workspace.spec.ts`
- `e2e/visual-evidence.spec.ts`

## Validation Commands

Run after restore:

```bash
npm ci
npm run build
npm test -- --run
npm run verify:scanlist
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

Run the app:

```bash
npm run dev -- --host 0.0.0.0
```

Then open:

```text
http://localhost:5173/#/map
```

If port 5173 is occupied, Vite will print the actual port.

## Known Boundaries

- The app is still pure frontend. There is no backend account system, cloud sync, server-side POI correction, or public permanent share hosting.
- AMap live POI search requires a user-provided Web Service Key in the browser UI. No real key is committed.
- Without an AMap key, the app provides search-copy and external map fallback links.
- Share poster currently supports `当前筛选`; `当前视野` is shown but disabled because viewport-bounded poster data is not yet wired into the composer.
- Some public/reference POI coordinates are intentionally marked approximate and require user confirmation or manual pin movement before precise navigation.

## Evidence To Inspect

- `docs/active/evidence/p18/p18-large-dataset-performance-smoke.json`
- `docs/active/evidence/p17/`
- `docs/active/evidence/p16/`

## Suggested Next Development Themes

Potential next stage candidates:

1. Wire true map-viewport bounds into the share-poster composer and enable `当前视野`.
2. Improve user-driven candidate confirmation for remaining uncertain personal places.
3. Add richer data-health dashboard for pending, approximate, manually moved, and verified personal pins.
4. Continue responsive polish for tablet and narrow desktop side-panel layouts.
5. Improve public-map search guidance without compromising the pure-frontend boundary.

## Prompt For The Next Codex Terminal

Paste this into a new Codex session after cloning and opening the repository:

```text
你正在接手 FoodMap 项目，仓库是 https://github.com/ljx418/foodMap，当前目录应为 foodMap。请先阅读 docs/active/codex-handoff-2026-06-22.md、docs/active/README.md、docs/active/product-requirements-document.md、docs/active/target-architecture.md、docs/active/development-and-acceptance-plan.md、docs/active/acceptance-gate.md、docs/active/current-vs-target-gap.md、docs/active/p18-candidate-search-trust-contract.md、docs/active/p18-7-final-acceptance-report.md。

本项目是纯前端、本地优先的武汉美食地图，P18 已验收通过。请不要重做 P18，先用 npm ci、npm run build、npm test -- --run、npm run verify:scanlist 复核环境；如需要浏览器验收，再跑 P18 large deterministic 和 Agent negative 的 Playwright 用例。后续开发必须继续遵守：真实数据验收、每个阶段先做开发/验收计划和审计、重大规格偏差或虚假验收风险才找用户确认、不要绕过用户确认固化坐标、不要把外部实时 POI 搜索能力过度宣称为已完成。

请先告诉我当前仓库状态、最近一次提交、验证结果，以及你建议的下一阶段开发候选目标。
```

