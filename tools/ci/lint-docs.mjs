#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;
const DOCS = join(ROOT, "docs");
const required = [
  "docs/README.md",
  "docs/architecture/engineering-foundation.md",
  "docs/roadmap/implementation-roadmap.md",
  "docs/architecture/decisions.md",
  "docs/issue-tracking/README.md",
  "docs/issue-tracking/AGENTS.md",
];

const errors = [];
for (const path of required) {
  if (!existsSync(join(ROOT, path))) errors.push(`missing ${path}`);
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (name.endsWith(".md")) acc.push(path);
  }
  return acc;
}

const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
for (const file of walk(DOCS)) {
  const src = readFileSync(file, "utf8");
  for (const match of src.matchAll(linkRe)) {
    const href = match[2].split("#")[0];
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) continue;
    const target = join(file, "..", href);
    if (!existsSync(target)) {
      errors.push(`${relative(ROOT, file)}: broken link ${href}`);
    }
  }
}

if (errors.length) {
  for (const err of errors) console.error(err);
  process.exit(1);
}
process.stdout.write("ok: docs links\n");
