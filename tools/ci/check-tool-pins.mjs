#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;
const PINS_PATH = join(ROOT, "tools/ci/tool-pins.json");
const errors = [];

function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function parsePins() {
  const pins = JSON.parse(readFileSync(PINS_PATH, "utf8"));
  for (const key of ["node", "pnpm", "flutter", "dart", "java", "wrangler"]) {
    if (typeof pins[key] !== "string" || !pins[key]) {
      errors.push(`tools/ci/tool-pins.json missing string pin "${key}"`);
    }
  }
  return pins;
}

function parseMiseTools(src) {
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

function which(bin) {
  try {
    execFileSync("sh", ["-c", `command -v ${bin}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function run(bin, args) {
  const result = spawnSync(bin, args, { encoding: "utf8" });
  return `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected}, found ${actual ?? "missing"}`);
  }
}

function expectContains(label, haystack, needle) {
  if (!haystack.includes(needle)) {
    errors.push(`${label}: missing ${JSON.stringify(needle)}`);
  }
}

function firstMatch(src, re) {
  const match = src.match(re);
  return match ? match[1] : null;
}

const pins = parsePins();
const pkg = JSON.parse(read("package.json"));
const apiPkg = JSON.parse(read("apps/api/package.json"));
const mise = parseMiseTools(read("mise.toml"));
const ci = read(".github/workflows/ci.yml");
const gitignore = read(".gitignore");

expectEqual("mise node", mise.node, pins.node);
expectEqual("mise pnpm", mise.pnpm, pins.pnpm);
expectEqual("mise flutter", mise.flutter, pins.flutter);
expectEqual("mise java", mise.java, pins.java);
if (mise.dart) {
  errors.push("mise.toml must not pin dart separately; it ships with Flutter");
}

expectEqual("packageManager", pkg.packageManager, `pnpm@${pins.pnpm}`);
expectContains("engines.node", String(pkg.engines?.node ?? ""), pins.node);
expectContains("engines.pnpm", String(pkg.engines?.pnpm ?? ""), pins.pnpm);
expectEqual("apps/api wrangler", apiPkg.devDependencies?.wrangler, pins.wrangler);

expectContains("CI Node", ci, `node-version: ${pins.node}`);
expectContains("CI pnpm", ci, `version: ${pins.pnpm}`);
expectContains("CI Flutter", ci, `flutter-version: "${pins.flutter}"`);

for (const pattern of [".dev.vars", "*.sqlite", "*.jks", "*.keystore", ".wrangler"]) {
  expectContains(`.gitignore ${pattern}`, gitignore, pattern);
}

expectEqual("runtime node", process.versions.node, pins.node);

if (which("pnpm")) {
  expectEqual("runtime pnpm", run("pnpm", ["-v"]), pins.pnpm);
} else {
  errors.push("pnpm is not on PATH");
}

if (which("flutter")) {
  const flutterOut = run("flutter", ["--version"]);
  expectEqual(
    "runtime flutter",
    firstMatch(flutterOut, /Flutter ([0-9]+\.[0-9]+\.[0-9]+)/),
    pins.flutter,
  );
  expectEqual(
    "runtime dart (from flutter)",
    firstMatch(flutterOut, /Dart ([0-9]+\.[0-9]+\.[0-9]+)/),
    pins.dart,
  );
} else {
  process.stdout.write("skip: flutter not on PATH\n");
}

if (which("dart")) {
  const dartOut = run("dart", ["--version"]);
  expectEqual(
    "runtime dart",
    firstMatch(dartOut, /Dart SDK version: ([0-9]+\.[0-9]+\.[0-9]+)/),
    pins.dart,
  );
}

if (which("java")) {
  const javaOut = run("java", ["-version"]);
  expectEqual(
    "runtime java",
    firstMatch(javaOut, /(?:openjdk|java) version "([^"]+)"/i),
    pins.java,
  );
} else {
  process.stdout.write("skip: java not on PATH\n");
}

const wranglerPkg = join(ROOT, "apps/api/node_modules/wrangler/package.json");
if (existsSync(wranglerPkg)) {
  const installed = JSON.parse(readFileSync(wranglerPkg, "utf8")).version;
  expectEqual("installed wrangler", installed, pins.wrangler);
} else {
  process.stdout.write("skip: wrangler not installed yet\n");
}

if (errors.length) {
  for (const err of errors) console.error(err);
  process.exit(1);
}
process.stdout.write(
  `ok: toolchain pins node ${pins.node}, pnpm ${pins.pnpm}, flutter ${pins.flutter}, dart ${pins.dart}, java ${pins.java}, wrangler ${pins.wrangler}\n`,
);
