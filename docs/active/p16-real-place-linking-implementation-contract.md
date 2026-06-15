# FoodMap P16 Real Place Linking Implementation Contract

## 1. Purpose

This contract turns the P16 PRD and target architecture into implementation rules. It is the binding reference for real place candidate recall, location-aware ranking, Agent candidate ingestion, external map handoff, and map-like poster export.

P16 must keep FoodMap pure frontend and local first. If a subtask requires a stable server-side POI search service to meet the stated experience, development must stop at the audit gate instead of faking real recall.

## 2. Binding Scope

| Area | Required Outcome | Non-negotiable Rule |
| --- | --- | --- |
| Place candidate recall | User can input shop name, address, intro text, or link and see candidates | Ambiguous candidates cannot silently create pins |
| Candidate ranking | Candidates show confidence and readable reasons | Location permission denial cannot block the flow |
| Agent ingestion | Agent can submit structured candidates | Agent cannot bypass user confirmation or domain validation |
| External map handoff | Detail page can open map app/web map or copy fallback | Missing coordinates cannot show misleading navigation |
| Poster export | PNG reflects current filtered personal pins | Empty or unrelated posters fail acceptance |
| Scanlist layer | Verified scanlist remains toggleable reference layer | Scanlist must not pollute personal map state |

## 3. Domain Shapes

### 3.1 Place Candidate

`PlaceCandidate` should include these fields before it is shown in the UI:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | yes | Stable local candidate id, not a permanent POI guarantee |
| `name` | string | yes | Display shop name |
| `address` | string | conditional | Required for real-world candidate unless source explicitly marks coordinate-only |
| `city` | string | conditional | Defaults to Wuhan when inferred from map context |
| `district` | string | optional | Used for disambiguation and filters |
| `longitude` | number | conditional | Required before enabling navigation |
| `latitude` | number | conditional | Required before enabling navigation |
| `source` | enum | yes | `text`, `history`, `scanlist`, `agent`, `map-provider`, `manual` |
| `sourceLabel` | string | yes | Human-readable source |
| `confidence` | number | yes | 0 to 1 |
| `coordinateAccuracy` | enum | yes | `exact`, `approximate`, `inferred`, `unknown` |
| `distanceMeters` | number | optional | From user location or clicked point |
| `reasons` | string[] | yes | 1 to 4 readable ranking reasons |
| `rawInputRef` | string | optional | Link or source text summary, not long scraped content |

### 3.2 Location Snapshot

`UserLocationService` returns one of:

| Status | Required Fields | UI Requirement |
| --- | --- | --- |
| `granted` | longitude, latitude, observedAt | Ranking can mention current location |
| `denied` | reason | Flow continues with clicked point/history fallback |
| `unavailable` | reason | Flow continues and shows non-blocking fallback copy |
| `timeout` | reason | Flow continues and can retry |
| `idle` | none | Before request |

Location is used only for ranking and local display. It must not be persisted into the user record unless the user explicitly saves a place whose coordinates came from a selected candidate.

### 3.3 External Map Link

`ExternalMapLinkBuilder` returns:

| Field | Type | Notes |
| --- | --- | --- |
| `primaryLabel` | string | Example: `打开地图/导航` |
| `primaryHref` | string | AMap URI/web URL, Apple Maps URL, or geo URI |
| `fallbackLabel` | string | Example: `复制地址/坐标` |
| `fallbackText` | string | Name + address + coordinates when available |
| `disabledReason` | string optional | Required when navigation should not be clickable |

When coordinates are missing, the UI may offer copy fallback but must not show a navigation action that implies exact location.

## 4. Candidate Source Strategy

P16 provider order:

1. `history`: user's saved places, used for duplicate warning and habit/history ranking.
2. `scanlist`: verified Wuhan scanlist reference, used for known public recommendation candidates.
3. `text`: local parser for shop name, address-like fragments, tags, and intro-board text.
4. `agent`: structured candidate payload from `FoodMapAgentBridge`.
5. `map-provider`: optional future browser-side provider. It cannot be required for baseline acceptance unless configured and documented.
6. `manual`: user can still save manually entered name/address/coordinate if no candidate is trustworthy.

The baseline P16 acceptance can use deterministic fixtures for same-name Wuhan shops plus scanlist/history candidates. It cannot claim external real-time map search unless a real provider is configured and evidenced.

When `map-provider` is enabled, `MapSearchResult` must be converted through `mapSearchResultToPlaceCandidate(result, context)` before it enters the P16 candidate pool. The adapter rules are defined in [Map Provider Contract](./map-provider-contract.md). Provider results cannot skip candidate scoring, blocker checks, or user confirmation.

