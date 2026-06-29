# P27-4 Acceptance Report

Status: `Accepted as substage`

## Automated Gate Result

The P27 local automation loop was executed on 2026-06-29:

| Command | Result |
| --- | --- |
| `npm run build:edgeone` | Passed |
| `npm test -- --run` | Passed, 46 tests |
| `npm run verify:scanlist` | Passed, 50 real AMap Wuhan scanlist entries |
| `npm run verify:mainland:deployment` | Passed against local `dist/` |
| `EDGEONE_DRY_RUN=1 EDGEONE_PROJECT_NAME=foodmap npm run deploy:edgeone` | Passed as dry-run |
| `npm run verify:p26:release` | Passed |
| `npm run verify:p27:release` | Passed local gate and wrote blocked-before-final-acceptance manifest |
| Known token pattern scan | Passed after removing script self-match risk |

The generated P27 release manifest must remain `accepted: false` until stable public URL verification and Mate70 public-URL evidence are available.

## PRD Review

| PRD Requirement | Result |
| --- | --- |
| Real scanlist data remains part of acceptance | Covered by `verify:scanlist` |
| Existing accepted baseline remains protected | Covered by `verify:p26:release` and unit/static checks |
| Mainland artifact is root-oriented, not GitHub Pages based | Covered by `verify:mainland:deployment` and P27 verifier |
| No false P27 final acceptance | Enforced by manifest status |

## Audit Conclusion

No fatal or major residual risk for P27-4. The substage is closed. P27 final acceptance remains blocked by external public URL and Mate70 evidence.
