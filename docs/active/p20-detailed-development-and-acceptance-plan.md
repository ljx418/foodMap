# FoodMap P20 Detailed Development And Acceptance Plan

Date: 2026-06-23

Status: P20 core implemented; P20-C completion required before claiming original P20 PRD completion

## 1. Development Sequence

This document now records two layers:

- P20 core implementation remains a regression baseline.
- P20-C is the active completion layer for the original P20 PRD gaps found on 2026-06-24.

P20-C must be implemented in this order. Later phases may read earlier phase outputs, but must not skip acceptance gates.

| Phase | Goal | Primary User-Visible Result | Primary Architecture Result |
| --- | --- | --- | --- |
| P20C-1 | Documentation and audit baseline | Team knows exact completion scope and evidence path | PRD/architecture/gate/fixtures aligned |
| P20C-2 | Governance workbench completion | User sees stale-reference and at least three batch previews | Complete governance issue and batch read models |
| P20C-3 | Duplicate decision completion | User can ignore, keep, or merge possible duplicates safely | Duplicate decision domain |
| P20C-4 | Import strategy completion | User selects import strategies before writes | Import conflict strategy planner |
| P20C-5 | Maintenance history and report export | User can see and export governance history | Governance journal and report exporter |
| P20C-6 | Agent and responsive regression | Completed governance paths are bounded and usable | Agent negative and viewport harness |
| P20C-7 | Final acceptance | Original P20 PRD exits with evidence | Final report and residual risk record |

## 2. P20C-1 Documentation And Audit Baseline

Tasks:

- Confirm PRD, target architecture, development plan, acceptance gate, roadmap, gap, E2E matrix, repository/domain contract, and stage contract define the same P20-C scope.
- Confirm drawio remains below 8 pages and does not conflict with P20 direction.
- Define real-data fixtures and browser command path.

Acceptance:

- Preimplementation audit has no unresolved fatal or major specification risks.
- P19 final report remains linked as accepted baseline.
- P20 core is described as regression baseline, not full original P20 PRD completion.

## 3. P20C-2 Governance Workbench Completion

Tasks:

- Derive governance issue groups from personal places, including stale-reference.
- Keep workbench UI reachable from P19 data health.
- Add at least three safe batch previews for low-risk actions such as tag, skip, queue, reviewed status, and report inclusion.
- Preserve map-first workspace and avoid admin-table redesign.

Acceptance:

- Unit tests for `deriveGovernanceIssues` and `planGovernanceBatchAction`.
- Playwright `P20-C governance batch` verifies groups, queue, at least three previews, confirm/cancel, and no hidden mutation.
- PRD review confirms health problems are actionable and still local-first.

## 4. P20C-3 Duplicate Decisions

Tasks:

- Implement duplicate suggestion helper based on name, address, coordinate distance, tags, photos, and timestamps.
- Add comparison UI with ignore, keep separate, and merge preview decisions.
- Require explicit confirmation before any merge. Ignore and keep separate must not delete or rewrite coordinates.

Acceptance:

- Unit tests cover duplicate scoring and false-positive controls.
- Playwright `P20-C duplicate decisions` verifies evidence compare, ignore, keep separate, merge preview, decision history, and no auto-delete.

## 5. P20C-4 Import Conflict Strategy

Tasks:

- Build import conflict planner for `.foodmap.json`.
- Classify new, update, duplicate, high-risk, skipped, and invalid rows before writes.
- Add strategy selection and cancel no-op path.

Acceptance:

- Unit tests cover conflict planning and cancel no-op.
- Playwright `P20-C import strategy` verifies preview before write, strategy selection, readonly share snapshot preservation, and local records unchanged after cancel.

## 6. P20C-5 Maintenance History And Report Export

Tasks:

- Define governance journal entry shape.
- Append entries for batch actions, duplicate decisions, import conflicts, candidate confirmation, and manual move where P20 touches those flows.
- Display history in governance/detail surfaces.
- Export a local governance report whose facts come from the same issue, import, duplicate, and journal read models shown in the UI.

Acceptance:

- Unit tests cover journal derivation from new entries and legacy audit fallback.
- Unit tests cover report content derivation.
- E2E verifies confirmed governance actions create readable history and report download content matches UI facts.

## 7. P20C-6 Agent And Responsive Regression

Tasks:

- Extend Agent negative tests for prohibited governance writes.
- Validate governance workbench, duplicate compare, import preview, report export, and history across required viewports.
- Capture screenshot evidence under `docs/active/evidence/p20/`.

Acceptance:

- Playwright `P20 agent negative` rejects bulk modify, merge, delete, hide risk, and coordinate finalization.
- Playwright `P20-C responsive` covers 390x844, 430x932, 768x900, 1280x820.

## 8. P20C-7 Final Acceptance

Required commands:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 governance"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 import conflict"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 agent negative"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 responsive"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20-C"
```

Final report must include command summaries, screenshots, real-data scanlist result, PRD/architecture review, known issues, and final decision. It must explicitly state whether the original P20 PRD governance experience is complete.
