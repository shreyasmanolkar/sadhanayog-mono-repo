#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;
const NOTES = join(ROOT, ".agents/notes");
const LIFECYCLES = {
  proposed: "Status: proposed",
  implemented: "Status: implemented",
  rejected: "Status: rejected",
  archived: "Status: implemented",
};
const REQUIRED = {
  proposed: [
    "Problem",
    "Proposal",
    "Rationale",
    "Alternatives considered",
    "Affected components",
    "Related records",
  ],
  implemented: [
    "Problem",
    "Decision",
    "Rationale",
    "Alternatives considered",
    "Affected components",
    "Related records",
    "Consequences",
    "Implementation",
    "Verification",
  ],
  rejected: [
    "Problem",
    "Proposal",
    "Rationale",
    "Alternatives considered",
    "Affected components",
    "Related records",
  ],
  archived: [
    "Problem",
    "Decision",
    "Rationale",
    "Alternatives considered",
    "Affected components",
    "Related records",
    "Consequences",
    "Implementation",
    "Verification",
  ],
};

const errors = [];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else if (
      name.endsWith(".md") &&
      name !== "README.md" &&
      name !== "AGENTS.md" &&
      name !== "CLAUDE.md"
    ) {
      acc.push(path);
    }
  }
  return acc;
}

for (const [lifecycle, statusPrefix] of Object.entries(LIFECYCLES)) {
  const dir = join(NOTES, lifecycle);
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    if (!src.startsWith("# Agent Note:")) errors.push(`${file}: must start with "# Agent Note:"`);
    if (!src.includes(statusPrefix)) errors.push(`${file}: missing ${statusPrefix}`);
    if (lifecycle === "archived" && !/^Archived: \d{4}-\d{2}-\d{2}$/m.test(src)) {
      errors.push(`${file}: archived notes need Archived: YYYY-MM-DD`);
    }
    for (const heading of REQUIRED[lifecycle]) {
      if (!src.includes(`## ${heading}`)) errors.push(`${file}: missing ## ${heading}`);
    }
    if ((src.match(/^Status:/gm) || []).length !== 1) {
      errors.push(`${file}: must have exactly one Status line`);
    }
  }
}

if (errors.length) {
  for (const err of errors) console.error(err);
  process.exit(1);
}
process.stdout.write("ok: decision notes\n");
