# FoodMap P19-5 Development And Acceptance Plan - Responsive Regression

Date: 2026-06-23
Status: Plan Ready

## 1. Scope

P19-5 verifies that P19 current-viewport poster and data health changes remain usable across required viewport sizes:

- `390x844`
- `430x932`
- `768x900`
- `1280x820`

P19-5 may make small layout fixes if acceptance finds clipping or unreachable controls. It must not redesign FoodMap into an admin dashboard or demote the map.

## 2. PRD-Derived Acceptance Standard

The PRD requires desktop and mobile layouts to be usable, with the map as the primary surface and mobile using compact controls. P19-5 is accepted only if new P19 controls are reachable without overlapping core map workflows.

Acceptance standard:

1. Workspace map is visible at every required viewport.
2. Data health entry is reachable.
3. Data health panel opens and can be closed or navigated without blocking the map permanently.
4. Share poster entry is reachable.
5. Poster dialog opens and mode controls fit.
6. No required control is hidden behind an unrelated modal/panel.

## 3. Development Plan

| Step | Code Area | Work |
| --- | --- | --- |
| 1 | `e2e/workspace.spec.ts` | Add P19 responsive targeted test across required viewports |
| 2 | `src/styles/app.css` | Apply small wrapping/spacing fixes only if test exposes clipping |
| 3 | docs | Record screenshots/test result in acceptance report |

## 4. Audit Before Development

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Health/poster controls crowd mobile dock | Major | Browser test checks controls are reachable at 390/430 widths |
| P19 panel blocks map permanently | Major | Test closes panel/dialog and checks map remains visible |
| Over-scoped redesign | Medium | Only small layout fixes are allowed |

Audit opinion: no fatal or major unresolved specification risk remains before implementation. Proceed to P19-5 responsive validation.

## 5. Required Verification

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 responsive"
```
