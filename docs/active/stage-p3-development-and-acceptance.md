# Stage P3 Development And Acceptance Plan

## Summary

P3 improves recommendation viewing so selecting a map pin shows one clear place detail instead of flooding the right panel or mobile sheet with the entire ranking.

## PRD And Architecture Mapping

- PRD: information appears on demand and map remains the primary surface.
- Architecture: recommendation detail defaults to selected item; ranking list is a deliberate expansion.

## Development Plan

- Preserve selected-place-first detail.
- Keep the recommendation list collapsed behind a toggle.
- Show rank, score, source, coordinate accuracy, confidence, verification warnings, review text, and image evidence/fallback.
- Validate desktop and mobile screenshots.

## Acceptance Plan

- Playwright: select a recommendation, verify detail is visible and list remains collapsed.
- Verify image evidence appears for the selected real entry.
- Verify approximate items display calibration guidance.
- Run full build/unit/e2e after changes.

## Audit Opinion

- Initial status: currently covered by existing Playwright tests, but screenshot evidence should be refreshed after any UI change.
- No fatal risk identified.

## Exit Condition

P3 exits when selected detail, evidence display, and mobile readability are verified.
