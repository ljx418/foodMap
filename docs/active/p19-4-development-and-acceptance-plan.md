# FoodMap P19-4 Development And Acceptance Plan - Domain/Repository Consolidation

Date: 2026-06-23
Status: Plan Ready

## 1. Scope

P19-4 reduces UI-only truth in coordinate-changing flows by moving candidate confirmation transform logic into Domain.

P19-4 does not perform a broad repository rewrite. It preserves P18 user-visible confirmation rules:

- candidate selection cannot silently change coordinates before user confirmation,
- manual pin move still requires old/new preview and explicit confirmation,
- Agent still cannot finalize pending coordinates, delete pending records, or hide uncertainty.

## 2. PRD-Derived Acceptance Standard

The PRD requires local persistence, user-controlled editing, and predictable map records. P18/P19 add coordinate trust boundaries. P19-4 is accepted only if shared Domain helpers preserve those boundaries.

Acceptance standard:

1. Candidate confirmation transform is testable outside UI.
2. Precise candidates become exact records and remove stale calibration tags.
3. Approximate candidates remain pending/approximate.
4. Manual move transform remains the shared path for manual coordinate changes.
5. UI still performs explicit confirmation before saving.
6. Agent negative regression remains green.

## 3. Development Plan

| Step | Code Area | Work |
| --- | --- | --- |
| 1 | `src/domain/placeCalibration.ts` | Add `confirmPlaceCandidate` transform |
| 2 | `src/features/workspace/MapWorkspace.tsx` | Replace inline candidate-confirmation mutation with Domain helper |
| 3 | `src/tests/domain.test.ts` | Add precise/approximate confirmation tests |
| 4 | `e2e/workspace.spec.ts` | Reuse existing P18 candidate/Agent/manual-move regressions |

## 4. Audit Before Development

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Domain helper bypasses user confirmation | Major | Helper is pure transform only; UI still calls it only after user button click |
| Approximate candidate becomes exact | Major | Unit test approximate candidate remains approximate and pending |
| Agent starts using helper to finalize pending data | Major | No Agent write path added; Agent negative regression required |
| Repository rewrite expands scope | Medium | Keep repository unchanged unless required; P19-4 only moves transform logic |

Audit opinion: no fatal or major unresolved specification risk remains before implementation. Proceed to P19-4 development.

## 5. Required Verification

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```
