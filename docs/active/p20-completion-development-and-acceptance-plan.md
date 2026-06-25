# FoodMap P20-C Completion Development And Acceptance Plan

Date: 2026-06-24

Status: Implemented and accepted by `docs/active/p20-c-final-acceptance-report.md`

## 1. Stage Objective

P20-C completes the original P20 personal data governance PRD. It does not create a new product direction. It closes the PRD gaps found by the 2026-06-24 audit:

1. The implemented batch path is narrower than the PRD requirement for at least three safe batch operations.
2. Duplicate suggestions currently center on merge; ignore and keep-separate decisions are not complete user flows.
3. Import conflict preview needs explicit strategy selection for new, update, duplicate, risk, and skipped classes.
4. Governance report export is not yet a complete user-visible capability.
5. Stale-reference needs to be a first-class governance group.
6. E2E coverage must prove these PRD capabilities, including cancel no-op paths.

P20-C preserves all existing boundaries: pure frontend, local-first, no account, no backend, no cloud sync, no automatic coordinate finalization, no automatic merge/delete, and no over-claim of external realtime POI search.

## 2. Preimplementation Audit

| Audit Item | Status | Opinion |
| --- | --- | --- |
| PRD support | Pass | PRD now defines P20-C as completion of the original P20 governance experience, not a new backend/admin stage. |
| Architecture support | Pass | Target architecture identifies UI, Domain, Repository, Agent, and E2E modules required for P20-C. |
| Stage boundary | Pass | P20 core can remain regression baseline; full PRD completion is blocked until P20-C exits. |
| False acceptance risk | Controlled | Acceptance gate forbids claiming full P20 completion until P20-C targeted tests and final report pass. |
| Real-data requirement | Pass | Required fixtures include scanlist 50, Dingtuyi 120, personal records, pending/high-risk/manual/skipped/stale/duplicate/import conflict data. |
| High-risk flow | Controlled | Merge, delete, coordinate, verification, import, and Agent writes stay behind explicit confirmation or are rejected. |

Audit decision: `P20-C accepted after implementation and final acceptance`.

## 3. Development Sequence

| Phase | Development Goal | User-Visible Result | Acceptance Evidence |
| --- | --- | --- | --- |
| P20C-1 | Freeze docs and fixtures | Team sees P20-C scope and no over-claiming | Documentation audit, drawio XML opens, fixture checklist |
| P20C-2 | Complete governance groups and batch actions | User sees stale-reference and can preview at least three safe batch actions | Unit tests, E2E batch preview/confirm/cancel |
| P20C-3 | Complete duplicate decisions | User can ignore, keep separate, or merge duplicate suggestions | Unit tests, E2E duplicate decision history |
| P20C-4 | Complete import strategies | User chooses import handling strategy before writes | Unit tests, E2E strategy selection and cancel no-op |
| P20C-5 | Complete history and report export | User sees readable history and exports a local governance report | Unit tests, download E2E, report content assertions |
| P20C-6 | Agent and responsive regression | Agent cannot execute governance writes; mobile/tablet/desktop paths remain usable | Agent negative, responsive screenshots |
| P20C-7 | Final acceptance | Project can claim original P20 PRD governance completion | build, unit, scanlist, P18/P19/P20 regression, P20-C targeted Playwright, final report |

## 4. Required Functional Acceptance

P20-C can pass only if all requirements below are true in the browser:

- Governance workbench shows pending, high-risk, manual-adjusted, skipped, stale-reference, duplicate, and import-conflict groups when fixtures contain those states.
- At least three low-risk batch actions have preview, cancel no-op, confirmation, repository persistence, and journal entries.
- Duplicate suggestions show evidence and support ignore, keep separate, and merge. Ignore and keep do not delete records. Merge requires explicit confirmation and lists retained/removed records.
- Import conflict preview classifies new, update, duplicate, risk, skipped, and invalid rows. User-selected strategies are visible before commit. Cancel leaves local IndexedDB unchanged.
- Governance report export downloads a local file whose counts and summaries match the workbench and journal facts.
- Agent can read and explain governance state but cannot bulk modify, merge, delete, import, hide risk, or finalize coordinates.
- 390x844, 430x932, 768x900, and 1280x820 keep governance, duplicate compare, import preview, report export, and history reachable without clipping core controls.

## 5. Required Commands

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 governance"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 import conflict"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20 agent negative"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P20-C"
```

Full Playwright may be used as the final browser gate if targeted grep labels drift:

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test
```

## 6. Exit Conditions

P20-C exits only when:

- No PRD, architecture, gate, roadmap, gap, drawio, test matrix, or final report document claims more than the implemented evidence proves.
- All required commands pass or a browser dependency blocker is documented with severity and a non-fake alternate runner.
- Real-data scanlist verification passes and P20-C fixtures include real or deterministic local personal records for every governance group.
- E2E proves both successful writes and cancel/no-op paths.
- The final acceptance report explicitly states whether the original P20 PRD governance experience is complete.
