# FoodMap P25 Static Deployment Profile

Date: 2026-06-25

## Status

`Implemented primary route with gh-pages branch fallback.`

This document narrows P25 from a generic "stable static host" target to the implemented deployment profile. It does not prove P25 acceptance; final acceptance still requires Mate70 fixed-URL evidence.

## Decision

Primary route: GitHub Pages for the existing repository `ljx418/foodMap`.

Target public URL:

```text
https://ljx418.github.io/foodMap/
```

Hash route targets:

```text
https://ljx418.github.io/foodMap/#/map
https://ljx418.github.io/foodMap/#/share/:snapshotId
```

Implementation should prefer a GitHub Actions workflow that builds `dist/` from `main` and publishes it to GitHub Pages. If the available GitHub token cannot create or update workflow files, a versioned `gh-pages` branch source is an accepted fallback because it still produces a durable GitHub Pages URL under the same repository. Manual upload is acceptable only as temporary evidence and cannot be the final P25 durable profile unless the final report records why automation is unavailable.

## Required Code And Config Touchpoints

| Entity | Required P25 Role |
| --- | --- |
| `package.json` | Keep `npm run build`; add deployment verifier script only if needed |
| `vite.config.ts` | Support GitHub Pages subpath base `/foodMap/` without breaking local dev |
| `dist/` | Static artifact published to GitHub Pages |
| `.github/workflows/` | Add Pages build/deploy workflow if repository settings permit |
| `gh-pages` branch | Approved fallback source when workflow creation is blocked by token scope |
| `index.html` | Remains the static entry; hash routes must resolve after load |
| `public/manifest.webmanifest` | WebApp metadata must work under the deployed subpath |
| `public/sw.js` and `src/registerServiceWorker.ts` | Service worker scope and source-down fallback must not claim offline map tiles |
| `src/app/App.tsx` | `#/map` and `#/share/:snapshotId` remain the route contract |
| `e2e/workspace.spec.ts` or deployment verifier | Verify deployed URL and direct hash routes |
| `docs/active/evidence/p25/` | Store screenshots, command output summaries, and Mate70 evidence |

## Acceptance Commands

Minimum local gate before publishing:

```bash
npm ci
npm run build
npm test -- --run
npm run verify:scanlist
npm run verify:p24:webapp
```

Minimum deployed-origin gate after publishing:

```bash
curl -I https://ljx418.github.io/foodMap/
npm run verify:p25:deployment
```

`curl` can only verify the deployed origin and static files. URL fragments such as `#/map` and `#/share/:snapshotId` are not sent to the server, so hash-route acceptance must be performed by the browser gate.

Browser gate:

```bash
FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25"
```

The final implementation may use a dedicated script such as `npm run verify:p25:deployment`; if so, the script must check the same deployed-origin facts and write or summarize evidence for the final report.

## Mate70 Evidence

Mate70 must open the GitHub Pages URL directly, not through HDC reverse forwarding, local preview, or a temporary tunnel.

Required screenshots or recording segments:

1. Fixed URL opened on Mate70.
2. `#/map` workspace with map, search, quick filters, WebApp status, and bottom actions.
3. Created or imported personal place with detail visible.
4. `.foodmap.json` export/import path visible and local-first wording intact.
5. Valid `#/share/:snapshotId` route opened from the deployed origin.
6. Refresh/reopen proof that local data or snapshot remains readable.
7. Failure or fallback state proof for source-down, missing share, external map/copy fallback, or installability limitation.

## Fallback Routes

If GitHub Pages cannot be enabled or cannot provide a durable public URL in the user's repository/account, use the first viable fallback and document the reason in `p25-final-acceptance-report.md`.

| Route | When To Use | Pros | Cons |
| --- | --- | --- | --- |
| GitHub Pages | Default path for `ljx418/foodMap` | Fits existing GitHub repo, simple Actions deployment, stable URL under repo owner | Requires Pages setting/access; subpath base must be handled |
| Cloudflare Pages | GitHub Pages unavailable or blocked | Strong static hosting, easy Git integration, custom headers support | Requires Cloudflare project/account setup outside repo |
| Netlify | GitHub Pages and Cloudflare Pages unavailable | Simple drag-and-drop or Git deploy, fast static hosting | External service dependency; final URL may differ from repo identity |
| Self-hosted static server | Public hosts unavailable | Full control over host and headers | User must maintain server, TLS, uptime, and public reachability |

## Non-Goals

- No HarmonyOS native HAP or AppGallery package.
- No account, cloud sync, remote backup, collaboration, or permanent public share platform.
- No FoodMap business backend API.
- No offline map tiles.
- No claim that external realtime POI search is complete.
