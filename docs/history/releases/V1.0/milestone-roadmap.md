# FoodMap V1.0 Milestone Roadmap

## M0: Documentation And Scheme 4 Freeze

Goal:

- Establish the V1.0 Scheme 4 design baseline before implementation.

Deliverables:

- Active docs and V1.0 snapshot docs.
- Product requirements document.
- Scheme 4 development plan.
- Figma prompts.
- Drawio gap diagram.
- Acceptance gate document.

Completion Conditions:

- All V1.0 documents exist and consistently describe pure frontend scope and the Scheme 4 travel journal direction.
- Drawio includes architecture, gap, plan, milestones, gates, and feature specification.

## M1: Project Foundation

Goal:

- Create a runnable frontend app with test tooling.

Deliverables:

- Vite + React + TypeScript project.
- Hash routes for workspace and share view.
- Base layout and design tokens.
- Vitest and Playwright setup.

Completion Conditions:

- App runs locally.
- Build and initial tests pass.
- `#/map` route renders the workspace shell.

## M2: Domain And IndexedDB Data Core

Goal:

- Make user records durable in the browser.

Deliverables:

- Domain types and validation.
- IndexedDB repositories for `places`, `layers`, `photos`, `snapshots`, and `meta`.
- Photo blob and thumbnail handling.
- Import/export codecs.
- First-run default layers.

Completion Conditions:

- CRUD works for layers and food places.
- Photos survive reload.
- Invalid imports fail safely.

## M3: Map Provider Layer

Goal:

- Deliver provider-independent map rendering and marker interaction.

Deliverables:

- Map provider adapter.
- AMap provider and Leaflet fallback.
- Marker rendering, layer visibility, selected place focus.
- Map click and marker click event flow.

Completion Conditions:

- User can create and manage places on the map.
- Marker interaction and layer toggles work.
- No-key fallback map is usable.

## M4: Personal Workspace UI

Goal:

- Deliver the full personal food journal map workspace.

Deliverables:

- Desktop workspace with left layer panel, top controls, map tools, detail drawer, editor modal, filters, photos, and import/export.
- Mobile workspace with top search, full-screen map, bottom action bar, bottom sheets, and full-screen editor.
- Place CRUD, layer visibility, search, filtering, rating, visit date, tags, notes, and photos.

Completion Conditions:

- User can create, edit, delete, view, and filter food places.
- User can upload at least two photos and see thumbnails.
- Desktop and mobile layouts are usable without incoherent overlap.

## M5: Local Share Experience

Goal:

- Provide a read-only local sharing workflow without a backend.

Deliverables:

- Share snapshot generation.
- `#/share/:snapshotId` read-only route.
- `.foodmap.json` export/import.

Completion Conditions:

- A generated snapshot opens as a read-only map.
- Export/import works across browser profiles.
- Editing controls are absent from share view.

## M6: Scheme 4 Visual Closure

Goal:

- Make the implemented UI match the travel journal design direction without harming usability.

Deliverables:

- Scheme 4 theme CSS.
- Desktop and mobile screenshots.
- Visual polish for paper cards, muted map, star ratings, layer markers, and restrained decoration.

Completion Conditions:

- Interface reads as warm travel journal rather than generic admin UI.
- Map remains the primary surface.
- User can identify search, add, filter, and layer controls quickly.

## M7: V1.0 Acceptance Closure

Goal:

- Prove V1.0 is complete and ready to use.

Deliverables:

- Passing build and tests.
- Desktop and mobile screenshots.
- Final acceptance report.

Completion Conditions:

- Every acceptance gate passes or has an explicit non-blocking waiver.
- No blocker remains in functionality, persistence, map rendering, share view, or responsive layout.

## Evidence Sources

Each milestone must reference the implementation-level documents below when development starts:

- Data and import/export evidence: `data-schema-and-import-export-contract.md`
- Domain and repository evidence: `repository-and-domain-api-contract.md`
- Map provider evidence: `map-provider-contract.md`
- Browser and final report evidence: `e2e-test-and-evidence-matrix.md`
- Visual and responsive evidence: `visual-acceptance-checklist.md`

Final milestone closure must produce `docs/V1.0/final-acceptance-report.md`.
