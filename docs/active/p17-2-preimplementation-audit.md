# FoodMap P17-2 Pre-Implementation Audit

Date: 2026-06-16

## Scope

P17-2 covers the pending-place workbench and coordinate-trust loop. It may start because the active PRD, target architecture, development plan, acceptance gate, E2E matrix, data/API contracts, map-provider contract, and P17 UX trust contract all describe the same scope.

This is a planning and implementation-entry audit. It does not claim P17 implementation or acceptance is complete.

## Pre-Implementation Checklist

| Check | Result | Evidence |
| --- | --- | --- |
| Scanlist 50 fixture exists | Pass | `src/recommendations/amapWuhanScanlist.generated.ts`, `npm run verify:scanlist` required at exit |
| Reference layer 100+ fixture exists | Pass | `src/externalShares/dingtuyiWuhanFoodShare.ts` |
| Personal favorites 30+ fixture exists | Pass | `src/personalFavorites/wuhanPersonalFavorites.ts` currently maps 32 personal favorites |
| Pending places 10+ target | Needs implementation evidence | Current domain has pending detection; P17-2 must expose a focused workbench and test it with real fixture data |
| Status model | Pass with implementation work | `mapAccuracy`, system tags, coordinate risk, and manual pin-move audit fallback are documented |
| Agent boundary | Pass with negative-test requirement | Agent may read pending context and submit candidates, but cannot directly finalize coordinates, delete, or hide pending places |
| Mobile viewports | Pass with execution requirement | P17-2 acceptance must run `390x844` and `430x932` evidence through Playwright or manual screenshots |
| Screenshot evidence path | Pass | Use `docs/active/evidence/p17/` |
| Exit commands | Pass | `npm run build`, `npm test`, `npx playwright test`, `npm run verify:scanlist` |

## Audit Opinion

Decision: `Go for P17-2 implementation`.

Implementation must stop for human confirmation if any of the following occurs:

- Pending places cannot be produced from real or deterministic data.
- The implementation requires a backend or paid POI service to pass baseline acceptance.
- Agent actions need direct coordinate finalization to complete the flow.
- Manual pin move cannot preserve a visible audit or calibration state after refresh.

## P17-2 Acceptance Plan

1. Add a focused pending-place workbench from the homepage pending count.
2. Show pending total, high-risk total, original place information, coordinate risk, candidates, and actions.
3. Support three operations: confirm candidate, start manual pin move, skip pending for now.
4. Persist candidate confirmation and skip state with visible status.
5. Verify map/list/detail counts and status update after each operation.
6. Run unit/domain checks, browser E2E, scanlist verification, and PRD spec review.

