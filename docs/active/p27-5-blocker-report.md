# P27-5 Blocker Report

Status: `Blocked before acceptance`

## Blocking Condition

P27-5 cannot be closed in the current environment because EdgeOne deployment currently exposes only protected access, and the tokenless default domain does not pass public remote verification.

Public domain registration, ICP filing, DNS binding, and HTTPS certificate setup are intentionally bypassed for the current development run. They are external user-owned release prerequisites, not automatically executable product-code work.

The current blockers are:

- EdgeOne real deployment succeeded for project `foodmap`.
- The EdgeOne CLI returned a protected preview URL with token/time query parameters; this is not valid P27 public access evidence.
- The tokenless default domain `https://foodmap.edgeone.cool/` returns HTTP 401 during remote verification.
- `npm run smoke:p27:browser` still requires a stable public HTTPS URL before it can produce accepted browser evidence.
- Mate70 public-URL evidence cannot be produced without the stable public URL.
- Custom-domain registration/ICP/HTTPS evidence is not being pursued in this run.

## What Is Not A Valid Substitute

- GitHub Pages URL.
- LAN IP, local preview, or HDC reverse forwarding.
- EdgeOne protected preview URL containing login or token query parameters.
- Temporary tunnel.
- Desktop-only Playwright evidence.

## Required Next Evidence

1. Stable public HTTPS URL.
2. Remote `verify:mainland:deployment` pass without protected preview token.
3. P27 release verifier pass against the stable URL.
4. P27 browser smoke screenshots.
5. Mate70 real-device screenshots or recording from the same stable URL.
6. P27 final acceptance report.

## Current Development Bypass

Do not continue trying to close P27-5 through domain registration or ICP automation in this run. Continue only with non-public-domain development work listed in `p27-public-domain-blocker-and-next-development-outline.md`.

## Audit Conclusion

This is an external deployment closure blocker, not a product-code failure. P27 must remain not accepted until the required public-URL and Mate70 evidence exists.
