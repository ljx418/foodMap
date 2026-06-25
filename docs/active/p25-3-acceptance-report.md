# FoodMap P25-3 Acceptance Report

Date: 2026-06-25

## Result

`Accepted.`

The deployed GitHub Pages URL passed browser-based P25 acceptance. After HDC tooling was restored, Mate70 fixed-URL evidence also passed.

## PRD Review

PRD 4L requires Mate70 fixed URL evidence before P25 can exit. Desktop browser evidence supports implementation confidence but cannot replace the Mate70 evidence gate. This report now includes real Mate70 evidence from the stable GitHub Pages URL.

## Browser Evidence

| Scenario | Result | Evidence |
| --- | --- | --- |
| GitHub Pages workspace | Passed | `docs/active/evidence/p25/github-pages-workspace.png` |
| Valid readonly share | Passed | `docs/active/evidence/p25/github-pages-share.png` |
| Hash route refresh | Passed | `docs/active/evidence/p25/hash-route-refresh.png` |

## Mate70 Evidence

| Scenario | Result | Evidence |
| --- | --- | --- |
| Fixed URL workspace | Passed | `docs/active/evidence/p25/01-mate70-fixed-url-workspace.jpeg` |
| Create and save | Passed | `docs/active/evidence/p25/03-mate70-create-entry.jpeg`, `04-mate70-create-name.jpeg`, `06-mate70-create-save-visible.jpeg`, `07-mate70-after-save.jpeg` |
| Detail | Passed | `docs/active/evidence/p25/08-mate70-detail.jpeg` |
| Data package | Passed | `docs/active/evidence/p25/10-mate70-data-package.jpeg` |
| Valid read-only share | Passed | `docs/active/evidence/p25/12-mate70-snapshot-generated.jpeg`, `13-mate70-share-open.jpeg`, `14-mate70-share-detail.jpeg` |
| Refresh persistence | Passed | `docs/active/evidence/p25/15-mate70-share-refresh.jpeg` |

## Command

```bash
FOODMAP_DEPLOY_URL=https://ljx418.github.io/foodMap/ LD_LIBRARY_PATH=/mnt/c/workspace/foodmap/.tmp/playwright-libs/root/usr/lib/x86_64-linux-gnu npx playwright test e2e/workspace.spec.ts --project=desktop --grep "P25 deployed"
```

Result: `1 passed`.

## Device And Tooling

- `hdc.exe` version: `3.2.0c`.
- Tool signature: valid Huawei Technologies Co., Ltd. code-signing certificate.
- Device: `3AP0224B14092043`, USB connected.
- Model: `CLS-AL00`.
- API version: `23`.
