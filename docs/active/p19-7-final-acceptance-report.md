# P19-7 Final Acceptance Report

Date: 2026-06-23

Status: Accepted

## Scope

This report closes P19 after the accepted P18 baseline. P19 delivered:

- reproducible acceptance environment notes and browser workaround;
- real current-viewport poster mode;
- personal data health center;
- domain transformation reuse for candidate confirmation;
- responsive regression evidence across mobile, tablet, and desktop;
- documentation sync review.

P19 did not add backend services, accounts, cloud sync, public permanent share links, automatic coordinate finalization, or guaranteed external realtime POI search.

## Command Results

| Gate | Result | Summary |
| --- | --- | --- |
| `npm run build` | Passed | TypeScript build and Vite production build completed; 1646 modules transformed |
| `npm test -- --run` | Passed | 1 test file, 40 domain tests passed |
| `npm run verify:scanlist` | Passed | 50 scanlist entries, 50 manual verification overlays, 38 approximate admitted pins |
| P18 large deterministic Playwright | Passed | `P18 large deterministic dataset performance smoke`, 1 passed |
| Agent negative Playwright | Passed | `agent bridge returns structured errors, emits events and does not write invalid data`, 1 passed |
| P19 current viewport poster Playwright | Passed | `P19 current viewport poster uses real map bounds and explicit empty state`, 1 passed |
| P19 data health Playwright | Passed | `P19 data health center groups places and actions do not mutate facts`, 1 passed |
| P19 responsive Playwright | Passed | `P19 responsive keeps data health and poster controls reachable`, 1 passed |
| Candidate/calibration import regression | Passed | `personal favorites import verified and calibration pins distinctly`, 1 passed |
| Manual pin move audit regression | Passed | `pending personal favorite pins can be manually moved and audited`, 1 passed after rerun outside read-only sandbox |

## Browser Environment

Local Playwright launch originally required Linux NSS/NSPR libraries. P19 acceptance used the documented local extraction workaround:

```bash
LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/extracted/usr/lib/x86_64-linux-gnu npx playwright test ...
```

The libraries present for acceptance were:

- `libnspr4.so`
- `libnss3.so`
- `libnssutil3.so`

Port `5173` was checked before browser gates; no conflicting Vite server was listening at the start of P19-7.

One manual pin move rerun was needed because the managed sandbox was read-only and blocked Playwright from writing `test-results/.last-run.json`. The same command passed after running outside the read-only sandbox. This is an environment write-permission issue, not a product regression.

## Evidence

P19 responsive screenshot evidence:

- `docs/active/evidence/p19/mobile-390-data-health.png`
- `docs/active/evidence/p19/mobile-390-poster.png`
- `docs/active/evidence/p19/mobile-430-data-health.png`
- `docs/active/evidence/p19/mobile-430-poster.png`
- `docs/active/evidence/p19/tablet-768-data-health.png`
- `docs/active/evidence/p19/tablet-768-poster.png`
- `docs/active/evidence/p19/desktop-1280-data-health.png`
- `docs/active/evidence/p19/desktop-1280-poster.png`

Supporting phase reports:

- `docs/active/p19-1-acceptance-report.md`
- `docs/active/p19-2-acceptance-report.md`
- `docs/active/p19-3-acceptance-report.md`
- `docs/active/p19-4-acceptance-report.md`
- `docs/active/p19-5-acceptance-report.md`
- `docs/active/p19-6-acceptance-report.md`

## PRD Review

P19 acceptance satisfies the PRD goals for this stage:

- current-viewport poster mode uses real map bounds and exposes count/empty state before export;
- personal data health makes verified, pending, high-risk, manual-adjusted, and skipped states visible;
- health actions are navigational or filtering actions and do not mutate coordinates, tags, notes, or verification facts;
- P18 trust flows remain explicit and require user confirmation;
- scanlist validation continues to use real Wuhan recommendation data.

No major PRD deviation was found.

## Target Architecture Review

P19 implementation remains inside the target architecture:

- viewport bounds are emitted by the map adapter and consumed by workspace/poster state;
- poster source-set filtering is implemented as reusable domain logic;
- personal data health is a derived read model;
- candidate confirmation uses a shared domain transform before persistence;
- Agent bridge guardrails remain negative-tested.

No architecture drift requiring drawio content changes was found during final acceptance. `docs/active/current-vs-target-gap.drawio` remains at 7 pages.

## Known Issues And Boundaries

- The local Linux browser dependency workaround should remain documented until the machine has system Playwright dependencies installed.
- The repository has many pre-existing mode-only dirty files unrelated to P19 implementation; they were not reverted.
- P19 improves domain/repository consolidation for coordinate-changing flows but does not claim a complete repository rewrite.

## Final Decision

P19 is accepted.

The stage has passed build, unit, real-data scanlist, P18 regression, P19 targeted browser tests, responsive screenshot evidence, documentation sync review, and final PRD/architecture review.
