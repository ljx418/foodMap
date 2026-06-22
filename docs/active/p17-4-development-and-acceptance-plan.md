# FoodMap P17-4 Development And Acceptance Plan

## Phase Scope

P17-4 focuses on the mobile main path. It builds on accepted P17-2 and P17-3 work and should not introduce a new navigation model.

Target mobile path:

```text
open map
-> filter pending
-> enter detail
-> edit tags
-> move pin
-> open/copy map fallback
-> export share poster
```

## Pre-Implementation Audit

| Item | Current Result | Decision |
| --- | --- | --- |
| Mobile detail drawer scrolls internally | Pass | Keep existing sheet behavior. |
| Mobile manual pin move has map-first mode | Pass | Keep existing full-map move mode and confirmation banner. |
| Mobile bottom action bar restores after closing detail | Pass | Keep existing panel choreography. |
| Mobile filter sheet is reachable | Pass | Keep existing bottom filter action. |
| Mobile share poster is reachable | Partial | It is reachable through More Tools, but not discoverable from detail after completing the main path. |
| Mobile external map/copy fallback is visible in detail | Pass | Keep P17-3 detail core actions. |

Audit decision: `Go for P17-4 implementation`.

No fatal or major spec deviation blocks coding. The implementation should stay small: add a direct share-poster entry from place detail and cover the mobile main path with E2E and visual evidence.

## Development Tasks

| Task | Implementation Target | Acceptance |
| --- | --- | --- |
| P17-4A Detail share entry | Add optional detail-level `导出分享图` action that opens current filtered poster preview | Mobile detail contains a direct share poster action. |
| P17-4B Mobile handoff path | Keep map/copy fallback and manual pin move visible in detail core actions | Mobile E2E sees map fallback and manual move before opening poster. |
| P17-4C Main-path E2E | Add a 390x844 scenario covering import -> pending -> detail -> tag edit -> poster | Playwright mobile test passes. |
| P17-4D Visual evidence | Capture mobile main path screenshot | Evidence saved under `docs/active/evidence/p17/`. |

## Acceptance Commands

```bash
npm run build
npm test
npx playwright test
npm run verify:scanlist
```

## Exit Criteria

- Mobile users can reach share poster preview from the detail flow without hunting through More Tools.
- Existing bottom action bar and manual pin move behavior do not regress.
- Poster preview still uses current filtered personal places.
- No horizontal truncation appears in the mobile detail drawer.
- P16/P17 existing Playwright regression remains green.

## Audit Opinion

P17-4 can proceed with a focused implementation. The high-risk path remains manual pin move persistence and false map navigation for pending places; both are already covered by existing tests and must remain green.
