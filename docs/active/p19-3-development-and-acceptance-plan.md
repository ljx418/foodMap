# FoodMap P19-3 Development And Acceptance Plan - Personal Data Health Center

Date: 2026-06-23
Status: Plan Ready

## 1. Scope

P19-3 adds a personal data health center that summarizes local personal places into:

- verified,
- pending,
- high-risk,
- manual-adjusted,
- skipped.

The health center is a derived read model. It must not automatically change coordinates, tags, `mapAccuracy`, notes, photos, or deletion state.

## 2. PRD-Derived Acceptance Standard

The PRD requires a local-first personal food map that lets users create, find, filter, share, import, and export personal places. P19 extends this with visibility into data quality so users can find uncertain or risky records before sharing or navigating.

Acceptance standard:

1. User can open a visible `数据健康` entry from the map workspace.
2. Health center shows all five groups and counts.
3. Groups are derived from local personal places only.
4. `pending`, `high-risk`, `manual-adjusted`, and `skipped` records are visible with representative place names.
5. Actions only focus/open detail, apply a filter, or open the pending workbench.
6. Health actions do not mutate coordinates, tags, `mapAccuracy`, notes, or delete records.
7. Build, unit, scanlist, and targeted browser acceptance pass.

## 3. Development Plan

| Step | Code Area | Work |
| --- | --- | --- |
| 1 | `src/domain/locationStatus.ts` | Add `PersonalDataHealthReport` and `derivePersonalDataHealthReport` |
| 2 | `src/tests/domain.test.ts` | Add grouping and read-only regression tests |
| 3 | `src/features/workspace/PersonalDataHealthCenter.tsx` | Add health center UI and action buttons |
| 4 | `src/features/workspace/MapWorkspace.tsx` | Derive report, expose health right-panel/mobile-panel view, wire actions |
| 5 | `src/features/workspace/HomeMapControlDock.tsx` | Add `数据健康` entry with issue count |
| 6 | `src/styles/app.css` | Add compact health center styles |
| 7 | `e2e/workspace.spec.ts` | Add P19 targeted browser test for groups and non-mutating actions |

## 4. Audit Before Development

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Health center silently fixes data | Major | Component receives only action callbacks for focus/filter/workbench; no save/delete callback |
| High-risk records hidden by verified status | Major | High-risk group is derived before verified group |
| Manual-adjusted exact records disappear from health context | Medium | Manual-adjusted can be listed independently from verified |
| Health filters mutate facts | Major | Filtering uses existing `FoodFilterState`; unit/E2E compare before/after records |
| UI becomes admin dashboard | Medium | Use compact workspace panel, preserve map-first layout |

Audit opinion: no fatal or major unresolved specification risk remains before implementation. Proceed to P19-3 development.

## 5. Required Verification

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 data health"
```

P19-3 acceptance report must include PRD specification review and explicit non-mutation evidence.
