# FoodMap P20-6 Acceptance Report

Status: Accepted

Date: 2026-06-24

## Scope

P20-6 implemented Agent governance read-only APIs and responsive governance regression.

## Evidence

- Agent read APIs: `getGovernanceSummary`, `listDuplicateSuggestions`, `listGovernanceJournal`.
- Agent blocked APIs: `applyGovernanceBatch`, `mergePlaces`, `commitImportPlan`, `hideGovernanceRisk`, `finalizeCoordinates`.
- Mobile access: mobile tools panel exposes `数据健康`.
- Screenshots:
  - `docs/active/evidence/p20/mobile-390-governance.png`
  - `docs/active/evidence/p20/mobile-430-duplicate-compare.png`
  - `docs/active/evidence/p20/tablet-768-import-conflict.png`
  - `docs/active/evidence/p20/desktop-1280-governance.png`

## Acceptance

- Playwright `P20 agent governance APIs are read-only and reject unsafe writes`: passed.
- Playwright `P20 responsive ...`: 4 viewport tests passed.
- PRD review: passed. Agent cannot bulk modify, merge, delete, hide risk, import, or finalize coordinates.

## Audit Opinion

No fatal or major drift. Responsive evidence is real browser evidence from FoodMap after clearing a false-risk condition where port 5173 was occupied by another app.
