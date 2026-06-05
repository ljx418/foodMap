# Stage P1 Development And Acceptance Plan

## Summary

P1 protects the original V1.0 PRD loops while later recommendation and agent work continues. The stage uses the current 50 verified Wuhan scanlist entries as the stable real-data baseline.

## PRD And Architecture Mapping

- PRD: `#/map` personal workspace, local persistence, map click create, photos, filters, local share, `.foodmap.json`, responsive layout.
- Architecture: IndexedDB repositories, Leaflet Wuhan fallback, workspace UI state, Agent Bridge must not bypass validation.

## Development Plan

- Preserve CRUD, photo, filter, share, import/export, and responsive baseline.
- Keep modal flows free of persistent status/action bars.
- Fix any validation path that could allow Agent or recommendation save actions to bypass domain or POI gates.
- Do not change the verified 50-entry scanlist baseline during P1.

## Acceptance Plan

- Run `npm run build`.
- Run `npm test`.
- Run `npx playwright test`.
- Verify Playwright covers desktop and mobile workspace open, share missing snapshot, map-click create, Agent save/list/focus, scanlist load, recommendation image detail, adaptive pin behavior, and saving verified recommendation.

## Audit Opinion

- Initial status: pass with one major risk.
- Major risk: the UI-backed Agent recommendation save path must call the same POI admission gate as the fallback bridge path.
- Required closure: saving any recommendation as a personal place must pass `evaluateRecommendation`; unit tests must prove unverified recommendations cannot be converted or saved.

## Exit Condition

P1 exits only when build, unit tests, and Playwright pass after the POI admission fix.
