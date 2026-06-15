# Stage P2 Acceptance Report

Status: passed

Date: 2026-06-05

## Scope

P2 validates the real-data Wuhan scanlist baseline and POI admission rules. The stage uses the approved stable real-data strategy: current 50 verified entries are the baseline; network refresh is not required unless the source changes.

## Evidence

- `npm test`: passed with a real-data baseline test.
- The unit baseline asserts:
  - `AMAP_WUHAN_SCANLIST` has 50 entries.
  - `getMappableRecommendations(AMAP_WUHAN_SCANLIST)` has 50 entries.
  - Every entry has at least two independent source groups.
  - Every entry has coordinate trust above `none/low`.
  - Every entry has longitude and latitude.
  - Every entry has matched image evidence.
- `npx playwright test`: passed and confirms the UI reports `扫街榜 50 条`, `已核验图钉 50 个`, `待核验 0 个`.

## PRD Specification Review

- V1.0 originally excludes public榜单 as a product goal, but current-stage target architecture explicitly adds a verified recommendation overlay.
- This overlay remains separate from personal records until explicitly saved.
- No unverified or conflicting candidate is allowed as a map pin.

## Audit Closure

- Major risk: false green from report-only verification.
- Closure: real-data POI quality is now asserted in executable unit tests.
- Remaining risk: public AMap page changes may affect future refreshes; current baseline intentionally avoids per-stage network refresh.

## Exit Decision

P2 exits for the current baseline. Future source refreshes must re-run this gate.
