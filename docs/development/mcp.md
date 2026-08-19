# Project MCP and agent tools

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Authority: [engineering foundation](../architecture/engineering-foundation.md) §14, §19  
Named outcome of [SY-0015](../issue-tracking/issues/SY-0015.md)

This document is the reviewable MCP/tool configuration. It does not
implement product behavior. App shells, CI jobs, and bootstrap runbooks
belong to other Stage 1 issues.

Canonical check: `pnpm mcp:check`.

## Inventory

| Server | Transport | Default | Why | Permission |
|---|---|---|---|---|
| `context7` | HTTPS `https://mcp.context7.com/mcp` | enabled | Current package docs for Flutter, TanStack, Hono, Drizzle, and test libraries | Documentation queries only. Optional `CONTEXT7_API_KEY`. Codex allowlists `resolve-library-id` and `query-docs`. Prompts may name libraries, never source or secrets. |
| `cloudflare_docs` | HTTPS `https://docs.mcp.cloudflare.com/mcp` | enabled | Current D1/R2/Workers/Wrangler documentation | Public docs only. No account OAuth. The URL is the boundary — do not point this name at `mcp.cloudflare.com` or other Cloudflare product servers. |
| `playwright` | stdio `npx -y @playwright/mcp@0.0.79` | **disabled** | Inspect local/dev web UI, a11y/responsive flows, screenshots/traces | Specialized. Local web (`:5173`) and API (`:8787`) origins only. Isolated in-memory profile. Headless in the committed config. Headed mode needs a human. Downloads go to `/tmp/sadhanayog-playwright-mcp`. |

GitHub, platform logs, and database access are **not** MCP servers. Their
permissions are documented below so an agent does not invent a server.

## Declared files

| File | Role |
|---|---|
| [`.codex/config.toml`](../../.codex/config.toml) | Foundation §5 / §19 project declarations for Codex |
| [`.grok/config.toml`](../../.grok/config.toml) | Same inventory for Grok (Grok does not read Codex TOML) |
| [`tools/ci/mcp-inventory.json`](../../tools/ci/mcp-inventory.json) | Pins and expected names/URLs for `pnpm mcp:check` |
| [`.env.example`](../../.env.example) | `CONTEXT7_API_KEY` **name** only |

`.codex/config.toml` is the named Stage 1 artifact. `.grok/config.toml` is a
projection so this repository's Grok sessions load the same servers. Do not
let the two files drift. Do not add `.mcp.json`, Cursor, or Claude copies
until a human asks — more files are more drift.

## Secret references

- Commit names, never values. `CONTEXT7_API_KEY` is optional (higher Context7
  rate limits). Copy the name from `.env.example` into an ignored local file
  or the shell environment.
- Codex sends the token only when that variable is set
  (`bearer_token_env_var`).
- Grok's committed projection omits headers so an empty expansion cannot
  become `Bearer ` with no token. Add a local, uncommitted header if you use
  a key: `Authorization = "Bearer ${CONTEXT7_API_KEY}"`.
- Playwright has no secret. Do not pass `--storage-state` that points at a
  production cookie jar.

## GitHub, logs, and database (not MCP)

| Tool | Default permission | How to use | Do not |
|---|---|---|---|
| GitHub | Read-only metadata (`gh pr view`, checks, review comments) once a remote exists | Prefer the `gh` CLI. A GitHub MCP is not declared. Write, release, deploy, org, and secrets administration need a human and a separate narrow token that is not in Git. | Do not add a repository-search MCP. `rg`, language tools, and Git stay local. |
| Platform logs | Not available in Stage 1 | After observability exists: redacted development logs only. Production logs are restricted. | Do not add `observability.mcp.cloudflare.com`, Logpush, or audit-log MCP. Never paste raw tokens or PII. |
| D1 / R2 / SQLite | Local bindings and reviewed scripts | `pnpm db:generate`, `pnpm db:migrate:local`, Wrangler local. Remote/production commands are human-gated and separately credentialed. | Do not add a generic database, D1, or R2 MCP. |

## Forbidden servers

Do not declare any of:

