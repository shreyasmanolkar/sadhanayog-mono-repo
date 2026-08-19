# Troubleshooting

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

| Symptom | Check |
|---|---|
| `pnpm verify` fails on tracker | `pnpm tracker:lint` |
| Board will not load | `pnpm tracker:board` serves http://localhost:4322; `pnpm tracker:export` writes `docs/issue-tracking/board.html` |
| Wrangler cannot find web assets | `pnpm --filter @sadhanayog/web build` first |
| Flutter commands missing | `mise install flutter` or skip locally; CI installs the SDK |
| `pnpm ci:policy` fails | Pins in `.github/workflows/ci.yml` must match `mise.toml`; Actions must be SHA-pinned; no `secrets.*` |
| `pnpm licenses:check` fails | New dependency license is outside the allowlist in `tools/ci/check-licenses.mjs`. Do not weaken the list to go green. |
| `pnpm secrets:scan` fails | Remove the matching PEM/token. `.example` files are skipped; real values are not. |
| GitHub Actions red, local green | Clean checkout: `pnpm install --frozen-lockfile` then `pnpm verify`. Do not rely on a dirty `node_modules`. |
| Health ready 503 | `SADHANAYOG_ENV` is unset in the Worker env |
