# P27 Detailed Development And Acceptance Plan

## Stage Summary

P27 is the mainland China public access closure stage after accepted P26. It turns the existing mainland static deployment profile and EdgeOne deployment adapter into a governed release path that can be accepted only when FoodMap is reachable by mainland users through a stable HTTPS URL without private login state, expiring preview tokens, local LAN routing, HDC reverse forwarding, or GitHub Pages dependency.

P27 remains a pure frontend, local-first static WebApp stage. It changes the public hosting route for mainland users; it does not add accounts, cloud sync, remote backup, collaboration, backend APIs, native HarmonyOS HAP/AppGallery delivery, offline map tiles, realtime POI completion, automatic data repair, or permanent public share links.

Current implementation status: P27-1 through P27-4 are covered by documentation, route classification, deployment-route preparation, local automated release-gate scripts, and EdgeOne protected-preview deployment. P27-5 remains blocked before final acceptance because public domain registration, ICP filing, custom-domain binding, and stable public HTTPS evidence are intentionally bypassed for the current development run.

## Target User Experience

After P27 implementation and final acceptance, a mainland China user can open FoodMap from a stable public URL such as `https://foodmap.example.cn/#/map`, use the same P26 accepted mobile WebApp on Mate70, and understand that personal data remains local in the browser. The user must not need a Tencent/EdgeOne console login, a preview token, a USB connection, a temporary tunnel, or GitHub Pages.

The maintainer can build, deploy, verify, and report the mainland static release through repeatable commands and evidence paths. If the selected provider only exposes a protected preview URL, P27 must stay open and record the provider blocker instead of claiming public acceptance.

## Phase Plan

| Phase | Goal | Main Output | Acceptance Gate |
| --- | --- | --- | --- |
| P27-1 | 文档审计与阶段边界冻结 | PRD、目标架构、计划、gate、roadmap、gap/drawio、profile、audit 同步 | No fatal or major unresolved spec risk; no token or private credential in docs |
| P27-2 | 当前部署状态归类 | EdgeOne protected preview, GitHub Pages baseline, local LAN, HDC, and mainland public URL states are classified | Protected preview is not treated as accepted public URL |
| P27-3 | 大陆公网路线实现准备 | EdgeOne Pages free-first route and COS/OSS/CDN fallback are decision-complete | External dependencies are explicit: provider account, domain, ICP, HTTPS, possible billing |
| P27-4 | 自动化验证闭环 | `build:mainland`, `build:edgeone`, `deploy:edgeone`, and `verify:mainland:deployment` evidence paths are defined | Local `dist/` and remote URL verification criteria are repeatable |
| P27-5 | Mate70 真实访问验收 | Mate70 opens the mainland URL and completes P26 accepted main paths | Evidence is real-device and public URL based, not desktop-only or token preview only |
| P27-6 | 回归、PRD 检视和 final report | Build/unit/scanlist/P18-P26 regression, remote verifier, screenshots, PRD review, and final report | P27 can be accepted only after public URL evidence exists |

Current bypass decision: public domain registration, ICP filing, DNS binding, and HTTPS certificate setup are external user-owned tasks and are not part of the current automatic development run. See `p27-public-domain-blocker-and-next-development-outline.md` for blocked items and the next non-public-domain development outline.

## Technical Routes And Decision Policy

P27 implementation must try routes in this order unless the user explicitly chooses a different route. The decision policy is designed to avoid over-planning and false acceptance while still allowing progress when one provider blocks stable public access.

| Route | When To Use | Advantages | Risks / Costs | Can Close P27? |
| --- | --- | --- | --- | --- |
| EdgeOne Pages default public domain | First implementation attempt because the project already has an EdgeOne adapter and this is the free-first route | Fastest path, no FoodMap backend, matches existing `deploy:edgeone` script, can reuse `build:edgeone` and remote verifier | Provider may expose only protected preview or require console settings that are not scriptable | Yes, only if the final URL is public HTTPS without login or expiring token |
| EdgeOne Pages custom domain | Blocked until the user provides a domain and approves DNS/ICP/HTTPS work | Best continuity with the existing EdgeOne route; CDN/static hosting stays close to current tooling | Requires domain ownership, DNS, ICP if mainland-hosted/accelerated, HTTPS, and possible provider review | Yes, after domain/ICP/HTTPS/remote verifier/Mate70 evidence pass |
| Tencent Cloud COS + CDN | Use when EdgeOne cannot provide a stable public URL but Tencent Cloud account/domain setup is available | Mature static object hosting, domestic CDN option, good fit for static WebApp | Requires bucket setup, DNS, ICP for mainland CDN/custom domain, HTTPS, possible cost | Yes, after static website, CDN/domain, remote verifier, and Mate70 evidence pass |
| Alibaba Cloud OSS + CDN | Use when Alibaba Cloud is preferred or Tencent route is blocked | Mature static object hosting and CDN, similar operating model to COS | Requires bucket setup, DNS, ICP for mainland CDN/custom domain, HTTPS, possible cost | Yes, after the same public URL evidence passes |
| Domestic ECS/Nginx static server | Use only if static hosting products are blocked or full server control is required | Maximum control over headers, routing, logs, and fallback behavior | More operations burden, VM cost, security patching, HTTPS and domain management | Yes, but only after ops risks are accepted and evidence passes |
| GitHub Pages / LAN / HDC / tunnel / protected preview | Use only for development diagnostics or regression comparison | Useful for debugging and preserving P26 overseas/developer baseline | Not reliable or public enough for mainland production acceptance | No |

