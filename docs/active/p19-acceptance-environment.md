# FoodMap P19 Acceptance Environment

## Purpose

This document defines the minimum environment needed to run P19 acceptance without confusing environment failures with product failures.

## Required Commands

Baseline commands:

```bash
npm ci
npm run build
npm test -- --run
npm run verify:scanlist
```

Browser regression commands:

```bash
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

P19 implementation must add targeted browser commands for:

- Current viewport poster mode.
- Empty viewport poster fallback.
- Personal data health center.
- Domain/repository guardrail regression.
- Mobile/tablet/narrow desktop responsive paths.

## Known Browser Dependency Risk

On the 2026-06-23 restore environment, `npm run build`, `npm test -- --run`, and `npm run verify:scanlist` passed, but Playwright browser launch was blocked by missing Linux browser dependencies:

```text
libnspr4.so: cannot open shared object file
```

`npx playwright install chromium` downloaded the browser, but `npx playwright install-deps chromium` required sudo. Until system dependencies are installed or an accepted CI/browser runner is used, browser acceptance is blocked at environment level.

## Acceptance Rules

- A failing browser launch caused by missing system libraries is an environment blocker, not a product assertion failure.
- P19 final acceptance cannot ignore that blocker. It must either be fixed or recorded with severity and alternate evidence.
- Command output summaries must be copied into the P19 final acceptance report.
- Browser screenshots are required for responsive and visual acceptance once the environment blocker is resolved.

## Recommended Remediation

Preferred path:

```bash
npx playwright install chromium
npx playwright install-deps chromium
```

If sudo is unavailable locally:

- Run browser acceptance in a CI or machine image with Playwright dependencies preinstalled.
- Keep local validation to build, unit, scanlist, and XML/doc checks.
- Record the environment limitation in the phase acceptance report.

## 2026-06-23 P19-1 Validation Update

P19-1 reran the restore baseline:

- `npm ci`: passed.
- `npm run build`: passed.
- `npm test -- --run`: passed after running outside the read-only sandbox because Vite/Vitest writes `node_modules/.vite-temp`.
- `npm run verify:scanlist`: passed with 50 entries and 50 manual verification overlays.

The initial P18 targeted Playwright regressions were blocked before product assertions:

- `P18 large deterministic`: blocked by missing `libnspr4.so`.
- `agent bridge returns structured errors`: blocked by missing `libnspr4.so`.
- `npx playwright install-deps chromium`: blocked because sudo password input is required.

The blocker was resolved for this workspace run with a local user-level library path:

```bash
mkdir -p .tmp/playwright-libs
cd .tmp/playwright-libs
apt-get download libnspr4 libnss3
dpkg-deb -x libnspr4_2%3a4.35-1.1build1_amd64.deb extracted
dpkg-deb -x libnss3_2%3a3.98-1ubuntu0.1_amd64.deb extracted
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

Both targeted browser regressions passed after clearing a wrong dev server that occupied port `5173`. Acceptance implication: P19-1 is complete, but future browser runs must either use the local `LD_LIBRARY_PATH` workaround or run on a machine with the Playwright system dependencies installed.

## 2026-06-23 P19-2 Browser Note

P19-2 hit the same port-risk class once: a non-FoodMap Vite server on `5173` caused Playwright to load the wrong app. After stopping that process, FoodMap's P19 targeted test passed.

Before browser acceptance, confirm `5173` is either free or owned by FoodMap:

```bash
ss -ltnp
```

If a wrong app owns `5173`, stop that dev server or run FoodMap Playwright with an isolated config/port.
