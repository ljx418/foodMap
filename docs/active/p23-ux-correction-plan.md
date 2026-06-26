# FoodMap P23 UX Correction Development And Acceptance Plan

Date: 2026-06-25

## Stage Goal

P23 is a corrective interaction-quality stage after the P22 report exposed evidence quality and mobile usability risks. It does not add new product capabilities. It tightens the accepted P21/P22 share experience and P20/P19 workspace governance surfaces so the current implementation matches the original PRD expectation: map-first, local-first, readable, and usable on small screens.

## Scope

| Area | Development Target | Acceptance Target |
| --- | --- | --- |
| Mobile read-only share | Marker click opens a detail summary; full detail requires an explicit expand action | Map context remains visible, bottom nav does not cover the panel, read-only guardrails remain |
| Share rendering quality | Cache share photo blobs and keep selected marker focused | No unnecessary render churn; selected marker is visually stable |
| Mobile workspace controls | Quick tag sheet remains reachable at 320px and active filters are visible | No horizontal overflow for dock, sheet, or bottom action bar |
| Health/governance panels | Data health and governance panels remain readable; governance actions wrap cleanly | No narrow strip, clipped action label, or vertical action text |
| Responsive state | Use reactive viewport state for mobile decisions | Resize does not leave stale mobile/desktop branching |
| Evidence correction | Replace stale P22 interaction screenshots with P23 evidence | Screenshots and E2E assertions prove the corrected experience |

## Boundaries

P23 must not claim backend sync, accounts, cloud sharing, public permanent links, automatic data repair, automatic coordinate finalization, or guaranteed external realtime POI search.

P23 keeps P18/P19/P20-C/P21/P22 accepted capabilities as regression baselines. P22 remains historical, but P23 supersedes its interaction evidence for mobile share and readable governance panels.

## Development Plan

1. Add a reactive mobile viewport helper and use it in mobile-sensitive controls.
2. Update `ShareView` so mobile marker/list/detail actions open a compact selected-place summary first.
3. Add an explicit full-detail expansion path and hide the mobile share nav while the panel is open.
4. Cache share photo blob wrappers with `useMemo`.
5. Raise mobile panel stacking above share header/nav and keep panel dimensions stable.
6. Make governance tabs and queue actions wrap instead of clipping.
7. Add P23 E2E assertions and screenshot evidence.
8. Run build, unit tests, real scanlist verification, P23 targeted Playwright, P21 responsive regression, and full workspace Playwright.

## Acceptance Plan

Required commands:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P23"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P21 responsive"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts
```

Required evidence:

- `docs/active/evidence/p23/01-mobile-share-marker-summary.png`
- `docs/active/evidence/p23/02-mobile-share-expanded-detail.png`
- `docs/active/evidence/p23/03-mobile-320-quick-filter.png`
- `docs/active/evidence/p23/04-data-health-readable.png`
- `docs/active/evidence/p23/05-governance-readable.png`

## Audit Opinion

Decision before implementation: `Go for P23 correction`.

Reasoning: P23 is a bounded correction stage. The identified issues are not PRD-level scope changes; they are interaction and evidence defects in accepted flows. The plan avoids new capability promises and uses direct browser evidence plus full regression to prevent false acceptance.
