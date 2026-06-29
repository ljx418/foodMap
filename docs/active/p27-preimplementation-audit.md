# P27 Preimplementation Audit

## Audit Scope

This audit checks whether the active documentation can guide P27 mainland China public access implementation without forcing the implementer to invent stage boundaries, architecture entities, acceptance gates, evidence paths, or false-acceptance rules.

Reviewed documents:

- `docs/active/product-requirements-document.md`
- `docs/active/target-architecture.md`
- `docs/active/development-and-acceptance-plan.md`
- `docs/active/acceptance-gate.md`
- `docs/active/milestone-roadmap.md`
- `docs/active/current-vs-target-gap.md`
- `docs/active/current-vs-target-gap.drawio`
- `docs/active/mainland-deployment-profile.md`
- `docs/active/p27-detailed-development-and-acceptance-plan.md`

## Findings

| Area | Finding | Severity | Required Closure |
| --- | --- | --- | --- |
| Stage boundary | P27 is correctly defined as mainland public static access after accepted P26, not a native app, backend, account, cloud sync, or permanent share stage | None | Keep P26 accepted and P27 not-yet-accepted |
| Current deployment truth | Existing EdgeOne work may produce a protected preview URL; docs now classify that as package/browser smoke only | None | Final P27 report must not accept protected preview |
| Architecture specificity | Target architecture names concrete code, build, deployment, runtime, data, and evidence entities | None | Drawio must mirror the same entities |
| External dependencies | Domain, ICP, HTTPS, provider console access, and possible billing are outside repo control | Controlled risk | Stop for user confirmation if required |
| Route fallback clarity | `p27-detailed-development-and-acceptance-plan.md` now defines EdgeOne default, EdgeOne custom domain, COS/CDN, OSS/CDN, domestic Nginx, and diagnostic-only routes with pros, risks, and closure rules | None | Follow route order unless user chooses otherwise |
| Secret handling | Credentials and preview query tokens must not be committed, quoted, or written into reports | High if violated | Use env vars and redact all token-like values |
| Acceptance evidence | Local verifier, remote verifier, browser smoke, Mate70 evidence, PRD review, and final report are required | None | No final acceptance without stable public URL evidence |

## Audit Opinion

Decision: `Go for P27 documentation completion; implementation can start only after the updated drawio and active docs are reviewed with no fatal or major unresolved risk.`

The current documentation can support P27 if the active docs are updated together. The remaining execution risk is external rather than architectural: a stable mainland public URL may require EdgeOne project settings, domain binding, ICP filing, HTTPS setup, provider approval, or payment. That risk cannot be eliminated by code or docs. The detailed plan now contains route fallback rules so implementation can move from EdgeOne default domain to custom domain, COS/CDN, OSS/CDN, or domestic Nginx only when each route's external prerequisites are available and approved.

## Residual Risk And Route Choice

| Risk | Can Documentation Remove It? | Control |
| --- | --- | --- |
| EdgeOne only exposes protected preview | No | Treat as smoke only; try EdgeOne custom domain or fallback host after user approval |
| Custom domain requires ICP or provider review | No | Stop for user action; do not claim accepted before approval and HTTPS |
| Free tier or provider policy blocks public access | No | Record blocker; switch route only after user approval |
| Mainland CDN or custom domain creates cost | No | Stop before paid operation |
| Remote URL passes desktop browser but fails on Mate70 | No | Keep P27 open until real-device evidence passes |
| Secret appears in logs or reports | Yes, with discipline | Use env vars, redact command output, run secret scan before final report |

## Required Implementation Guardrails

1. Do not declare the P27 stage accepted until a stable mainland HTTPS URL works without login or expiring preview token.
2. Do not treat GitHub Pages, LAN URL, HDC reverse forwarding, local preview, temporary tunnel, or EdgeOne protected preview as mainland public acceptance.
3. Do not write API tokens, cookies, SecretKey values, or full preview query tokens into tracked files.
4. Preserve IndexedDB and `.foodmap.json` as the only personal data persistence and portability paths.
5. Preserve P18-P26 regression gates and Agent trust boundaries.
6. Stop for user confirmation before paid services, domain purchase, ICP/real-name filing, or provider console changes.
