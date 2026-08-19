#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SKIP_DIRS = new Set([
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
  ".grok",
]);

export const SKIP_FILE = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|eot|jar|lock|iml|sqlite3?)$/i;

// Contiguous credential-like strings only. Do not scan for the words "secret"
// or "BEGIN PRIVATE KEY" split across quotes in this file.
export const SECRET_PATTERN =
  /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}|gho_[A-Za-z0-9]{36}/;

export function shouldSkipFile(name) {
  if (SKIP_FILE.test(name)) return true;
  if (name.endsWith(".example")) return true;
  if (name.endsWith("-lock.yaml") || name.endsWith("-lock.json") || name === "pubspec.lock") {
    return true;
  }
  return false;
}

export function collectFiles(root) {
  const acc = [];
  function walk(dir) {
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of names) {
      if (SKIP_DIRS.has(name)) continue;
      const path = join(dir, name);
      let st;
      try {
        st = statSync(path);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(path);
      else if (!shouldSkipFile(name) && st.size < 2_000_000) acc.push(path);
    }
  }
  walk(root);
  return acc;
}

export function scanFile(rel, src) {
  return SECRET_PATTERN.test(src) ? rel : null;
}

export function scanRoot(root) {
  const hits = [];
  for (const file of collectFiles(root)) {
    const rel = relative(root, file);
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const hit = scanFile(rel, src);
    if (hit) hits.push(hit);
  }
  return hits;
}

function isMain() {
  const invoked = process.argv[1];
  return Boolean(invoked) && pathToFileURL(invoked).href === import.meta.url;
}

if (isMain()) {
  const ROOT = fileURLToPath(new URL("../..", import.meta.url));
  const hits = scanRoot(ROOT);
  if (hits.length) {
    for (const hit of hits) console.error(hit);
    process.exit(1);
  }
  process.stdout.write("ok: no secret-like strings\n");
}
