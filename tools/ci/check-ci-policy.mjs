#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function parseMiseTools(src) {
  const tools = {};
  let inTools = false;
  for (const raw of src.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (line.startsWith("[")) {
      inTools = line === "[tools]";
      continue;
    }
    if (!inTools) continue;
    const match = line.match(/^([A-Za-z0-9_-]+)\s*=\s*"([^"]+)"$/);
    if (match) tools[match[1]] = match[2];
  }
  return tools;
}

export function usesLines(workflow) {
  return [...workflow.matchAll(/^\s+- uses:\s*(\S+)/gm)].map((m) => m[1]);
}

export function checkWorkflow(workflow, pins) {
  const errors = [];
  const expect = (cond, msg) => {
    if (!cond) errors.push(msg);
  };

  expect(/^permissions:\s*$/m.test(workflow), "workflow must declare permissions");
  expect(
    /^permissions:\n {2}contents: read\n/m.test(workflow),
    "workflow permissions must be exactly contents: read",
  );
  expect(!/^\s*pull_request_target:/m.test(workflow), "pull_request_target is forbidden");
  expect(!/\bsecrets\./.test(workflow), "workflow must not reference secrets.*");
  expect(!/upload-artifact/.test(workflow), "artifact uploads are forbidden in Stage 1 CI");
  expect(
    !/contents:\s*write|id-token:\s*write|packages:\s*write|pull-requests:\s*write/.test(workflow),
    "workflow must not grant write permissions",
  );
  expect(
    /persist-credentials:\s*false/.test(workflow),
    "checkout must set persist-credentials: false",
  );
  expect(/branches:\s*\[main, staging\]/.test(workflow), "push must include main and staging");
  expect(/^\s+pull_request:\s*$/m.test(workflow), "pull_request trigger required");

  expect(workflow.includes(`node-version: ${pins.node}`), `CI Node pin ${pins.node}`);
  expect(workflow.includes(`version: ${pins.pnpm}`), `CI pnpm pin ${pins.pnpm}`);
  expect(workflow.includes(`flutter-version: "${pins.flutter}"`), `CI Flutter pin ${pins.flutter}`);

  for (const job of ["governance:", "typescript:", "flutter:", "dependencies:"]) {
    expect(workflow.includes(`  ${job}`), `missing job ${job.replace(":", "")}`);
  }

  const uses = usesLines(workflow);
  expect(uses.length > 0, "workflow has no uses: actions");
  for (const ref of uses) {
    if (!/@[0-9a-f]{40}(?:\s|$)/.test(ref) && !/@[0-9a-f]{40}$/.test(ref)) {
      errors.push(`action not pinned to a 40-character SHA: ${ref}`);
    }
  }

  const checkoutCount = uses.filter((u) => u.startsWith("actions/checkout@")).length;
  const persistCount = [...workflow.matchAll(/persist-credentials:\s*false/g)].length;
  expect(
    persistCount === checkoutCount && checkoutCount > 0,
    "every checkout must set persist-credentials: false",
  );

  return errors;
}

export function checkSupportFiles(files) {
  const errors = [];
  if (!files.codeowners.includes("/.github/")) {
    errors.push("CODEOWNERS must cover /.github/");
  }
  if (!files.prTemplate.includes("No secrets")) {
    errors.push("PR template must mention secrets");
  }
  if (!files.dependabot.includes("package-ecosystem: npm")) {
    errors.push("dependabot.yml must update npm");
  }
  if (!files.dependabot.includes("package-ecosystem: github-actions")) {
    errors.push("dependabot.yml must update github-actions");
  }
  if (!files.dependabot.includes("package-ecosystem: pub")) {
    errors.push("dependabot.yml must update pub");
  }
  if (/auto-merge|automerged/i.test(files.dependabot)) {
    errors.push("dependabot must not enable automerge");
  }
  for (const pattern of [".dev.vars", "*.sqlite", "*.jks", "*.keystore", ".wrangler"]) {
    if (!files.gitignore.includes(pattern)) {
      errors.push(`.gitignore must exclude ${pattern}`);
    }
  }
  return errors;
}

function isMain() {
  const invoked = process.argv[1];
  return Boolean(invoked) && pathToFileURL(invoked).href === import.meta.url;
}

if (isMain()) {
  const ROOT = fileURLToPath(new URL("../..", import.meta.url));
  const workflowPath = join(ROOT, ".github/workflows/ci.yml");
  const required = [
    workflowPath,
    join(ROOT, ".github/CODEOWNERS"),
    join(ROOT, ".github/pull_request_template.md"),
    join(ROOT, ".github/dependabot.yml"),
    join(ROOT, "docs/development/ci.md"),
  ];
  const errors = [];
  for (const path of required) {
    if (!existsSync(path)) errors.push(`missing ${path.replace(ROOT + "/", "")}`);
  }

  const mise = parseMiseTools(readFileSync(join(ROOT, "mise.toml"), "utf8"));
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  if (pkg.packageManager !== `pnpm@${mise.pnpm}`) {
    errors.push(`packageManager ${pkg.packageManager} != mise pnpm ${mise.pnpm}`);
  }
  if (!String(pkg.engines?.node ?? "").includes(mise.node)) {
    errors.push("package.json engines.node must include the mise Node pin");
  }

  if (existsSync(workflowPath)) {
    errors.push(
      ...checkWorkflow(readFileSync(workflowPath, "utf8"), {
        node: mise.node,
        pnpm: mise.pnpm,
        flutter: mise.flutter,
      }),
    );
  }

  errors.push(
    ...checkSupportFiles({
      codeowners: readFileSync(join(ROOT, ".github/CODEOWNERS"), "utf8"),
      prTemplate: readFileSync(join(ROOT, ".github/pull_request_template.md"), "utf8"),
      dependabot: readFileSync(join(ROOT, ".github/dependabot.yml"), "utf8"),
      gitignore: readFileSync(join(ROOT, ".gitignore"), "utf8"),
    }),
  );

  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  process.stdout.write("ok: CI policy\n");
}
