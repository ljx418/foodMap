# FoodMap P16 2026-06-09 Regression Plan And Audit

> Status note, 2026-06-11: this historical regression plan is superseded by `p16-final-acceptance-report.md`, which contains the current command evidence: 25 Vitest tests, 36 Playwright passed, 12 project-scoped skips, and the explicit personal-favorites import fix.

## 1. Purpose

This document closes the remaining P16 acceptance gap found on 2026-06-09. P16 implementation was accepted in `p16-implementation-audit-and-acceptance-log.md`, but the active acceptance gate still requires a dedicated final acceptance report at `docs/active/p16-final-acceptance-report.md`, and the visual evidence script still writes screenshots to the historical P8-P14 evidence directory.

## 2. Pre-Implementation Audit

Status: `Go`.

| Finding | Severity | Decision |
| --- | --- | --- |
| `docs/active/p16-final-acceptance-report.md` is missing although `acceptance-gate.md` and `milestone-roadmap.md` require it | Major documentation acceptance gap | Create the report after fresh command evidence |
| `e2e/visual-evidence.spec.ts` writes to `docs/active/evidence/p8-p14` while active P16 visual checklist requires `docs/active/evidence/p16` | Medium evidence-path gap | Retarget visual evidence to P16 screenshots |
| P16 product functionality was previously accepted, but commands must be rerun on 2026-06-09 before claiming current pass | Medium false-green risk | Run full command gate again |
| No PRD/architecture requirement currently demands a new feature beyond P16 | Low | Do not invent P17 scope in this pass |

No fatal or high-risk issue blocks work. The work is documentation/evidence closure plus regression validation, not a new product feature phase.

## 3. Development Plan

1. Update visual evidence capture to write current P16 screenshots under `docs/active/evidence/p16/`.
2. Create `docs/active/p16-final-acceptance-report.md` with build, unit, Playwright, scanlist, visual evidence, PRD review, and known boundaries.
3. Update active README audit set so the final report and this plan are visible to external review.
4. Run the full P16 command gate:
   - `npm run build`
   - `npm test`
   - `npm run verify:scanlist`
   - `npx playwright test`
5. If any command fails, return to the development plan and fix before acceptance.

## 4. Acceptance Criteria

- P16 final acceptance report exists at the path required by the active acceptance gate.
- P16 screenshot evidence exists under `docs/active/evidence/p16/`.
- Build, unit tests, Playwright E2E, and scanlist verification pass on 2026-06-09.
- PRD review confirms P16 still supports: empty personal map, scanlist toggle, map click/add, multi-candidate confirmation, location fallback, Agent candidate loop, tags/filtering, external map handoff, and poster export.
- Final report explicitly preserves the pure-frontend boundary and does not over-claim real-time external POI search.

## 5. Audit Opinion

The project can proceed with this closure work. Human confirmation is only required if the fresh command gate reveals a major product-path failure, real scanlist regression, or evidence suggesting previous acceptance was false.

## 6. Acceptance Result

Status: `Pass`.

### Evidence

- `npm run build`: pass.
- `npm test`: pass, 22 tests.
- `npm run verify:scanlist`: pass, 50 entries, 50 manual verification overlays, guardrails include 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆.
- `npx playwright test`: pass, 24 tests across desktop and mobile.
- P16 visual evidence generated under `docs/active/evidence/p16/`.

### PRD Review

The 2026-06-09 closure work did not add new product scope. It closed the active P16 exit-condition gap by producing the required final report and current P16 screenshot evidence. The P16 PRD journey remains supported: empty personal map, optional scanlist layer, map/add editor, multi-candidate confirmation, location fallback, Agent candidate loop, external map handoff, tags/filtering, and poster export.

### Final Audit Opinion

No fatal or major specification deviation remains for P16. No high-risk human confirmation is required.
