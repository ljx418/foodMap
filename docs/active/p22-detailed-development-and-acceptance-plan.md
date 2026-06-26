# FoodMap P22 Detailed Development And Acceptance Plan

## Stage Objective

P22 is the interaction experience refactor after accepted P21. It does not add backend, account, cloud sharing, public links, automatic POI finalization, or new external real-time search claims. It fixes release-candidate usability gaps exposed by automated visual review and human review:

1. Read-only share pages must be understandable without returning to the editable workspace.
2. Missing share snapshots must offer direct `.foodmap.json` import recovery.
3. Workspace desktop panels for data health and governance must be wide enough for human scanning.
4. Mobile top controls must stay compact and not obscure the map-first workflow.
5. Header actions must use intent names users can distinguish: `数据包`, `分享图`, `快照`.
6. P21/P20/P19/P18 accepted behavior must remain regression-safe.

## PRD Fit

P22 supports the original PRD principles around map-first workflow, clear local-first data handling, share snapshot portability, mobile usability, and non-overlapping controls. It is a usability and trust stage, not a new product capability stage.

## Development Plan

| Phase | Development Scope | Acceptance Evidence | Exit Condition |
| --- | --- | --- | --- |
| P22-1 文档和审计基线 | Define P22 as interaction refactor; confirm no cloud/share over-claim | Plan, audit, updated active docs and drawio | No major spec drift before implementation |
| P22-2 只读分享页重构 | Add standalone share shell with map, layer panel, detail panel, mobile share nav | P21 clean profile/share E2E and screenshots | Share viewer can inspect map/layers/details without editable workspace |
| P22-3 缺失快照恢复 | Add direct `.foodmap.json` import on missing snapshot page | Missing route E2E and screenshot | User can recover a shared package from the error state |
| P22-4 工作台交互收口 | Widen health/governance panels; compact mobile filter dock; clarify action labels | P22 shell E2E and screenshots | Panels are readable and mobile controls do not crowd the map |
| P22-5 回归验收 | Run build, unit, scanlist, P21 targeted, P19/P20 core targeted, P22 targeted | Command logs and final report | Accepted baselines remain green |
| P22-6 证据包 | Capture screenshots and HTML/manual-readable evidence | Evidence paths and final report | Human reviewer can verify current vs target implementation |

## Required Acceptance

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P21 share portability|P21 import safety|P21 read only share|P21 responsive"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "workspace opens with core controls|place can be created|map poster|P19 current viewport poster|P19 data health|governance|imported foodmap|responsive workspace"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P22 workspace shell"
```

## Audit Opinion

Decision before implementation: `Go for P22 implementation`.

Rationale: The stage is bounded to interaction clarity and does not change location trust, governance write paths, import safety, or share capability claims. The main false-acceptance risk is screenshot-only approval without browser assertions; P22 therefore requires targeted E2E for share readability, missing snapshot recovery, panel width, and mobile dock readability.
