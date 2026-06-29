# P27 Stage Audit And Visual Acceptance Summary

Status: `Needs work / blocked before P27 final acceptance`

Generated report: `docs/active/evidence/p27/stage-audit-2026-06-29/index.html`

## Audit Scope

This audit reran the current P27 stage checks against the original PRD, target architecture, active acceptance gates, current code, automated command evidence, and browser screenshots.

The audit intentionally does not close public-domain registration, ICP filing, DNS binding, HTTPS certificate setup, or Mate70 public-URL evidence. These remain external blockers.

## Command Evidence

| Gate | Result |
| --- | --- |
| `npm ci` | Passed |
| `npm run build:edgeone` | Passed |
| `npm test -- --run` | Passed, 46 tests |
| `npm run verify:scanlist` | Passed, 50 real AMap Wuhan scanlist entries |
| `npm run verify:mainland:deployment` | Passed against local `dist/` |
| `npm run verify:p26:release` | Passed |
| `FOODMAP_MAINLAND_DEPLOY_URL=https://foodmap.edgeone.cool/ npm run verify:p27:release` | Passed local gate and correctly kept P27 blocked because remote static checks returned HTTP 401 |
| Remote `verify:mainland:deployment` against `https://foodmap.edgeone.cool/` | Expected failure, HTTP 401 |
| `npm run e2e` | Failed because Linux Playwright Chromium cannot launch without `libnspr4.so` |
| `npm run smoke:p27:browser` against `https://foodmap.edgeone.cool/` | Expected blocker/failure; P27 stable public URL evidence is not available |

## Visual Evidence

The HTML report contains 11 fresh screenshots captured through Windows Chrome CDP with an isolated temporary profile:

- workspace home;
- data package dialog;
- imported personal favorites map;
- place detail;
- personal data health center;
- governance workbench;
- current viewport poster;
- missing share fallback;
- WebApp status;
- mobile workspace;
- mobile missing share fallback.

Linux Playwright screenshot capture remains blocked by the missing system library. The report records that fallback and does not treat it as a full E2E pass.

## PRD And Architecture Review

The implemented local-first WebApp paths remain aligned with the PRD constraints:

- pure frontend and static deployable;
- IndexedDB and `.foodmap.json` remain the data boundary;
- no account, cloud sync, backend, collaboration, native HAP/AppGallery, offline map, realtime POI completion, or permanent public share claim;
- P26 remains the latest accepted implementation baseline;
- P27 public mainland access remains blocked until a stable tokenless HTTPS URL passes remote verification, browser smoke, Mate70 evidence, and final report.

## Audit Conclusion

Current project state is usable for local/static WebApp review and protected-preview package evidence, but it is not P27 final accepted. The honest status is:

```text
P18-P26 accepted baseline preserved by available command evidence.
P27 local build/deploy/verify path implemented.
P27 stable mainland public access blocked by EdgeOne tokenless HTTP 401 and missing custom-domain/ICP/HTTPS/Mate70 public-URL evidence.
Linux full Playwright E2E blocked by missing libnspr4.so in this environment.
```
