# FoodMap P8-P14 Implementation Contract

## Summary

This contract makes the P8-P14 plan implementable without inventing interfaces during development. It preserves the V1.0 local-first boundary and the accepted P1-P7 baseline.

## P8 Refresh Diff Contract

Refresh runs in two modes:

- `dry-run`: reads sources and writes only audit output.
- `apply`: may update generated recommendation data only when every changed item passes POI admission and no conflict exists.

Diff statuses:

| Status | Meaning | Can Update Map Data |
| --- | --- | --- |
| `unchanged` | Same POI ID/name/location confidence as baseline | No change needed |
| `new` | New candidate not in baseline | Only after `evaluateRecommendation().mappable === true` |
| `removed` | Baseline item missing from refreshed source | No, keep baseline until manual review |
| `renamed` | Same POI ID or duplicate group, changed display name | Only if branch/address do not conflict |
| `moved` | Coordinate or address changed materially | No, requires manual review |
| `conflict` | Name, branch, source group, address, or coordinate evidence disagree | No |
| `pending` | Insufficient evidence | No |

Audit row fields:

- `sourceId`
- `poiId`
- `rank`
- `name`
- `normalizedName`
- `duplicateGroupId`
- `baselineStatus`
- `diffStatus`
- `sourceGroups`
- `coordinateTrust`
- `locationAccuracy`
- `baselineCoordinate`
- `refreshedCoordinate`
- `distanceMeters`
- `admissionDecision`
- `mapDataChanged`
- `risk`

Distance defaults:

- `distanceMeters <= 300`: location compatible.
- `300 < distanceMeters <= 800`: requires warning.
- `distanceMeters > 800`: `moved` or `conflict`.

## P9 Evidence Contract

Recommendation detail evidence must expose:

- `imageUrl`
- `imageAlt`
- `sourceUrl`
- `observedName`
- `observedAt`
- `matched`
- `evidenceStatus`

Evidence statuses:

- `verified`: image exists and `matched === true`.
- `missing`: no image evidence exists.
- `broken`: image fails to load.
- `mismatch`: `matched === false`.
- `stale`: evidence is older than the accepted refresh report or explicitly marked stale.

UI rule:

- Only `verified` may be presented as matched evidence.
- `missing`, `broken`, `mismatch`, and `stale` must render fallback text and must not use verified styling.

## P10 Input UX Contract

Duplicate warning logic:

- Compare normalized name and coordinates against existing personal places.
- Warn when normalized names match and distance is `<= 800m`.
- Warn when names are similar and distance is `<= 300m`.
- Warning does not block save; it requires a deliberate confirm action.

Required-first fields:

- name
- layer
- rating
- visitedAt
- coordinates

Photo preview:

- Pending local files show file name and preview or thumbnail placeholder before save.
- Saved photos must still reload from IndexedDB.

## P11 Filter And Selection Contract

Filter additions:

- `source`: `all | personal | recommendation`
- `district`: string or empty
- `verificationStatus`: `all | verified | approximate | conflict | pending`
- `distanceCenter`: optional `{ longitude, latitude }`
- `distanceKm`: optional number

Selection rule:

- Personal records and recommendations remain separate entity types.
- A selected personal place uses `placeId`.
- A selected recommendation uses `sourceId`.
- Marker click and list click must update the same selected entity state.

Count rule:

- Visible marker count and visible list count must be derived from the same filtered collection per source.

## P12 Agent Bridge Contract

Stable result shape:

```ts
type AgentErrorCode =
  | "INVALID_PAYLOAD"
  | "PLACE_NOT_FOUND"
  | "UNVERIFIED_RECOMMENDATION"
  | "POI_CONFLICT"
  | "IMPORT_VALIDATION_FAILED"
  | "EXPORT_FAILED"
  | "UNSUPPORTED_ACTION";

interface FoodMapAgentResult<T = unknown> {
  ok: boolean;
  action: FoodMapAgentAction;
  data?: T;
  error?: string;
  errorCode?: AgentErrorCode;
}
```

Safe command policy:

- Read/filter/focus/export commands may be extended.
- Write commands must keep using domain validation and POI admission.
- Any recommendation with `evaluateRecommendation().mappable !== true` must return `UNVERIFIED_RECOMMENDATION` or `POI_CONFLICT`.

Audit events:

- `foodmap:agent-command`
- `foodmap:agent-result`
- `foodmap:state-changed`

The event payload must include action name and success/error status for command/result events.

## P13 Performance Contract

Acceptance defaults:

- `npm run build` must pass.
- If any chunk remains over 500 kB, the final report must include measured rationale or a follow-up.
- Recommendation-heavy UI and image-heavy detail content should be lazy-loaded when it reduces initial bundle risk without breaking map-first interaction.
- Mobile first screen must show map and primary controls before noncritical recommendation detail content.

## P14 Productization Evidence Contract

Final evidence package must include:

- command evidence: build, unit tests, Playwright.
- real-data evidence: verified count, mappable count, conflict count.
- visual evidence: desktop 1440x900 and mobile 390x844 screenshots.
- Agent evidence: success path and structured error path.
- performance evidence: bundle stats and first-screen notes.
- PRD/spec review: pass/fail table for P8-P14.
- release notes: implemented scope, known limits, no-go confirmations.