## 5. Ranking Rules

Ranking must produce both score and reasons. Recommended weighted factors:

| Factor | Weight Guidance | Reason Example |
| --- | --- | --- |
| User location distance | high when granted | `距离你约 420 米` |
| Clicked point distance | high when available | `靠近你点击的位置` |
| Source trust | medium | `来自已核验扫街榜参考` |
| Field completeness | medium | `地址和坐标完整` |
| History/habit match | low to medium | `与你常用商圈相近` |
| Name/address semantic match | high | `名称与输入完全匹配` |

Hard blockers:

- Candidate has no name.
- Candidate coordinate is outside the expected Wuhan area without explicit evidence.
- Candidate source is `agent` but lacks address and coordinate.
- Candidate is a scanlist item that fails `evaluateRecommendation`.

## 6. UI Flow Contract

1. Map click or bottom add opens `PlaceEditorModal`.
2. User input area accepts shop name/address/text/link.
3. Candidate search action displays candidate list below the input area.
4. Each candidate card shows name, address, source, confidence, distance when available, and reasons.
5. Selecting a candidate fills the editable form but does not save.
6. Save uses existing `FoodPlace` validation and IndexedDB repository path.
7. Saved personal place detail and trusted mappable recommendation detail show external map actions; selecting a candidate in the editor still does not imply the place has been saved.
8. Filter state is the single source for visible markers, list contents, and poster export.

## 7. Agent Bridge Contract

P16 extends Agent Bridge with a candidate workflow:

| Action | Payload | Result |
| --- | --- | --- |
| `recognizePlaceCandidates` | `text`, `url`, `clickedPoint`, `candidates` | ranked candidates with reasons |
| `submitPlaceCandidates` | structured candidates plus optional source note | ranked candidates, no save |
| `getPlaceCandidateContext` | optional current filter/map context request | current city, clicked point, visible scanlist state, safe history summary |

Agent payload validation failures return `INVALID_PAYLOAD`. Candidate conflicts return `POI_CONFLICT`. Unsupported actions return `UNSUPPORTED_ACTION`.

## 8. Development Plan

| Phase | Tasks | Required Tests |
| --- | --- | --- |
| P16-2 Candidate recall | Add `placeSearch.ts`, normalize source candidates, show candidate cards in editor | Unit tests for normalization, blocker filtering, duplicate same-name candidates; E2E for candidate display |
| P16-3 Location ranking | Add `userLocation.ts`, geolocation request states, ranker reasons | Unit tests for granted/denied/unavailable; Playwright geolocation mock |
| P16-4 Agent loop | Add bridge actions and shared candidate ingestion | Bridge unit/E2E tests that Agent cannot save automatically |
| P16-5 Map handoff | Add `externalMapLinks.ts`, detail actions, copy fallback | Unit tests for AMap/Apple/web/geo links; mobile and desktop E2E |
| P16-6 Poster export | Upgrade `mapPoster.ts` input to current filtered places | PNG/SVG non-empty tests; E2E count consistency |
| P16-7 Final acceptance | Run commands, PRD review, visual evidence, scanlist regression | Build, unit, Playwright, scanlist verification |

## 9. Acceptance Fixtures

Minimum deterministic fixtures:

1. Two same-name Wuhan candidates in different districts.
2. One candidate near clicked point.
3. One candidate near mocked user location.
4. One scanlist-backed candidate.
5. One Agent-backed candidate with full address and coordinates.
6. One invalid Agent candidate missing address or coordinates.
7. One saved history place used for duplicate warning.
8. One saved personal place with tags used in poster export.

## 10. PRD Review Checklist

Before a P16 subphase exits, check:

- The user can start from empty personal map.
- Scanlist remains optional and visible only when toggled on.
- Ambiguous POI candidates require user confirmation.
- Location denial does not block adding a place.
- Agent cannot write a place without the same validation path as manual UI.
- Detail page can hand off to external map or show copy fallback.
- Poster export uses the same filtered personal-place set as the map.
- Mobile 390x844 has no overlapping modal, bottom bar, panel, or persistent status bar.

## 11. Stop Conditions

Stop and ask for human confirmation when:

- A real external POI provider or API key becomes mandatory to satisfy the PRD.
- Candidate data cannot be made truthful without inventing source evidence.
- External map links would expose sensitive user location beyond the selected destination.
- Automated tests pass but screenshot/manual evidence shows the main mobile journey is blocked.
