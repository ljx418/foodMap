# FoodMap P20-1 Development And Acceptance Plan

Status: Completed for implementation entry on 2026-06-24

## Scope

P20-1 freezes the accepted P20 direction and verifies that implementation can start without inventing phase boundaries, acceptance criteria, or evidence paths.

## Development Tasks

- Re-read PRD, target architecture, P20 stage contract, acceptance gate, detailed plan, repository/domain contract, E2E matrix, visual checklist, and drawio gap atlas.
- Confirm P20 remains local-first, pure frontend, no backend, no account, no cloud sync, no automatic coordinate finalization, no automatic merge/delete.
- Confirm browser evidence is executable with the local Playwright dependency path.
- Confirm real-data scanlist baseline is valid before P20 feature work.

## Acceptance Criteria

- `npm run build` passes.
- `npm test -- --run` passes.
- `npm run verify:scanlist` passes with 50 scanlist entries and manual verification overlays.
- P19 current viewport poster and P19 data health targeted browser regression pass.
- P20 can enter implementation only if no fatal or major specification drift remains.

## Result

P20-1 passed. P20 feature implementation may start, while P20 itself remains not implemented and not accepted.
