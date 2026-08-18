# AGENTS.md — decision notes

Write or update a note when work alters behavior, architecture, a shared
contract, process, testing strategy, or an on-disk/wire/configuration format.

Do not write a note for formatting, typos, generated output, or mechanical
refactors.

Proposed notes are not authority. IDs/slugs are never reused.

## Transitions

| From | To | What changes |
|---|---|---|
| proposed | implemented | Rewrite Proposal into present-tense Decision. Add Consequences, Implementation, Verification. Human approval required for high-impact notes. |
| proposed | rejected | Move the file. Set `Status: rejected — <why>`. Do not rewrite the body. |
| implemented | archived | Move the file. Keep `Status: implemented`. Add `Archived: YYYY-MM-DD`. |

No other transitions. Do not reopen sealed history.
