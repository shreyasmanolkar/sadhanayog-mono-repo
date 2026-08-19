# AGENTS.md — decision notes

Write or update a note when work alters behavior, architecture, a shared
contract, process, testing strategy, or an on-disk/wire/configuration format.

Do not write a note for formatting, typos, generated output, or mechanical
refactors.

Proposed notes are not authority. IDs and slugs are never reused. Do not
hand-edit [docs/architecture/decisions.md](../../docs/architecture/decisions.md);
regenerate it.

## New note

1. Copy [templates/proposed.md](templates/proposed.md) to
   `proposed/<class>/YYYY-MM-DD-<slug>.md`.
2. Set `ID: ADR-NNNN` to max existing + 1, zero-padded. Never reuse.
3. Name at least two real alternatives, including status quo.
4. Fill **Impact** (security, operations, data) and **Approvers**.
5. Run `pnpm docs:lint`. High-impact notes stay `proposed` until a human
   moves them.

## Transitions

| From | To | What changes |
|---|---|---|
| proposed | implemented | Rewrite Proposal into present-tense Decision. Add Consequences, Implementation, Verification. Keep the same `ID` and filename. Human approval required for high-impact notes. |
| proposed | rejected | Move the file. Set `Status: rejected — <why>`. Do not rewrite the body. |
| implemented | archived | Move the file. Keep `Status: implemented`. Add `Archived: YYYY-MM-DD`, `Replacement:`, and `Content-SHA256:`. |

No other transitions. Do not reopen sealed history.

Foundation §18.2 names files `proposed/ADR-NNNN-slug.md`. This tree uses
class/date-slug paths plus an `ID:` field. See
[ADR-0006](proposed/process/2026-08-19-decision-record-paths.md). That note
is not authority until a human implements it.
