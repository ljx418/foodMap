# P27 Implementation Progress Report

Status: `P27-1 through P27-4 closed; P27-5 public-domain path bypassed and blocked before final acceptance`

Timestamp: 2026-06-29T16:10:18+08:00

## Scope

This report records the P27 implementation attempts after the P27 documentation set was reviewed and accepted for direction. The work stayed inside the P27 mainland China public access scope:

- build and verify the mainland static artifact;
- prove EdgeOne deployment command wiring through dry-run and real deploy;
- preserve P26 accepted baseline gates;
- avoid paid operations, provider console changes, and secret exposure;
- do not claim P27 acceptance without stable mainland public URL evidence.
- bypass public domain registration, ICP filing, DNS binding, and HTTPS certificate setup for the current development run.

## Commands Executed

| Command | Result | Evidence |
| --- | --- | --- |
| `.env.local` token presence check | Passed | Token is present in ignored local env file; no secret value was printed |
| `npm run build:edgeone` | Passed | Built `dist/` through `build:mainland`; asset base is root-oriented for mainland static hosting |
| `npm test -- --run` | Passed | 46 Vitest tests passed |
| `npm run verify:scanlist` | Passed | 50 scanlist entries verified; 50 manual verification overlays; known guardrails passed |
| `npm run verify:mainland:deployment` | Passed | Local `dist/` checks passed for base `/` |
| `EDGEONE_DRY_RUN=1 EDGEONE_PROJECT_NAME=foodmap npm run deploy:edgeone` | Passed | Dry-run command produced safe EdgeOne CLI command without requiring token |
| `npm run deploy:edgeone` | Passed | EdgeOne CLI deployed `dist/` to project `foodmap`; CLI returned a protected preview URL with token query parameters, which is not accepted public access |
| `FOODMAP_MAINLAND_DEPLOY_URL=https://foodmap.edgeone.cool/ npm run verify:mainland:deployment` | Failed as expected | The tokenless default domain returned HTTP 401 |
| `npm run verify:p26:release` | Passed | P26 release verifier passed and wrote the P26 manifest |
| `FOODMAP_MAINLAND_DEPLOY_URL=https://foodmap.edgeone.cool/ npm run verify:p27:release` | Passed local gate / blocked final acceptance | Wrote `docs/active/evidence/p27/release-gate-manifest.json` with `accepted: false` because remote static checks returned HTTP 401 |
| `npm run smoke:p27:browser` | Expected blocker | Wrote `docs/active/evidence/p27/browser-smoke-result.json` with `blocked_before_browser_smoke` because `FOODMAP_MAINLAND_DEPLOY_URL` is missing |
| Drawio XML/page check | Passed | `current-vs-target-gap.drawio` parses and has 7 pages |

## Acceptance Assessment

P27 cannot be accepted in this run.

Reasons:

1. EdgeOne real deployment completed, but the CLI returned a protected preview URL containing token/time query parameters.
2. The tokenless default domain `https://foodmap.edgeone.cool/` returns HTTP 401, so it is not a stable public URL.
3. No stable mainland public HTTPS URL has passed `FOODMAP_MAINLAND_DEPLOY_URL=<stable-url> npm run verify:mainland:deployment`.
4. No Mate70 evidence exists for a stable mainland public URL.

This is not a product-code failure. It is an external deployment closure blocker. The current implementation can support the next attempt once a stable public URL route is available.

Public domain registration and ICP work are now explicitly marked as bypassed external prerequisites for this run. Next development should continue with PRD-based audit, local/protected-preview evidence reporting, mobile interaction polish, and local data portability hardening without claiming P27 final acceptance.

## PRD And Architecture Review

| Requirement | Result |
| --- | --- |
| Pure frontend and local-first | Preserved |
| No account/cloud/backend/native/offline-map/permanent-share claim | Preserved |
| Mainland build profile | Passed local build |
| Mainland local verifier | Passed |
| EdgeOne adapter dry-run | Passed |
| EdgeOne real deployment | Passed as protected preview only |
| Stable public mainland URL | Blocked |
| Mate70 stable public URL evidence | Blocked |
| Final acceptance report | Not created; P27 remains open |

## Next Route

Follow the route order in `p27-detailed-development-and-acceptance-plan.md`:

1. Do not continue public domain registration, ICP filing, DNS binding, or HTTPS certificate setup in this run.
2. Execute the non-public-domain development outline in `p27-public-domain-blocker-and-next-development-outline.md`.
3. Resume P27-5 only after a user-owned domain or tokenless public EdgeOne URL is available and approved for verification.

## Decision

Current decision: `P27-1 through P27-4 implementation path complete; P27 final acceptance blocked at P27-5`.

Do not declare the P27 stage complete until a stable mainland public HTTPS URL passes remote verification and Mate70 evidence.

## Stage Audit Update

The 2026-06-29 staged audit and visual report were generated at `docs/active/evidence/p27/stage-audit-2026-06-29/index.html`.

Result: `Needs work / blocked before P27 final acceptance`.

Key evidence:

- Local build, unit tests, real scanlist, local mainland static verifier, P26 release gate, and P27 release gate ran.
- 11 browser screenshots were captured through Windows Chrome CDP with an isolated temporary profile.
- Full Linux Playwright E2E remains blocked in this environment because Chromium cannot load `libnspr4.so`.
- Tokenless `https://foodmap.edgeone.cool/` remains HTTP 401, so P27 public mainland access is still blocked.
