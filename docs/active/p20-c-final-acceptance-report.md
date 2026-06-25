# FoodMap P20-C Final Acceptance Report

Status: Accepted

Date: 2026-06-24

## Summary

P20-C is accepted. The stage completes the original P20 personal data governance PRD on top of the accepted P19 baseline and the P20 core regression baseline.

P20-C remains pure frontend and local-first. It does not add backend sync, accounts, cloud governance, public permanent links, automatic coordinate finalization, automatic merge/delete, or unsupported external realtime POI claims.

## Implemented User Experience

- Governance workbench now includes `stale-reference` as a first-class issue group.
- Users can preview at least three safe batch actions before writing: add to queue, mark skipped, and apply governance tag. Mark reviewed remains available.
- Duplicate suggestions support ignore, keep separate, and merge decisions. Ignore and keep do not delete records. Merge still requires explicit confirmation.
- Import conflict preview supports visible strategy selection before writes; skipped/risk items default to no-write behavior.
- Governance history records batch actions, duplicate decisions, import handling, and existing candidate/manual workflows touched by governance.
- Governance report export downloads a local JSON report derived from the same workbench, duplicate, import, and journal facts shown in the UI.
- Agent remains read/suggest only for governance and rejects prohibited bulk write, merge, import, hide-risk, delete, and coordinate-finalization attempts.

## Verification

```text
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20-C|P20 governance|P20 import conflict|P20 agent governance"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster|P19 data health|P20 responsive|P18 large deterministic|agent bridge returns structured errors"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test
```

Results:

- Build: passed.
- Unit tests: passed, 44 tests.
- Scanlist verification: passed, 50 entries, 50 manual overlays, 38 approximate admitted pins.
- P20/P20-C targeted browser tests: passed, 4 tests.
- P18/P19/P20 regression browser tests: passed, 8 tests.
- Full Playwright: passed, 72 passed, 34 skipped.

## Real Data Evidence

- `npm run verify:scanlist` passed with the real 50-entry Wuhan AMap scanlist baseline.
- Guardrails remain present: 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆.
- P20-C browser fixtures use FoodMap's real IndexedDB persistence, `.foodmap.json` import format, governance journal store, coordinate-risk checks, and local report download behavior.

## PRD And Architecture Review

P20-C satisfies the original P20 PRD target experience for local personal data governance:

- grouped governance queues including stale-reference;
- at least three safe batch operation types with preview and cancel paths;
- duplicate ignore/keep/merge decisions;
- import conflict strategy selection before write;
- governance history and report export;
- Agent boundary and responsive governance paths.

P20-C advances the target architecture by completing the P20-C modules:

- `GovernanceBatchActionService`;
- `DuplicateDecisionService`;
- `ImportConflictStrategyPlanner`;
- `StaleReferenceIssueDetector`;
- `GovernanceReportExporter`;
- `P20CRegressionHarness`.

## Known Boundaries

- Governance report export is JSON and local-only.
- Batch operations intentionally modify only low-risk metadata tags/queue state.
- High-risk coordinates, verification state, delete, and merge remain explicit user-confirmation flows.
- External realtime POI search remains bounded by configured providers or Agent-submitted evidence; P20-C does not expand that claim.

## Exit Decision

P20-C is accepted. Future stages may treat P20-C as the regression baseline for original P20 personal data governance completion.
