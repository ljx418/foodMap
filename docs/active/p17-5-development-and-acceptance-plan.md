# FoodMap P17-5 Development And Acceptance Plan

## Phase Scope

P17-5 covers homepage filter command bar and pin visual state. It must keep the map as the first-class surface and avoid reintroducing clipped buttons, confusing layer controls, selected-pin flicker, or unreadable pin states.

## Pre-Implementation Audit

| Item | Current Result | Decision |
| --- | --- | --- |
| Filter bar at narrow desktop and tablet sizes | Covered by E2E | Keep existing implementation. |
| Mobile compact filter sheet | Covered by E2E | Keep existing implementation. |
| Pin selected state color and no-shadow rule | Covered by E2E | Keep existing implementation. |
| Scanlist tag/status filtering | Covered by E2E | Keep existing implementation. |
| P17-specific visual evidence | Partial | Add dedicated P17 screenshots for filter bar and selected pin. |

Audit decision: `Go for P17-5 acceptance-evidence implementation`.

No app-code change is required before acceptance. The implementation work for this phase is to add P17-specific visual evidence coverage so future regressions do not rely on P16 screenshot names.

## Development Tasks

| Task | Implementation Target | Acceptance |
| --- | --- | --- |
| P17-5A Filter evidence | Capture desktop and mobile filter command bar screenshots | Screenshots saved under `docs/active/evidence/p17/`. |
| P17-5B Pin visual evidence | Capture selected personal pin state with real imported personal data | Screenshot shows selected green pin without shadow-heavy state. |
| P17-5C Regression | Keep existing filter and pin E2E green | Full Playwright passes. |

## Acceptance Commands

```bash
npm run build
npm test
npx playwright test
npm run verify:scanlist
```

## Exit Criteria

- Visible homepage filter controls do not overflow in target viewports.
- Selected personal pin uses stable state styling and does not rely on click flash.
- Scanlist filters still hide/show pins according to source/tag/status.
- P17 visual evidence is available for audit.

## Audit Opinion

P17-5 can proceed without product-code changes. Adding evidence coverage is enough for this phase because the relevant behavior already passed in the current regression suite.
