# Stage P5 Development And Acceptance Plan

## Summary

P5 validates map marker readability across zoom and density states.

## PRD And Architecture Mapping

- PRD: map is primary; pins may be numerous but controls and markers must remain readable.
- Architecture: recommendation markers use ranked pins, adaptive green pins, and compact dots based on zoom and visible density.

## Development Plan

- Preserve distinct personal and recommendation marker classes.
- Keep top-ranked recommendations in ranked pin mode.
- Keep secondary recommendations in adaptive green pin mode only when zoom/density threshold allows.
- Keep compact dots for crowded views.

## Acceptance Plan

- Playwright: load 50 recommendations and verify no secondary adaptive pin at crowded baseline.
- Focus/zoom to a lower-ranked item and verify adaptive pin appears.
- Capture desktop/mobile screenshots if visual tuning is changed.
- Run full build/unit/e2e.

## Audit Opinion

- Initial status: covered by current E2E selector assertions.
- Medium risk: selector evidence is not a full visual proof; screenshot evidence should be refreshed when marker CSS changes.

## Exit Condition

P5 exits when marker mode transitions are verified and no stale marker state remains after focus/zoom.
