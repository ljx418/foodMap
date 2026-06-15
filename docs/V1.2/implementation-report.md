# FoodMap V1.2 Implementation Report

Date: 2026-06-04

## Completed

- Added an independent `高德扫街榜` recommendation layer.
- Added local Wuhan scanlist recommendation data with score, rank, district, address, tags, summary review, public review snippets, source URL, and location accuracy.
- Added recommendation map markers that are visually different from personal food pins.
- Added `加载扫街榜` toolbar action.
- Added recommendation panel with district filter, ranking list, recommendation detail, score, review text, snippets, and location-accuracy notice.
- Added `收藏为个人记录`; saved recommendations become regular `FoodPlace` records under the user's normal data model.
- Added `scripts/generate_amap_wuhan_scanlist.mjs` as the public-page generation entrypoint and source manifest writer.
- Extended `window.FoodMapAgentBridge` with:
  - `loadRecommendations`
  - `listRecommendations`
  - `focusRecommendation`
  - `saveRecommendationAsPlace`

## Data Notes

- Recommendation points are loaded as a separate recommendation layer and do not count as personal records until saved.
- The current dataset covers the 20 entries visible on the public AMap ranking page. The page states that the full ranking has 68 entries, but the app does not fabricate APP-only entries.
- Recommendation candidates now require POI Detail coordinate verification before becoming map pins.
- Most coordinates are marked `approximate`, because no AMap key is configured and public HTML does not reliably expose precise coordinates.
- UI details explicitly say: `近似位置，建议收藏后手动校准`.
- The implementation does not bypass login, scrape private APP-only data, or use hidden authenticated APIs.

## Verification

- `npm run build`: passed.
- `npm test`: passed, 4 unit tests.
- `npx playwright test`: passed, 12 desktop/mobile browser tests.

## Follow-Up

- Replace curated seed data with a fuller public-page extraction pipeline if the pages remain stable.
- Add an AMap Open Platform key path for exact POI coordinates.
- Add a recommendation-specific marker legend if recommendation density grows.
