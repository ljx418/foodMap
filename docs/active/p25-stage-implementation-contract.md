# FoodMap P25 Stage Implementation Contract

Date: 2026-06-25

## Binding Scope

P25 may implement only the work needed to make the accepted P24 WebApp available through a durable static deployment profile and to prove the result on Mate70.

## Required Product Boundary

FoodMap remains:

- Pure frontend.
- Local-first.
- Static-deployable.
- Browser-delivered.
- IndexedDB-backed for local user data.
- `.foodmap.json` based for cross-device portability.

P25 must not add or imply:

- Account login.
- Cloud sync or remote backup.
- Multiplayer collaboration.
- Public permanent share links.
- FoodMap business backend APIs.
- HarmonyOS native HAP packaging or AppGallery release.
- Offline map tiles.
- Automatic coordinate repair.
- Completed external realtime POI search.

## Required Architecture Targets

| Target | Required Entity |
| --- | --- |
| Static build | `npm run build`, `dist/`, Vite assets |
| Static host profile | Primary: GitHub Pages for `ljx418/foodMap` as defined by `p25-static-deployment-profile.md`; fallback: Cloudflare Pages, Netlify, or self-hosted static server only if GitHub Pages is blocked and the reason is documented |
| Deployment base | Vite deployment base supports `/foodMap/` on GitHub Pages without breaking local dev |
| Hash routes | `src/app/App.tsx`, `#/map`, `#/share/:snapshotId` |
| WebApp shell | `index.html`, `manifest.webmanifest`, `public/sw.js`, `src/registerServiceWorker.ts` |
| Local facts | IndexedDB repositories for places/layers/photos/snapshots/governance |
| Portability | import/export codec and `.foodmap.json` |
| Evidence | Playwright, HDC screenshots, `docs/active/evidence/p25/`, final report |

## Acceptance Rules

- Stable URL must be opened on Mate70; HDC reverse or quick tunnel alone is not enough.
- The primary stable URL target is `https://ljx418.github.io/foodMap/` unless the final report documents why GitHub Pages was not viable.
- `#/map` and a valid `#/share/:snapshotId` must both work from the stable URL.
- A personal place or imported package must survive refresh/reopen.
- Failure states must explain local-data safety and must not show cloud/data-loss wording.
- P18-P24 accepted regression gates must remain green.
- P25 cannot be marked accepted without `p25-final-acceptance-report.md`.
