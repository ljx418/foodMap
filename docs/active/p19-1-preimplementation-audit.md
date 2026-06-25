# FoodMap P19-1 Pre-Implementation Audit - Documentation And Acceptance Environment

Date: 2026-06-23
Status: Go for P19-1 implementation; drawio direction reviewed and accepted by the user on 2026-06-23

## Scope

P19-1 establishes the current-stage documentation and acceptance-environment baseline. It does not change product behavior. It exists to prevent false acceptance before P19 feature work begins.

P18 is accepted and remains the regression baseline. P19 must not reimplement P18 candidate search, candidate evidence, manual pin move audit preview, detail IA, filter explanation, share poster current-filter export, Agent negative boundary, or large deterministic performance smoke.

## Current Audit Findings

| Area | Finding | Severity | P19-1 Action |
| --- | --- | --- | --- |
| Active stage naming | Top-level docs now point to P19, while P18 is accepted baseline | Low | Keep P19 as current stage in active docs |
| Historical PRD wording | P16/P17 sections previously said “本阶段” | Medium | Mark P16/P17/P18 as completed extensions |
| Drawio coverage | P19 drawio has 7 pages: target experience, architecture gap, functional entities, key paths, development plan, milestones, gates | Low | Keep it below 8 pages and update only when implementation materially changes scope |
| Browser acceptance | Current machine previously could not launch Linux Playwright browser because `libnspr4.so` was missing | High | Document setup/remediation before browser gates are required |
| Repository contract drift | Current `placeRepository` is thin CRUD, richer contract is staged target | Medium | Keep docs explicit that P19 target API is staged |
| Current viewport poster | Product has current-filter export; current-viewport mode is planned target | Medium | Require real bounds, empty state, and preview/export count parity |
| Data health | Status exists through tags/mapAccuracy/helpers but no central health workflow yet | Medium | Require derived read model and non-mutating actions |

## Required Restore Baseline

Run after checkout or handoff:

```bash
npm ci
npm run build
npm test -- --run
npm run verify:scanlist
```

Required browser regression before P19 final acceptance:

```bash
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

If Playwright cannot launch, record the exact system dependency blocker before claiming any browser acceptance. On the current handoff environment, the known Linux blocker was:

```text
libnspr4.so: cannot open shared object file
```

## P19-1 Exit Criteria

- Active docs consistently describe P19 as current stage.
- P18 final acceptance report remains linked as the accepted baseline.
- Drawio opens and includes target experience, architecture gap, functional entities and relationships, key paths, plan, milestones, gates, and exit conditions.
- Browser acceptance dependency risk is documented.
- No P19 document claims backend, cloud sync, public permanent sharing, or automatic POI correction.

## Audit Opinion

P19-1 may proceed. `docs/active/current-vs-target-gap.drawio` has been reviewed and accepted for P19 direction. This is an implementation go signal only; it is not P19 final acceptance.
