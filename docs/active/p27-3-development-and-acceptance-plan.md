# P27-3 Development And Acceptance Plan

## Scope

P27-3 prepares the mainland public deployment route without performing paid operations or provider-side changes. The implementation must support the EdgeOne free-first route and preserve fallback clarity for custom domain, COS/CDN, OSS/CDN, or static Nginx routes.

## PRD Acceptance Criteria

- Deployment tooling must be repeatable and must not require secrets in tracked files.
- EdgeOne protected preview is not equivalent to public mainland acceptance.
- Any paid service, domain purchase, ICP filing, certificate setup, or provider console operation requires user approval.
- GitHub Pages remains an overseas/developer baseline only, not the mainland production answer.

## Development Plan

1. Keep `build:edgeone` mapped to the mainland static build.
2. Keep `deploy:edgeone` dry-run capable.
3. Ensure the release verifier can be run before and after real deployment.
4. Document that real deployment is blocked in the current shell when `EDGEONE_API_TOKEN` is absent.

## Audit Opinion Before Development

No fatal or major specification risk remains. P27-3 is safe because it does not call provider APIs unless credentials are supplied through environment variables and does not persist secrets.

## End-To-End Acceptance

P27-3 is accepted when `EDGEONE_DRY_RUN=1 EDGEONE_PROJECT_NAME=foodmap npm run deploy:edgeone` passes and the report records that real deployment was not attempted without a token.
