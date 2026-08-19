#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "Checking pinned tools..."
if command -v mise >/dev/null 2>&1; then
  if ! mise install; then
    echo "warning: mise install failed (trust mise.toml with \`mise trust\` if this is a new worktree). Continuing with tools on PATH." >&2
  fi
fi

corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
node tools/ci/check-tool-pins.mjs

if command -v flutter >/dev/null 2>&1; then
  (cd apps/mobile && flutter pub get)
else
  echo "flutter is not installed; skipping mobile bootstrap (pin is in tools/ci/tool-pins.json)"
fi

echo "Bootstrap complete. Next: pnpm verify && pnpm dev"
