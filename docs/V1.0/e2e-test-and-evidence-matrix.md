# FoodMap V1.0 E2E Test And Evidence Matrix

## Summary

This matrix defines the browser-level evidence needed to prove V1.0 satisfies the PRD and target architecture.

## Required Commands

```bash
npm run build
npm test
npx playwright test
```

## Test Data

Use deterministic fixture data for E2E tests:

- Layers: `必吃餐厅`, `咖啡馆`, `小吃快餐`, `甜品饮品`, `想去清单`
- Places:
  - `弄堂里 · 本帮面馆`, rating 5, city `上海市`, tag `想二刷`
  - `M Stand 静安店`, rating 4, city `上海市`, tag `咖啡`
  - `街角甜品`, rating 3, city `上海市`, tag `甜品饮品`
- One small test image fixture for thumbnail generation.

## Selector Strategy

Use stable `data-testid` attributes for E2E-critical controls:

- `workspace-map`
- `workspace-search`
- `workspace-add-place`
- `layer-panel`
- `place-editor`
- `place-detail`
- `photo-uploader`
- `filter-panel`
- `share-snapshot-dialog`
- `import-export-dialog`
- `share-view`

## Playwright Scenarios

| ID | Scenario | Evidence |
| --- | --- | --- |
| E2E-01 | Clean profile opens `#/map` | Route visible, map shell rendered |
| E2E-02 | Leaflet fallback renders without `VITE_AMAP_KEY` | Fallback map visible |
| E2E-03 | Create place from map click | Marker and detail visible |
| E2E-04 | Create place from search result | Prefilled draft saved |
| E2E-05 | Edit place fields | Updated detail visible |
| E2E-06 | Delete place | Marker disappears |
| E2E-07 | Upload photo | Thumbnail visible |
| E2E-08 | Reload persistence | Place and thumbnail remain |
| E2E-09 | Toggle layer visibility | Matching markers disappear |
| E2E-10 | Apply and clear filters | Marker/result count changes and restores |
| E2E-11 | Generate share snapshot | `#/share/:snapshotId` opens |
| E2E-12 | Share page read-only | No edit/create/delete/upload/save controls |
| E2E-13 | Export `.foodmap.json` | Download exists |
| E2E-14 | Import package in clean profile | Share snapshot opens |
| E2E-15 | Desktop screenshot | `docs/V1.0/evidence/desktop-1440x900.png` |
| E2E-16 | Mobile screenshot | `docs/V1.0/evidence/mobile-390x844.png` |

## Manual Evidence

- AMap provider verified with `VITE_AMAP_KEY`.
- AMap invalid-key fallback verified.
- Visual review confirms Scheme 4 style and no over-decoration.
- Import failure verified with malformed JSON.

## Final Report Requirements

`docs/V1.0/final-acceptance-report.md` must include:

- Build output summary.
- Unit test output summary.
- Playwright output summary.
- Desktop and mobile screenshot paths.
- AMap and Leaflet verification notes.
- Import/export round-trip result.
- Known issues and severity.

