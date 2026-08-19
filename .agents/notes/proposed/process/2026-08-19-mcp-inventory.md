# Agent Note: Project MCP inventory

Status: proposed

## Problem

Agents need current library and Cloudflare documentation, and later a
constrained local browser, without receiving production data, account
mutation, or committed secrets.

## Proposal

Keep the project inventory in `.codex/config.toml` as foundation §19
requires. Enable Context7 and Cloudflare **docs** over HTTPS. Declare
Playwright pinned and disabled. Document GitHub (`gh`), logs, and D1/R2 as
non-MCP permissions. Project the same inventory to `.grok/config.toml`
because Grok does not load Codex TOML. Check the files with
`pnpm mcp:check`.

## Rationale

Provider-managed docs endpoints need no account OAuth. A disabled, pinned
Playwright server is reviewable without giving every agent a browser.
Preferring `gh` over a GitHub MCP keeps write/release tokens off the default
tool list. A Grok projection is the smallest way to make the inventory real
in this repository's current agent.

## Alternatives considered

- **Codex file only:** rejected as the sole runtime config; Grok sessions
  would not see the servers. The Codex file remains the named §5 artifact.
- **Also commit `.mcp.json` / Cursor / Claude copies:** rejected for now;
  three more files would drift. Add them only if a human uses those clients.
- **Enable Playwright for every agent:** rejected; §19 calls it specialized
  and headed mode needs approval.
- **GitHub or Cloudflare account MCP:** rejected; write and production blast
  radius are too high for a default tool.

## Affected components

`.codex/config.toml`, `.grok/config.toml`, `tools/ci/mcp-inventory.json`,
`tools/ci/check-mcp.mjs`, `docs/development/mcp.md`, `.env.example`.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
