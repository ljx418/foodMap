# P27-5 Development And Acceptance Plan

## Scope

P27-5 is the real public-access and Mate70 evidence stage. It cannot be completed from local build artifacts, LAN URLs, HDC reverse forwarding, GitHub Pages, protected EdgeOne preview URLs, or temporary tunnels.

## PRD Acceptance Criteria

- A mainland user can open FoodMap from a stable public HTTPS URL without provider console login or expiring preview token.
- Mate70 opens the same stable URL and completes the accepted mobile WebApp smoke paths.
- Browser smoke captures deployed-origin evidence for `#/map`, refresh recovery, missing-share fallback, manifest, service worker, and static assets.
- The evidence must not claim account, cloud sync, backend, native HarmonyOS package, offline maps, or permanent public share links.

## Development Plan

1. Obtain or deploy to a stable public mainland HTTPS URL through the approved route.
2. Set `FOODMAP_MAINLAND_DEPLOY_URL=<stable-url>` only in the shell environment.
3. Run `npm run verify:mainland:deployment`.
4. Run `npm run verify:p27:release`.
5. Run `npm run smoke:p27:browser`.
6. Capture Mate70 screenshots or recording from the stable public URL.
7. Write the P27 final acceptance report only if all gates pass.

## Audit Opinion Before Development

P27-5 has a known external blocker in the current environment: no stable public HTTPS URL is available. Development must stop at this boundary unless the URL and required provider prerequisites are supplied.

## End-To-End Acceptance

P27-5 is accepted only when remote verifier, browser smoke, Mate70 real-device evidence, PRD review, and final report all pass against the same stable public URL.
