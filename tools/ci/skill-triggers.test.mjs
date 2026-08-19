import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import { classifyPrompt, loadSkills, REQUIRED_SKILLS } from "./skills-lib.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const skills = loadSkills(ROOT).filter((skill) => !skill.error);

const CASES = [
  { id: "work-issue-id", prompt: "implement SY-0014", expect: "work-issue" },
  {
    id: "work-issue-next",
    prompt: "pick up the next unblocked tracker item",
    expect: "work-issue",
  },
  {
    id: "record-decision-adr",
    prompt: "create an Agent Note ADR for the Vite SPA choice",
    expect: "record-decision",
  },
  {
    id: "record-decision-transition",
    prompt: "move a proposed decision into implemented notes",
    expect: "record-decision",
  },
  {
    id: "model-domain-glossary",
    prompt: "define membership consumption invariant in the domain glossary",
    expect: "model-domain",
  },
  {
    id: "model-domain-before-schema",
    prompt: "model terminology and entities before schema or API design",
    expect: "model-domain",
  },
  {
    id: "change-d1-schema-migration",
    prompt: "add a Drizzle SQL migration for D1",
    expect: "change-d1-schema",
  },
  {
    id: "change-d1-schema-table",
    prompt: "change the sqlite schema and review the generated SQL",
    expect: "change-d1-schema",
  },
  {
    id: "build-worker-api-route",
    prompt: "add a Worker Hono route for attendance",
    expect: "build-worker-api",
  },
  {
    id: "build-worker-api-usecase",
    prompt: "change API use case authorization on the Worker",
    expect: "build-worker-api",
  },
  {
    id: "build-flutter-feature-screen",
    prompt: "implement the Flutter attendance screen from the contract",
    expect: "build-flutter-feature",
  },
  {
    id: "build-flutter-feature-widget",
    prompt: "add a Dart widget and go_router destination",
    expect: "build-flutter-feature",
  },
  {
    id: "build-web-feature-page",
    prompt: "implement the TanStack web students page",
    expect: "build-web-feature",
  },
  {
    id: "build-web-feature-form",
    prompt: "add a Vite TanStack form and Playwright coverage",
    expect: "build-web-feature",
  },
  {
    id: "handle-r2-object-upload",
    prompt: "upload a private PDF to R2 object storage",
    expect: "handle-r2-object",
  },
  {
    id: "handle-r2-object-lifecycle",
    prompt: "change the R2 document lifecycle and orphan cleanup",
    expect: "handle-r2-object",
  },
  {
    id: "review-security-privacy-idor",
    prompt: "threat-model this PR for IDOR and tenant isolation",
    expect: "review-security-privacy",
  },
  {
    id: "review-security-privacy-audit",
    prompt: "privacy review of logs and upload handling",
    expect: "review-security-privacy",
  },
  {
    id: "audit-accessibility-parity-close",
    prompt: "compare web and mobile accessibility before the feature closes",
    expect: "audit-accessibility-parity",
  },
  {
    id: "audit-accessibility-parity-keyboard",
    prompt: "keyboard and screen-reader parity matrix across platforms",
    expect: "audit-accessibility-parity",
  },
  {
    id: "review-change-merge",
    prompt: "independent code review of the diff before merge",
    expect: "review-change",
  },
  {
    id: "review-change-findings",
    prompt: "label review findings by severity without rewriting the author's work",
    expect: "review-change",
  },
  {
    id: "manage-release-incident-prod",
    prompt: "rollback the production release",
    expect: "manage-release-incident",
  },
  {
    id: "manage-release-incident-postmortem",
    prompt: "write a postmortem after the qualifying incident",
    expect: "manage-release-incident",
  },
  { id: "none-prettier", prompt: "rewrap this comment to 100 columns", expect: null },
  { id: "none-typo", prompt: "fix a typo in a code comment", expect: null },
];

assert.equal(new Set(skills.map((skill) => skill.name)).size, REQUIRED_SKILLS.length);

const seen = new Set();
for (const testCase of CASES) {
  const result = classifyPrompt(testCase.prompt, skills);
  assert.equal(
    result.skill,
    testCase.expect,
    `${testCase.id}: expected ${testCase.expect}, got ${result.skill} (score=${result.score.toFixed(2)} margin=${result.margin.toFixed(2)})`,
  );
  if (testCase.expect) seen.add(testCase.expect);
}

for (const name of REQUIRED_SKILLS) {
  assert.ok(seen.has(name), `${name} has no positive trigger fixture`);
}

process.stdout.write(`ok: skill triggers (${CASES.length} cases)\n`);
