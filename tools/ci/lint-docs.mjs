#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));

const REQUIRED = [
  "docs/README.md",
  "docs/architecture/README.md",
  "docs/architecture/engineering-foundation.md",
  "docs/architecture/decisions.md",
  "docs/roadmap/README.md",
  "docs/roadmap/implementation-roadmap.md",
  "docs/issue-tracking/README.md",
  "docs/issue-tracking/AGENTS.md",
  "docs/api/README.md",
  "docs/database/README.md",
  "docs/security/README.md",
  "docs/development/README.md",
  "docs/development/agent-instructions.md",
  "docs/testing/README.md",
  "docs/deployment/README.md",
  "docs/operations/README.md",
  "docs/operations/runbooks/README.md",
  "docs/operations/troubleshooting/README.md",
  "docs/product/README.md",
  "docs/discovery/README.md",
  "docs/postmortems/README.md",
  "docs/postmortems/template.md",
  "docs/operations/runbooks/auth-outage.md",
  "docs/operations/runbooks/api-outage.md",
  "docs/operations/runbooks/failed-migration.md",
  "docs/operations/runbooks/suspected-compromise.md",
  "docs/operations/runbooks/document-exposure.md",
  "docs/operations/runbooks/restore.md",
  "docs/operations/runbooks/mobile-release-failure.md",
  ".agents/notes/README.md",
  ".agents/notes/AGENTS.md",
  ".agents/notes/templates/proposed.md",
  ".agents/notes/templates/implemented.md",
  ".agents/notes/templates/rejected.md",
  ".agents/notes/templates/archived.md",
  ".agents/notes/implemented/README.md",
  ".agents/notes/rejected/README.md",
  ".agents/notes/archived/README.md",
];

const POSTMORTEM_HEADINGS = [
  "Summary and impact",
  "Detection",
  "Timeline",
  "Response",
  "Root cause and contributing conditions",
  "Safeguards that failed or were missing",
  "What worked",
  "Recovery and data reconciliation",
  "Security/privacy notification assessment",
  "Corrective issues",
  "Lessons",
  "Prevention and detection guard updates",
];

function parseArgs(argv) {
  let root = DEFAULT_ROOT;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--root") {
      root = resolve(argv[i + 1] ?? "");
      i += 1;
    } else if (arg.startsWith("--root=")) {
      root = resolve(arg.slice("--root=".length));
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return { root };
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

function isOwnedReadme(file, docsRoot) {
  if (basename(file) !== "README.md") return false;
  const rel = relative(docsRoot, file);
  if (rel.startsWith("issue-tracking/issues/")) return false;
  if (rel.startsWith("issue-tracking/templates/")) return false;
  return !rel.startsWith("..");
}

function main() {
  const { root } = parseArgs(process.argv.slice(2));
  const docs = join(root, "docs");
  const errors = [];

  for (const path of REQUIRED) {
    if (!existsSync(join(root, path))) errors.push(`missing ${path}`);
  }

  const template = join(root, "docs/postmortems/template.md");
  if (existsSync(template)) {
    const src = readFileSync(template, "utf8");
    for (const heading of POSTMORTEM_HEADINGS) {
      if (!src.includes(`## ${heading}`)) {
        errors.push(`docs/postmortems/template.md: missing ## ${heading}`);
      }
    }
  }

  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const file of walk(docs)) {
    const src = readFileSync(file, "utf8");
    if (isOwnedReadme(file, docs)) {
      if (!/^Status: .+/m.test(src)) {
        errors.push(`${relative(root, file)}: missing Status line`);
      }
      if (!/^Owner: .+/m.test(src)) {
        errors.push(`${relative(root, file)}: missing Owner line`);
      }
      if (!/^Last-reviewed: \d{4}-\d{2}-\d{2}\s*$/m.test(src)) {
        errors.push(`${relative(root, file)}: missing Last-reviewed: YYYY-MM-DD`);
      }
    }
    for (const match of src.matchAll(linkRe)) {
      const href = match[2].split("#")[0];
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) continue;
      const target = join(file, "..", href);
      if (!existsSync(target)) {
        errors.push(`${relative(root, file)}: broken link ${href}`);
      }
    }
  }

  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  process.stdout.write("ok: docs\n");
}

main();
