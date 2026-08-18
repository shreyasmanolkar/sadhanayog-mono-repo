# AGENTS.md — Web

Route guards are UX, never authorization. Same-origin `/api` only.

- Do not import `packages/db` or Worker internals.
- No `unsafe-inline` / `innerHTML` for user content.
- Feature folders own views; promote shared components only after reuse.

Validate: `pnpm --filter @sadhanayog/web test && pnpm --filter @sadhanayog/web typecheck`
