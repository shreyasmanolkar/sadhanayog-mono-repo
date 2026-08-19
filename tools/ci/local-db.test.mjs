import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";
import { LOCAL_DATABASE, applyPlan, buildPlan, parseArgs, run, validateArgs } from "./local-db.mjs";

const ROOT = join(fileURLToPath(new URL("../..", import.meta.url)));
const script = join(ROOT, "tools/ci/local-db.mjs");

const seedArgs = parseArgs(["seed", "--database", LOCAL_DATABASE]);
assert.equal(seedArgs.command, "seed");
assert.equal(seedArgs.database, LOCAL_DATABASE);
assert.equal(validateArgs(seedArgs).ok, true);

const eqArgs = parseArgs(["seed", `--database=${LOCAL_DATABASE}`]);
assert.equal(eqArgs.database, LOCAL_DATABASE);

const pnpmArgs = parseArgs(["seed", "--", "--database", LOCAL_DATABASE]);
assert.equal(pnpmArgs.database, LOCAL_DATABASE);
assert.equal(validateArgs(pnpmArgs).ok, true);

assert.equal(validateArgs(parseArgs(["seed"])).ok, false);
assert.match(validateArgs(parseArgs(["seed"])).error, /--database/);

assert.equal(validateArgs(parseArgs(["wat", "--database", LOCAL_DATABASE])).ok, false);

const remote = parseArgs(["seed", "--database", LOCAL_DATABASE, "--remote"]);
assert.equal(validateArgs(remote).ok, false);
assert.match(validateArgs(remote).error, /--remote/);

const prodName = parseArgs([
  "reset",
  "--database",
  "sadhanayog-prod",
  "--confirm",
  "sadhanayog-prod",
]);
assert.equal(validateArgs(prodName).ok, false);
assert.match(validateArgs(prodName).error, /only local/);

const stagingName = parseArgs(["seed", "--database", "shared-staging"]);
assert.equal(validateArgs(stagingName).ok, false);

const resetBare = parseArgs(["reset", "--database", LOCAL_DATABASE]);
assert.equal(validateArgs(resetBare).ok, false);
assert.match(validateArgs(resetBare).error, /--confirm/);

const resetWrongConfirm = parseArgs(["reset", "--database", LOCAL_DATABASE, "--confirm", "yes"]);
assert.equal(validateArgs(resetWrongConfirm).ok, false);

const resetOk = parseArgs(["reset", "--database", LOCAL_DATABASE, "--confirm", LOCAL_DATABASE]);
assert.equal(validateArgs(resetOk).ok, true);

const productionEnv = validateArgs(seedArgs, { SADHANAYOG_ENV: "production" });
assert.equal(productionEnv.ok, false);
assert.match(productionEnv.error, /SADHANAYOG_ENV=production/);

const plan = buildPlan(resetOk);
assert.equal(plan.database, LOCAL_DATABASE);
assert.ok(plan.actions.some((a) => a.includes("remove local persist")));
assert.ok(plan.migrationFile.endsWith("0000_schema_migrations.sql"));

const dry = run(["reset", "--database", LOCAL_DATABASE, "--confirm", LOCAL_DATABASE, "--dry-run"], {
  write: () => {},
  apply: () => {
    throw new Error("dry-run must not apply");
  },
});
assert.equal(dry.status, 0);
assert.equal(dry.plan.command, "reset");

const applied = [];
const seed = run(["seed", "--database", LOCAL_DATABASE], {
  write: () => {},
  apply: (p) => applied.push(p.command),
});
assert.equal(seed.status, 0);
assert.deepEqual(applied, ["seed"]);

assert.equal(run(["reset", "--database", LOCAL_DATABASE]).status, 2);
assert.equal(run(["seed", "--database", LOCAL_DATABASE, "--remote"]).status, 2);
assert.equal(run(["seed", "--oops"]).status, 2);

const calls = [];
applyPlan(buildPlan(seedArgs), {
  exec: (bin, args, opts) => {
    calls.push({ bin, args, opts });
  },
  rm: () => {
    throw new Error("seed must not delete persist");
  },
  exists: (path) => path.endsWith("wrangler"),
  env: {},
});
assert.equal(calls.length, 1);
assert.ok(calls[0].args.includes("--local"));
assert.ok(!calls[0].args.includes("--remote"));
assert.equal(calls[0].opts.cwd.endsWith("apps/api"), true);

const cliHelp = execFileSync("node", [script, "--help"], { encoding: "utf8", cwd: ROOT });
assert.match(cliHelp, /Local D1 seed\/reset/);

const cliRefuse = (() => {
  try {
    execFileSync("node", [script, "reset", "--database", LOCAL_DATABASE], {
      encoding: "utf8",
      cwd: ROOT,
    });
    return "";
  } catch (err) {
    return `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }
})();
assert.match(cliRefuse, /--confirm/);

const cliRemote = (() => {
  try {
    execFileSync("node", [script, "seed", "--database", LOCAL_DATABASE, "--remote"], {
      encoding: "utf8",
      cwd: ROOT,
    });
    return "";
  } catch (err) {
    return `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }
})();
assert.match(cliRemote, /--remote/);

process.stdout.write("ok: local-db guards\n");
