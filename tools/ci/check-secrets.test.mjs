#!/usr/bin/env node
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strict as assert } from "node:assert";
import { scanFile, scanRoot, shouldSkipFile } from "./check-secrets.mjs";

const pem = ["-----BEGIN ", "PRIVATE KEY-----"].join("");
const aws = "AKIA" + "IOSFODNN7EXAMPLE";
const ghp = "ghp_" + "a".repeat(36);

assert.equal(shouldSkipFile(".dev.vars.example"), true);
assert.equal(shouldSkipFile("pnpm-lock.yaml"), true);
assert.equal(shouldSkipFile("README.md"), false);

assert.equal(scanFile("ok.txt", "no credentials here"), null);
assert.equal(scanFile("key.pem", pem), "key.pem");
assert.equal(scanFile("aws.txt", aws), "aws.txt");
assert.equal(scanFile("gh.txt", ghp), "gh.txt");
assert.equal(scanFile("split.txt", '-----BEGIN " + "PRIVATE KEY-----'), null);

const dir = mkdtempSync(join(tmpdir(), "sy-secrets-"));
try {
  writeFileSync(join(dir, "clean.txt"), "hello\n");
  writeFileSync(join(dir, "secret.pem"), `${pem}\n`);
  writeFileSync(join(dir, "ok.example"), `${pem}\n`);
  mkdirSync(join(dir, "node_modules"));
  writeFileSync(join(dir, "node_modules", "hidden.pem"), `${pem}\n`);
  const hits = scanRoot(dir).sort();
  assert.deepEqual(hits, ["secret.pem"]);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

process.stdout.write("ok: secret scan tests\n");
