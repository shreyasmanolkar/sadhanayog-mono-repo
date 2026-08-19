# Troubleshooting

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-20

| Symptom | Check |
|---|---|
| `pnpm verify` fails on tracker | `pnpm tracker:lint` |
| `pnpm toolchain:check` fails | Compare the printed field to [`tools/ci/tool-pins.json`](../../../tools/ci/tool-pins.json). Run `mise install`. Do not add a mise `dart` tool. |
| `mise install` refuses `mise.toml` | New worktree/clone: `mise trust`. Bootstrap continues with PATH tools and still runs `pnpm toolchain:check`. |
| `engine-strict` / wrong Node | `node -v` must be `v24.11.1`; `pnpm -v` must be `10.33.0` |
| `pnpm lint` or format check fails | `pnpm format`; see [style.md](../../development/style.md) |
| `pnpm boundaries` or `licenses:check` fails | see [style.md](../../development/style.md); do not weaken the check |
| `pnpm skills:lint` or `pnpm skills:test` fails | See [agent-instructions.md](../../development/agent-instructions.md). Descriptions must include `Use when` / `Do not use`. |
| `pnpm mcp:check` fails | Compare `.codex/config.toml` and `.grok/config.toml` to [`tools/ci/mcp-inventory.json`](../../../tools/ci/mcp-inventory.json). Do not use `@playwright/mcp@latest`. See [mcp.md](../../development/mcp.md). |
| Agent has no Context7 / Cloudflare docs | Codex needs a trusted project. Grok loads [`.grok/config.toml`](../../../.grok/config.toml); refresh `/mcps`. |
| Board will not load | `pnpm tracker:board` serves http://localhost:4322; `pnpm tracker:export` writes `docs/issue-tracking/board.html` |
| Wrangler cannot find web assets | `pnpm --filter @sadhanayog/web build` first |
| Flutter commands missing | `mise install flutter` or skip locally; CI installs the SDK |
| Health ready 503 | `SADHANAYOG_ENV` is unset in the Worker env |
