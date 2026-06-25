# FoodMap P19/P20/P21/P22/P23 Visual Acceptance Checklist

Updated: 2026-06-25

## Summary

P19 preserves the accepted Scheme 4 travel-journal direction and P18 trust baseline. P20 extends that baseline with personal data governance. P21 extends release readiness with local read-only share and `.foodmap.json` portability. P22 improves interaction readability over those accepted flows. P23 corrects the remaining mobile/narrow-screen readability gaps and adds full PRD screenshot evidence. New UI must remain map-first, readable, local-first, and must not imply cloud or public sharing.

## Required Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--color-paper` | `#F6EBD6` | Page paper background |
| `--color-paper-light` | `#FFF8EA` | Cards and panels |
| `--color-ink` | `#3B2B1F` | Main text |
| `--color-muted` | `#8B7B68` | Secondary text |
| `--color-line` | `#D8C5A5` | Borders |
| `--color-primary` | `#C76A32` | Primary actions and key markers |
| `--color-olive` | `#6F7F47` | Natural/success accent |
| `--color-gold` | `#D99A2B` | Rating stars |
| `--color-danger` | `#B94A3A` | Destructive actions |

## P19 Visual Requirements

| Area | Requirement |
| --- | --- |
| Current viewport poster | Mode selector clearly distinguishes `当前筛选` and `当前视野`; source count and empty state are visible before export |
| Poster preview | Title, mode, count, tag summary, generated time, and export action fit without clipping |
| Data health center | Health groups are compact, readable, and action-oriented without looking like a generic admin table |
| Health risk display | Pending/high-risk/manual/skipped states remain visually explicit; uncertainty must not be hidden |
| Detail and pending flows | P18 candidate evidence, pin move audit, map fallback, and Agent suggestion states remain visually distinct |
| Map-first layout | New panels do not demote the map or permanently cover primary map controls |
| Responsive | 390x844, 430x932, 768x900, 1280x820 do not clip core buttons or text |

## P20 Visual Requirements

| Area | Requirement |
| --- | --- |
| Governance workbench | Issue groups, queue, progress, and next actions are scannable without demoting the map |
| Batch preview | Affected records are listed before commit; confirm/cancel hierarchy is clear |
| Duplicate comparison | Name, address, distance, tags, photos, rating, time, and retained/discarded fields are comparable without implying auto-merge |
| Import conflict preview | New/update/duplicate/risk/skipped/invalid groups are visible before write; cancel no-op is clear |
| Maintenance history | Journal entries read as audit history, not editable source facts |
| Agent boundary states | Agent suggestions look advisory; prohibited writes show structured refusal or disabled state |
| Responsive governance | 390x844, 430x932, 768x900, 1280x820 keep governance, duplicate compare, import preview, and history reachable |

## P21 Visual Requirements

| Area | Requirement |
| --- | --- |
| Snapshot generation | Local/read-only meaning, title, place count, layer count, thumbnail count, and generated time are visible before export/open |
| Export/import dialog | Export and import actions are clear; import errors are visible and do not look like success |
| Read-only share page | Share page displays title, snapshot time, layers, map pins, details, thumbnails, rating, visit date, tags, address, and notes |
| Read-only guard | No create, edit, delete, upload, save, account, cloud, or public-link controls are visible |
| Missing snapshot fallback | Copy explains the snapshot is local and requires importing the matching `.foodmap.json` |
| Clean profile path | Import success leads to the share route without showing workspace edit controls |
| Responsive portability | 390x844, 430x932, 768x900, 1280x820 keep export/import/share/fallback actions reachable |

## P22 Visual Requirements

| Area | Requirement |
| --- | --- |
| Standalone share shell | Desktop share page shows readonly notice, layer panel, map, and detail panel without editable workspace chrome |
| Mobile share navigation | Mobile share page provides clear 图层/清单/详情 navigation and does not hide the map permanently |
| Missing snapshot recovery | Missing snapshot page has a direct `.foodmap.json` import action and visible error copy |
| Wide workspace panels | Data health and governance panels are wide enough for Chinese text and action buttons |
| Compact mobile dock | Mobile top dock is short, opaque, and does not crowd bottom actions or map inspection |
| Intent labels | `数据包`, `分享图`, and `快照` visually read as different actions |

## P23 Visual Requirements

| Area | Requirement |
| --- | --- |
| Mobile share summary | Selecting a shared place on mobile first shows a compact summary; full detail requires an explicit action |
| Mobile share navigation | Bottom navigation remains reachable and must not cover the selected-place summary or full detail actions |
| 320px workspace | Search, quick filters, map surface, and bottom actions fit without critical overlap or unreadable labels |
| Health/governance readability | Tabs, queue rows, explanations, and action buttons wrap horizontally before turning into narrow vertical text |
| Full acceptance report | HTML report includes screenshots for workspace, import/export, personal map, detail, health, governance, poster, share, missing snapshot, invalid import, and mobile paths |
| False acceptance guard | Screenshots must match implemented UI and report must state residual limits instead of claiming unsupported cloud/backend/realtime POI features |

