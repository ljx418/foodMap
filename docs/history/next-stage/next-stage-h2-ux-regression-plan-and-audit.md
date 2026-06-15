# FoodMap H2 UX Regression Plan And Audit

Status: active

Date: 2026-06-07

## Summary

H2 closes evidence-backed UX regressions found in the latest Playwright screenshots. It does not redesign the product or expand scope. The target is to preserve the PRD map-first, low-interference workspace while removing UI elements that compete with active reading or input surfaces.

## Screenshot Findings

| Evidence | Finding | Severity | Decision |
| --- | --- | --- | --- |
| `mobile-390x844-recommendation-detail.png` | Toast overlaps recommendation detail text | Major UX | Hide toast while mobile panels are open |
| `mobile-390x844-filter-panel.png` | Toast overlaps the map/filter transition area | Major UX | Hide toast while filter sheet is open |
| `desktop-1440x900-recommendation-detail.png` | Toast overlaps right recommendation detail/evidence area | Major UX | Hide toast while desktop detail/recommendation side panel is open |
| `mobile-390x844-place-editor.png` | Create modal no longer overlaps filter panel or toast | Pass | No change |

## PRD Review

The fix supports PRD sections 2.2, 6.1, and 4A.2:

- Do not show multiple task surfaces at the same time.
- Keep the map as the primary surface.
- Preserve low-interference input and viewing.
- Let users inspect evidence without transient notification overlays.

## Implementation Scope

- Update CSS only.
- Extend existing toast suppression beyond modal flows to active task panels:
  - mobile panels,
  - filter sheet,
  - desktop detail drawer,
  - desktop recommendation panel.

## Acceptance Criteria

- New screenshots show no toast over recommendation detail, filter panel, or editor.
- Existing browser flows still pass.
- No product data, POI data, or Agent contract is changed.

## Audit Opinion

Fatal issues: none.

Major issues before implementation: one UX overlap issue, closed by scoped CSS change.

Go for implementation.
