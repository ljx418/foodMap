# FoodMap P18-3 Acceptance Report

Date: 2026-06-17

## Scope

P18-3 implemented candidate evidence model and candidate card refinement. The work closes the evidence/provenance part of W18-A and preserves W18-F Agent confirmation boundaries.

## Implemented Changes

- Extended `PlaceCandidate` with P18 evidence fields:
  - `riskReasons`
  - `matchSignals`
  - `lastCheckedAt`
  - `requiresUserConfirmation`
- Updated candidate creation paths:
  - local text candidates
  - history candidates
  - scanlist candidates
  - map-provider candidates
  - AMap Web Service candidates
  - Agent candidates
  - external web-map fixtures
- Updated detail candidate cards and pending-workbench candidate cards to display match/risk/check evidence.
- Added unit assertions for candidate confirmation requirement and match-signal evidence.

## PRD Specification Review

| PRD Requirement | Result |
| --- | --- |
| Candidate cards expose source, confidence, coordinate accuracy, evidence and risk | Pass |
| Agent candidates remain suggestions requiring confirmation | Pass |
| Candidate confirmation remains the only coordinate write path | Pass |
| Candidate cards avoid name-only display | Pass |
| Scanlist baseline remains intact | Pass |

## Verification

```text
npm test -- --run
Result: pass, 34 tests

npm run build
Result: pass

npx playwright test e2e/workspace.spec.ts --project=desktop --grep "place detail can search AMap|pending workbench candidate search"
Result: pass, 2 tests

npm run verify:scanlist
Result: pass, 50 scanlist entries and 50 manual verification overlays
```

## Audit Opinion

Status: `P18-3 accepted`.

No fatal or major specification deviation found. Remaining P18 work should continue with P18-4 manual pin move audit preview. The known risk is that current manual move behavior may save immediately after map click; P18-4 must verify and fix that before acceptance.

