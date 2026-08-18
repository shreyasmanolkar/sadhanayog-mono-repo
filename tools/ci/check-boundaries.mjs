#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;

const FORBIDDEN = [
  {
    from: /^apps\/web\//,
    importRe: /@sadhanayog\/db|apps\/api|wrangler/,
    msg: "web may not import db or Worker internals",
  },
  {
    from: /^packages\/contracts\//,
    importRe: /@sadhanayog\/db|apps\//,
    msg: "contracts may not depend on apps or db",
  },
  {
    from: /^packages\/config\//,
    importRe: /@sadhanayog\/(db|contracts)|apps\//,
    msg: "config may not depend on apps",
  },
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) acc.push(path);
  }
  return acc;
}

const files = walk(ROOT);
const errors = [];
for (const file of files) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, "utf8");
  for (const rule of FORBIDDEN) {
    if (!rule.from.test(rel)) continue;
    if (rule.importRe.test(src)) errors.push(`${rel}: ${rule.msg}`);
  }
}

if (errors.length) {
  for (const err of errors) console.error(err);
  process.exit(1);
}
process.stdout.write("ok: import boundaries\n");
