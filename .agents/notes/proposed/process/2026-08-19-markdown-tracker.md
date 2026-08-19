# Agent Note: Markdown issue tracker

ID: ADR-0005
Status: proposed

## Problem

Work, code, and agents need a dependency DAG that lives with the repository.

## Proposal

Store one Markdown file per issue under `docs/issue-tracking/issues`, validate
with `tools/tracker/track.mjs`, and seed from the roadmap manifest.

## Rationale

Issues evolve with code. Agents can lint the DAG without an external token.

## Alternatives considered

- **Status quo (roadmap prose only):** rejected; agents would re-interpret
  sequencing every session.
- **GitHub Issues only:** rejected as the source of truth; weaker local DAG
  and poorer code co-evolution. An outward sync remains possible later.
- **Custom web board as the database:** rejected; too much product for three
  users. The in-repo board is a view.

## Impact

- **Security:** no tracker API token in agent context. Issue files must not
  contain secrets or raw user data.
- **Operations:** `pnpm tracker:lint` is part of `pnpm verify`.
- **Data:** markdown files are the database; the board is not.

## Affected components

`docs/issue-tracking`, `tools/tracker`, CI.

## Approvers

Human architectural reviewer. Not self-approved.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
