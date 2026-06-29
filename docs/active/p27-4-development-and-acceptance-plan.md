# P27-4 Development And Acceptance Plan

## Scope

P27-4 closes the local automated acceptance loop for P27. It proves the project can build, run unit checks, verify real scanlist data, verify local mainland deployment artifacts, dry-run deployment, preserve the P26 release baseline, and generate P27 release-gate evidence.

## PRD Acceptance Criteria

- P27 automation must be repeatable from a clean working environment.
- Real data verification must continue to use the 50 verified AMap Wuhan scanlist entries.
- Accepted P18-P26 boundaries must not regress.
- P27 must remain not accepted if stable public URL and Mate70 evidence are missing.

## Development Plan

1. Run `npm run build:edgeone`.
2. Run `npm test -- --run`.
3. Run `npm run verify:scanlist`.
4. Run `npm run verify:mainland:deployment`.
5. Run EdgeOne deploy dry-run.
6. Run `npm run verify:p26:release`.
7. Run `npm run verify:p27:release`.
8. Run secret and formatting checks.

## Audit Opinion Before Development

No fatal or major specification risk remains. The only known blocker is final public URL evidence, which P27-4 must record as an explicit non-acceptance blocker rather than masking it.

## End-To-End Acceptance

P27-4 is accepted when the local automated gate commands pass and P27 release manifest records the correct blocked-before-final-acceptance status.
