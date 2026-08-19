# Generated files

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0017](../issue-tracking/issues/SY-0017.md)

| Artifact | Disposition | Check |
|---|---|---|
| `packages/contracts/openapi/openapi.json` | Committed. A contract change is a reviewable diff. | `pnpm generated:check` |
| `packages/*/dist`, `apps/web/dist`, `apps/api/dist` | Gitignored build output | Recreated by `pnpm build` |
| `apps/web/src/routeTree.gen.ts` | Gitignored. No file-based route tree yet. | Do not commit if a generator appears |
| Generated Dart client | Not present. Stage 4. | — |
| Local D1 / Wrangler persist (`apps/api/.wrangler/`, `*.sqlite`) | Gitignored | Never commit |
| `apps/api/.dev.vars`, root `.env` | Gitignored secrets | Names only in `*.example` |
| Mobile signing (`*.jks`, `*.keystore`, `*.p12`, `*.p8`, `*.mobileprovision`) | Gitignored | Human-controlled |
| `docs/issue-tracking/index.md`, `docs/issue-tracking/board.html` | Generated views of the markdown issues | `pnpm tracker:index` / `pnpm tracker:export` |
| MCP config (`.codex/config.toml`, `.grok/config.toml`) | Hand-written. Not generated. | `pnpm mcp:check` |

`pnpm generated:check` regenerates OpenAPI and fails if the committed file drifted. Do not hand-edit `openapi.json`.
