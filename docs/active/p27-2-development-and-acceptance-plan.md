# P27-2 Development And Acceptance Plan

## Scope

P27-2 classifies every available access route before any public-release claim is made. The goal is to make the current deployment state machine executable and auditable: local preview, LAN/HDC, GitHub Pages, EdgeOne protected preview, temporary tunnels, and stable mainland public HTTPS URL must be distinguishable.

## PRD Acceptance Criteria

- FoodMap remains a pure frontend, local-first WebApp.
- Mainland production acceptance requires a stable public HTTPS URL without login, expiring preview token, LAN routing, HDC reverse forwarding, temporary tunnel, or GitHub Pages dependency.
- Protected preview can be recorded as package or smoke evidence only; it cannot close P27.
- No API token, cookie, SecretKey, or protected-preview query token may be committed.

## Development Plan

1. Add a P27 release-gate verifier that classifies `FOODMAP_MAINLAND_DEPLOY_URL`.
2. Treat missing URL, invalid URL, non-HTTPS URL, local/LAN URL, GitHub Pages URL, and preview-token URL as blocked before final acceptance.
3. Write a structured manifest to `docs/active/evidence/p27/release-gate-manifest.json`.
4. Keep the verifier non-destructive and safe to run without provider credentials.

## Audit Opinion Before Development

No fatal or major specification risk remains for P27-2. The implementation surface is limited to verification scripts and evidence output. It does not change user data, map behavior, share semantics, Agent powers, or provider account state.

## End-To-End Acceptance

P27-2 is accepted when the release verifier can run locally, produce a manifest, and refuse to mark the stage accepted unless a stable public URL candidate exists.
