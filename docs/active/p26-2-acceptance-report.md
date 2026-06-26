# P26-2 Acceptance Report: Mobile Release Experience Hardening

## Status

Implemented and passed automated browser acceptance. Supersession note: final P26 acceptance later passed after Mate70 fixed-URL evidence for the P26 build was captured and recorded in `docs/active/p26-final-acceptance-report.md`.

## Implementation Summary

- `WebAppStatus` now exposes user-visible release diagnostics:
  - release target: fixed URL, local preview, or static site;
  - local storage status: IndexedDB on the current device;
  - Service Worker shell status;
  - offline copy that says local data can be viewed and will not be synced or deleted.
- `ShareView` missing-snapshot recovery now explains that a share route has no public cloud copy and requires `.foodmap.json` import on another device.
- `ImportExportDialog` now separates export, read-only import, and merge-to-my-map intent with explicit local-only language.

## Evidence

- Screenshot: `docs/active/evidence/p26/01-mobile-release-status.png`
- Screenshot: `docs/active/evidence/p26/02-missing-share-recovery.png`
- Targeted E2E: `P26 mobile release diagnostics and missing share recovery stay honest` passed.

## PRD Review

Matches PRD 4M mobile release hardening:

- The user can see whether the app is in WebApp/browser/static-site mode.
- The user is told data remains local in IndexedDB.
- Missing share recovery points to `.foodmap.json`, not cloud or permanent public links.
- No native HarmonyOS, AppGallery, account, cloud sync, backend, offline tile, or public-share claim was added.

## Supersession And Residual Limit

This substage report originally covered the automated browser scope only. The Mate70 final gate is now closed by `docs/active/p26-final-acceptance-report.md` and `docs/active/evidence/p26/mate70-fixed-url/`. The remaining residual limit is narrower: HarmonyOS file-picker import preview was not automated on the physical device, so import preview/cancel no-write remains proven by targeted Playwright plus Mate70 data package/governance reachability evidence.