- repository-search / generic filesystem MCP
- production D1 or R2 MCP
- a persistent browser profile or Playwright `--extension` against a daily driver
- shell-as-MCP
- Cloudflare account mutation (`https://mcp.cloudflare.com/mcp` and other
  product servers besides docs)
- a secrets manager
- Sentry (the product has not adopted Sentry)
- Figma (there is no design-source repository)

`pnpm mcp:check` rejects those names and Cloudflare account URLs, rejects
`@playwright/mcp@latest`, and rejects secret-like strings.

## Setup

1. Trust the repository so Codex will load `.codex/config.toml`.
2. Grok loads `.grok/config.toml` when this folder is trusted. Refresh `/mcps`.
3. Optionally export `CONTEXT7_API_KEY` from a password manager.
4. Leave Playwright disabled unless you are doing web/QA inspection. To enable
   it locally, set `enabled = true` in an **uncommitted** user overlay or flip
   the project key only for that session. Headed mode is a human decision.

No package is added to the workspace lockfile. Playwright is fetched by `npx`
at the pinned version when that server is enabled.

## Commands

| Command | Meaning |
|---|---|
| `pnpm mcp:check` | Parse the TOML files, compare them to `mcp-inventory.json`, run fixture cases |
| `pnpm verify` | Includes `mcp:check` |

There is no generated MCP artifact.

## Dependencies

- Context7 and Cloudflare docs are provider-managed HTTPS endpoints.
- Playwright is the official `@playwright/mcp` package, pinned in the
  inventory and both TOML files. Bump the pin in all three places together.
- No Sentry, Figma, GitHub, or database MCP packages.

## Environment matrix

| Host | MCP |
|---|---|
| Local Linux / macOS | Docs servers need outbound HTTPS. Playwright needs a browser only if enabled. |
| GitHub Actions | Does not start MCP servers. `pnpm mcp:check` is static. |
| Shared staging / production | None. Do not point Playwright at production. |

## Agent authority

Agents may read this inventory, enable Playwright **locally** for a review of
the empty web shell, and query Context7/Cloudflare **documentation**. They
must stop before adding a server, changing CI permissions, storing a token
in Git, enabling headed Playwright against a personal profile, or calling a
Cloudflare account API through MCP.

Proposed Agent Notes are not authority. The engineering foundation is still
a proposed document; this issue follows §19 and does not approve it.

## Unsigned decisions

1. **Engineering foundation** — still proposed. This issue implements §19; it
   does not sign the foundation.
2. **Grok projection** — `.grok/config.toml` is extra relative to the §5
   tree. Recorded in
   [`.agents/notes/proposed/process/2026-08-19-mcp-inventory.md`](../../.agents/notes/proposed/process/2026-08-19-mcp-inventory.md).
3. **Playwright default off** — specialized, as §19 requires. Enabling it in
   the committed files is a later review choice.
4. **No GitHub MCP** — `gh` is enough until a reviewer proves otherwise.
5. **No log or database MCP** — scripts only; observability has not landed.
6. **Context7 API key** — optional. No shared development secret store.
7. **Playwright 0.0.79** — current npm release on 2026-08-19. Not a floating
   `@latest`.
8. **Cloudflare docs tool allowlist** — omitted. The hosted tool names are
   not a stable published contract; the docs URL is the control.

## Layers this issue does not touch

- Database: None.
- API: None.
- Flutter: None.
- Web application code: None. Playwright may later inspect the empty shell
  on localhost only.
- Infrastructure: None. No production DNS, D1, R2, identity, or CI secrets.

## Troubleshooting

| Symptom | Check |
|---|---|
| Codex ignores project MCP | The project must be trusted. User `~/.codex/config.toml` can shadow servers with the same name. |
| Grok has no Context7 / Cloudflare docs | Confirm [`.grok/config.toml`](../../.grok/config.toml). In the TUI, `/mcps` then refresh. |
| `pnpm mcp:check` fails on Playwright | The pin must be `@playwright/mcp@0.0.79` in both TOML files and `mcp-inventory.json`. `@latest` is an error. |
| Context7 rate-limits | Set `CONTEXT7_API_KEY` locally. Do not commit it. |
| Playwright wants a real profile | Stop. Use `--isolated`. Do not pass a production `--storage-state` or `--extension`. |
