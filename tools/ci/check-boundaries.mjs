#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".git",
  ".pnpm-store",
  ".wrangler",
  "coverage",
  ".dart_tool",
]);

const IMPORT_RE = /(?:from|import)\s*['"]([^'"]+)['"]/g;
const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

export const SOURCE_RULES = [
  {
    from: /^apps\/web\//,
    forbidden: (spec) =>
      spec === "@sadhanayog/db" ||
      spec.startsWith("@sadhanayog/db/") ||
      spec.includes("apps/api") ||
      spec === "wrangler" ||
      spec.startsWith("wrangler/") ||
      spec === "@cloudflare/workers-types",
    msg: "web may not import db or Worker internals",
  },
  {
    from: /^apps\/api\//,
    forbidden: (spec) => spec.includes("apps/web") || spec.includes("apps/mobile"),
    msg: "api may not import web or mobile",
  },
  {
    from: /^packages\/contracts\//,
    forbidden: (spec) =>
      spec === "@sadhanayog/db" || spec.startsWith("@sadhanayog/db/") || spec.includes("apps/"),
    msg: "contracts may not depend on apps or db",
  },
  {
    from: /^packages\/config\//,
    forbidden: (spec) =>
      spec.startsWith("@sadhanayog/db") ||
      spec.startsWith("@sadhanayog/contracts") ||
      spec.includes("apps/"),
    msg: "config may not depend on apps, contracts, or db",
  },
  {
    from: /^packages\/db\//,
    forbidden: (spec) => spec.includes("apps/"),
    msg: "db may not import applications",
  },
];

export const PACKAGE_RULES = [
  {
    file: "apps/web/package.json",
    forbidden: ["@sadhanayog/db"],
    msg: "web package.json may not depend on @sadhanayog/db",
  },
  {
    file: "packages/contracts/package.json",
    forbidden: ["@sadhanayog/db", "@sadhanayog/api", "@sadhanayog/web"],
    msg: "contracts package.json may not depend on apps or db",
  },
  {
    file: "packages/config/package.json",
    forbidden: ["@sadhanayog/db", "@sadhanayog/contracts", "@sadhanayog/api", "@sadhanayog/web"],
    msg: "config package.json may not depend on apps, contracts, or db",
  },
  {
    file: "packages/db/package.json",
    forbidden: ["@sadhanayog/api", "@sadhanayog/web"],
    msg: "db package.json may not depend on apps",
  },
];

export function importedSpecifiers(src) {
  const found = [];
  for (const re of [IMPORT_RE, REQUIRE_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(src))) found.push(match[1]);
  }
  return found;
}

function walk(dir, acc = []) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return acc;
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
    if (st.isDirectory()) walk(path, acc);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) acc.push(path);
  }
  return acc;
}

function declaredDeps(pkg) {
  return {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies,
  };
}

export function checkBoundaries(root) {
  const errors = [];
  for (const file of walk(root)) {
    const rel = relative(root, file).replaceAll("\\", "/");
    const src = readFileSync(file, "utf8");
    const specs = importedSpecifiers(src);
    for (const rule of SOURCE_RULES) {
      if (!rule.from.test(rel)) continue;
      for (const spec of specs) {
        if (rule.forbidden(spec)) errors.push(`${rel}: ${rule.msg} (import ${spec})`);
      }
    }
  }

  for (const rule of PACKAGE_RULES) {
    const path = join(root, rule.file);
    if (!existsSync(path)) continue;
    const pkg = JSON.parse(readFileSync(path, "utf8"));
    const deps = declaredDeps(pkg);
    for (const name of rule.forbidden) {
      if (name in deps) errors.push(`${rule.file}: ${rule.msg} (${name})`);
    }
  }

  return errors;
}

function isMain() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isMain()) {
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const errors = checkBoundaries(root);
  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  process.stdout.write("ok: import boundaries\n");
}
