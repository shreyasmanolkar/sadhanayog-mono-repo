# Deployment

Status: living  
Owner: operations  
Last-reviewed: 2026-08-19

No production resources are created by this foundation. Local Wrangler
bindings use placeholder D1 IDs. Production deploy is Stage 17
([SY-0127](../issue-tracking/issues/SY-0127.md)).

## Environment matrix

| Environment | Purpose | Provisioned in Stage 1 |
|---|---|---|
| Local | mise + Wrangler local D1/R2-compatible bindings | Developer workstation only |
| CI | GitHub Actions `pnpm verify` and Flutter analyze/test | Workflow files exist; SY-0016 owns the job |
| Shared development | Protected non-local development | None. Unsigned whether it is needed. |
| Staging | Release-candidate only if justified (foundation §14) | None. |
| Production | Live studio | None. |

Names, quotas, and bindings for non-local environments are
[SY-0128](../issue-tracking/issues/SY-0128.md).
