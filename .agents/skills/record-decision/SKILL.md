---
name: record-decision
description: Create or transition an Agent Note / ADR. Use when making a durable architecture or process choice.
---

# record-decision

Follow `.agents/notes/README.md` and `.agents/notes/AGENTS.md`.

- Copy `.agents/notes/templates/<lifecycle>.md`.
- Start unbuilt work in `proposed/<class>/YYYY-MM-DD-<slug>.md` with the next
  `ID: ADR-NNNN`.
- Name at least two real alternatives, including status quo.
- Do not self-approve high-impact notes into `implemented/`.
- Run `pnpm docs:lint`. Regenerate the index with `pnpm decisions:index`.
