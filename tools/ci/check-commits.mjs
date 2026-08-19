#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const TYPES = "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert";
const HEADER =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9][a-z0-9/_-]*\))?!?: .{1,100}$/;

export function firstLine(message) {
  return message
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/, 1)[0]
    .trim();
}

export function isValidCommitMessage(message) {
  const header = firstLine(message);
  if (!header) return false;
  if (header.startsWith("Merge ")) return true;
  if (header.startsWith("Revert ")) return true;
  if (header.endsWith(".")) return false;
  return HEADER.test(header);
}

export { TYPES };

function printHelp() {
  process.stdout.write(`Validate Conventional Commit headers.

Usage:
  node tools/ci/check-commits.mjs --message <text>
  node tools/ci/check-commits.mjs --stdin
  node tools/ci/check-commits.mjs --range <git-range>

Merge and Revert commits are allowed. History before this convention is not rewritten.
`);
}

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

function checkMessage(message, label = "commit") {
  if (isValidCommitMessage(message)) return;
  fail(
    `${label} is not a Conventional Commit header.\n` +
      `Expected: type(scope)?: summary\n` +
      `Types: ${TYPES.replaceAll("|", ", ")}\n` +
      `Got: ${firstLine(message) || "(empty)"}`,
  );
}

function parseArgs(argv) {
  const out = { message: null, range: null, stdin: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--stdin") out.stdin = true;
    else if (arg === "--message") out.message = argv[++i];
    else if (arg === "--range") out.range = argv[++i];
    else fail(`unknown argument: ${arg}`);
  }
  return out;
}

function isMain() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isMain()) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.message && !args.range && !args.stdin)) {
    printHelp();
    process.exit(args.help ? 0 : 2);
  }
  if (args.message != null) checkMessage(args.message, "message");
  if (args.stdin) {
    const message = await new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        data += chunk;
      });
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
    checkMessage(message, "stdin");
  }
  if (args.range) {
    const log = execFileSync("git", ["log", "--format=%s", args.range], {
      encoding: "utf8",
    });
    const subjects = log
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!subjects.length) fail(`no commits in range ${args.range}`);
    for (const subject of subjects) checkMessage(subject, subject);
  }
  process.stdout.write("ok: commit message convention\n");
}
