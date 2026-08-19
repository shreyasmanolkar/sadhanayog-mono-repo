#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "Checking pinned tools..."
if command -v mise >/dev/null 2>&1; then
  if ! mise install; then
    echo "warning: mise install failed (trust mise.toml with \`mise trust\` if this is a new worktree). Continuing with tools on PATH." >&2
  fi
fi

if command -v pnpm >/dev/null 2>&1; then
  pnpm_version="$(pnpm -v)"
  echo "pnpm $pnpm_version"
  if [[ "$pnpm_version" != 10.33.* ]]; then
    echo "warning: expected pnpm 10.33.x (see mise.toml)" >&2
  fi
fi

corepack enable >/dev/null 2>&1 || true
if ! pnpm install --frozen-lockfile; then
  echo "warning: frozen lockfile install failed; retrying unlocked (review pnpm-lock.yaml)" >&2
  pnpm install
fi
node tools/ci/check-tool-pins.mjs

if command -v flutter >/dev/null 2>&1; then
  echo "flutter $(flutter --version | head -n1)"
  (cd apps/mobile && flutter pub get)
else
  echo "flutter is not installed; skipping mobile bootstrap (pin is in tools/ci/tool-pins.json)"
fi

echo "Bootstrap complete. This script does not copy secrets or create .dev.vars."
echo "Next:"
echo "  1. Copy names from .env.example; copy apps/api/.dev.vars.example to apps/api/.dev.vars"
echo "  2. pnpm verify"
echo "  3. pnpm db:seed:local -- --database sadhanayog-dev"
echo "  4. pnpm dev"
