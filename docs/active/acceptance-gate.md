# FoodMap Acceptance Gate

## Summary

The current stage can exit only when the original V1.0 PRD loops still work and the added recommendation, verification, UX, and Agent Bridge requirements pass. A blocker failure prevents acceptance.

## Gate Matrix

| Gate | Pass Criteria | Blocker Conditions |
| --- | --- | --- |
| Documentation | Active docs and drawio describe current implementation and remaining plan | Docs still claim missing implemented source/map/persistence/tests, or omit recommendation/POI/agent scope |
| PRD Alignment | Personal food journal experience satisfies V1.0 PRD P0 loops | Core product drifts into a generic list/admin UI or loses local-first workflow |
| Build | `npm run build` passes | TypeScript or bundler errors |
| Unit Tests | `npm test` passes | Domain, filters, import/export, or recommendation verification tests fail |
| Browser Tests | `npx playwright test` passes | Core desktop/mobile workspace or scanlist tests fail |
| Persistence | Places, layers, photos, snapshots, and metadata survive reload | User records or photos disappear after reload |
| Map | Wuhan map renders through Leaflet fallback without AMap key and handles tile failure | No-key app cannot show a usable map or blank map has no fallback |
| Personal Workspace | Create from map click, view, edit, delete, filter, photo, share, import/export all work | Cannot complete a core record loop |
| Required Fields | Name, coordinates, layer, rating, and visit date are enforced | Invalid place can be saved |
| Recommendation Layer | 50 scanlist entries are available; verified mappable count equals rendered recommendation pin count | Unverified/conflicting candidate appears as a map pin, or verified pins are missing |
| POI Verification | Semantic duplicate, branch, source group, coordinate trust, and manual overlay rules govern future items | A future item can be added without verification metadata |
| Recommendation Detail | Detail shows rank, score, source, confidence, coordinate accuracy, review/evidence, and image/fallback | Detail hides verification risk or floods selected state with full list by default |
| Marker Readability | Pin/dot/adaptive marker modes remain legible across zoom and viewport sizes | Zoomed map still shows unreadable small dots where adaptive pins should appear |
| Modal And Panel UX | Only the active task surface is visible; bars/panels do not persist over modals | Add/edit/share/import modal is blocked or visually polluted by persistent controls |
| Mobile UX | 390x844 layout has compact header, bottom action bar, and mutually exclusive panels | Text/buttons overlap or mobile panels compete with each other |
| Agent Bridge | Bridge can query, focus, filter, save valid data, save verified recommendations, reject unverified recommendations, snapshot/export | Agent command bypasses validation or POI verification |
| Data Safety | Malformed import and unsafe agent writes fail without corrupting existing data | Bad input mutates or deletes valid records |
| Evidence | Final report references commands, screenshots, POI report, scanlist report, import/export, and agent checks | Required evidence is missing |

## Manual Acceptance Scenarios

1. Open `#/map` in a clean browser profile.
2. Confirm Wuhan map appears without `VITE_AMAP_KEY`.
3. Create a place from map click after confirmation.
4. Fill required fields and save.
5. Upload photos and confirm thumbnails after reload.
6. Edit and delete a saved place.
7. Toggle display/layer visibility and confirm markers update.
8. Filter by keyword, city/tag/rating/date and clear filters.
9. Generate and open a read-only share snapshot.
10. Export `.foodmap.json` and import into a clean profile.
11. Load AMap Wuhan scanlist.
12. Confirm 50 recommendations are available and verified mappable count equals map pin count.
13. Select recommendation pins and inspect detail evidence, image, confidence, and coordinate accuracy.
14. Confirm approximate locations are labeled as approximate.
15. Confirm an unverified recommendation cannot be saved as a personal place.
16. Check low and high zoom marker readability.
17. Check desktop 1440x900 and mobile 390x844 screenshots for overlap.
18. Exercise Agent Bridge context/list/focus/filter/save/recommendation/snapshot/export commands.

## Required Commands

```bash
npm run build
npm test
npx playwright test
```

## Exit Conditions

Current-stage acceptance is complete when:

- All blocker gates pass.
- The V1.0 PRD experience remains complete.
- 50 verified scanlist pins are visible when the recommendation layer is loaded.
- Every future scanlist item is governed by POI verification before it can become a pin.
- Agent Bridge actions preserve the same validation and verification rules as UI actions.
- Drawio and active docs match the final architecture and acceptance state.
