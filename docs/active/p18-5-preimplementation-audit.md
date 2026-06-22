# P18-5 Pre-Implementation Audit - Detail IA And Filter Explainability

Date: 2026-06-17
Status: Go, with scoped UI fixes before validation

## Scope

P18-5 focuses on the daily-use experience after P18-2 to P18-4 established candidate search, evidence display, and two-step manual pin movement.

The implementation must improve:

- Detail page information density on desktop, tablet, and mobile.
- Filter/layer explainability on the home map.
- Screenshot evidence against real data volume without regressing P16/P17 map and pending-place flows.

## PRD Acceptance Criteria

- Place detail keeps status, tags, and core actions above lower-priority content.
- Photos, long notes, and calibration evidence do not dominate the first screen on narrow viewports.
- Home filter controls explain what is currently visible: personal count, active tag/status filters, and enabled reference layers.
- Low-frequency controls remain available without forcing the main dock to overflow.
- Mobile and compact desktop views must not show clipped text or horizontal document overflow.

## Current-State Findings

1. The detail drawer already follows the P17 order: status, title, tags, core actions, record, calibration, notes.
2. The record block still exposes photo placeholder and full note content as always-visible content, which crowds mobile and right-side desktop panels.
3. Home filter dock shows counts and active chips, but it does not provide a compact natural-language summary of active filters/layers.
4. Existing E2E already checks dock containment and detail ordering, but lacks a direct assertion that active tag filters are explainable after toggling.

## Development Plan

1. Keep rating, visit date, city, and address visible as the primary record summary.
2. Move photo preview and long notes into progressive disclosure sections.
3. Add a compact home filter summary bound to the same filter state as the visible pins and share poster.
4. Add focused E2E coverage for the summary after a quick tag filter is applied.
5. Run unit/build/E2E/scanlist verification and record acceptance.

## Audit Opinion

No fatal or major specification deviation blocks development. The work is a scoped IA and explainability refinement and should not change persistence, provider, Agent, or coordinate-confirmation contracts.
