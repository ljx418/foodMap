# FoodMap P20 Stage Implementation Contract

Date: 2026-06-23

Status: P20-C accepted; preserve as regression contract

## Binding Scope

P20-C is the current-stage contract for completing the original personal data governance and location maintenance efficiency PRD. It builds on accepted P19 and the implemented P20 core regression baseline, and must preserve all P18/P19 trust boundaries.

P20-C may implement:

- governance workbench from the P19 data health center;
- grouped issue queues for pending, high-risk, manual-adjusted, skipped, duplicate candidates, and import conflicts;
- stale-reference issue grouping;
- at least three safe batch previews for low-risk metadata actions;
- duplicate suggestion decisions: ignore, keep separate, and merge preview;
- `.foodmap.json` import conflict dry-run with strategy selection;
- governance action journal, history display, and local report export;
- Agent governance read/suggestion APIs with negative guardrails;
- responsive evidence for governance flows.

P20-C must not implement or claim:

- backend sync, account system, cloud governance, or permanent public links;
- automatic duplicate merge or delete;
- coordinate finalization without explicit confirmation;
- import writes before conflict preview and user strategy confirmation;
- external realtime POI search without provider key or Agent evidence;
- admin-dashboard replacement of the map-first workspace.
- full original P20 PRD completion before P20-C final acceptance evidence exists.

## Required User-Facing Contract

- The governance workbench must make data problems actionable without hiding the map-first context.
- Batch actions must include at least three low-risk operation types and show affected records before committing.
- Duplicate suggestions must show evidence and support ignore, keep separate, and merge decisions until confirmed.
- Import conflict preview must be cancelable without data mutation and must support strategy selection for new, update, duplicate, risk, and skipped classes.
- Maintenance history must be readable by users and tied to the affected place.
- Governance report export must match the same facts shown in the workbench and history.
- High-risk writes must remain explicit, reviewable, and auditable.

## Required Architecture Contract

- Issue reports, duplicate suggestions, import plans, stale-reference groups, and governance reports are derived domain read models.
- Write commits must flow through domain transforms and repository saves.
- Journal append must be part of the same logical write as the action it records.
- Agent may read and suggest, but cannot execute prohibited writes.
- Existing schema version 1 data must remain import/export compatible.

## Required Acceptance Contract

P20-C cannot exit until:

- `npm run build`, `npm test -- --run`, and `npm run verify:scanlist` pass;
- P19 current-viewport poster and data-health targeted tests pass;
- P20 core governance, duplicate, import conflict, journal, Agent negative, and responsive regression tests pass;
- P20-C targeted tests cover stale-reference, at least three batch actions, duplicate ignore/keep/merge, import strategy selection, report export, Agent negative, responsive paths, and cancel no-op paths;
- real data fixtures include the 50 verified scanlist baseline and local personal records with pending/high-risk/manual/skipped/stale-reference/duplicate/import-conflict cases;
- final report records command results, screenshot evidence, PRD/architecture deviation review, known issues, residual boundaries, and whether original P20 PRD completion is accepted.
