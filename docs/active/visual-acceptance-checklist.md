# FoodMap V1.0 Visual Acceptance Checklist

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

Viewport: `1440x900`.

- Map is the largest visible surface.
- Left layer panel does not cover top search or right detail.
- Right detail drawer is `360-400px` when open.
- Detail drawer scrolls internally when content is long.
- Search, add, filter, and layer controls are visible within 3 seconds.
- Selected marker has a clear focus ring.
- Decoration is limited to one subtle paper/tape/stamp element in the main view.
- Text does not overflow buttons, chips, drawers, or cards.

## Mobile Checklist

Viewport: `390x844`.

- Map remains the primary surface.
- Top search does not cover critical markers.
- Bottom action bar has four primary entries: 图层, 筛选, 清单, 新增.
- Details, layer, and filter panels use bottom sheets.
- Bottom sheet controls remain tappable and do not overlap system-safe areas.
- Full-screen editor fields are large enough for touch.
- Import/export is not forced into the main bottom action bar.

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

Save visual evidence to:

```text
docs/V1.0/evidence/desktop-1440x900.png
docs/V1.0/evidence/mobile-390x844.png
docs/V1.0/evidence/share-desktop-1440x900.png
```

