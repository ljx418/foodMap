# Stage P6 Development And Acceptance Plan

## Summary

P6 makes the browser Agent Bridge acceptable for companion-agent use without creating a second unsafe data path.

## PRD And Architecture Mapping

- PRD: local-first personal data remains under user control.
- Architecture: Agent commands must reuse domain validation, persistence, and POI admission rules.

## Development Plan

- Keep commands for context, places, filters, focus, snapshots, exports, recommendations, and save actions.
- Ensure `savePlace` and `updatePlace` use domain validation.
- Ensure `saveRecommendationAsPlace` rejects recommendations that fail `evaluateRecommendation`.
- Emit command/result/state events consistently.

## Acceptance Plan

- Playwright: Agent can save/list/focus a valid personal place.
- Playwright: Agent can load/list/focus recommendations.
- Playwright: Agent can save a verified recommendation.
- Unit or E2E: unverified recommendation conversion/save is rejected.
- Run full build/unit/e2e.

## Audit Opinion

- Initial status: needs one closure item.
- Major risk: UI-provided save callback must not bypass the fallback bridge's POI gate.

## Exit Condition

P6 exits when both valid-save and unsafe-rejection paths have automated evidence.
