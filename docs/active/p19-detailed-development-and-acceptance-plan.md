# FoodMap P19 Detailed Development And Acceptance Plan

Date: 2026-06-23
Status: Accepted; drawio direction reviewed and accepted by the user on 2026-06-23; final acceptance completed on 2026-06-23

This status means P19 has completed the required build, unit, scanlist, P18 regression, P19 targeted browser evidence, screenshots/JSON evidence, documentation sync review, and final acceptance report. The plan remains as the implementation trace for the accepted P19 stage.

## 1. Development Sequence

P19 must be implemented in this order. Later phases may read earlier phase outputs, but must not skip their acceptance gates.

| Phase | Goal | Primary User-Visible Result | Primary Architecture Result |
| --- | --- | --- | --- |
| P19-1 | Acceptance environment baseline | Developers can distinguish environment blockers from product failures | Browser acceptance setup is documented and reproducible |
| P19-2 | Current viewport poster | User can export a poster for exactly the current map viewport | Map bounds flow from map adapter to poster source selector |
| P19-3 | Personal data health center | User can see and act on unhealthy personal map data | Health read model centralizes trust grouping |
| P19-4 | Domain/repository consolidation | Coordinate-changing flows remain consistent across UI and Agent | Shared domain transforms reduce UI-only truth |
| P19-5 | Responsive regression | New P19 UI remains usable on mobile/tablet/narrow desktop | E2E/screenshots guard layout regressions |
| P19-6 | Documentation sync review | Docs match implemented behavior | Active docs and drawio remain current |
| P19-7 | Final acceptance | P19 can exit with evidence | Final report ties commands, screenshots, and residual risks |

## 2. P19-1 Acceptance Environment Baseline

Implementation tasks:

- Keep `docs/active/p19-acceptance-environment.md` as the source of truth for local/CI browser setup.
- Record whether local Playwright can launch Chromium before any P19 browser claim.
- If local launch fails, record exact dependency error and use an accepted alternate runner before final acceptance.

Acceptance:

```bash
npm ci
npm run build
npm test -- --run
npm run verify:scanlist
```

Browser gate, once environment is ready:

```bash
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

Exit evidence:

- P19-1 acceptance note or final report section with command summaries.
- Exact browser dependency status.

## 3. P19-2 Current Viewport Poster

Implementation tasks:

- Extend map adapter contract with a read or event path for current bounds:

```ts
interface MapViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  coordinateSystem?: "wgs84" | "gcj02";
}
```

- Add map adapter support in Leaflet provider to produce bounds after initialization and after pan/zoom.
- Add `onViewportChange` or equivalent prop in `MapCanvas`, then store latest bounds in `MapWorkspace`.
- Add domain helper for poster source selection:

```ts
type PosterMode = "current-filter" | "current-viewport";

