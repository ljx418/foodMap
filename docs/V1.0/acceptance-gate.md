# FoodMap V1.0 Acceptance Gate

## Summary

V1.0 can exit only when all gates below pass. A failure in any blocker condition prevents release. The gates now include the Scheme 4 PRD requirements: travel journal style, local-first data safety, map-first layouts, and read-only local sharing.

## Gate Matrix

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| Documentation | Active and V1.0 docs exist; drawio opens; scope is consistent | Missing drawio, missing gate criteria, or docs contradict pure frontend scope |
| PRD Alignment | Product implements Scheme 4 travel journal direction and P0 requirements | Implementation drifts into generic admin UI, marketing page, social feed, or backend-dependent product |
| Build | App builds without TypeScript or bundler errors | `npm run build` fails |
| Test | Unit tests and browser smoke tests pass | Core persistence, map adapter, or route tests fail |
| Persistence | Places, layers, photos, share snapshots, and meta data survive reload | User records disappear after reload |
| Map Provider | Leaflet fallback works without AMap key; AMap works when key is configured; provider failure has readable error state | No-key app cannot show a map or provider failure produces blank screen |
| Workspace | User can create from map click and search result, edit, delete, filter, and view food places | Cannot create or edit food records |
| Required Fields | Name, coordinates, layer, rating, and visit date are enforced | Invalid place can be saved without required fields |
| Photos | User can attach multiple photos, see thumbnails, and reload them | Photo upload fails or thumbnails do not render |
| Layers | Default layers exist; layer visibility and counts work | First-run has no usable layer or hidden layer markers remain visible |
| Search And Filters | Keyword, city, tag, rating, visit-date filters work and can be cleared | Filters do not change visible markers or cannot be cleared |
| Sharing | User can generate read-only snapshot, open `#/share/:snapshotId`, and export/import it | Share route cannot open details or exposes editing controls |
| Visual UX | Scheme 4 warm paper style is applied without excessive decoration | UI reads as generic admin panel, marketing page, or cluttered scrapbook |
| Responsive UX | Desktop 1440x900 and mobile 390x844 layouts are usable with no incoherent overlap | Text or panels overlap in normal desktop/mobile viewports |
| Data Safety | Import validation rejects malformed packages | Malformed import corrupts existing data |
| Evidence | Final evidence matrix is complete | Missing screenshot, command, provider, or import/export evidence |

## Manual Acceptance Scenarios

1. Open `#/map` in a clean browser profile.
2. Confirm the fallback map renders without `VITE_AMAP_KEY`.
3. Create a new food place from a map click.
4. Fill name, rating, visit date, tags, notes, and address.
5. Upload at least two photos and confirm thumbnails render.
6. Reload the page and confirm the record remains.
7. Hide the place layer and confirm the marker disappears.
8. Filter by keyword and rating and confirm matching behavior.
9. Generate a share snapshot and open `#/share/:snapshotId`.
10. Confirm share view is read-only and marker details open.
11. Export a `.foodmap.json` package.
12. Import the package in a clean browser profile and confirm the share snapshot opens.
13. Run the same visual checks at desktop and mobile viewport sizes.
14. Create a place from a map provider search result and confirm name, address, city, and coordinates are prefilled where provider data is available.
15. Confirm first-run default layers: `必吃餐厅`, `咖啡馆`, `小吃快餐`, `甜品饮品`, `想去清单`.
16. Confirm empty states for first-run, no filter results, and missing share snapshot.
17. Confirm share view includes the local read-only copy and excludes create, edit, delete, upload, and save controls.
18. Confirm Scheme 4 visual rules: map remains dominant, decoration is restrained, controls remain easy to find.

## Required Commands

```bash
npm run build
npm test
npx playwright test
```

If Playwright is not installed during early development, the blocker is resolved only after Playwright is installed and the smoke test passes.

## Exit Conditions

V1.0 is accepted when:

- All blocker gates pass.
- Final acceptance report exists at `docs/V1.0/final-acceptance-report.md`.
- The report includes command output summaries and manual scenario results.
- Any non-blocking defects are listed with severity and follow-up plan.
- Every P0 PRD requirement has either automated evidence, manual evidence, or a documented non-blocking waiver.
- The drawio gap document still reflects final architecture, development plan, milestones, gates, and exit conditions.

## Required Playwright Coverage

- Clean profile opens `#/map`.
- Leaflet fallback appears without `VITE_AMAP_KEY`.
- Place create, edit, delete flows work.
- Photo upload produces visible thumbnail.
- Reload preserves place and photo data.
- Layer hide removes markers.
- Filters change marker/result count and clear correctly.
- Share snapshot opens at `#/share/:snapshotId`.
- Share page has no edit/create/delete/upload/save controls.
- `.foodmap.json` export/import round-trip works in a clean profile.
- Desktop 1440x900 and mobile 390x844 screenshots have no incoherent overlap.

Detailed evidence requirements are defined in [e2e-test-and-evidence-matrix.md](./e2e-test-and-evidence-matrix.md). Visual checks are defined in [visual-acceptance-checklist.md](./visual-acceptance-checklist.md).
