# FoodMap P23 Final Acceptance Report

Date: 2026-06-25

## Decision

`P23 accepted`.

P23 is accepted as an interaction-quality correction over the accepted P22/P21/P20-C/P19/P18 baselines. It fixes the mobile read-only share detail flow, stale/weak visual evidence risk, narrow governance action layout, and 320px quick-filter usability without adding backend, account, cloud sync, public permanent links, automatic data repair, or new external realtime POI claims.

## Implemented Scope

| Area | Result |
| --- | --- |
| Mobile read-only share | Map marker selection opens an unobstructed selected-place summary; full detail is an explicit second step. |
| Share panel stacking | Share bottom nav is hidden while a mobile share panel is open; the panel sits above header/nav layers. |
| Share rendering | Share photo blob wrappers are memoized; selected marker focus is passed into `MapCanvas`. |
| Mobile workspace controls | 320px quick-filter sheet is reachable and checked for horizontal overflow. |
| Governance readability | Governance tabs and batch actions wrap cleanly instead of clipping or forcing poor vertical text. |
| Responsive state | Mobile branching uses a reactive viewport hook. |
| Evidence | P23 screenshot evidence replaces the stale P22 interaction evidence for the corrected paths. |

## PRD And Architecture Review

P23 supports the original PRD by preserving the map-first workspace and making accepted local-first flows easier to use and verify. The target architecture remains unchanged:

- User places, snapshots, photos, and governance history remain local.
- `#/share/:snapshotId` remains read-only and local.
- Governance remains explicit, preview-first, and user-confirmed.
- Agent and coordinate trust boundaries remain unchanged.

P23 is not a new feature-expansion stage. It is a correction stage that makes P22's accepted flows match the expected user experience more honestly.

## Command Evidence

| Gate | Result |
| --- | --- |
| `npm run build` | Passed. |
| `npm test -- --run` | Passed, 46 Vitest tests. |
| `npm run verify:scanlist` | Passed, 50 scanlist entries and 50 manual verification overlays. |
| P23 targeted Playwright | Passed, 3 tests. |
| P21 responsive regression | Passed, 4 tests after updating the mobile share expectation to summary then expand. |
| Full `e2e/workspace.spec.ts` | Passed, 75 passed and 45 project-guarded skips. |

Browser command used:

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts
```

## Screenshot Evidence

- `docs/active/evidence/p23/01-mobile-share-marker-summary.png`
- `docs/active/evidence/p23/02-mobile-share-expanded-detail.png`
- `docs/active/evidence/p23/03-mobile-320-quick-filter.png`
- `docs/active/evidence/p23/04-data-health-readable.png`
- `docs/active/evidence/p23/05-governance-readable.png`

## Issues Found During Acceptance

| Issue | Resolution |
| --- | --- |
| Initial P23 marker test used the wrong marker class for the P21 share fixture | Updated the test to click the actual share fixture marker. |
| First P23 run reused a stale dev server and did not reflect new share behavior | Restarted the dev server and reran targeted tests. |
| Governance screenshot still showed clipped/wrapped action layout after first pass | Changed governance tabs and queue actions to wrap into readable rows. |
| Full regression failed because old P21 responsive tests expected immediate full detail on mobile | Updated regression to assert the new P23 summary-first, expand-to-detail path. |

## Residual Boundaries

- P23 does not downgrade the accepted P22 history, but P23 supersedes P22's interaction evidence for the corrected mobile share and governance/readability paths.
- Playwright still requires the documented local `LD_LIBRARY_PATH` workaround on this machine unless system browser dependencies are installed globally.
- P23 does not complete external realtime POI search or introduce any cloud/public share capability.