## Desktop Checklist

Viewports: `2048x768`, `1440x900`, `1280x820`.

- Map is the largest visible surface.
- Poster composer mode controls fit and cannot wrap into unreadable chips.
- Data health center can open without covering all map context.
- Governance workbench can open without turning the workspace into a full-screen admin table.
- Duplicate comparison and import conflict preview show evidence in aligned, readable sections.
- Detail drawer scrolls internally when content is long.
- Filter summary, health summary, and poster source count agree with visible state.
- Selected marker state remains stable during poster/health interactions.
- Text does not overflow buttons, chips, drawers, or cards.
- P22 health/governance right panels do not collapse into narrow unreadable strips.

## Tablet Checklist

Viewport: `768x900`.

- Map, detail, filter, health, and poster paths remain mutually understandable.
- Side panels do not overlap into an unusable stack.
- Poster preview and mode controls remain reachable.
- Health groups remain scannable and actions are tappable.
- Governance queue, duplicate compare, import preview, and history can be reached without panel stacking.

## Mobile Checklist

Viewports: `390x844`, `430x932`.

- Map remains the primary surface.
- Bottom action bar and bottom sheets do not overlap system-safe areas.
- Top filter dock remains compact and does not compete with the map as the primary surface.
- On 320px and 390px widths, quick filters remain tappable and do not hide the map as the primary surface.
- Poster composer can switch modes and show count/empty state.
- Data health center can open and navigate to a record without hidden controls.
- Governance workbench can preview a batch action and cancel without hidden controls.
- Duplicate comparison and import conflict preview use bottom sheet or full-screen modal patterns without clipping actions.
- Detail core actions, candidate search, manual move, map fallback, and share entry remain reachable.
- Long names, long tags, and long addresses wrap cleanly.

## Negative Checks

Reject visual implementation if any of these appear:

- Marketing landing page instead of map workspace.
- Generic admin dashboard feel.
- Social feed or ecommerce layout.
- Excessive stickers, stamps, tape, or photo collage.
- Dark cyber or glassmorphism visual direction.
- Mobile desktop sidebars.
- Public link, login, cloud sync, or collaboration UI.
- Current viewport mode that visually appears enabled but exports a different point set.
- Data health UI that hides or softens pending/high-risk/manual states.
- Governance UI that looks like a backend admin console.
- Batch action UI that writes without an obvious preview and confirmation step.
- Duplicate suggestion UI that visually implies automatic merge/delete.
- Import UI that appears to write before conflict preview.
- Share UI that implies a public permanent link or cloud share exists.
- Share page exposing workspace edit, delete, upload, save, account, or cloud controls.
- Import error that appears successful or hides whether data changed.

## Evidence

Save P19 visual evidence to:

```text
docs/active/evidence/p19/mobile-390-data-health.png
docs/active/evidence/p19/mobile-390-poster.png
docs/active/evidence/p19/mobile-430-data-health.png
docs/active/evidence/p19/mobile-430-poster.png
docs/active/evidence/p19/tablet-768-data-health.png
docs/active/evidence/p19/tablet-768-poster.png
docs/active/evidence/p19/desktop-1280-data-health.png
docs/active/evidence/p19/desktop-1280-poster.png
```

Historical P8-P18 visual evidence remains under `docs/history` or `docs/active/evidence/p16`, `docs/active/evidence/p17`, and `docs/active/evidence/p18`.

Save P20 visual evidence to:

```text
docs/active/evidence/p20/mobile-390-governance.png
docs/active/evidence/p20/mobile-430-duplicate-compare.png
docs/active/evidence/p20/tablet-768-import-conflict.png
docs/active/evidence/p20/tablet-768-history.png
docs/active/evidence/p20/desktop-1280-governance.png
docs/active/evidence/p20/desktop-1280-import-conflict.png
```

Save P21 visual evidence to:

```text
docs/active/evidence/p21/mobile-390-share-readonly.png
docs/active/evidence/p21/mobile-430-import-fallback.png
docs/active/evidence/p21/tablet-768-export-summary.png
docs/active/evidence/p21/tablet-768-clean-import.png
docs/active/evidence/p21/desktop-1280-share-readonly.png
docs/active/evidence/p21/desktop-1280-invalid-import.png
```

Save P22 visual evidence to:

```text
docs/active/evidence/p22/desktop-share-viewer.png
docs/active/evidence/p22/mobile-share-navigation.png
docs/active/evidence/p22/desktop-governance-readable.png
docs/active/evidence/p22/mobile-workspace-compact.png
```

Save P23 correction and full acceptance evidence to:

```text
docs/active/evidence/p23/mobile-share-summary-first.png
docs/active/evidence/p23/mobile-share-full-detail.png
docs/active/evidence/p23/mobile-320-quick-filters.png
docs/active/evidence/p23/desktop-health-governance-readable.png
docs/active/evidence/full-acceptance-2026-06-25/
```
