# FoodMap P20-4 Acceptance Report

Status: Accepted

Date: 2026-06-24

## Scope

P20-4 changed `.foodmap.json` import from immediate write to dry-run conflict preview before write.

## Evidence

- Domain: `planImportConflicts` classifies create, update, duplicate, skip, and risk.
- UI: file import now creates `导入冲突预览` in the governance workbench.
- Write path: local places are unchanged until the user clicks `确认导入可写项`.
- Risk boundary: high-risk coordinates block confirmation.

## Acceptance

- Unit tests cover import conflict planning and journal entry creation.
- Playwright `P20 import conflict preview is shown before any import write`: passed.
- PRD review: passed. Import no longer directly pollutes the local personal map.

## Audit Opinion

No fatal or major drift. The first failed E2E fixture used water coordinates and was correctly blocked by real coordinate-risk rules; fixture was corrected to a valid Wuhan land coordinate.
