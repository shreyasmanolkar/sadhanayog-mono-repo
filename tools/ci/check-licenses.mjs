#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function normalizeLicense(raw) {
  if (!raw) return "UNKNOWN";
  if (typeof raw === "string") return raw.trim() || "UNKNOWN";
  if (Array.isArray(raw)) {
    return raw.map((item) => normalizeLicense(item.type || item)).join(" OR ");
  }
  if (typeof raw === "object" && raw.type) return String(raw.type).trim() || "UNKNOWN";
  return "UNKNOWN";
}

export function splitLicenseExpr(expr) {
  return expr
    .replaceAll(/[()]/g, " ")
    .split(/\s+(?:OR|AND)\s+/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function isAllowedLicense(expr, allow) {
  if (!expr || expr === "UNKNOWN") return false;
  const allowed = new Set(allow);
  if (allowed.has(expr)) return true;
  const parts = splitLicenseExpr(expr);
  if (!parts.length) return false;
  return parts.every((part) => allowed.has(part));
}

export function loadAllowlist(root) {
  const path = join(root, "tools/ci/license-allowlist.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

function pnpmPackageJsons(root) {
  const pnpm = join(root, "node_modules/.pnpm");
  const files = [];
  if (!existsSync(pnpm)) return files;
  for (const dir of readdirSync(pnpm)) {
    const nm = join(pnpm, dir, "node_modules");
    if (!existsSync(nm)) continue;
    for (const name of readdirSync(nm)) {
      if (name.startsWith(".")) continue;
      if (name.startsWith("@")) {
        const scope = join(nm, name);
        for (const pkg of readdirSync(scope)) {
          const json = join(scope, pkg, "package.json");
          if (existsSync(json)) files.push(json);
        }
      } else {
        const json = join(nm, name, "package.json");
        if (existsSync(json)) files.push(json);
      }
    }
  }
  return files;
}

export function collectLicenses(root) {
  const found = [];
  const seen = new Set();
  for (const file of pnpmPackageJsons(root)) {
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    if (!pkg.name || !pkg.version) continue;
    const id = `${pkg.name}@${pkg.version}`;
    if (seen.has(id)) continue;
    seen.add(id);
    found.push({
      id,
      name: pkg.name,
      version: pkg.version,
      license: normalizeLicense(pkg.license || pkg.licenses),
    });
  }
  return found.sort((a, b) => a.id.localeCompare(b.id));
}

export function exceptionMatches(pkg, exception) {
  const versionOk = (exception.version ?? "*") === "*" || exception.version === pkg.version;
  if (!versionOk) return false;
  const name = exception.name ?? "";
  if (name.endsWith("*")) return pkg.name.startsWith(name.slice(0, -1));
  return name === pkg.name;
}

export function checkLicenses(root) {
  const allowlist = loadAllowlist(root);
  const allow = allowlist.allow ?? [];
  const exceptions = allowlist.exceptions ?? [];
  const errors = [];
  for (const pkg of collectLicenses(root)) {
    if (exceptions.some((exception) => exceptionMatches(pkg, exception))) continue;
    if (!isAllowedLicense(pkg.license, allow)) {
      errors.push(`${pkg.id}: license ${pkg.license} is not on the allowlist`);
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
  if (!existsSync(join(root, "node_modules/.pnpm"))) {
    process.stderr.write("node_modules/.pnpm is missing; run pnpm install\n");
    process.exit(1);
  }
  const errors = checkLicenses(root);
  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  process.stdout.write("ok: dependency licenses\n");
}
