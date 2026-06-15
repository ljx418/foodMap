# FoodMap P8-P14 Implementation And Acceptance Report

Status: passed

Date: 2026-06-07

## Implemented Scope

- P8 refresh governance: added testable refresh diff classification, dry-run/apply script mode, audit fields, and no-auto-overwrite behavior for moved/conflicting/pending POIs.
- P9 evidence hardening: added image evidence status handling and recommendation-detail fallback for missing, broken, mismatched, or stale evidence.
- P10 input UX: added near-duplicate warning, deliberate confirm-to-save behavior, and pending photo preview chips before save.
- P11 viewing/filtering: added source, district, verification status, and distance filters; personal and recommendation visibility now share the same filter semantics.
- P12 Agent Bridge: added structured `errorCode`, safer payload checks, repository-backed focus validation, and command/result/state browser events.
- P13 performance: split React, Leaflet/map, icons, and app chunks through Vite manualChunks; removed the prior 500 kB chunk warning.
- P14 productization: reran PRD/architecture review, command acceptance, drawio export validation, and desktop/mobile screenshot evidence capture.
- Visual issue closed during release readiness: opening create/edit now closes filter/share/import/mobile panels, and modal flows hide stale toast overlays.

## Command Evidence

- `npm run build`: passed.
  - Largest JS chunks after splitting:
    - app `index`: 211.26 kB, gzip 41.30 kB.
    - React chunk: 192.46 kB, gzip 60.33 kB.
    - map chunk: 149.50 kB, gzip 43.29 kB.
  - No Vite chunk-size warning remains.
- `npm test`: passed, 14 unit tests.
- `npm run verify:scanlist`: passed, 50 scanlist entries and 50 manual verification overlays; disputed-location guardrails passed.
- `npx playwright test`: passed, 14 desktop/mobile browser tests, including visual evidence capture.
- drawio validation: `current-vs-target-gap.drawio` exported all pages to PDF through draw.io CLI.

## PRD And Architecture Review

| Area | Result | Evidence |
| --- | --- | --- |
| Local-first PRD scope | Pass | No backend, account, or public permanent share dependency introduced |
| Recommendation isolation | Pass | Recommendations remain separate until explicit save through POI admission |
| Real-data governance | Pass | Refresh diff blocks moved/conflict/pending map-data mutation |
| Evidence truthfulness | Pass | Missing/mismatch image evidence renders fallback and is not marked verified |
| Input UX | Pass | Duplicate warning and pending photo preview implemented |
| Viewing/filtering | Pass | Source, district, verification, and distance filters implemented |
| Agent safety | Pass | Structured errors and repository-backed focus path implemented |
| Performance | Pass | Manual chunks remove large single-bundle warning |

## Visual Evidence

Screenshots captured through Playwright:

- `docs/active/evidence/p8-p14/desktop-1440x900-workspace.png`
- `docs/active/evidence/p8-p14/desktop-1440x900-recommendation-detail.png`
- `docs/active/evidence/p8-p14/desktop-1440x900-filter-panel.png`
- `docs/active/evidence/p8-p14/desktop-1440x900-place-editor.png`
- `docs/active/evidence/p8-p14/mobile-390x844-workspace.png`
- `docs/active/evidence/p8-p14/mobile-390x844-recommendation-detail.png`
- `docs/active/evidence/p8-p14/mobile-390x844-filter-panel.png`
- `docs/active/evidence/p8-p14/mobile-390x844-place-editor.png`

## Real-Data Evidence

- The accepted 50-entry Wuhan scanlist baseline remains the visible recommendation source.
- Unit tests still assert the 50-entry baseline is fully mappable.
- Standalone scanlist baseline gate verifies the 50 entries, manual overlays, image evidence, report summary, and guardrails for the three historically disputed locations.
- Playwright still verifies the workspace reports 50 scanlist entries and 50 verified recommendation pins.
- Refresh script defaults to `dry-run`, writing only the audit report unless `--apply` is explicitly provided.

## Audit Result

- Fatal issues: none.
- Major issues: none open.
- No POI refresh conflict was applied during this stage.
- Release-readiness issue closed: mobile create modal no longer coexists with filter panel or stale toast overlay.
- Remaining non-blocking risk: future live source refreshes still require manual review when AMap public data changes branch, address, or coordinates.

## Exit Decision

P8-P14 implementation passes the current acceptance gate. Future development may proceed only if new POI refreshes preserve the same diff, evidence, Agent, and PRD review gates.
