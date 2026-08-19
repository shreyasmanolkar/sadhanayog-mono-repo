# Agent Note: Decision record paths and ADR IDs

ID: ADR-0009
Status: proposed

## Problem

Foundation §18.2 names decision files `proposed/ADR-NNNN-slug.md`. The notes
README and the five stack records already use
`<lifecycle>/<class>/YYYY-MM-DD-<topic>.md`. Agents must not silently pick.

## Proposal

Keep lifecycle/class/date-slug paths. Put a stable `ID: ADR-NNNN` inside each
note. Generate `docs/architecture/decisions.md` from the notes. Never reuse
an ID or a slug. Moving a note changes only its lifecycle directory.

## Rationale

Class folders match how notes are searched. Dates match git history. Numeric
IDs survive promotion. The index stays a view.

## Alternatives considered

- **Status quo (class/date-slug files, hand-maintained index, no `ID` field):**
  rejected; the index can drift and IDs are not in the record.
- **Foundation literal (`proposed/ADR-NNNN-slug.md`):** rejected for now
  because five records and the notes README already use class/date-slug, and
  promoting a note would rename the file.
- **Dual names (ID in the filename and a class folder):** rejected; two names
  to keep in sync.

## Impact

- **Security:** ID reuse could hide a rejected choice as if it were new.
  The validator forbids reuse. `.agents/notes/` stays CODEOWNERS-protected.
- **Operations:** `pnpm docs:lint` fails on schema or index drift.
  `pnpm decisions:index` regenerates the readable table.
- **Data:** none.

## Affected components

`.agents/notes`, `docs/architecture/decisions.md`, `tools/ci/lint-decisions.mjs`.

## Approvers

Human architectural reviewer. Not self-approved.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
