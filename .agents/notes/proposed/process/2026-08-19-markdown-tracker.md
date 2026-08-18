# Agent Note: Markdown issue tracker

Status: proposed

## Problem

Work, code, and agents need a dependency DAG that lives with the repository.

## Proposal

Store one Markdown file per issue under `docs/issue-tracking/issues`, validate
with `tools/tracker/track.mjs`, and seed from the roadmap manifest.

## Rationale

Issues evolve with code. Agents can lint the DAG without an external token.

## Alternatives considered

- **GitHub Issues only:** rejected as the source of truth; weaker local DAG
  and poorer code co-evolution. An outward sync remains possible later.
- **Custom web board:** rejected; too much product for three users.

## Affected components

`docs/issue-tracking`, `tools/tracker`, CI.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
