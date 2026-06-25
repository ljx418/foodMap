# FoodMap P24 Stage Implementation Contract

Date: 2026-06-25

## Binding Scope

P24 may implement:

- WebApp manifest, icons, theme color, launch URL, and display metadata.
- Mobile safe-area, browser chrome, keyboard, sheet, dialog, and touch target improvements.
- Static deployment profile and route smoke checks.
- Weak-network, tile failure, external-map failure, and installability fallback UI.
- P24 automated tests, screenshots, Mate70 evidence, and final acceptance report.

P24 must preserve:

- Pure frontend and local-first architecture.
- IndexedDB as the local source of truth.
- `.foodmap.json` as the only cross-device portability path.
- P18 candidate trust and coordinate confirmation rules.
- P19 current-viewport poster and data health behavior.
- P20-C governance preview/confirmation/journal boundaries.
- P21 local read-only share and invalid import no-op safety.
- P22/P23 interaction readability corrections.

## Forbidden Work

P24 must not add or claim:

- Account login or identity system.
- Cloud sync, remote backup, or automatic multi-device sync.
- Multiplayer/collaborative editing.
- Public permanent share links.
- FoodMap custom backend API.
- HarmonyOS native HAP delivery or AppGallery release.
- Automatic coordinate finalization or data repair.
- Completed external real-time POI search without provider evidence.

## Required User-Visible Behavior

- If install/add-to-home behavior is unsupported on Mate70, the UI or final report must say so plainly and offer browser/shortcut fallback.
- If map tiles fail, the app must preserve local data and explain that the map layer failed, not that records are lost.
- If external map handoff fails, the app must keep copy-address/coordinate fallback.
- If offline/weak network prevents remote assets, the app must not imply cloud data loss.

## Acceptance Contract

P24 is accepted only when:

1. Build, unit, scanlist, P18-P23 regression, and P24 targeted checks pass.
2. Static deployment smoke is recorded.
3. Mate70 real-device screenshots or recording prove required user paths from `docs/active/p24-mate70-real-device-acceptance-script.md`.
4. `docs/active/p24-final-acceptance-report.md` records evidence and residual limits.
5. Active docs remain consistent and do not over-claim unsupported capabilities.
