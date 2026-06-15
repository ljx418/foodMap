# FoodMap H1 Real-Data Refresh Rehearsal Development And Acceptance Plan

Status: active

Date: 2026-06-07

## Summary

H1 validates the live real-data refresh workflow without changing the accepted 50 verified map pins. This substage supports PRD 4A.3 real-data refresh and conflict governance: users should see source changes, conflicts, removals, renames, and pending items as audit evidence instead of having refreshed data pollute the map.

## Development Scope

- Keep `scripts/refresh_amap_scanlist.mjs` in dry-run mode for H1.
- Add safe report-path support so H1 can write a dedicated refresh rehearsal report instead of overwriting the accepted baseline report.
- Add baseline diff accounting for `new`, `removed`, `renamed`, `moved`, `unchanged`, `conflict`, and `pending`.
- Preserve generated recommendation data unless an explicit future high-risk `--apply` is approved.

## Acceptance Criteria

- H1 dry-run produces `docs/active/amap-scanlist-refresh-h1-dry-run-report.md`.
- The dry-run report includes source URLs, refresh time, current baseline count, target count, verified count, conflict count, and diff counts.
- `src/recommendations/amapWuhanScanlist.generated.ts` is not modified by dry-run.
- `npm run verify:scanlist` still passes after dry-run.
- `npm test`, `npm run build`, and `npx playwright test` still pass.

## Stop Conditions

- If dry-run finds moved, conflict, removed, renamed, or pending items that would require `--apply` to alter generated data, H1 must not apply them.
- If live source parsing fails or produces fewer than 50 entries, keep the accepted baseline and record the failure as audit evidence.
- If the dry-run report contradicts the visible 50-pin baseline, return to planning before further implementation.
