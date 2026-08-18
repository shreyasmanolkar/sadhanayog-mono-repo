#!/usr/bin/env node
/**
 * Compatibility wrapper. Canonical tracker lives at docs/issue-tracking/track.mjs.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const child = spawnSync(
  process.execPath,
  [join(root, "docs/issue-tracking/track.mjs"), ...process.argv.slice(2)],
  { stdio: "inherit" },
);
process.exit(child.status ?? 1);
