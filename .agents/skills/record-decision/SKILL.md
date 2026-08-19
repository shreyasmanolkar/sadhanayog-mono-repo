---
name: record-decision
description: Create or transition an Agent Note ADR. Use when making a durable architecture, process, contract, or testing-strategy choice, including proposed notes and implemented/rejected/archived transitions. Do not use for formatting, typos, generated output, mechanical refactors, or ordinary issue implementation.
---

# record-decision

Input: the decision, impact, and target lifecycle (`proposed`, `implemented`, `rejected`, `archived`).

## Steps

1. Read [`.agents/notes/README.md`](../../notes/README.md) and [`.agents/notes/AGENTS.md`](../../notes/AGENTS.md).
2. Copy `.agents/notes/templates/<lifecycle>.md`. Start unbuilt work in `proposed/<class>/YYYY-MM-DD-<slug>.md` with the next `ID: ADR-NNNN`.
3. Name at least two real alternatives, including status quo.
4. Transition only along the allowed table. Do not self-approve high-impact notes into `implemented/`.
5. Do not hand-edit [`docs/architecture/decisions.md`](../../../docs/architecture/decisions.md). Regenerate with `pnpm decisions:index`.

## Stop

High-impact `proposed` → `implemented` needs a human architectural reviewer. Do not reuse IDs or slugs. Proposed notes are not authority.

## Validate

`pnpm docs:lint` and `pnpm decisions:index`.

## Examples

- Match: "create an Agent Note ADR for the Vite SPA choice"; "move a proposed decision into implemented notes".
- Do not match: "implement SY-0014"; "add a Drizzle migration".

## References

- [`.agents/notes/AGENTS.md`](../../notes/AGENTS.md)
- [`docs/architecture/decisions.md`](../../../docs/architecture/decisions.md)
- engineering-foundation.md §18.2
