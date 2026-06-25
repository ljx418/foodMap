# P19-7 Final Acceptance Development And Acceptance Plan

Date: 2026-06-23

Status: Implementation-ready

## Objective

P19-7 is the final stage gate for P19. It does not add new product behavior. It proves that P19 can exit with repeatable command evidence, P18 regression coverage, P19 targeted browser evidence, real-data scanlist verification, screenshot evidence, PRD/architecture review, and a final acceptance report.

## PRD-Derived Acceptance Standard

P19 can be accepted only if the user-facing target experience is demonstrated:

- the app remains a pure-frontend, local-first Wuhan food map;
- P18 candidate search, manual pin move, Agent negative boundary, and large deterministic behavior remain intact;
- current-viewport poster mode uses real map bounds and does not silently export the current-filter set;
- personal data health exposes verified, pending, high-risk, manual-adjusted, and skipped states without mutating facts;
- coordinate-changing flows keep explicit user confirmation and shared domain transformation;
- mobile/tablet/desktop paths keep poster and health controls reachable;
- verified scanlist data remains real-data validated.

## Required Command Gates

Run sequentially:

```bash
npm run build
npm test -- --run
npm run verify:scanlist
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 current viewport poster"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 data health"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P19 responsive"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "personal favorites import verified and calibration pins distinctly"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "pending personal favorite pins can be manually moved and audited"
```

## Pre-Acceptance Audit Opinion

Open issues before execution:

- Browser tests depend on local Playwright library extraction through `LD_LIBRARY_PATH`; this must be recorded as an environment workaround rather than hidden.
- Port `5173` must serve FoodMap, not another Vite project, before Playwright gates run.
- If any browser gate fails, P19-7 returns to the relevant prior phase plan instead of weakening acceptance language.

Fatal or major specification risks: none open after P19-6.

Decision: proceed to final command gates.

## Final Report Requirements

Create `docs/active/p19-7-final-acceptance-report.md` with:

- command results and dates;
- browser dependency notes and workaround;
- P18 regression result;
- P19 targeted evidence result;
- screenshot evidence paths;
- real-data scanlist result;
- PRD and target-architecture deviation review;
- known issues and severity;
- final acceptance decision.
