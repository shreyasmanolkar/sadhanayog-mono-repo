# Environment matrix

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0017](../issue-tracking/issues/SY-0017.md)

Foundation §14. A shared development, staging, or production environment is an **unsigned** human decision. This stage creates none of those resources.

| Environment | Who runs it | Compute / data | Identity | Secrets |
|---|---|---|---|---|
| Local | Contributor or agent laptop | Wrangler on `:8787`, Vite on `:5173`, local D1 name `sadhanayog-dev`, Flutter against the empty shell. Optional Context7/Cloudflare-docs MCP. Playwright MCP is declared disabled. | None | Ignored `apps/api/.dev.vars`. Public names in [`.env.example`](../../.env.example). Optional `CONTEXT7_API_KEY` is a name only. |
| CI (GitHub Actions) | `.github/workflows/ci.yml` on pull requests and `main` | `pnpm verify` plus `flutter analyze` / `flutter test`. No D1 or R2 bindings | None | Workflow `permissions: contents: read`. No `secrets:` keys. Fork PRs therefore receive none |
| Shared development | Not created | — | — | — |
| Staging | Not created | — | — | — |
| Production | Not created | — | — | — |

Local Wrangler `database_id` is the placeholder `local-dev-placeholder`. It is not a Cloudflare D1 UUID and must not be used as a production identifier.

Mobile flavors `dev` / `prod` are not configured. Bundle ids, OAuth callbacks, and signing stay unset until a later issue names them.
