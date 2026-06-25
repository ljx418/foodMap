# FoodMap PRD Full Code, Docs, Function, And E2E Audit

Status: Superseded by P21 implementation and `p21-final-acceptance-report.md`.

Superseded note: This audit recorded the pre-implementation state where P21 targeted tests and release-portability behavior were missing. P21 has since been implemented and accepted on 2026-06-24. Keep this file as historical evidence of the blocker that P21 closed.

Date: 2026-06-24

## Summary

This historical audit rechecked FoodMap against the original V1.0 PRD plus accepted P18/P19/P20-C baselines and the then-planned P21 stage. At that time, build, unit tests, real scanlist verification, and full Playwright regression passed, but P21 could not be accepted because targeted browser tests did not exist yet and several P21 requirements exceeded the implementation. The current accepted status is recorded in `p21-final-acceptance-report.md`.

Decision:

```text
P18/P19/P20-C regression baseline: pass.
Historical P21 release-portability stage finding: blocked for implementation and targeted acceptance at audit time.
```

## Environment And Commands

Repository state:

- Head: `1cbbfed1df5bdc09d2c6e51655ecc6f0da93e6c0`
- Latest commit: `1cbbfed 2026-06-22T21:28:07+08:00 Complete P18 handoff and acceptance baseline`
- Worktree: dirty, with active P19/P20/P21 documentation, code, and evidence changes present.

Commands:

| Command | Result |
| --- | --- |
| `npm ci` | Passed; 1 low severity npm audit item reported |
| `npm run build` | Passed |
| `npm test -- --run` | Passed; 44 unit tests |
| `npm run verify:scanlist` | Passed; 50 entries, 50 manual overlays, 38 approximate admitted pins |
| `npx playwright test --list` | Passed; 106 listed tests |
| `LD_LIBRARY_PATH=... npx playwright test` | Passed; 72 passed, 34 skipped, 0 failed |
| `LD_LIBRARY_PATH=... npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P21 share portability\|P21 import safety\|P21 read only share"` | Failed: no tests found |

## PRD Function Coverage

| PRD Area | Implementation Status | Test Coverage | Audit Opinion |
| --- | --- | --- | --- |
| Map-first workspace | Implemented | E2E covered | Pass |
| Place create/edit/delete | Implemented | E2E covered | Pass |
| Rating, visit date, tags, notes | Implemented | Unit/E2E covered | Pass |
| Photo upload and thumbnail display | Implemented | E2E covered for create-with-photo | Pass, but share portability thumbnail inspection needs P21 test |
| Layer display and visibility | Implemented | E2E covered for personal/reference layers | Pass |
| Search and filters | Implemented | Unit/E2E covered | Pass |
| Local share route missing-state copy | Implemented | E2E covered | Pass |
| Read-only share page | Implemented through readonly components | Partially covered | Needs P21 guard test for absence of all edit/write controls |
| `.foodmap.json` export/import | Implemented | Partially covered | Needs P21 JSON inspection, clean-profile import, and invalid import no-op |
| P18 candidate trust/calibration | Implemented | E2E covered | Pass |
| P19 current viewport poster/data health | Implemented | Unit/E2E covered | Pass |
| P20-C governance completion | Implemented | Unit/E2E covered | Pass |
| P21 snapshot portability summary | Not fully implemented | Not covered | Major gap |
| P21 targeted acceptance suite | Not implemented | No tests found | Major gap |

## Major Findings

### F1: P21 targeted E2E tests are missing

The active P21 E2E matrix requires targeted tests named around:

```text
P21 share portability
P21 import safety
P21 read only share
```

The targeted Playwright command finds no matching tests. Full Playwright passing does not satisfy P21 exit criteria.

Severity: Major blocker for P21 acceptance.

### F2: Snapshot generation does not yet expose the full P21 portability summary

`ShareSnapshotDialog` generates a fixed-title snapshot and shows local-readonly copy plus open/export actions. It does not yet show the P21-required pre/post summary with title entry, place count, layer count, thumbnail count, and generated time.

Severity: Major implementation gap against P21 PRD.

### F3: Import package validation is too shallow for P21

`isExportFile` and `isSnapshot` validate the outer package, version, arrays, and timestamp shape, but do not deeply validate required `FoodPlace`, `FoodLayer`, or `SnapshotPhoto` fields before import planning/write paths.

P21 requires schema/version, snapshot metadata, places, layers, thumbnail-only photos, malformed thumbnail handling, and invalid package no-op evidence.

Severity: Major implementation and test gap.

### F4: Invalid import no-op is not proven at P21 level

Current import failure notifies the user. Existing tests cover some import conflict preview behavior, but there is no P21 browser evidence that invalid JSON, unsupported schema, missing fields, or malformed thumbnails leave `places`, `layers`, `photos`, `snapshots`, and governance journal unchanged.

Severity: Major false-acceptance risk.

### F5: Read-only share guard is implemented but under-tested

`ShareView` passes `readonly` into `LayerPanel`, `MapCanvas`, and `PlaceDetailDrawer`. The detail drawer hides edit/delete/tag mutation/poster controls when readonly. However, P21 requires browser proof that no create/edit/delete/upload/save/account/cloud/public-link controls appear on the share route.

Severity: Test coverage gap.

### F6: Data schema documentation still conflicts with code versioning

`data-schema-and-import-export-contract.md` still describes IndexedDB version `1`, while code uses `DB_VERSION = 2` and includes `governanceJournal`.

Severity: Documentation concept mismatch.

## Documentation Consistency

Pass:

- Historical finding: active docs consistently treated P21 as planned/current stage, not accepted at audit time.
- P20-C is preserved as accepted baseline.
- Drawio has 7 pages and contains P21 target experience, architecture gap, entities, plan, milestones, gates, and exit conditions.
- Docs do not claim backend, account, cloud sync, or public permanent sharing.

Needs correction:

- Data schema contract must be updated from DB version 1 to the actual version 2 store set, or explicitly distinguish package schema version 1 from IndexedDB version 2.
- P21 docs require selectors such as `snapshot-portability-summary`, `export-foodmap-json`, `import-error-message`, `share-readonly-notice`, and `share-missing-snapshot`; current code does not provide these selectors yet.

## Test Coverage Gaps

Required before P21 implementation can be accepted:

1. Unit tests for deep `.foodmap.json` package validation.
2. Unit tests for snapshot portability summary counts and thumbnail inclusion.
3. Browser test for exported JSON inspection.
4. Browser test for clean-profile import opening `#/share/:snapshotId`.
5. Browser test for read-only share guard across create/edit/delete/upload/save/account/cloud/public-link controls.
6. Browser test for invalid JSON, unsupported schema, missing required fields, and malformed thumbnail no-op.
7. Agent negative test for public-link forging and import-confirmation bypass.
8. Responsive P21 screenshots/evidence under `docs/active/evidence/p21/`.

## Final Audit Conclusion

Current accepted regression baseline is healthy:

```text
build: pass
unit: pass
real scanlist: pass
full Playwright: pass
P18/P19/P20-C regression: pass
```

P21 is not complete and must not be declared accepted:

```text
P21 targeted tests: missing
P21 package validation: incomplete
P21 snapshot summary: incomplete
P21 invalid import no-op: unproven
P21 read-only guard: under-tested
```

Recommended next action: implement P21 requirements from `docs/active/p21-detailed-development-and-acceptance-plan.md`, then rerun this audit and create `docs/active/p21-final-acceptance-report.md` only after targeted P21 E2E and full regression pass.
