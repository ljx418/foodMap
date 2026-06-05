# Stage P4 Development And Acceptance Plan

## Summary

P4 reduces friction in personal place input while preserving required-field validation and data safety.

## PRD And Architecture Mapping

- PRD: editing must be light; required fields are name, coordinates, layer, rating, visit date.
- Architecture: editor modal and domain validators remain the source of truth for saved records.

## Development Plan

- Keep required fields prominent.
- Keep coordinates lower priority unless map click prefilled them.
- Preserve dirty-close confirmation.
- Improve pending photo preview and field-level validation clarity if tests or screenshots reveal friction.

## Acceptance Plan

- Create a minimal place from map click.
- Verify missing required fields block save.
- Verify dirty close asks for confirmation.
- Verify photo names/previews before save and thumbnails after save.
- Run full build/unit/e2e.

## Audit Opinion

- Initial status: acceptable baseline, pending deeper screenshot review.
- Medium risk: photo preview before save is functional but may remain dense.

## Exit Condition

P4 exits when minimal save, dirty guard, and photo flow are proven by tests or screenshots.
