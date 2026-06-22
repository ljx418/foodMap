# FoodMap P18-2 Pre-Implementation Audit

Date: 2026-06-17

## Scope

P18-2 covers the candidate search entry and provider fallback workstream. It must support the P18 PRD path where a user opens a pending or high-risk place, searches for more candidates, uses provider fallback when no key exists, and never changes coordinates before explicit confirmation.

## Development Plan

| Workstream | Planned Change | Acceptance |
| --- | --- | --- |
| W18-A coordinate/candidate calibration | Add candidate search entry to pending workbench and keep detail search entry | Pending detail and workbench both expose search more, copy search term, external map search, and manual move |
| W18-A provider fallback | When no AMap key exists, show copy/open external map fallback instead of blocking | No-key flow remains usable and does not claim realtime POI search |
| W18-F Agent/acceptance governance | Preserve candidate confirmation as the only coordinate write path | Candidate search and fallback do not mutate `FoodPlace` |

## Pre-Implementation Findings

- `PlaceDetailDrawer` already contains an AMap Web Service key field and live candidate list.
- `PendingPlaceWorkbench` only shows existing candidates, manual move, and skip. It lacks search-more and external map fallback actions.
- `MapWorkspace` has `searchSelectedMapCandidates`, but there is no equivalent search handler for arbitrary pending places.
- `externalMapLinks.ts` can build navigation links for saved places, but P18-2 also needs search links for unresolved/pending places.

## Audit Opinion

Status: `Go for P18-2 implementation`.

No fatal or major specification risk was found before coding. Required fixes are implementation-level:

1. Add external map search fallback builder for unresolved place queries.
2. Expose candidate search and fallback actions in the pending workbench.
3. Ensure search results are stored only as UI candidates until the user confirms one.
4. Add unit/E2E coverage for no-key fallback and candidate search non-mutation.

