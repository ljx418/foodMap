# P27-2 Acceptance Report

Status: `Accepted as substage`

## What Was Implemented

- Added `scripts/verify_p27_release.mjs`.
- Added `npm run verify:p27:release`.
- The verifier classifies mainland deployment URLs as `missing`, `invalid`, `not_https`, `protected_preview`, `local_or_lan`, `github_pages`, or `stable_candidate`.
- The verifier writes `docs/active/evidence/p27/release-gate-manifest.json`.

## Acceptance Result

The current shell has no `FOODMAP_MAINLAND_DEPLOY_URL`, so the verifier correctly records `blocked_before_final_acceptance` instead of accepting P27.

This is the expected P27-2 result: deployment state classification works, and false acceptance is blocked.

## PRD Review

| PRD Requirement | Result |
| --- | --- |
| Stable mainland public URL required for P27 acceptance | Preserved |
| Protected preview/LAN/GitHub Pages cannot close P27 | Enforced by verifier |
| Local-first pure frontend remains unchanged | Preserved |
| No cloud/account/backend/native claim | Preserved |
| Secrets must not be committed | Covered by verifier secret scan |

## Audit Conclusion

No fatal or major residual risk for P27-2. The substage is closed, but P27 remains open until stable public URL, remote browser smoke, Mate70 evidence, and final report exist.
