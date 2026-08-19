#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_AGENTS,
  REQUIRED_SKILLS,
  ROOT_HEADINGS,
  NAME_RE,
  brokenSkillLinks,
  headingNames,
  loadSkills,
  missingSkillBody,
  parseFrontmatter,
} from "./skills-lib.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const errors = [];

function fail(message) {
  errors.push(message);
}

const skills = loadSkills(ROOT);
const byName = new Map(skills.map((skill) => [skill.name, skill]));

for (const name of REQUIRED_SKILLS) {
  if (!byName.has(name)) fail(`missing required skill ${name}`);
}

for (const skill of skills) {
  if (!REQUIRED_SKILLS.includes(skill.name)) {
    fail(`unexpected skill directory ${skill.name}; foundation §18.3 lists the allowed set`);
  }
  if (skill.error) {
    fail(`${skill.name}: ${skill.error}`);
    continue;
  }
  const { name: declared, description } = skill.fields;
  if (declared !== skill.name) {
    fail(`${skill.name}: frontmatter name "${declared ?? ""}" must match directory`);
  }
  if (!declared || !NAME_RE.test(declared) || declared.length > 64) {
    fail(`${skill.name}: invalid name (lowercase, digits, single hyphens, ≤64)`);
  }
  if (!description) fail(`${skill.name}: description is required`);
  else {
    if (description.length > 1024) fail(`${skill.name}: description exceeds 1024 characters`);
    if (!/use when/i.test(description)) {
      fail(`${skill.name}: description must say "Use when" so hosts can trigger it`);
    }
    if (!/do not use/i.test(description)) {
      fail(`${skill.name}: description must say "Do not use" to bound implicit matching`);
    }
  }
  for (const problem of missingSkillBody(skill)) fail(`${skill.name}: ${problem}`);
  for (const problem of brokenSkillLinks(skill, ROOT)) fail(problem);
}

for (const rel of REQUIRED_AGENTS) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) {
    fail(`missing ${rel}`);
    continue;
  }
  const src = readFileSync(path, "utf8");
  if (rel === "AGENTS.md") {
    if (src.startsWith("---")) {
      try {
        parseFrontmatter(src);
      } catch (err) {
        fail(`AGENTS.md: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    for (const heading of ROOT_HEADINGS) {
      if (!src.includes(`## ${heading}`)) fail(`AGENTS.md: missing ## ${heading}`);
    }
    const lines = src.split(/\r?\n/).length;
    if (lines > 120) fail(`AGENTS.md: ${lines} lines; root instructions must stay compact`);
  } else if (rel !== "docs/issue-tracking/AGENTS.md") {
    const headings = headingNames(src);
    const copied = ROOT_HEADINGS.filter((heading) => headings.includes(heading));
    if (copied.length >= 4) {
      fail(
        `${rel}: repeats root headings (${copied.join(", ")}); scoped files add local rules only`,
      );
    }
    const lines = src.split(/\r?\n/).length;
    if (lines > 80) fail(`${rel}: ${lines} lines; scoped instructions must stay short`);
    if (!/validate/i.test(src)) fail(`${rel}: identify a runnable check (Validate)`);
  }
}

if (errors.length) {
  for (const err of errors) console.error(err);
  process.exit(1);
}

process.stdout.write(
  `ok: skills quick_validate (${REQUIRED_SKILLS.length} skills, ${REQUIRED_AGENTS.length} AGENTS.md)\n`,
);
