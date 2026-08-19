---
name: manage-release-incident
description: Release, rollback, or postmortem procedure. Use when preparing an RC, production release, production rollback, or a qualifying incident postmortem. Do not use for ordinary issue implementation, local verify failures, or autonomous production writes.
---

# manage-release-incident

Input: release/incident identifier, environment, and the runbook in play.

## Steps

1. Human gates for production and destructive steps. Capture timestamps, evidence, and remediations.
2. Follow [`docs/operations/runbooks`](../../../docs/operations/runbooks/README.md) and [`docs/postmortems`](../../../docs/postmortems/README.md).
3. Never run production writes autonomously.

## Stop

Production deploy, rollback, restore, and identity/DNS/CI permission changes require a human. Local test failures are not incidents.

## Validate

Runbook checklist, smoke evidence, release or postmortem links.

## Examples

- Match: "rollback the production release"; "write a postmortem after the qualifying incident".
- Do not match: "pnpm verify is red"; "implement SY-0014".

## References

- [`docs/operations/runbooks/README.md`](../../../docs/operations/runbooks/README.md)
- [`docs/postmortems/README.md`](../../../docs/postmortems/README.md)
- [`docs/deployment/README.md`](../../../docs/deployment/README.md)
- engineering-foundation.md §21, §25
