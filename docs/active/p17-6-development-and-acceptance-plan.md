# FoodMap P17-6 Development And Acceptance Plan

## Phase Scope

P17-6 covers share poster preview and propagation experience. The phase goal is not to redesign poster rendering, but to verify that preview/export still reflects the same visible personal-place facts after P17-2 to P17-5 changes.

## Pre-Implementation Audit

| Item | Current Result | Decision |
| --- | --- | --- |
| Desktop poster export produces PNG | Covered by E2E | Keep implementation. |
| Mobile can reach poster preview from main path | Covered by P17-4 | Keep detail-level share entry. |
| Poster uses current filtered personal places | Covered by poster E2E and P17-4 screenshot | Keep implementation. |
| Scanlist/reference layers do not pollute personal count | Covered by poster copy and E2E | Keep implementation. |
| Empty/pending UI does not export misleading state | Covered by dialog wording and P17 acceptance gates | No code change needed in this phase. |

Audit decision: `Go for P17-6 acceptance`.

No product-code changes are required before acceptance. Existing implementation and tests satisfy the P17-6 scope after the P17-4 detail share entry.

## Acceptance Tasks

| Task | Evidence |
| --- | --- |
| Verify mobile poster preview is reachable from the P17 main path | `mobile P17 main path reaches detail tags, map fallback and share poster` |
| Verify desktop export can download PNG | `map poster export downloads a png for the current filtered personal pins` |
| Verify visual preview is not blank and reports visible personal count | `docs/active/evidence/p17/mobile-390x844-main-path.png` and P16 poster evidence |
| Verify full regression is green | `npx playwright test` |

## Acceptance Commands

```bash
npm run build
npm test
npx playwright test
npm run verify:scanlist
```

## Exit Criteria

- Share poster preview opens from the mobile detail main path.
- Export PNG path remains functional on desktop.
- Preview count reflects current visible personal places, not scanlist/reference totals.
- No regression in P16 poster visual evidence.

## Audit Opinion

P17-6 can be accepted as a validation phase. Any future poster redesign should be a separate stage, because P17's current requirement is correctness, reachability, and consistency rather than a new visual template.
