# FoodMap Next-Stage H0 Acceptance Report

Status: passed

Date: 2026-06-07

## Scope

H0 is the baseline re-gate before continuing any further implementation. It verifies that the current project can keep developing under the PRD and target architecture without creating false acceptance risk.

Implemented in this substage:

- Added `scripts/verify_scanlist_baseline.mjs`.
- Added `npm run verify:scanlist`.
- Added `next-stage-development-and-acceptance-plan.md`.
- Added `next-stage-preimplementation-audit.md`.
- Updated the active README and acceptance gate to require the scanlist baseline gate.

No product scope expansion was introduced.

## Command Evidence

- `npm run verify:scanlist`: passed.
  - Entries: 50.
  - Manual verification overlays: 50.
  - Approximate but admitted pins: 38.
  - Guardrails passed for `刘聋子牛肉粉馆(汉阳龙兴东街店)`, `万松小院·荷花垄`, and `小骆川菜馆`.
- `npm test`: passed, 14 unit tests.
- `npm run build`: passed.
  - Largest chunks remain split into app, React, map, and icons.
  - No Vite large chunk warning.
- `npx playwright test`: passed, 14 desktop/mobile tests.
- drawio validation: `docs/active/current-vs-target-gap.drawio` exported all pages to `/private/tmp/foodmap-next-stage-drawio-check.pdf`.

## PRD Specification Review

| Area | Result | Evidence |
| --- | --- | --- |
| Local-first scope | Pass | Only local scripts/docs/package command changed; no backend/account/share service added |
| Real-data validation | Pass | Dedicated scanlist command checks all 50 entries, manual overlays, report summary, images, and guardrails |
| POI admission | Pass | The new gate preserves the rule that only verified, non-conflicting recommendations may be map pins |
| UX acceptance | Pass | Existing Playwright visual evidence test regenerated desktop/mobile screenshots |
| Agent boundary | Pass | No Agent write path expansion; existing Agent E2E still passes |
| Documentation consistency | Pass | README and acceptance gate now reference the same baseline command and next-stage process |

## Real-Data Evidence

The H0 gate uses the accepted 50-entry Wuhan scanlist baseline instead of live network refresh. This avoids overwriting verified pins while still checking that every currently visible recommendation pin remains supported by local evidence.

The new baseline verifier fails if:

- The generated scanlist is not exactly 50 entries.
- A recommendation lacks a manual verification overlay.
- Coordinates leave Wuhan bounds.
- District, address, evidence URL, observed time, image evidence, or confidence is missing.
- Refresh report summary no longer records 50 verified mappable entries.
- The historical guardrails for 刘聋子、万松小院、小骆川菜馆 drift.

## Audit Result

Fatal issues: none.

Major issues: none.

Non-blocking risks:

- 38 admitted pins are approximate. They remain acceptable only because they are medium-trust, labeled approximate in UI, and covered by the baseline gate.
- A future live refresh can still introduce source drift. It must run dry-run first and stop before `--apply` if any conflict/moved/pending item appears.

## Exit Decision

H0 passes. The project may continue to H1/H2/H3 only under the high-risk gates in `next-stage-development-and-acceptance-plan.md`.
