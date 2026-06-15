# FoodMap Next-Stage Development And Acceptance Plan

Status: active guard plan

Date: 2026-06-07

## Summary

P8-P14 has passed the current-stage acceptance gate. The next-stage work is a controlled continuation, not a scope expansion. It must preserve the V1.0 local-first food map, the 50 verified Wuhan scanlist pins, the recommendation/personal-record boundary, and the Agent Bridge validation boundary.

The default data posture is conservative: use the existing 50-entry verified baseline for routine acceptance, run live AMap refreshes as dry-run first, and stop for human confirmation before any `--apply` that would move, overwrite, remove, or downgrade an existing verified pin.

## Substage Plan

| Substage | Development Scope | Required Acceptance | Stop Conditions |
| --- | --- | --- | --- |
| H0 Baseline Re-Gate | Re-read PRD, target architecture, P8-P14 report, and current code state | `npm run verify:scanlist`, PRD spec review, audit opinion | Docs and implementation contradict each other |
| H1 Real Data Refresh Rehearsal | Run refresh governance only as dry-run unless no conflicts exist and apply is explicitly accepted | Refresh report explains diff, admission, mappable count, conflict count | Any moved/conflict/pending item would alter generated map data |
| H2 UX Regression Closure | Improve only evidence-backed input/viewing issues found in screenshots or E2E | Desktop/mobile screenshots show no modal, panel, toast, bar, or detail overlap | Screenshot evidence cannot prove the claimed UX improvement |
| H3 Agent Callable Readiness | Keep Agent commands stable for read, filter, export, focus, and safe save paths | Agent E2E proves structured errors and blocked unsafe writes | Agent can bypass domain validation or POI admission |
| H4 Release Evidence Pack | Update final report, evidence matrix, visual checklist, and audit set | Build, unit, browser, scanlist, drawio export, screenshots all pass | Any fatal or major risk remains open |

## Required Commands

```bash
npm run verify:scanlist
npm test
npm run build
npx playwright test
```

Drawio must also export all pages through the draw.io CLI before a release decision.

## Real-Data Acceptance

- The app must still contain exactly 50 scanlist recommendations.
- Every scanlist recommendation must have a manual verification overlay.
- Every displayed scanlist pin must have Wuhan coordinates, a district, an address, evidence URL, observed time, confidence above the admission threshold, and matched image evidence.
- Previously disputed locations have explicit guardrails:
  - `刘聋子牛肉粉馆(汉阳龙兴东街店)` must remain in 汉阳区, not drift to 硚口区.
  - `万松小院·荷花垄` must remain near 江汉区/中山公园/荷花垄, not drift to the river.
  - `小骆川菜馆` must remain in 洪山区/东湖风景区方家村片区.
- Approximate pins may remain visible only when they are explicitly labeled approximate and have medium/high coordinate trust.

## High-Risk Human Confirmation Gates

Human confirmation is required before:

- Running `scripts/refresh_amap_scanlist.mjs --apply` when the dry-run has moved, conflict, pending, removed, renamed, or low-confidence entries.
- Replacing an existing verified coordinate with a new coordinate from a single source.
- Introducing a backend, account system, public permanent share dependency, or real-time ranking dependency.
- Allowing Agent write paths that bypass existing domain validation, import/export validation, or POI admission.

## Exit Decision Rule

A substage passes only when the development work, PRD review, real-data evidence, command output, screenshot evidence, and audit opinion all support the same conclusion. If any evidence is missing or contradicts the claim, the work returns to the plan/audit stage before more implementation.
