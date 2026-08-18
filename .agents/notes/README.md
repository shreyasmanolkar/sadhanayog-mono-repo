# Agent Notes

An Agent Note records a decision — the why and what we gave up.

Path: `.agents/notes/<lifecycle>/<class>/YYYY-MM-DD-<topic>.md`

- `proposed/` — not current authority
- `implemented/` — shipped
- `rejected/` — frozen permanently
- `archived/` — former implemented note, frozen

Classes: `feature`, `bug-fix`, `simplification`, `architecture`, `process`, `testing`.

See [AGENTS.md](AGENTS.md) for transitions. Only a human architectural
reviewer moves high-impact records into `implemented/`.
