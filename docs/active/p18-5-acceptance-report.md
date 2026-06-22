# P18-5 Acceptance Report - Detail IA And Filter Explainability

Date: 2026-06-17
Status: Accepted

## Implemented Scope

- Added a compact home filter summary that reflects visible personal place count, active tag/status filters, and enabled or hidden reference layers.
- Kept detail priority order intact: status, title, editable tags, core actions, record summary, calibration, notes.
- Moved photo preview and notes into progressive disclosure sections so narrow and right-side panels do not start with low-priority blocks.
- Updated E2E expectations to validate the disclosure containers and expand long notes before scroll verification.

## Validation Commands

```text
npm run build
npm test -- --run
npx playwright test e2e/workspace.spec.ts --grep "narrow homepage|desktop homepage filter dock|place detail follows P17|mobile place detail drawer"
npm run verify:scanlist
```

## Evidence

- Build passed.
- Unit tests passed: 34 tests.
- Targeted Playwright passed: 6 passed, 2 project-skip expected.
- Scanlist baseline passed: 50 entries, 50 manual verification overlays, 38 approximate admitted pins.

## PRD Spec Review

- The detail page continues to prioritize status, tags, and core actions before lower-priority content.
- Photos and notes no longer dominate the initial detail view.
- Home filtering is more explainable because the current visible scope and active filters are summarized from the same filter state used by the map.
- No persistence, provider, Agent, or coordinate-confirmation contract was changed.

## Audit Opinion

No fatal or major specification deviation found. P18-5 can be treated as accepted and P18-6 can start.
