# Troubleshooting

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-20  
Issue: [SY-0017](../../issue-tracking/issues/SY-0017.md)

Local and bootstrap failures only. Production runbooks are Stage 15.

| Symptom | Check |
|---|---|
| `mise: command not found` | Install mise or install the [toolchain.md](../../development/toolchain.md) pins by hand. CI does not use mise; it uses `actions/setup-node` and `subosito/flutter-action`. |
| `mise install` refuses `mise.toml` | New worktree/clone: `mise trust`. Bootstrap continues with PATH tools and still runs `pnpm toolchain:check`. |
| Node / pnpm version warning | `mise install` or use Node 24.11.x and pnpm 10.33.x. Bootstrap warns; it does not hard-fail. |
| `engine-strict` / wrong Node | `node -v` must be `v24.11.1`; `pnpm -v` must be `10.33.0` |
| `pnpm install --frozen-lockfile` fails | The lockfile drifted. Do not `--force`. Recreate with `pnpm install` only in the issue that changed dependencies, then commit `pnpm-lock.yaml`. |
| `pnpm toolchain:check` fails | Compare the printed field to [`tools/ci/tool-pins.json`](../../../tools/ci/tool-pins.json). Run `mise install`. Do not add a mise `dart` tool. |
| `pnpm verify` fails on tracker | `pnpm tracker:lint` and read the first error. Relations must stay a DAG. |
| `pnpm bootstrap:check` fails | A template, gitignore exclusion, or CI permission line is missing. See [`tools/ci/check-bootstrap.mjs`](../../../tools/ci/check-bootstrap.mjs). |
| `pnpm lint` or format check fails | `pnpm format`; see [style.md](../../development/style.md) |
| `pnpm boundaries` or `licenses:check` fails | see [style.md](../../development/style.md); do not weaken the check |
| `pnpm skills:lint` or `pnpm skills:test` fails | See [agent-instructions.md](../../development/agent-instructions.md). Descriptions must include `Use when` / `Do not use`. |
| `pnpm mcp:check` fails | Compare `.codex/config.toml` and `.grok/config.toml` to [`tools/ci/mcp-inventory.json`](../../../tools/ci/mcp-inventory.json). Do not use `@playwright/mcp@latest`. See [mcp.md](../../development/mcp.md). |
| Agent has no Context7 / Cloudflare docs | Codex needs a trusted project. Grok loads [`.grok/config.toml`](../../../.grok/config.toml); refresh `/mcps`. |
| Board will not load | `pnpm tracker:board` serves http://localhost:4322; `pnpm tracker:export` writes `docs/issue-tracking/board.html`. |
| Wrangler cannot find web assets | `pnpm --filter @sadhanayog/web build` first. `apps/api` `wrangler.jsonc` serves `../web/dist`. |
| `pnpm dev` port already allocated | Something else owns `5173` or `8787`. Stop it, or wait; do not change the documented ports in a bootstrap issue. |
| Flutter commands missing | `mise install flutter` or skip locally; CI installs the SDK. Do not claim mobile bootstrap on a host without Flutter. |
| Android emulator cannot reach the API | Use `10.0.2.2:8787`, not `127.0.0.1`. |
| `db:reset:local` refused | Name `sadhanayog-dev` twice (`--database` and `--confirm`). `--remote` and any other name are refused on purpose. |
| `pnpm ci:policy` fails | Pins in `.github/workflows/ci.yml` must match `mise.toml`; Actions must be SHA-pinned; no `secrets.*` |
| `pnpm licenses:check` fails | New dependency license is outside the allowlist in `tools/ci/check-licenses.mjs`. Do not weaken the list to go green. |
| `pnpm secrets:scan` fails | Remove the matching PEM/token. `.example` files are skipped; real values are not. |
| Secret scan hit on a template | Keep real values out of `*.example`. Commented names are fine; `OIDC_CLIENT_SECRET=...` is not. |
| GitHub Actions red, local green | Clean checkout: `pnpm install --frozen-lockfile` then `pnpm verify`. Do not rely on a dirty `node_modules`. |
| Health ready 503 | `SADHANAYOG_ENV` is unset in the Worker env. Local `wrangler.jsonc` sets `development`. |
| OpenAPI drift | `pnpm --filter @sadhanayog/contracts build` and commit `packages/contracts/openapi/openapi.json`. |
| Local D1 looks dirty | `pnpm db:reset:local -- --database sadhanayog-dev --confirm sadhanayog-dev` then `pnpm db:seed:local -- --database sadhanayog-dev`. Deletes `apps/api/.wrangler/state` only. |
