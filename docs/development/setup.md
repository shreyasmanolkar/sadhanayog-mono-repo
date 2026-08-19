# Setup

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Program: [Stage 1 — Repository and engineering foundation](README.md)

## Tools

Pins live in [`mise.toml`](../../mise.toml):

- Node 24.11.1
- pnpm 10.33.0
- Flutter 3.35.4
- Java 25.0.1 (Android toolchain)

```bash
mise install
pnpm bootstrap
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
