# FoodMap Current-Stage Final Acceptance Report

Status: passed

Date: 2026-06-07

## Implemented Scope

- V1.0 local-first personal food journal map remains implemented.
- `#/map` personal workspace and `#/share/:snapshotId` read-only local share route remain available.
- IndexedDB persists places, layers, photos, snapshots, and metadata.
- Leaflet Wuhan map fallback supports no-key operation and map-click creation.
- AMap Wuhan scanlist overlay remains at 50 verified real-data entries.
- Recommendation details now show image evidence status, source, observed time, and fallback when evidence is missing or mismatched.
- Recommendation markers remain separated from personal records until explicit save.
- Personal input now includes duplicate-place warning and pending photo preview chips.
- Viewing filters now include source, district, verification status, and distance filters.
- `window.FoodMapAgentBridge` now returns structured errors and keeps write paths behind domain validation and POI admission.
- Production build now splits app, React, map, and icon chunks, removing the previous 500 kB bundle warning.
- Modal create/edit flows now close competing panels and hide stale toast overlays.

## Command Evidence

- `npm run build`: passed.
- `npm test`: passed, 14 unit tests.
- `npm run verify:scanlist`: passed, 50 entries, 50 manual verification overlays, and guardrails for 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆.
- `npx playwright test`: passed, 16 desktop/mobile browser tests.
- drawio validation: all 7 pages exported to PDF through draw.io CLI.

## Real-Data Evidence

- Stable baseline: current 50 verified AMap Wuhan scanlist entries.
- Unit tests assert:
  - 50 scanlist entries.
  - 50 mappable recommendations.
  - At least two independent source groups per entry.
  - Coordinate trust is not `none` or `low`.
  - Longitude and latitude exist for every entry.
  - Matched image evidence exists for every entry.
- Browser tests assert:
  - UI reports `扫街榜 50 条`.
  - UI reports `已核验图钉 50 个`.
  - UI reports `待核验 0 个`.
- Standalone baseline gate asserts:
  - All 50 scanlist entries have manual verification overlays.
  - Every entry has Wuhan coordinates, district/address metadata, evidence URL, observed time, confidence above the admission threshold, and matched image evidence.
  - Historical disputed-location guardrails pass for 刘聋子牛肉粉馆、万松小院·荷花垄、小骆川菜馆.
- Refresh script defaults to `dry-run`; `--apply` is required before generated recommendation data changes.
- H1 live dry-run rehearsal report exists at `docs/active/amap-scanlist-refresh-h1-dry-run-report.md` and records 50 unchanged verified rows, 0 new, 0 removed, 0 renamed, 0 moved, 0 conflict, and 0 pending.

## Visual Evidence

- `docs/active/evidence/p8-p14/desktop-1440x900-workspace.png`
- `docs/active/evidence/p8-p14/desktop-1440x900-recommendation-detail.png`
- `docs/active/evidence/p8-p14/desktop-1440x900-filter-panel.png`
- `docs/active/evidence/p8-p14/desktop-1440x900-place-editor.png`
- `docs/active/evidence/p8-p14/mobile-390x844-workspace.png`
- `docs/active/evidence/p8-p14/mobile-390x844-recommendation-detail.png`
- `docs/active/evidence/p8-p14/mobile-390x844-filter-panel.png`
- `docs/active/evidence/p8-p14/mobile-390x844-place-editor.png`

## PRD Specification Review

- Personal record loops remain aligned with V1.0 PRD: create, view, edit, filter, photo, share, export/import.
- P8-P14 additions match PRD section 4A: refresh governance, evidence hardening, input/view UX, Agent Bridge, performance, and productization evidence.
- Target architecture remains satisfied: pure frontend, local-first, recommendation overlay isolated from personal records, POI admission before map pins, and Agent write paths behind validation.
- Non-goals remain respected: no backend account system, no public permanent share links, no server photo storage, no fabricated private/app-only ranking data.

## Audit Result

- Fatal issues: none.
- Major issues: none open.
- Major issues closed this stage:
  - Refresh governance now has diff classification and dry-run/apply mode.
  - Missing or mismatched image evidence no longer presents as verified.
  - Agent result shape now includes stable structured error codes.
  - Bundle warning is removed through manual chunking.
  - Mobile create/edit no longer coexists with filter panel or stale toast overlay.
  - Real-data acceptance now has a standalone `npm run verify:scanlist` command instead of relying only on scattered unit/E2E assertions.
  - H1 refresh rehearsal now writes a dedicated dry-run report with baseline diff counts and manual overlay evidence.
  - H2 UX regression closure hides transient toasts while active panels, sheets, drawers, or modals are open.
  - H3 Agent readiness now covers structured errors, export, observable events, and no-write behavior for invalid commands.
  - H4 release evidence pack consolidates substage evidence while keeping the ChatGPT audit document set below 20 paths.
- Non-blocking follow-ups:
  - Re-run POI refresh audit when AMap public source changes.
  - Refresh screenshot evidence after marker, panel, or modal CSS changes.
  - If future live refresh produces moved/conflicting POIs, keep them in audit and do not mutate generated map data.

## Exit Decision

Current-stage P8-P14 plus H0-H4 continuation acceptance passes. Future work must preserve the same PRD, POI admission, evidence, Agent, and performance gates before changing verified map-pin data.
