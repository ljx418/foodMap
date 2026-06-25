# FoodMap P19 Stage Implementation Contract

## 1. Binding Scope

P19 binds the current stage around acceptance reproducibility, current-viewport poster export, personal data health, domain/repository consolidation, responsive regression, and documentation governance.

P19 must preserve all accepted P18 boundaries:

- No backend, accounts, cloud sync, or permanent public share link.
- No automatic coordinate finalization.
- No external realtime POI search claim without configured provider key or Agent evidence.
- Agent cannot finalize coordinates, delete pending places, or hide uncertainty.

## 2. Required Workstreams

| Workstream | Required Result |
| --- | --- |
| W19-A 验收环境可复现 | Restore instructions and targeted Playwright gates are runnable or explicitly blocked with remediation |
| W19-B 当前视野分享图 | Poster composer uses real map bounds for `当前视野`, with matching preview/export counts |
| W19-C 个人数据健康中心 | Verified, pending, high-risk, manual-adjusted, skipped groups are visible with non-mutating next actions |
| W19-D Domain/Repository 收口 | Candidate confirmation, manual pin move, and pending status derive from shared domain paths |
| W19-E 多尺寸回归 | New flows remain usable across required mobile/tablet/narrow desktop viewports |
| W19-F 文档和治理 | PRD, architecture, plan, gates, roadmap, gap, drawio, test matrix, and final report stay aligned |

## 3. Current Viewport Poster Contract

Minimum behavior:

- `当前筛选` uses current filtered personal places.
- `当前视野` uses current filtered personal places intersected with current map bounds.
- Preview count, mode label, source set, and exported PNG must match.
- Empty viewport state must be explicit and must not silently export current-filter or all-place data.
- Reference layers remain excluded unless a future stage explicitly adds a reference-layer poster mode.

Minimum bounds shape:

```ts
interface MapViewportBounds {
  west: number;
  south: number;
  east: number;
  north: number;
  coordinateSystem?: "wgs84" | "gcj02";
}
```

Bounds rules:

- Bounds must come from the active map adapter or workspace map state, not from a hard-coded Wuhan extent.
- Personal places must be normalized to a comparable coordinate system before intersection.
- If bounds are unavailable, `当前视野` must stay disabled with an explanation.

Forbidden:

- Keeping `当前视野` enabled without real bounds.
- Exporting a different set than preview.
- Claiming current viewport support when only current filter is used.

## 4. Personal Data Health Contract

Minimum groups:

```text
verified
pending
high-risk
manual-adjusted
skipped
```

Rules:

- Groups are derived from `mapAccuracy`, system tags, location risk helpers, and audit fallback fields.
- A place may appear in more than one risk-oriented group if the UI explains that status clearly.
- Health actions may focus, filter, open detail, or open pending workbench.
- Health actions must not auto-change coordinates, delete records, or mark uncertain records verified.

Minimum derivation:

- `pending`: includes `mapAccuracy="approximate"`, `位置待确认`, and pending calibration helper matches.
- `high-risk`: includes `位置高风险` and coordinate-risk helper matches.
- `manual-adjusted`: includes `手动校准` or visible manual-move audit fallback in notes/tags.
- `skipped`: includes skipped confirmation tags or notes.
- `verified`: exact personal places that do not match pending, high-risk, or skipped conditions. Manual-adjusted exact places may also appear in `manual-adjusted`.

## 5. Domain/Repository Contract

P19 should align docs and code toward these stable responsibilities:

- Domain owns status derivation, candidate confirmation transforms, manual move transforms, and audit fallback.
- Repository owns persistence and prevents partial coordinate/audit writes where implementation needs a combined save path.
- UI owns presentation, explicit confirmation, and panel choreography.
- Agent owns structured read/assist commands and must call the same guarded domain path for any future write capability.

Current implementation may be staged, but any new location-changing code must not add another independent truth model.

## 6. Acceptance Environment Contract

P19 acceptance must document:

- `npm ci`
- `npm run build`
- `npm test -- --run`
- `npm run verify:scanlist`
- Playwright browser dependency setup or accepted alternate runner.
- Targeted P18 regression browser commands.
- New P19 targeted browser commands.

If browser dependencies fail on the current machine, final acceptance must record the exact missing dependency and severity before claiming stage status.

## 7. Exit Gates

P19 cannot exit if:

- Active docs still describe P18 as current unfinished scope.
- Drawio omits architecture gap, development plan, milestones, gates, or exit conditions.
- Current viewport poster mode is still disabled or does not use real bounds.
- Data health hides uncertainty or mutates facts.
- Agent can bypass confirmation.
- Required responsive viewports are not evidenced.
- P18 regression baseline is not rerun or explicitly blocked.
