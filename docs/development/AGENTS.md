# AGENTS.md — Development

Stage 1 workspace rules. Product features are not implemented from this
directory.

- Canonical pins: [`tools/ci/tool-pins.json`](../../tools/ci/tool-pins.json).
  `mise.toml` installs Node, pnpm, Flutter, and Java. Do not silently float
  those, Dart, or Wrangler. Do not add a mise `dart` tool.
- [README.md](README.md) is the Stage 1 program and unsigned decision
  register. It does not approve the engineering foundation.
- Child issues [SY-0009](../issue-tracking/issues/SY-0009.md)–[SY-0017](../issue-tracking/issues/SY-0017.md)
  own the named artifacts. Do not close those issues from the epic.
- Health placeholder, empty Drizzle ledger, and empty client shells only.
  No product routes, tables, or screens.
- Local D1 / Wrangler only. No remote migrate, no production resources,
  no secret values in Git.
- Proposed Agent Notes are not authority. Only a human architectural
  reviewer moves high-impact notes into `implemented/`.
- Copy names from [`.env.example`](../../.env.example) and
  `apps/api/.dev.vars.example`. Values stay in ignored files.
