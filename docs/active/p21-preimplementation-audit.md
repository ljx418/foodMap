# FoodMap P21 Preimplementation Audit

Status: Go for P21 implementation after drawio direction review.

Date: 2026-06-24

## Audit Scope

This audit reviews whether the active documentation can support P21 development before code changes start. P21 is defined as the local share and data portability release stage.

## PRD Review

The PRD supports P21 through:

- Section 6.4: share page must be local, read-only, and clear about import requirements.
- Section 9: `#/share/:snapshotId` must show snapshot title, time, map pins, layers, details, thumbnails, and import fallback without edit actions.
- Sections 10.8 and 10.9: share snapshot and import/export are P0 requirements.
- Sections 11.7 and 11.8: generate snapshot, export package, clean profile import, and read-only share opening are required user flows.
- Section 16.3: refresh persistence, delete confirmation, import failure safety, local read-only copy, and clear filename are release trust requirements.
- Section 17: local sharing and import/export must feel clear, credible, and safe.

Audit opinion: PRD support is complete for planning P21.

## Architecture Review

The target architecture now defines:

- `SnapshotPortabilityComposer`
- `FoodMapPackageValidator`
- `CleanProfileImportHarness`
- `ReadOnlyShareGuard`
- `ImportFailureNoOpGuard`
- `P21ReleaseEvidencePack`

These modules map cleanly to existing share/import/export surfaces and do not require backend infrastructure or schema-breaking migration.

Audit opinion: architecture support is complete for planning P21.

## Risk Review

| Risk | Severity | Control |
| --- | --- | --- |
| Local share is over-claimed as cloud/public sharing | Major | P21 docs and UI copy must say local read-only; no public URL claim |
| Import writes partial or editable data before validation | Major | Validator and no-op tests required before acceptance |
| Share page leaks workspace edit controls | Major | Read-only guard and E2E selectors required |
| Export package omits thumbnails or metadata | Major | JSON inspection gate required |
| P21 breaks P20-C import conflict/governance baseline | Major | P20-C regression gate required |
| Browser acceptance skipped | Major | Targeted Playwright and final report required |

No fatal risk is present if the controls above remain binding.

## Documentation Coverage

| Document | Coverage |
| --- | --- |
| PRD | Complete after P21 section |
| Target architecture | Complete after P21 architecture extension |
| Development plan | Must include P21 orchestration |
| Acceptance gate | Must include P21 gates |
| Milestone roadmap | Must include M21-1 to M21-7 |
| Gap + drawio | Must describe current/target share portability gap under 8 pages |
| E2E matrix | Must include P21 targeted browser scenarios |
| Visual checklist | Must include share/import/read-only/fallback views |

## Decision

P21 is implementation-ready after the active docs and drawio are synchronized. Implementation must stop and ask the user only if a later audit finds one of these high-risk deviations:

- requirement to add backend, account, cloud sync, or public permanent links;
- requirement to restore imports as editable personal data without a new stage;
- requirement to bypass import confirmation or validation;
- inability to run browser acceptance without documented blocker severity.
