# P18-6 Pre-Implementation Audit - Share Poster Composer

Date: 2026-06-17
Status: Go, scoped composer upgrade

## Scope

P18-6 upgrades share poster communication without changing the local-first export architecture.

## PRD Acceptance Criteria

- Poster dialog must explain that export is based on the current filtered personal places.
- User can customize the poster title before export.
- Dialog exposes export mode and point count clearly.
- Reference layers such as scanlist and Dingtuyi must not be counted as personal poster pins.
- PNG export remains non-empty and browser-downloadable.

## Current-State Findings

1. Existing poster export already uses current `visiblePlaces`, which are filtered personal places.
2. Existing dialog does not let the user edit the poster title.
3. Existing dialog has no explicit composer mode or compact preview metadata.
4. The app does not currently pass viewport-bounded pins to the poster dialog; claiming a true viewport mode would be a false acceptance risk.

## Development Plan

1. Add poster title input with default title.
2. Add an explicit export mode selector with current-filter mode enabled and current-viewport mode disabled until map bounds are passed.
3. Show point count, tag summary, and generation scope in the dialog before export.
4. Keep export using current filtered personal pins.
5. Update E2E to assert custom title affects the downloaded PNG name.

## Audit Opinion

No fatal or major deviation blocks development. The only important guardrail is to avoid claiming current-viewport export until the component receives viewport-bounded data.
