# FoodMap P24 Mate70 Real Device Acceptance Script

Date: 2026-06-25

## Decision

`Ready for execution; P24 remains not accepted until this script passes or blockers are recorded.`

This script is the required Mate70 completion gate for P24. It turns PRD 4K.3 into concrete evidence steps. It must not be replaced by desktop mobile emulation. HDC reverse forwarding may be used as a development transport, but the final report must say whether the evidence came from a deployable URL or from HDC.

## Device And Transport

| Field | Required Value |
| --- | --- |
| Device | HUAWEI Mate70 or the user's declared target Mate70 |
| System evidence | Record model, system version, API version, browser name/version if visible |
| Transport | Prefer deployable static URL; HDC reverse is acceptable only when final report labels it as development evidence |
| App URL | `#/map` and a valid `#/share/:snapshotId` route must be opened |
| Output path | `docs/active/evidence/p24/` |

## Evidence Steps

| Step | User-visible action | Pass criteria | Evidence file |
| --- | --- | --- | --- |
| M70-1 Workspace entry | Open FoodMap on Mate70 and enter `#/map` | Map, search, quick filters, WebApp status, and bottom actions are visible and not covered by browser chrome | `08-mate70-workspace-entry.*` |
| M70-2 Filter and detail | Use layer/filter controls and open one place detail | Filter or layer state changes; detail is readable and actions are reachable | `09-mate70-filter-detail.*` |
| M70-3 Import or create | Import personal data or create a personal place | Personal data appears in workspace; UI does not imply account or cloud sync | `10-mate70-import-or-create.*` |
| M70-4 Export package | Open data package export path | `.foodmap.json` export action is visible; wording remains local-first | `11-mate70-export-package.*` |
| M70-5 Valid read-only share | Generate/import a valid local share package and open `#/share/:snapshotId` | Share page is read-only, map/detail are visible, no edit/account/cloud controls appear | `12-mate70-valid-share.*` |
| M70-6 Persistence | Refresh or reopen the page | Local data or imported share remains readable after reload | `13-mate70-refresh-persistence.*` |
| M70-7 Installability | Try browser install/add-to-home behavior or inspect its absence | Supported behavior is captured, or unsupported behavior shows browser/shortcut fallback copy | `14-mate70-installability.*` |
| M70-8 Failure states | Exercise or document weak/offline, tile failure, and external-map fallback | Failure copy says what failed and does not imply local data loss | `15-mate70-failure-states.*` |

## Acceptance Rules

- P24 can be accepted only if M70-1 through M70-8 pass or each blocked item has a specific blocker and severity in `p24-final-acceptance-report.md`.
- Missing valid share evidence cannot be replaced by missing-snapshot fallback evidence.
- HDC route smoke proves the phone can open routes, but it does not prove deployable static URL availability.
- No step may claim account login, cloud sync, collaboration, public permanent share links, HarmonyOS native HAP, or AppGallery delivery.

## Audit Checklist

- The screenshot or recording file names match this script.
- The final report identifies whether the URL was deployable static hosting or HDC reverse forwarding.
- The PRD and target architecture still describe P24 as WebApp-first and local-first.
- `npm run build`, `npm run verify:p24:webapp`, `npm test -- --run`, `npm run verify:scanlist`, P18-P23 regression, and P24 targeted E2E remain green before acceptance.
