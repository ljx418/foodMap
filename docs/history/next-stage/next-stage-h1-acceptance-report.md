# FoodMap H1 Real-Data Refresh Rehearsal Acceptance Report

Status: passed

Date: 2026-06-07

## Scope

H1 rehearsed live real-data refresh in dry-run mode. It did not run `--apply` and did not mutate generated recommendation map data.

Implemented in this substage:

- `scripts/refresh_amap_scanlist.mjs` now supports `REFRESH_REPORT_PATH` and `REFRESH_OUTPUT_PATH`.
- Dry-run can write a dedicated rehearsal report without overwriting the accepted baseline report.
- Refresh reports now compare live crawl results against the current generated baseline and summarize `new`, `removed`, `renamed`, `moved`, `unchanged`, `conflict`, and `pending`.
- Manual verification overlay details are shown in the report so accepted rows display real district, address, coordinate trust, and evidence URL.
- Manual overlay parsing was fixed for the final object in `manualVerifiedPins.ts`, preventing a false pending row for `德膳舫·庭院餐厅·湖北菜`.

## Real-Data Evidence

H1 dry-run report:

- `docs/active/amap-scanlist-refresh-h1-dry-run-report.md`

Dry-run summary:

- Refresh mode: `dry-run`.
- Ranking entries: 50.
- Target entries: 50.
- Current baseline entries: 50.
- Verified mappable entries: 50.
- Pending unmappable entries: 0.
- Hidden conflicts: 0.
- Image evidence matched: 50.
- Diff new: 0.
- Diff removed candidate: 0.
- Diff renamed candidate: 0.
- Diff moved candidate: 0.
- Diff unchanged: 50.
- Diff conflict: 0.
- Diff pending: 0.

Disputed-location rows remain guarded:

- `刘聋子牛肉粉馆(汉阳龙兴东街店)` remains 汉阳区 / 龙阳街道龙兴东街2号.
- `万松小院·荷花垄` remains 江汉区 / 荷花垄，近中山公园片区.
- `小骆川菜馆` remains 洪山区 / 东湖风景区方家村216号.

## Command Evidence

- `npm run verify:scanlist`: passed after the dry-run.
- `npm test`: passed, 14 unit tests.
- `npm run build`: passed, no Vite large chunk warning.
- `npx playwright test`: passed, 14 desktop/mobile tests.

## PRD Specification Review

| Area | Result | Evidence |
| --- | --- | --- |
| Real-data refresh | Pass | Live dry-run generated a dedicated report with diff and admission status |
| Conflict governance | Pass | No conflict was applied; report marks map-data changes as false in dry-run |
| Local-first boundary | Pass | No backend, account, or live service dependency was introduced into the app |
| POI admission | Pass | Existing generated 50-pin baseline remains protected by `npm run verify:scanlist` |
| False acceptance risk | Pass | Report no longer hides manual overlay evidence behind `待核验`/`none` detail rows |

## Audit Result

Fatal issues: none.

Major issues: none.

Issues found and closed during H1:

- The initial H1 report showed 49 verified and 1 pending because the report parser missed the final manual pin object without a trailing comma. The parser was fixed and the dry-run was repeated.
- The initial H1 report displayed POI Detail `待核验` fields even for manual overlay rows. The report now displays manual verification district, address, trust, and evidence URL.

Remaining non-blocking risk:

- Live AMap pages can still change in the future. Any future `--apply` remains a high-risk operation and is not authorized by this report.

## Exit Decision

H1 passes. Continue to H2 UX regression closure.
