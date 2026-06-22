# FoodMap P18-2 Acceptance Report

Date: 2026-06-17

## Scope

P18-2 implemented candidate search entry and provider fallback for pending-place calibration. The work closes the first part of W18-A and preserves W18-F guardrails.

## Implemented Changes

- Added `buildExternalMapSearchFallback` for pure frontend no-key fallback links.
- Added pending workbench candidate search UI:
  - search-more entry
  - local AMap Web Service key field
  - search query field
  - copy search term fallback
  - AMap/Baidu/Apple web map search links
  - non-mutating candidate result state
- Added workspace search handler for arbitrary pending places.
- Added unit coverage for external map search fallback.
- Added Playwright coverage proving no-key fallback does not mutate coordinates.

## PRD Specification Review

| PRD Requirement | Result |
| --- | --- |
| Pending detail/workbench can search more candidates | Pass for pending workbench; detail path already existed |
| No provider key must not block user flow | Pass |
| Candidate search must not silently modify coordinates | Pass |
| Manual move remains available as fallback | Pass |
| P16/P17 scanlist baseline remains intact | Pass |

## Verification

```text
npm test -- --run
Result: pass, 34 tests

npm run build
Result: pass

npx playwright test e2e/workspace.spec.ts --project=desktop --grep "pending workbench candidate search"
Result: pass, 1 test

npm run verify:scanlist
Result: pass, 50 scanlist entries and 50 manual verification overlays
```

## Audit Opinion

Status: `P18-2 accepted`.

No fatal or major specification deviation found. Remaining P18 work should continue with P18-3 candidate evidence model and candidate card refinement.

