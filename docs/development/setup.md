# Setup

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-20  
Issue: [SY-0017](../issue-tracking/issues/SY-0017.md)  
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

`pnpm bootstrap` runs [`tools/ci/bootstrap.sh`](../../tools/ci/bootstrap.sh): it
installs JS deps (frozen lockfile first), runs `pnpm toolchain:check`, and runs
`flutter pub get` when `flutter` is on `PATH`. It never writes `.dev.vars` or
seed data.

## Local environment templates

Copy names, never invent values in Git.

1. Root [`.env.example`](../../.env.example) — public local names (`SADHANAYOG_ENV`, origins). Optional local `.env` is gitignored and unused by the Stage 1 shells.
2. [`apps/api/.dev.vars.example`](../../apps/api/.dev.vars.example) → ignored `apps/api/.dev.vars` for Worker secrets. Leave secret names empty until an identity provider exists.

Wrangler already sets `SADHANAYOG_ENV=development` and `RELEASE=local` in [`apps/api/wrangler.jsonc`](../../apps/api/wrangler.jsonc). The local D1 binding is `DB` → `sadhanayog-dev` with placeholder id `local-dev-placeholder`. That id is not a Cloudflare resource.

## First verify

```bash
pnpm verify
```

This is the deterministic smoke: tracker lint/test, bootstrap artifact and
seed/reset guards, toolchain pins, MCP inventory, docs/decision lint, skill
lint/tests, secret scan, CI policy, import boundaries, licenses, format/lint,
typecheck, unit tests, web/api dry-run build, OpenAPI drift.

Flutter analyze/test/`build bundle` run only when `flutter` is on `PATH`.
CI installs the SDK via pinned `subosito/flutter-action` and runs those
commands on every pull request. See [ci.md](ci.md).

```bash
cd apps/mobile && flutter analyze && flutter test
```

Install the recommended VS Code extensions in
[`.vscode/extensions.json`](../../.vscode/extensions.json) so Prettier, ESLint,
EditorConfig, and Dart format-on-save match [style.md](style.md).

## Run the empty apps

```bash
pnpm db:seed:local -- --database sadhanayog-dev
pnpm dev
```

| Surface | URL / command |
|---|---|
| Web | http://127.0.0.1:5173 |
| API liveness | http://127.0.0.1:8787/health/live |
| API readiness | http://127.0.0.1:8787/health/ready |
| Flutter | `cd apps/mobile && flutter run --dart-define=SADHANAYOG_ENV=dev --dart-define=SADHANAYOG_API_ORIGIN=http://127.0.0.1:8787` |

Web proxies `/api`, `/health`, and `/auth` to the Worker. On the Android
emulator use `10.0.2.2:8787` instead of `127.0.0.1`.

Reset **only** the named local database, and type the name twice:

```bash
pnpm db:reset:local -- --database sadhanayog-dev --confirm sadhanayog-dev
```

The command refuses `--remote`, any name other than `sadhanayog-dev`, and
`SADHANAYOG_ENV=production`. See [commands.md](commands.md).

## Clean-checkout procedure

On a new Linux machine (or a mobile build host with Flutter):

```bash
git clone <this-repo>
cd sadhanayog-mono-repo
mise trust
mise install          # or install the pins by hand
pnpm bootstrap
pnpm verify
pnpm db:seed:local -- --database sadhanayog-dev
pnpm dev
```

On a host without Flutter, bootstrap skips `pub get` and `pnpm verify` still
covers the TypeScript graph. Record that skip; do not claim mobile bootstrap
succeeded.

Windows is not a first-class host. Use WSL2 with the Linux pins.

## Create an issue or an ADR

```bash
pnpm tracker new "Short title" project=stage-1 cycle=stage-1 template=task
pnpm tracker:lint
```

Decision records start in [`.agents/notes/proposed/`](../../.agents/notes/proposed/)
using the [record-decision](../../.agents/skills/record-decision/SKILL.md) skill.
Proposed notes are not authority. Validate with `pnpm docs:lint`.

Protected operations are listed in [agent-authority.md](agent-authority.md).
