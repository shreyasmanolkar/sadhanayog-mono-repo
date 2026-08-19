#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".pnpm-store",
  "coverage",
  ".dart_tool",
  ".wrangler",
  ".vite",
  ".idea",
  ".flutter-plugins-dependencies",
]);
const SKIP_FILE = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|jar|lock|iml|sqlite3?)$/i;
const PATTERN = /BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY|AKIA[0-9A-Z]{16}/;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    let st;
    try {
      st = statSync(path);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(path, acc);
    else if (!SKIP_FILE.test(name) && st.size < 2_000_000) acc.push(path);
  }
  return acc;
}

const hits = [];
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (PATTERN.test(src)) hits.push(rel);
}

if (hits.length) {
  for (const hit of hits) console.error(hit);
  process.exit(1);
}
process.stdout.write("ok: no secret-like strings\n");