Route fallback rule: if a route cannot produce a stable public HTTPS URL without login or expiring token, record the blocker and move to the next route only when the next route's external prerequisites are available and approved. Do not silently change product scope to add backend, accounts, cloud sync, native packaging, or permanent public share storage.

## Development Scope

P27 implementation may adjust only deployment, verification, documentation, and evidence workflow needed to make the mainland static release repeatable and honest:

- Static build profiles: `npm run build:mainland`, `npm run build:edgeone`, `FOODMAP_MAINLAND_BASE_PATH`.
- Deployment adapter: `scripts/deploy_edgeone_pages.mjs`, `npm run deploy:edgeone`, provider project name handling, dry-run behavior, and token guardrails.
- Verification: `scripts/verify_mainland_deployment.mjs`, local `dist/` checks, remote URL checks, hash route checks, manifest/service worker/static asset checks.
- Evidence: `docs/active/evidence/p27/`, browser smoke screenshots, Mate70 screenshots or recording, remote verifier logs, PRD review, and final report.
- Documentation governance: active PRD, target architecture, milestone roadmap, acceptance gate, current-vs-target gap, drawio, and mainland deployment profile.

P27 implementation must not modify location trust rules, Agent write permissions, IndexedDB data semantics, `.foodmap.json` schema, share snapshot semantics, governance write paths, or UI copy in a way that implies cloud sync or permanent public share storage.

## Required Acceptance Scenarios

1. `npm run build:mainland` produces a static `dist/` suitable for custom-domain root deployment.
2. `npm run build:edgeone` produces the same mainland static artifact through the EdgeOne alias.
3. `npm run verify:mainland:deployment` passes against local `dist/`.
4. `EDGEONE_DRY_RUN=1 EDGEONE_PROJECT_NAME=foodmap npm run deploy:edgeone` proves deploy command wiring without requiring a token.
5. If provider credentials are available, `npm run deploy:edgeone` uploads the verified artifact without printing or persisting secrets.
6. `FOODMAP_MAINLAND_DEPLOY_URL=<stable-mainland-url> npm run verify:mainland:deployment` passes remotely.
7. Browser smoke opens `#/map`, refreshes the route, verifies missing-share fallback for `#/share/:snapshotId`, and sees manifest/service worker/static assets.
8. Mate70 opens the stable mainland URL and completes workspace entry, detail/filter, data package, read-only share fallback or valid imported share, refresh recovery, and release status visibility.
9. P18-P26 accepted regression boundaries remain green or have documented non-product environment blockers.
10. Final report states whether the URL is stable public access or protected preview; protected preview cannot close P27.

## Evidence Requirements

| Evidence | Required Content |
| --- | --- |
| Command log | `build:mainland`, `build:edgeone`, local verifier, dry-run deploy, remote verifier when URL exists |
| Browser evidence | Screenshot or trace for public URL `#/map`, route refresh, missing share fallback, manifest/service worker/static assets |
| Mate70 evidence | Real-device screenshot or recording using the stable public URL, not LAN/HDC/tunnel-only transport |
| PRD review | Explicit comparison to PRD local-first, mobile WebApp, mainland access, and non-goal boundaries |
| Security review | Confirmation that API tokens, cookies, SecretKey values, and preview query tokens are not committed or printed in reports |
| Final report | URL, provider, ICP/HTTPS status, command results, screenshots, blockers, residual limits, and acceptance decision |

## Go / No-Go

Go for P27 implementation only when this documentation set is reviewed and no fatal or major spec risk remains.

No-go conditions:

- The only working URL requires `eo_token`, console login, private preview access, local LAN, HDC reverse forwarding, or a temporary tunnel.
- The selected route requires paid services, domain purchase, ICP filing, or provider console changes that have not been approved by the user.
- Any document claims account/cloud/native/offline-map/permanent-share capability.
- Any doc, drawio file, screenshot metadata, or report includes API tokens, cookies, SecretKey values, or full protected-preview tokens.
