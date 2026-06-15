# FoodMap V1.0 Current vs Target Gap

## Current State

The project has a V1.0 documentation baseline and a Scheme 4 PRD package, but no source code, no package manifest, no frontend runtime, no persistence implementation, no map provider implementation, no test harness, and no final acceptance evidence.

## Target State

FoodMap V1.0 is a pure frontend, local-first, travel-journal-style food map application with:

- Full-screen interactive map.
- Personal editing workspace at `#/map`.
- Local read-only share page at `#/share/:snapshotId`.
- Food place records with ratings, visit dates, notes, tags, photos, and coordinates.
- Layer controls and filtering.
- AMap provider with Leaflet fallback.
- IndexedDB persistence.
- Local read-only share snapshots.
- Export/import share packages.
- Documented acceptance gates and final acceptance report.
- Scheme 4 visual style: warm paper, muted map, paper cards, restrained decoration.

## Gap Matrix

| Area | Current | Target | Required Work | Evidence |
| --- | --- | --- | --- | --- |
| Documentation | Baseline docs plus Scheme 4 PRD package | Canonical active docs and V1.0 snapshot | Normalize PRD, dev plan, Figma prompts and update indexes | Files under `docs/active` and `docs/V1.0` |
| App Foundation | None | Vite React TypeScript SPA | Initialize frontend project | Build output and route smoke test |
| Domain Model | None | Typed food map records | Add models and validation | Unit tests |
| Persistence | None | IndexedDB local storage with `places`, `layers`, `photos`, `snapshots`, `meta` | Implement repositories and import/export codec | Reload persistence test |
| Map | None | AMap plus Leaflet fallback | Implement adapter and providers | Browser smoke tests |
| Workspace UI | None | Scheme 4 map-first editor | Build panels, drawers, forms, filters, and mobile bottom sheets | Manual scenario screenshots |
| Photos | None | Blob storage and thumbnails | Implement upload and thumbnails | Photo round-trip test |
| Sharing | None | Local read-only snapshots and `.foodmap.json` packages | Implement snapshot route and export/import | Import/export evidence |
| Visual System | PRD tokens only | Scheme 4 CSS implementation | Apply warm paper tokens, marker icons, card styles, and restrained decoration | Desktop/mobile screenshots |
| Responsive UX | None | Desktop 1440x900 and mobile 390x844 usable layouts | Add responsive CSS and verify | Playwright screenshots |
| Acceptance | None | Gate-based V1.0 exit | Run and document checks | Final acceptance report |
| Implementation Contracts | Newly added contract docs | Implementation-ready contract set | Use data, repository, map, E2E, and visual contract docs during development | Audit document set under `docs/active` |

## Functional Specification Summary

Food places:

- Required fields: name, longitude, latitude, layer, rating, visit date.
- Optional fields: address, city, tags, notes, photos.
- Supported actions: create from map click, create from search result, edit, delete with confirmation, select, focus, filter.

Layers:

- Required fields: name, color, icon, visibility, sort order.
- Default layers: `必吃餐厅`, `咖啡馆`, `小吃快餐`, `甜品饮品`, `想去清单`.
- Supported actions: create default layer, create custom layer, toggle visibility, show counts, assign places.

Photos:

- Stored locally as blobs.
- Thumbnail data URLs are generated for list/detail/share display.
- Share export includes thumbnails, not original blobs by default.

Share snapshots:

- Generated from current local records.
- Stored locally and opened by `#/share/:snapshotId`.
- Exported as `.foodmap.json` for import elsewhere.
- Share view must show local read-only copy and must not show create, edit, delete, upload, or save controls.

Search and filters:

- Keyword covers name, address, tags, and notes.
- Provider search can create a place draft from a result.
- Filters cover city, layer, tag, rating or minimum rating, and visit date range.
- Clear action restores all visible places.

State design:

- First-run empty state offers search, map add, and `.foodmap.json` import.
- Filter empty state suggests relaxing rating, tags, or visit date.
- Missing share snapshot state offers import and return-to-map.
- Loading and error states cover map, data, photos, import validation, provider failure, fallback map mode, and storage failure.

## Development Path

1. Freeze Scheme 4 docs and indexes.
2. Initialize app and test harness.
3. Implement domain and IndexedDB repositories.
4. Implement Leaflet fallback and map provider abstraction.
5. Build workspace UI and place CRUD.
6. Add search, filters, layers, and photos.
7. Build share route and import/export.
8. Add AMap provider.
9. Apply Scheme 4 visual polish.
10. Run acceptance gate and write final report.

## Risks And Controls

- AMap key unavailable: Leaflet fallback must run without configuration.
- IndexedDB quota pressure from photos: generate thumbnails and keep export size bounded.
- Share expectations: V1.0 explicitly supports local snapshots and file export/import, not public links.
- Mobile panel overlap: responsive layout must be verified with browser screenshots.
- Scheme 4 over-decoration: keep decoration minimal and preserve map readability.
