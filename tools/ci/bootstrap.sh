#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "Checking pinned tools..."
if command -v mise >/dev/null 2>&1; then
  mise install
fi

node_version="$(node -v | sed 's/^v//')"
echo "node $node_version"
if [[ "$node_version" != 24.11.* ]]; then
  echo "warning: expected Node 24.11.x (see mise.toml)" >&2
fi

corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

if command -v flutter >/dev/null 2>&1; then
  (cd apps/mobile && flutter pub get)
else
  echo "flutter is not installed; skipping mobile bootstrap (pin is in mise.toml)"
fi

echo "Bootstrap complete. Next: pnpm verify && pnpm dev"
