# Stage P2 Development And Acceptance Plan

## Summary

P2 hardens the real-data POI verification pipeline for the AMap Wuhan scanlist. The default real-data baseline is the current 50 verified entries. Network refresh is reserved for this stage or later source changes.

## PRD And Architecture Mapping

- PRD: map pins must be trustworthy and not fabricate locations.
- Architecture: recommendation pins pass `evaluateRecommendation`; unverified or conflicting candidates stay off map.
- Evidence: `amap-scanlist-refresh-report.md`, `poi-verification-mechanism-v1.md`, `manualVerifiedPins.ts`.

## Development Plan

- Keep `scripts/refresh_amap_scanlist.mjs` as the refresh entrypoint.
- Extend generated refresh reporting with duplicate group, independent source groups, coordinate trust, admission decision, and hidden conflict count.
- Keep exact and approximate coordinate labels visible in UI.
- Do not overwrite manually verified pins when a public-page refresh conflicts.

## Acceptance Plan

- Verify generated scanlist has 50 entries.
- Verify `getMappableRecommendations(AMAP_WUHAN_SCANLIST).length` is 50.
- Verify every mappable item has evidence, coordinate trust not `low/none`, coordinate values, and no conflict warnings.
- Run full build/unit/e2e.

## Audit Opinion

- Initial status: needs work.
- Major risk: refresh report currently communicates 50 verified entries but lacks structured duplicate/source/coordinate columns for future audit.
- Required closure: update report generation or produce a current-stage verification summary with those fields.

## Exit Condition

P2 exits when structured verification evidence exists and no unverified/conflicting candidate can render as a map pin.