interface PosterSourceResult {
  mode: PosterMode;
  places: FoodPlace[];
  count: number;
  emptyReason?: string;
}
```

- `current-filter` uses current filtered personal places.
- `current-viewport` uses current filtered personal places intersected with current bounds.
- Normalize coordinates before bounds intersection.
- Keep scanlist and Dingtuyi reference pins excluded from P19 poster source sets.
- Enable `当前视野` in `MapPosterDialog` only when bounds exist.
- Add explicit empty viewport state; do not silently export all places or current-filter places.

Acceptance:

- Unit test: viewport source selector includes points inside bounds and excludes outside points.
- Unit test: no bounds disables or returns explicit unavailable result for current viewport.
- Playwright: current-filter mode count remains stable.
- Playwright: pan/zoom or deterministic bounds changes current-viewport count.
- Playwright: exported PNG source count matches preview count.
- Playwright: empty viewport shows explicit empty state.

Exit evidence:

- Screenshot of poster composer with `当前视野` selected.
- PNG download non-empty check.
- P19 report records count parity.

## 4. P19-3 Personal Data Health Center

Implementation tasks:

- Add domain read model:

```ts
interface PersonalDataHealthReport {
  verified: FoodPlace[];
  pending: FoodPlace[];
  highRisk: FoodPlace[];
  manualAdjusted: FoodPlace[];
  skipped: FoodPlace[];
}
```

- Minimum derivation:
  - `pending`: `mapAccuracy="approximate"`, `位置待确认`, `待校准`, `近似坐标`, or pending helper match.
  - `highRisk`: `位置高风险` or coordinate-risk helper match.
  - `manualAdjusted`: `手动校准` or visible manual-move audit fallback.
  - `skipped`: `暂时跳过` or skipped confirmation note/tag.
  - `verified`: exact personal places not pending, high-risk, or skipped. Manual-adjusted exact places may also appear in `manualAdjusted`.
- Add health center UI in workspace tools/import-export area or a dedicated workspace panel.
- Health actions may only:
  - focus a place,
  - apply filter,
  - open detail,
  - open pending workbench.
- Health actions must not change coordinates, tags, `mapAccuracy`, notes, or delete records.

Acceptance:

- Unit test: health grouping covers verified, pending, high-risk, manual-adjusted, skipped.
- Unit test: health grouping is read-only.
- Playwright: data health center displays all groups and counts with real/deterministic data.
- Playwright: clicking health action opens detail/filter/workbench without coordinate mutation.
- Screenshot: desktop health center.
- Screenshot: mobile health center.

Exit evidence:

- Health center screenshots under `docs/active/evidence/p19/`.
- P19 report records group counts.

## 5. P19-4 Domain/Repository Consolidation

Implementation tasks:

- Extract candidate confirmation and manual pin move transforms toward shared domain helpers.
- Keep UI responsible for explicit confirmation and visual preview.
- Keep repository responsible for persistence only; add atomic helper only if it reduces partial write risk.
- Do not introduce a new persisted schema version unless necessary.
- Preserve Agent negative boundaries:
  - no direct coordinate finalization,
  - no pending deletion,
  - no hiding uncertainty.

Acceptance:

- Unit test: candidate confirmation transform preserves confirmation/audit requirements.
- Unit test: manual move transform updates coordinates, `mapAccuracy`, and visible audit fallback consistently.
- Unit test: pending/high-risk derivation remains stable after transform extraction.
- Playwright: existing manual move and candidate confirmation flows still require explicit confirmation.
- Playwright: Agent negative regression still returns structured errors.

Exit evidence:

- Unit test names and summaries in P19 report.
- Agent negative command output summary.

## 6. P19-5 Responsive Regression

Implementation tasks:

- Validate new poster and health UI across:
  - `390x844`,
  - `430x932`,
  - `768x900`,
  - `1280x820`.
- Ensure map remains primary surface.
- Ensure bottom sheets/modals do not overlap core actions or safe areas.
- Ensure long names/tags/addresses wrap without button overflow.

Acceptance:

- Playwright screenshots for required viewports.
- Assertions for visible poster mode controls and health group controls.
- Assertions that primary actions are reachable and not disabled unexpectedly.

Exit evidence:

```text
docs/active/evidence/p19/mobile-390-data-health.png
docs/active/evidence/p19/mobile-390-poster.png
docs/active/evidence/p19/mobile-430-data-health.png
docs/active/evidence/p19/mobile-430-poster.png
docs/active/evidence/p19/tablet-768-data-health.png
docs/active/evidence/p19/tablet-768-poster.png
docs/active/evidence/p19/desktop-1280-data-health.png
docs/active/evidence/p19/desktop-1280-poster.png
```

## 7. P19-6 Documentation Sync Review

Implementation tasks:

- Update PRD if implemented behavior differs from the current P19 section.
- Update target architecture if module boundaries change.
- Update contract if interfaces differ from planned shapes.
- Update E2E matrix and visual checklist with exact test names and evidence paths.
- Update drawio only if architecture, flow, milestone, or gate meaning changes.

Acceptance:

- Active docs all describe the same P19 stage.
- Drawio XML parses and remains under 8 pages.
- No active top-level doc describes P18 as current unfinished work.

Exit evidence:

- Documentation audit note in final report.

## 8. P19-7 Final Acceptance

Required commands:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

Add and run P19 targeted tests:

```bash
npx playwright test e2e/workspace.spec.ts --grep "P19 current viewport poster"
npx playwright test e2e/workspace.spec.ts --grep "P19 data health"
npx playwright test e2e/workspace.spec.ts --grep "P19 responsive"
```

Final report must include:

- Command summaries.
- Browser environment status.
- Screenshot and JSON evidence paths.
- PRD review.
- Target architecture review.
- Residual risks.
- Explicit statement that no backend/cloud/public-link/autocorrect scope was added.

## 9. Completion Assessment

P19 is complete only when the product can demonstrate these target experiences:

1. A developer can restore and verify the project without guessing environment steps.
2. A user can export a current-viewport poster whose content matches the visible map bounds.
3. A user can understand data health and enter correction flows without hidden mutation.
4. Coordinate-changing flows remain explicit-confirmation only.
5. Agent assistance cannot bypass user-confirmed facts.
6. Mobile, tablet, and narrow desktop remain usable.
7. Active docs and drawio match the implemented behavior.
