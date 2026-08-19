#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Third-party allowlist for this private product. Product SPDX is unsigned.
export const ALLOWED = new Set([
  "0BSD",
  "Apache-2.0",
  "Artistic-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BSD-3-Clause-Clear",
  "CC0-1.0",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "ISC",
  "LGPL-2.1",
  "LGPL-2.1-or-later",
  "LGPL-3.0",
  "LGPL-3.0-or-later",
  "MIT",
  "MIT-0",
  "MPL-2.0",
  "OFL-1.1",
  "OpenSSL",
  "Python-2.0",
  "Unlicense",
  "Unicode-3.0",
  "Unicode-DFS-2016",
  "WTFPL",
  "Zlib",
]);

const ALIASES = new Map([
  ["mit", "MIT"],
  ["mit license", "MIT"],
  ["apache", "Apache-2.0"],
  ["apache2", "Apache-2.0"],
  ["apache 2", "Apache-2.0"],
  ["apache-2", "Apache-2.0"],
  ["apache 2.0", "Apache-2.0"],
  ["apache license 2.0", "Apache-2.0"],
  ["apache license, version 2.0", "Apache-2.0"],
  ["bsd", "BSD-3-Clause"],
  ["bsd-2-clause", "BSD-2-Clause"],
  ["bsd-3-clause", "BSD-3-Clause"],
  ["isc", "ISC"],
  ["unlicense", "Unlicense"],
  ["0bsd", "0BSD"],
]);

export function licenseText(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean).join(" OR ");
  if (raw == null) return "";
  return String(raw).trim();
}

export function canonicalToken(token) {
  const stripped = String(token).replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  if (!stripped) return "";
  const aliased = ALIASES.get(stripped.toLowerCase());
  if (aliased) return aliased;
  return stripped;
}

export function licenseAllowed(expr) {
  const raw = licenseText(expr);
  if (!raw) return false;
  if (/\bAGPL\b|\bGPL\b|\bSSPL\b|BUSL|COMMONS CLAUSE|PROSPERITY|ELASTIC/i.test(raw)) {
    return false;
  }
  if (/\sOR\s/i.test(raw)) {
    return raw.split(/\sOR\s/i).some((part) => licenseAllowed(part));
  }
  if (/\sAND\s/i.test(raw)) {
    return raw.split(/\sAND\s/i).every((part) => licenseAllowed(part));
  }
  return ALLOWED.has(canonicalToken(raw));
}

export function packagesFromPnpmLicenses(json) {
  const pkgs = [];
  if (Array.isArray(json)) {
    for (const row of json) {
      pkgs.push({
        name: row.name ?? row.packageName ?? "unknown",
        version: row.version ?? "",
        license: licenseText(row.license ?? row.licenses ?? ""),
      });
    }
    return pkgs;
  }
  if (json && typeof json === "object") {
    for (const [license, rows] of Object.entries(json)) {
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        pkgs.push({
          name: row.name ?? row.packageName ?? "unknown",
          version: row.versions?.[0] ?? row.version ?? "",
          license: licenseText(row.license ?? license),
        });
      }
    }
  }
  return pkgs;
}

export function isWorkspacePackage(name) {
  return name === "sadhanayog" || name.startsWith("@sadhanayog/");
}

export function findDisallowed(pkgs) {
  const bad = [];
  for (const pkg of pkgs) {
    if (isWorkspacePackage(pkg.name)) continue;
    if (!licenseAllowed(pkg.license)) {
      bad.push(`${pkg.name}@${pkg.version}: ${pkg.license || "UNKNOWN"}`);
    }
  }
  return bad;
}

export function parsePnpmFolder(folder) {
  const match = folder.startsWith("@")
    ? folder.match(/^(@[^@]+)@(.+)$/)
    : folder.match(/^([^@]+)@(.+)$/);
  if (!match) return null;
  return {
    name: match[1].replace("+", "/"),
    version: match[2].split("_")[0],
  };
}

export function packagesFromStore(root) {
  const store = join(root, "node_modules/.pnpm");
  if (!existsSync(store)) {
    throw new Error("node_modules/.pnpm missing; run pnpm install");
  }
  const pkgs = [];
  for (const folder of readdirSync(store)) {
    const dir = join(store, folder);
    if (!statSync(dir).isDirectory()) continue;
    const parsed = parsePnpmFolder(folder);
    if (!parsed) continue;
    const pkgJson = join(dir, "node_modules", parsed.name, "package.json");
    if (!existsSync(pkgJson)) continue;
    const json = JSON.parse(readFileSync(pkgJson, "utf8"));
    pkgs.push({
      name: json.name ?? parsed.name,
      version: json.version ?? parsed.version,
      license: licenseText(json.license ?? json.licenses ?? ""),
    });
  }
  return pkgs;
}

export function flutterGitDeps(pubspecSrc) {
  const hits = [];
  const lines = pubspecSrc.split("\n");
  let inDeps = false;
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "");
    if (/^(dependencies|dev_dependencies|dependency_overrides):/.test(line)) {
      inDeps = true;
      continue;
    }
    if (inDeps && /^\S/.test(line) && line.trim()) {
      inDeps = false;
    }
    if (inDeps && /\bgit:/.test(line)) hits.push(line.trim());
  }
  return hits;
}

function isMain() {
  const invoked = process.argv[1];
  return Boolean(invoked) && pathToFileURL(invoked).href === import.meta.url;
}

if (isMain()) {
  const ROOT = fileURLToPath(new URL("../..", import.meta.url));
  const errors = [];

  let pkgs;
  try {
    pkgs = packagesFromStore(ROOT);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (pkgs.length === 0) {
    console.error("no packages found under node_modules/.pnpm");
    process.exit(1);
  }
  errors.push(...findDisallowed(pkgs));

  const pubspec = readFileSync(join(ROOT, "apps/mobile/pubspec.yaml"), "utf8");
  for (const dep of flutterGitDeps(pubspec)) {
    errors.push(`apps/mobile/pubspec.yaml git dependency: ${dep}`);
  }

  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  process.stdout.write("ok: dependency licenses\n");
}
