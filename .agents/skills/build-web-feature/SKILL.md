---
name: build-web-feature
description: Implement a TanStack web slice. Use when adding Vite routes, TanStack Query/Form UI, or Playwright coverage for the web app. Do not use for mobile UI, server authorization, or importing the database package.
---

# build-web-feature

Input: issue ID and the contract the page must call.

## Steps

1. Typed TanStack route, query, and form. Same-origin `/api` only.
2. Semantic UI. Cover loading, empty, error, permission, and success states.
3. Route guards are UX, never authorization.
4. Feature folders own views; promote shared components only after reuse.

## Stop

Do not import `packages/db` or Worker internals. No `unsafe-inline` / `innerHTML` for user content.

## Validate

`pnpm --filter @sadhanayog/web test` and `pnpm --filter @sadhanayog/web typecheck`. Add axe, keyboard, and Playwright when the issue requires them.

## Examples

- Match: "implement the TanStack web students page"; "add a Vite TanStack form and Playwright coverage".
- Do not match: "Flutter widget"; "R2 upload".

## References

- [`apps/web/AGENTS.md`](../../../apps/web/AGENTS.md)
- engineering-foundation.md §8
