## Issue

- SY-

## Summary

## Verification

- [ ] `pnpm verify`
- [ ] Flutter analyze / test / `flutter build bundle` (if mobile touched, or relied on CI)
- [ ] Tracker updated in this commit
- [ ] Generated artifacts regenerated (`pnpm generated:check`)

## Security

- [ ] No secrets, `.dev.vars`, D1/R2 data, or signing files
- [ ] No repository secrets added to workflows; fork PRs still receive none
- [ ] Tenant/role impact considered (or N/A). Backend remains authorization.

## Protected paths

- [ ] CODEOWNERS paths (auth, contracts, migrations, Worker config, security docs, notes, `.github/`) have a human reviewer if touched

## Rollback
