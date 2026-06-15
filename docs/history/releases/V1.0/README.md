# FoodMap V1.0 Active Design Docs

This directory contains the active design baseline for FoodMap V1.0. V1.0 is a pure frontend, local-first personal food journal map using Scheme 4: travel journal style, warm paper texture, map-first interaction, and low-friction record keeping.

## Current Version

- Active version: V1.0
- Current project state: documentation-first workspace with no application source code yet
- Implementation priority: documentation first, then frontend implementation
- Primary constraint: pure frontend first, no backend dependency in V1.0
- Product direction: Scheme 4 travel journal style, not a generic admin/map-marking tool

## Document Index

- [Target Architecture](./target-architecture.md)
- [Product Requirements Document](./product-requirements-document.md)
- [Development And Acceptance Plan](./development-and-acceptance-plan.md)
- [Scheme 4 Development Plan](./development-plan-scheme4.md)
- [Milestone Roadmap](./milestone-roadmap.md)
- [Acceptance Gate](./acceptance-gate.md)
- [Current vs Target Gap](./current-vs-target-gap.md)
- [Drawio Gap Diagram](./current-vs-target-gap.drawio)
- [Figma Prompts For Scheme 4](./figma-prompts-scheme4.md)
- [Data Schema And Import/Export Contract](./data-schema-and-import-export-contract.md)
- [Repository And Domain API Contract](./repository-and-domain-api-contract.md)
- [Map Provider Contract](./map-provider-contract.md)
- [E2E Test And Evidence Matrix](./e2e-test-and-evidence-matrix.md)
- [Visual Acceptance Checklist](./visual-acceptance-checklist.md)

## V1.0 Definition

V1.0 delivers a browser-local food journal map with two first-class experiences:

- Personal workspace: create, edit, filter, and manage food places, layers, photos, ratings, visit dates, tags, and notes.
- Local share view: generate a read-only snapshot in the same app and export/import `.foodmap.json` packages for cross-device viewing.

V1.0 does not include backend sync, accounts, team collaboration, or public permanent share links.

## Scheme 4 Product Rules

- The map is always the primary surface.
- The visual language is warm paper, muted map, paper cards, thin borders, light shadows, restrained decoration.
- Desktop uses a left layer panel, top search controls, central map, and right detail drawer.
- Mobile uses top search, full-screen map, bottom action bar, and bottom sheets.
- Share pages are strictly read-only and must not expose create, edit, delete, upload, or save controls.

## Audit Document Set

For implementation-readiness audit, review these 15 documents:

1. `docs/active/product-requirements-document.md`
2. `docs/active/target-architecture.md`
3. `docs/active/development-plan-scheme4.md`
4. `docs/active/development-and-acceptance-plan.md`
5. `docs/active/acceptance-gate.md`
6. `docs/active/current-vs-target-gap.md`
7. `docs/active/current-vs-target-gap.drawio`
8. `docs/active/figma-prompts-scheme4.md`
9. `docs/active/milestone-roadmap.md`
10. `docs/active/data-schema-and-import-export-contract.md`
11. `docs/active/repository-and-domain-api-contract.md`
12. `docs/active/map-provider-contract.md`
13. `docs/active/e2e-test-and-evidence-matrix.md`
14. `docs/active/visual-acceptance-checklist.md`
15. `docs/active/README.md`
