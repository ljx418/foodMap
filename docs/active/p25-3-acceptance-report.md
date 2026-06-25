# FoodMap P25-3 Acceptance Report

Date: 2026-06-25

## Result

`Partially accepted for browser evidence; Mate70 real-device evidence blocked.`

The deployed GitHub Pages URL passed browser-based P25 acceptance. Mate70 fixed-URL evidence could not be captured automatically because neither `hdc` nor `hdc.exe` is available in the current shell PATH.

## PRD Review

PRD 4L requires Mate70 fixed URL evidence before P25 can exit. Desktop browser evidence supports implementation confidence but cannot replace the Mate70 evidence gate.

## Browser Evidence

| Scenario | Result | Evidence |
| --- | --- | --- |
| GitHub Pages workspace | Passed | `docs/active/evidence/p25/github-pages-workspace.png` |
| Valid readonly share | Passed | `docs/active/evidence/p25/github-pages-share.png` |
| Hash route refresh | Passed | `docs/active/evidence/p25/hash-route-refresh.png` |

## Command

```bash
FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25 deployed"
```

Result: `1 passed`.

## Blocker

`hdc` and `hdc.exe` were not found. P25 cannot be marked accepted until Mate70 opens `https://ljx418.github.io/foodMap/` directly and the required screenshots or recording are captured.
