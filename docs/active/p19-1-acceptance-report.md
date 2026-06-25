# FoodMap P19-1 Acceptance Report - Environment Baseline

Date: 2026-06-23
Status: Passed

## 1. Scope

P19-1 validates that the restored FoodMap workspace can distinguish product failures from local acceptance-environment failures before P19 feature work begins.

P19-1 does not change product behavior. It only validates restore commands, browser acceptance readiness, PRD boundary alignment, and false-acceptance risk.

## 2. Development And Acceptance Plan

Required baseline commands:

```bash
npm ci
npm run build
npm test -- --run
npm run verify:scanlist
```

Required P18 regression browser commands:

```bash
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P18 large deterministic"
npx playwright test e2e/workspace.spec.ts --project=desktop --grep "agent bridge returns structured errors"
```

Environment remediation attempt if browser launch fails:

```bash
npx playwright install-deps chromium
```

## 3. Audit Before Execution

| Area | Audit Result | Severity | Action |
| --- | --- | --- | --- |
| PRD boundary | P19-1 keeps pure frontend, local-first, no account/backend/cloud/public-link scope | None | Proceed |
| P18 baseline | P18 remains regression baseline and is not reimplemented | None | Proceed |
| Browser acceptance | Browser evidence is mandatory before final P19 exit | High | Run targeted Playwright and record blocker if launch fails |
| False acceptance | Claiming P19-1 complete without browser path would be false acceptance | High | Keep phase blocked until browser runner is verified |

Audit opinion before execution: proceed with P19-1 validation only. Do not start P19-2 feature development until the browser-gate result is recorded and the high-risk decision is resolved.

## 4. Command Results

| Command | Result | Notes |
| --- | --- | --- |
| `npm ci` | Passed | Added/audited 110 packages; 1 low severity vulnerability reported by npm audit |
| `npm run build` | Passed | TypeScript and Vite production build completed |
| `npm test -- --run` | Passed after sandbox escalation | Initial run failed because the read-only sandbox blocked Vite writing `node_modules/.vite-temp`; rerun outside the read-only sandbox passed 34 Vitest tests |
| `npm run verify:scanlist` | Passed | 50 entries, 50 manual verification overlays, 38 approximate admitted pins, guardrails present |
| `npx playwright test ... "P18 large deterministic"` | Passed after local library remediation | 1 desktop Playwright test passed |
| `npx playwright test ... "agent bridge returns structured errors"` | Passed after local library remediation | 1 desktop Playwright test passed |
| `npx playwright install-deps chromium` | Blocked but no longer required for this workspace run | Requires sudo password; replaced by local deb extraction workaround |

## 5. Browser Environment Remediation

The first browser attempts failed before product assertions because Chromium could not load `libnspr4.so`, `libnss3.so`, and `libnssutil3.so`.

`npx playwright install-deps chromium` could not run in the current non-interactive terminal because it required sudo password input. The blocker was resolved without system installation by downloading and extracting the required Ubuntu packages into a local temp directory:

```bash
mkdir -p .tmp/playwright-libs
cd .tmp/playwright-libs
apt-get download libnspr4 libnss3
dpkg-deb -x libnspr4_2%3a4.35-1.1build1_amd64.deb extracted
dpkg-deb -x libnss3_2%3a3.98-1ubuntu0.1_amd64.deb extracted
```

Browser acceptance commands then ran with:

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test ...
```

One additional environment issue was found: port `5173` was occupied by another project's Vite dev server, so Playwright reused the wrong app because `reuseExistingServer` is enabled. After stopping that unrelated dev server, Playwright started FoodMap correctly and both P18 targeted browser regressions passed.

## 6. PRD Specification Review

P19-1 remains aligned with the PRD:

- FoodMap remains pure frontend and local-first.
- No backend, account, cloud sync, or public permanent share-link scope was added.
- P18 accepted capabilities remain regression baselines rather than being reimplemented.
- Browser evidence is required for acceptance claims involving visual, responsive, Agent, and large-dataset behavior.

No product-code behavior changed in P19-1.

## 7. Acceptance Decision

P19-1 is complete.

Passing evidence:

- Restore dependency install passed.
- Production build passed.
- Unit test suite passed when allowed to write local Vite temp files.
- Real scanlist baseline verification passed.
- P18 large deterministic browser regression passed.
- Agent negative browser regression passed.

Residual environment notes:

- The durable system-level fix remains `npx playwright install-deps chromium` or equivalent OS packages.
- The current workspace-level fix uses local extracted libraries plus `LD_LIBRARY_PATH`.
- Port `5173` must point to FoodMap before Playwright runs; otherwise `reuseExistingServer` can reuse a wrong app.

## 8. Audit Opinion After Execution

Current status: `Passed`.

No fatal or major PRD/specification deviation remains for P19-1. P19-2 may begin, but each browser run must either use the local library path above or a machine with the Playwright system dependencies installed.
