# FoodMap H3 Agent Callable Readiness Plan And Audit

Status: active

Date: 2026-06-07

## Summary

H3 hardens the browser Agent callable contract through evidence, not new product scope. The Agent Bridge may read, filter, focus, export, and write only through the same validation and POI admission rules used by the UI.

## Audit Findings

Fatal issues: none.

Major issue before implementation:

- Existing E2E covered successful Agent save/focus and recommendation save, but did not directly prove stable structured errors, event emission, export shape, or no-write behavior after invalid Agent commands.

## Implementation Scope

- Add E2E coverage for:
  - command/result browser events,
  - `exportSnapshot`,
  - `getPlace` missing record error,
  - invalid `savePlace` payload,
  - invalid `saveRecommendationAsPlace` source ID,
  - no-place-write after rejected invalid save.

No Agent command shape is changed in H3.

## Acceptance Criteria

- Invalid Agent commands return `ok: false` with stable `errorCode`.
- Rejected Agent commands do not create places.
- Export returns a `.foodmap.json`-compatible payload.
- Browser command/result events are observable.
- Full build, unit, scanlist, and browser gates pass.

## PRD Review

H3 supports PRD 4A.2 and 4A.3: other intelligent agents can call FoodMap safely, but cannot bypass validation, POI admission, or local-first boundaries.
