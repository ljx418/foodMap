# FoodMap P20-7 Core Regression Acceptance Report

Status: P20 core regression accepted; superseded by P20-C completion gate for original P20 PRD

Date: 2026-06-24

## Summary

P20 core is accepted as a regression baseline. The stage implemented local-first personal data governance workbench, duplicate merge preview, import conflict preview, maintenance history, Agent boundary, and responsive governance evidence on top of accepted P19.

This report must not be used to claim full original P20 PRD completion. A 2026-06-24 PRD audit found remaining gaps: at least three safe batch operation types, duplicate ignore/keep/merge decisions, import conflict strategy selection, stale-reference grouping, governance report export, and complete targeted E2E coverage. Those gaps are governed by P20-C.

## Implemented User Experience

- User can enter a governance workbench from P19 data health.
- User can review grouped personal data issues and generate safe previews before writes.
- User can compare duplicate suggestions and merge only after explicit confirmation.
- User can import `.foodmap.json` through conflict preview before local data changes.
- User can read maintenance history in the governance workbench and place detail.
- User can use governance on mobile, tablet, and desktop.
- Agent can read governance context but cannot perform unsafe governance writes.

## Verification

```text
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport|P19 data health|P18 large deterministic|agent bridge returns structured errors"
```

All commands passed.

## Real Data Evidence

- `npm run verify:scanlist` passed with 50 scanlist entries and 50 manual verification overlays.
- Guardrails remain present: 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆.
- P20 browser fixtures use real FoodMap place schema, IndexedDB, coordinate-risk checks, and local import/export format.

## Browser Evidence

- P20 targeted: 7 Playwright tests passed.
- P19 regression: current viewport poster and data health passed.
- P18 regression: large deterministic dataset performance smoke passed.
- Agent negative regression: existing P18/P19 Agent negative path passed.
- P20 screenshots are stored under `docs/active/evidence/p20/`.

## PRD And Architecture Review

P20 core satisfies a narrower implemented subset of the PRD target experience for local personal data governance, duplicate merge review, import conflict preview, maintenance history, Agent boundary, and responsive governance.

P20 advances the target architecture by adding domain/repository-aligned governance helpers, import planning, duplicate merge preview, and append-only journal persistence while preserving the pure frontend local-first architecture.

The original P20 PRD is not complete until P20-C proves:

- At least three safe batch operations with preview, cancel no-op, confirmation, persistence, and journal coverage.
- Duplicate ignore, keep separate, and merge decisions.
- Import conflict strategy selection for new, update, duplicate, risk, and skipped classes.
- Stale-reference issue grouping.
- Governance report export.
- Complete targeted E2E and final acceptance report.

## Known Boundaries

- P20 does not add backend, account, cloud sync, public permanent sharing links, external realtime POI search without provider evidence, automatic coordinate finalization, automatic merge, or automatic delete.
- Governance batch actions remain intentionally narrow and safe; high-risk coordinate work still requires explicit user review through existing confirmation paths.

## Exit Decision

P20 core is accepted as regression evidence. Future work should preserve its explicit preview/confirmation boundaries while P20-C completes the original PRD governance scope.
