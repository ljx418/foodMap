# FoodMap P18-4 Pre-Implementation Audit

Date: 2026-06-17

## Scope

P18-4 covers manual pin move audit preview. It must prevent accidental coordinate writes by showing old/new coordinates and requiring explicit confirmation before persistence.

## Development Plan

| Workstream | Planned Change | Acceptance |
| --- | --- | --- |
| W18-A coordinate/candidate calibration | Convert manual move from immediate save to preview-confirm-save | Map click/drag only creates pending preview; confirm persists |
| W18-B mobile/detail path | Keep move mode usable on desktop and mobile | Move banner shows selected place, old/new coordinates, cancel and confirm |
| W18-F acceptance governance | Preserve audit trail on confirmed save | Refresh keeps `mapAccuracy`, tags, and notes audit evidence |

## Pre-Implementation Finding

Current behavior saves immediately in `movePlaceManually` when a user clicks the map or drags a marker. This is a major P18-4 specification gap because accidental clicks can permanently change coordinates without preview.

## Audit Opinion

Status: `Go after required fix`.

This phase must not be accepted until manual pin move has an explicit preview and confirm step.

