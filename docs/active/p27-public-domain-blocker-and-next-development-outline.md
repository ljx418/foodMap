# P27 Public Domain Blocker And Next Development Outline

## Decision

Public domain registration, ICP filing, custom-domain binding, and HTTPS certificate setup are explicitly bypassed for the current development run. These items remain external P27 final-acceptance blockers and must not be treated as product-code tasks that can be completed automatically.

Current EdgeOne state:

- `npm run deploy:edgeone` can deploy `dist/` to the EdgeOne Makers project `foodmap`.
- The EdgeOne CLI returns a protected preview URL with token/time query parameters.
- The tokenless default domain `https://foodmap.edgeone.cool/` returns HTTP 401 during remote verification.
- Therefore the current EdgeOne state proves package deployment only; it does not prove stable public mainland access.

## Blocked Development Plan Items

| Item | Status | Reason | Resume Condition |
| --- | --- | --- | --- |
| Stable mainland public URL acceptance | Blocked | No stable tokenless public URL passes remote verification | User provides a stable HTTPS URL that opens without provider login or preview token |
| Public domain registration | Bypassed / external | Requires domain ownership and user purchase/identity decisions | User chooses and owns a domain |
| ICP filing | Bypassed / external | Requires real-name and compliance submission | User completes or approves ICP filing path |
| Custom domain DNS binding | Blocked | Requires domain DNS control and provider console operation | Domain and DNS access are available |
| HTTPS certificate setup | Blocked | Depends on custom domain and provider certificate issuance | Domain is bound and certificate is issued |
| Mate70 public-URL P27 final evidence | Blocked | Requires stable public URL first | Remote verifier and browser smoke pass against stable URL |
| P27 final acceptance report | Blocked | Would be false acceptance without public URL evidence | All P27-5 evidence exists |

## Not Blocked

The following work can continue without public domain registration:

- Stage audit against the original PRD and active architecture.
- Code review for feature completeness, test coverage, and concept consistency.
- Local build, unit tests, real scanlist verification, static artifact verification, and EdgeOne protected-preview deployment evidence.
- Automated browser screenshots against local preview or protected preview, clearly labeled as non-final public-access evidence.
- HTML acceptance report that distinguishes accepted local/static behavior from blocked public-domain release.
- Mobile interaction and visual polish that does not depend on public domain access.
- Documentation cleanup and evidence indexing.

## Next Development Outline

### N1. Stage Audit And Evidence Baseline

Goal: create a fresh PRD-based audit over current code, docs, tests, and generated artifacts.

Acceptance:

- `npm run build:edgeone`
- `npm test -- --run`
- `npm run verify:scanlist`
- `npm run verify:mainland:deployment`
- `npm run verify:p26:release`
- `FOODMAP_MAINLAND_DEPLOY_URL=https://foodmap.edgeone.cool/ npm run verify:p27:release` records HTTP 401 blocker
- Audit report explicitly states P27 public-domain acceptance is blocked

### N2. Visual Automated Acceptance Report

Goal: generate a Chinese HTML report with screenshots that a human can review quickly.

Scope:

- Current architecture vs target architecture.
- Implemented local-first WebApp capabilities.
- User scenario screenshots from a local or protected-preview browser run.
- Clear non-acceptance section for public mainland URL, custom domain, ICP, and Mate70 public-URL evidence.

Acceptance:

- Report is written under `docs/active/evidence/p27/`.
- Screenshots are real automated browser screenshots.
- Report does not include API tokens, cookies, SecretKey values, or full protected-preview query values.
- Report does not claim P27 final acceptance.

### N3. Mobile Interaction And Release-Status Polish

Goal: improve the experience that is already testable without a public domain.

Candidate work:

- Make release/public-access status clearer in the app UI.
- Improve mobile data-package, missing-share, source-down, and local-first explanations.
- Reduce friction in core Mate70-sized flows where automated screenshots show layout issues.

Acceptance:

- Targeted Playwright screenshots pass at mobile and desktop sizes.
- PRD review confirms no account/cloud/backend/native/offline/permanent-share over-claim.
- P18-P26 regression boundaries remain green.

### N4. Local Package And Portability Hardening

Goal: make `.foodmap.json` import/export and local data portability more robust while public deployment remains blocked.

Candidate work:

- Strengthen export metadata and import preflight clarity.
- Improve invalid import and read-only share recovery.
- Add focused tests for local-only no-write failure behavior.

Acceptance:

- Unit and targeted E2E evidence prove no partial writes on invalid import.
- Report confirms IndexedDB and `.foodmap.json` remain the only persistence/portability paths.

### N5. Resume P27 Public Release When External Prerequisites Exist

Goal: close P27 only after external prerequisites are available.

Resume criteria:

- User-owned domain is available, or EdgeOne default domain becomes tokenless public.
- Remote verifier passes.
- Browser smoke passes.
- Mate70 opens the same stable URL.
- P27 final acceptance report is written.

## Audit Conclusion

Go for N1 and N2 without waiting for public domain registration. No-go for P27 final acceptance, P27-5 closure, custom-domain automation, ICP filing automation, or any report wording that implies public mainland release is complete.
