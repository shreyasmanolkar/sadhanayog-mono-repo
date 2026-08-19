# Setup

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Program: [Stage 1 — Repository and engineering foundation](README.md)

## Tools

Pins and the environment matrix live in [toolchain.md](toolchain.md).
Canonical versions: [`tools/ci/tool-pins.json`](../../tools/ci/tool-pins.json).

```bash
mise trust          # first clone or new git worktree
mise install
pnpm bootstrap
pnpm toolchain:check
```

Copy [`.env.example`](../../.env.example) names into ignored local files.
Worker secrets go in `apps/api/.dev.vars` from
`apps/api/.dev.vars.example`. Never commit values.

## First verify

```bash
pnpm verify
```

Flutter analyze/test run only when `flutter` is on `PATH`. CI installs the
SDK via `subosito/flutter-action`.
