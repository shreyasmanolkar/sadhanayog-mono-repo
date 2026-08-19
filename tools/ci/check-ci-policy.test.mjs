#!/usr/bin/env node
import { strict as assert } from "node:assert";
import { checkWorkflow, checkSupportFiles, parseMiseTools, usesLines } from "./check-ci-policy.mjs";

const pins = { node: "24.11.1", pnpm: "10.33.0", flutter: "3.35.4" };
const sha = "a".repeat(40);

const good = `
name: CI
on:
  pull_request:
  push:
    branches: [main, staging]
permissions:
  contents: read
jobs:
  governance:
    steps:
      - uses: actions/checkout@${sha}
        with:
          persist-credentials: false
  typescript:
    steps:
      - uses: actions/setup-node@${sha}
        with:
          node-version: 24.11.1
  flutter:
    steps:
      - uses: subosito/flutter-action@${sha}
        with:
          flutter-version: "3.35.4"
  dependencies:
    steps:
      - uses: pnpm/action-setup@${sha}
        with:
          version: 10.33.0
`;

assert.deepEqual(checkWorkflow(good, pins), []);
assert.equal(usesLines(good).length, 4);

const unpinned = good.replace(`actions/setup-node@${sha}`, "actions/setup-node@v4");
assert.ok(checkWorkflow(unpinned, pins).some((e) => /not pinned/.test(e)));

const secrets = `${good}\n      - run: echo \${{ secrets.FOO }}\n`;
assert.ok(checkWorkflow(secrets, pins).some((e) => /secrets/.test(e)));

const target = good.replace("  pull_request:", "  pull_request_target:");
assert.ok(checkWorkflow(target, pins).some((e) => /pull_request_target/.test(e)));

assert.deepEqual(parseMiseTools('[tools]\nnode = "24.11.1"\npnpm = "10.33.0"\n'), {
  node: "24.11.1",
  pnpm: "10.33.0",
});

assert.deepEqual(
  checkSupportFiles({
    codeowners: "/.github/ @shreyas\n",
    prTemplate: "- [ ] No secrets, production data\n",
    dependabot:
      "package-ecosystem: npm\npackage-ecosystem: github-actions\npackage-ecosystem: pub\n",
    gitignore: ".dev.vars\n*.sqlite\n*.jks\n*.keystore\n.wrangler\n",
  }),
  [],
);

process.stdout.write("ok: CI policy tests\n");
