# Sadhana Yog Command Center

Private operations desk for a small yoga teaching studio: classes, attendance,
students, invoices, work, and the Teaching Archive. This repository is a
modular monolith — one Cloudflare Worker, one D1 database per environment, one
web app, one Flutter app.

Status: engineering foundation. No product features have been migrated yet.

## Quick start

```bash
# 1. Install pinned tools (Node, pnpm, Flutter when available)
mise install   # or follow docs/development/setup.md

# 2. Install JS dependencies, check pins, verify
pnpm bootstrap
pnpm toolchain:check
pnpm verify

# 3. Run API + web
pnpm dev
```

- Web: http://127.0.0.1:5173
- API liveness: http://127.0.0.1:8787/health/live

Flutter is pinned in `mise.toml` and lives in `apps/mobile`. Setup, commands,
generated files, environment matrix, and agent authority live in
[docs/development](docs/development/README.md).

CI is GitHub Actions: docs/tracker/secret scan, TypeScript lint/test/build,
Flutter analyze/test/bundle, and license policy. See
[docs/development/ci.md](docs/development/ci.md).

## Layout

| Path | Role |
|---|---|
| `apps/api` | Cloudflare Worker (Hono). Serves `/api/v1` and the web build. |
| `apps/web` | React + Vite + TanStack shell. |
| `apps/mobile` | Flutter iOS/Android shell. |
| `packages/contracts` | Zod wire schemas and committed OpenAPI 3.1. |
| `packages/db` | Drizzle SQLite/D1 schema. No product tables yet. |
| `packages/config` | Shared TypeScript, ESLint, and Vitest config. |
| `docs/development/style.md` | Format, lint, boundaries, commits, generated files, licenses. |
| `content/teaching-archive` | Versioned learning content (empty until Stage 11). |
| `docs/issue-tracking` | In-repo issue tracker and board. |
| `docs/` | Architecture, product, operations, issues. |
| `docs/development/toolchain.md` | Pinned tools, lockfiles, environment matrix. |
| `.agents/` | Instructions, skills, decision notes. |

## Support

This is a private tool for 2–3 operators. There is no public signup. Security,
authorization, and money stay on the server. See [AGENTS.md](AGENTS.md) and
[docs/README.md](docs/README.md).
