# FoodMap P18-3 Pre-Implementation Audit

Date: 2026-06-17

## Scope

P18-3 covers candidate evidence model and candidate card refinement. It must make candidate provenance visible and auditable before any coordinate confirmation.

## Development Plan

| Workstream | Planned Change | Acceptance |
| --- | --- | --- |
| W18-A coordinate/candidate calibration | Extend `PlaceCandidate` with P18 evidence fields | Candidate carries evidence, risk reasons, match signals, last checked time, and explicit confirmation flag |
| W18-A candidate card | Show evidence and risk information in detail and pending workbench cards | Candidate cards do not only show name/address |
| W18-F Agent governance | Normalize Agent candidates into the same evidence model | Agent-submitted candidates remain suggestions requiring user confirmation |

## Pre-Implementation Findings

- `PlaceCandidate` already has `evidenceUrl`, `evidenceLabel`, `screenshotPath`, `blockers`, source, confidence, coordinate accuracy, and reasons.
- Missing P18 contract fields: `riskReasons`, `matchSignals`, `lastCheckedAt`, `requiresUserConfirmation`.
- `mapSearchResultToPlaceCandidate` and `normalizeAgentCandidates` need the same evidence shape so UI does not branch by source.
- Candidate cards already show source and evidence in detail, but pending workbench needs risk/evidence text to avoid weak candidates looking equivalent to verified candidates.

## Audit Opinion

Status: `Go for P18-3 implementation`.

No fatal or major risk found. The implementation must stay within Domain/UI boundaries and must not change coordinate write paths.

