# Troubleshooting

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

| Symptom | Check |
|---|---|
| `pnpm verify` fails on tracker | `pnpm tracker:lint` |
| Wrangler cannot find web assets | `pnpm --filter @sadhanayog/web build` first |
| Flutter commands missing | `mise install flutter` or skip locally; CI installs the SDK |
| Health ready 503 | `SADHANAYOG_ENV` is unset in the Worker env |
