# FoodMap P22 Preimplementation Audit

Date: 2026-06-24

## Scope Checked

- Original PRD map-first and mobile usability principles.
- Accepted P18 candidate/search/trust baseline.
- Accepted P19 current viewport poster and personal data health baseline.
- Accepted P20-C governance baseline.
- Accepted P21 local share and `.foodmap.json` portability baseline.
- Current automated screenshot report and human review that the interaction experience is poor.

## Findings

| Finding | Severity | Disposition |
| --- | --- | --- |
| Read-only share page reused workspace-like framing and did not expose enough standalone structure for layer/detail inspection | Major UX risk | Must fix in P22 |
| Missing snapshot route explained failure but did not offer direct package import recovery | Major UX risk | Must fix in P22 |
| Data health/governance desktop panels could be too narrow for action-heavy content | Major UX risk | Must fix in P22 |
| Mobile top dock could compete with map and bottom actions | Moderate UX risk | Must fix in P22 |
| Header labels `导入/导出/分享` were technically correct but ambiguous after poster/share/package split | Moderate UX risk | Rename to intent labels |
| P22 could be over-claimed as new sharing capability | Major spec risk | Explicitly forbidden; P22 is interaction refactor only |

## Closed Audit Conditions

- P22 has a dedicated development and acceptance plan.
- P22 does not modify accepted location confirmation boundaries.
- P22 does not introduce backend, account, cloud sync, or public link claims.
- P22 acceptance includes real browser E2E, not only screenshots.

## Decision

`Go for P22 implementation`.

No fatal or major unresolved specification risks remain before coding.
