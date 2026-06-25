# FoodMap P22 Final Acceptance Report

Date: 2026-06-24

## Decision

`P22 accepted`.

Post-acceptance note, 2026-06-25: P23 supersedes P22's interaction evidence for mobile read-only share detail and governance/data-health panel readability. The P22 report remains historical, but its screenshot evidence must not be used as the latest proof for those corrected paths.

P22 is accepted as an interaction experience refactor over the accepted P21/P20-C/P19/P18 baselines. It improves share-page readability, missing snapshot recovery, workspace panel readability, mobile dock behavior, and action language without adding backend, account, cloud sync, public permanent links, automatic data repair, or new external real-time POI claims.

## Implemented Scope

| Area | Result |
| --- | --- |
| Read-only share shell | Desktop share page now has standalone header, readonly notice, layer panel, map, and detail panel. Mobile share page has 图层/清单/详情 navigation. |
| Missing snapshot recovery | Missing `#/share/:snapshotId` page includes direct `.foodmap.json` import, package validation, no-op error copy, and route handoff after successful import. |
| Workspace panel readability | Data health, governance, and pending paths use wider right-panel classes; grid column animation was removed so panels open directly at readable width. |
| Mobile controls | Mobile top dock is compact and the quick tag sheet is rendered outside the dock so it remains viewport-clickable on 320px/390px widths. |
| Action language | Header/dialog labels now distinguish `数据包`, `分享图`, and `快照`. |
| Regression harness | Added `P22 workspace shell keeps governance and mobile controls readable` and strengthened P21 share/read-only assertions. |
| Documentation | PRD, target architecture, development plan, acceptance gate, milestone roadmap, gap markdown, drawio, E2E matrix, visual checklist, P22 plan, and P22 audit are synchronized. |

## PRD And Architecture Review

P22 supports the original PRD requirements for map-first workflow, local-first data handling, mobile usability, read-only share clarity, and non-overlapping controls. The target architecture remains pure frontend and local-first:

- User facts remain in IndexedDB.
- `#/share/:snapshotId` remains a local read-only route.
- `.foodmap.json` remains the portability mechanism.
- Candidate confirmation, manual pin move, governance writes, and Agent boundaries remain governed by accepted P18/P20-C/P21 rules.

No major PRD deviation or false acceptance risk remains after the final regression run.

## Command Evidence

| Gate | Result |
| --- | --- |
| `npm run build` | Passed. TypeScript build and Vite production build completed. |
| `npm test -- --run` | Passed. 46 Vitest tests passed. |
| `npm run verify:scanlist` | Passed. 50 scanlist entries and 50 manual verification overlays verified. |
| P21 targeted Playwright | Passed. 7 tests passed for share portability, import safety, read-only guard, and responsive share/fallback. |
| Core targeted Playwright | Passed. 12 tests passed for workspace, creation, poster, P19 data health, P20 governance, Agent, responsive governance, and P22 shell. |
| Full `e2e/workspace.spec.ts` | Passed. 72 passed, 42 intentionally skipped by project-specific guards. |

Browser command used the documented local dependency path:

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts
```

## Evidence

P22 screenshot evidence:

- `docs/active/evidence/p22/01-desktop-readonly-share.png`
- `docs/active/evidence/p22/02-mobile-readonly-share-detail.png`
- `docs/active/evidence/p22/03-missing-snapshot-recovery.png`
- `docs/active/evidence/p22/04-data-health-wide-panel.png`
- `docs/active/evidence/p22/05-governance-wide-panel.png`
- `docs/active/evidence/p22/06-mobile-compact-dock.png`
- `docs/active/evidence/p22/07-mobile-quick-filter-sheet.png`
- `docs/active/evidence/p22/manifest.json`

Drawio audit:

- `docs/active/current-vs-target-gap.drawio` has 7 pages.
- It covers target experience, current vs target architecture gap, functional entities and relationships, user paths, development and acceptance plan, milestones, acceptance gates, and exit conditions.

## Issues Found And Fixed During Acceptance

| Issue | Fix | Verification |
| --- | --- | --- |
| Quick filter sheet rendered inside a `backdrop-filter` dock, causing fixed-position sheet content to be constrained to the dock on 320px width | Moved quick filter sheet outside the dock section | Narrow homepage test passed on desktop and mobile projects |
| Detail and right panels were measured during grid-column transition, producing temporary unreadable slivers and false overflow | Removed workspace grid-column transition so panels open at final readable width | P17 detail IA and P22 workspace shell tests passed |

## Residual Boundaries

- P22 is not a cloud share, public link, sync, or account stage.
- P22 does not complete external real-time POI search.
- P22 does not change coordinate finalization or governance write rules.
- Playwright on this machine still requires the documented `LD_LIBRARY_PATH` workaround unless system browser dependencies are installed globally.
