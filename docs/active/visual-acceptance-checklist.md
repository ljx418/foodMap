# FoodMap P17 Visual Acceptance Checklist

Updated: 2026-06-15

Historical H2/P8-P14 screenshots are archived under `docs/history/p8-p14/evidence/p8-p14/`. P17 visual acceptance focuses on pending-place confirmation, detail-page information architecture, mobile main path, stable pin visuals, compact filters, and share-poster polish.

## Summary

This checklist makes the Scheme 4 travel journal visual direction testable. Visual polish is accepted only when the app remains map-first, readable, and efficient.

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

## Desktop Checklist

Viewports: `2048x768`, `1440x900`, `1280x820`.

- Map is the largest visible surface.
- Left layer panel does not cover top search or right detail.
- Right detail drawer remains fully visible; compact desktop may use narrower width if content remains readable.
- Detail drawer scrolls internally when content is long.
- Search, add, filter, and layer controls are visible within 3 seconds.
- Selected marker has stable color/outline state without flicker.
- Decoration is limited to one subtle paper/tape/stamp element in the main view.
- Text does not overflow buttons, chips, drawers, or cards.
- Homepage filter dock never shows half buttons or clipped action text.
- Pending workbench cards show status, candidate, and action hierarchy without becoming an admin table.

## Mobile Checklist

Viewports: `390x844`, `430x932`.

- Map remains the primary surface.
- Top search does not cover critical markers.
- Bottom action bar has four primary entries: 图层, 筛选, 清单, 新增.
- Details, layer, and filter panels use bottom sheets.
- Bottom sheet controls remain tappable and do not overlap system-safe areas.
- Full-screen editor fields are large enough for touch.
- Import/export is not forced into the main bottom action bar.
- Detail, pending workbench, and pin-move confirmation controls remain reachable with one-handed scrolling.
- Map does not scroll behind the detail sheet into blank space.

## P16 Flow Checklist

- Empty personal map is visually distinct from the optional scanlist reference layer.
- Candidate cards are compact but readable: name, address, source, confidence, distance, and reasons do not wrap into an unusable block.
- Candidate selection has a visible selected state and does not imply the place has already been saved.
- Location permission denied/fallback copy is visible without alarming the user or blocking the editor.
- External map handoff appears in the saved place detail, not in the unsaved candidate list.
- Copy fallback is visible when coordinates are missing or link generation is disabled.
- Poster export preview/action reflects the current filter and does not suggest hidden scanlist pins are personal places.
- Mobile candidate list, detail drawer, filter sheet, and export flow remain mutually exclusive; no bottom bar or status bar persists over modal flows.

## P17 Flow Checklist

- Pending count is visible and opens a focused workbench, not an ambiguous layer panel.
- Pending/high-risk locations are visually distinct from verified personal places.
- Detail page prioritizes status, editable tags, core actions, photos, rating/time/address, calibration and notes in that order.
- Tag chips support readable add/remove affordances and do not wrap into unusable columns.
- Rating stars reflect normalized five-star value; raw percent score is shown as supporting information when available.
- Manual pin move mode clearly indicates active state, cancel, and confirm.
- External map/navigation is disabled or downgraded when the coordinate is not trustworthy.
- Pin selected state uses color/outline only; no flash, shadow jump, or temporary wrong color.
- Filter dock uses high-frequency switches and hides/relocates low-frequency actions before clipping.
- Share-poster preview uses the current filtered places and shows title, count, tag summary and generated time.
- Real-data visual review includes scanlist, reference layer, personal favorites and pending places together.

## Share View Checklist

- Share page includes local read-only copy.
- Share page is visually quieter than workspace.
- It includes map, title, snapshot time, layers, and details.
- It excludes create, edit, delete, upload, and save controls.

## Negative Checks

Reject visual implementation if any of these appear:

- Marketing landing page instead of map workspace.
- Generic admin dashboard feel.
- Social feed or ecommerce layout.
- Excessive stickers, stamps, tape, or photo collage.
- Dark cyber or glassmorphism visual direction.
- Mobile desktop sidebars.
- Public link, login, cloud sync, or collaboration UI.

## Evidence

Save P16 visual evidence to:

```text
docs/active/evidence/p16/desktop-1440x900-workspace.png
docs/active/evidence/p16/desktop-1440x900-place-editor-candidates.png
docs/active/evidence/p16/desktop-1440x900-place-detail-map-link.png
docs/active/evidence/p16/desktop-1440x900-poster-export.png
docs/active/evidence/p16/mobile-390x844-workspace.png
docs/active/evidence/p16/mobile-390x844-place-editor-candidates.png
docs/active/evidence/p16/mobile-390x844-place-detail-map-link.png
docs/active/evidence/p16/mobile-390x844-poster-export.png
```

Save P17 visual evidence to:

```text
docs/active/evidence/p17/desktop-2048x768-filter-dock.png
docs/active/evidence/p17/desktop-1440x900-pending-workbench.png
docs/active/evidence/p17/desktop-1280x900-place-detail.png
docs/active/evidence/p17/mobile-390x844-main-path.png
docs/active/evidence/p17/mobile-430x932-pin-move.png
docs/active/evidence/p17/tablet-768x900-filter-and-detail.png
docs/active/evidence/p17/desktop-1440x900-share-poster-preview.png
```

Historical P8-P14 visual evidence is archived under `docs/history/p8-p14/evidence/p8-p14/`.
