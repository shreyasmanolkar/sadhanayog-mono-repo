#!/usr/bin/env node
/**
 * Local D1 seed and reset. Never touches remote, shared, or production databases.
 *
 *   node tools/ci/local-db.mjs seed --database sadhanayog-dev
 *   node tools/ci/local-db.mjs reset --database sadhanayog-dev --confirm sadhanayog-dev
 */
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const LOCAL_DATABASE = "sadhanayog-dev";
export const PERSIST_DIR = "apps/api/.wrangler/state";
export const MIGRATION_FILE = "packages/db/migrations/0000_schema_migrations.sql";

const FORBIDDEN_NAME = /prod|production|staging|shared/i;

export function parseArgs(argv) {
  const out = {
    command: null,
    database: null,
    confirm: null,
    remote: false,
    dryRun: false,
    help: false,
  };
  const rest = [...argv];
  while (rest.length) {
    const tok = rest.shift();
    if (tok === "--") {
      continue;
    }
    if (tok === "--help" || tok === "-h") {
      out.help = true;
      continue;
    }
    if (tok === "--remote") {
      out.remote = true;
      continue;
    }
    if (tok === "--dry-run") {
      out.dryRun = true;
      continue;
    }
    if (tok === "--database" || tok === "-d") {
      out.database = rest.shift() ?? null;
      continue;
    }
    if (tok.startsWith("--database=")) {
      out.database = tok.slice("--database=".length) || null;
      continue;
    }
    if (tok === "--confirm") {
      out.confirm = rest.shift() ?? true;
      continue;
    }
    if (tok.startsWith("--confirm=")) {
      out.confirm = tok.slice("--confirm=".length);
      continue;
    }
    if (tok.startsWith("-")) {
      throw new Error(`unknown flag: ${tok}`);
    }
    if (!out.command) {
      out.command = tok;
      continue;
    }
    throw new Error(`unexpected argument: ${tok}`);
  }
  return out;
}

export function validateArgs(args, env = process.env) {
  if (args.help) return { ok: true, help: true };
  if (args.command !== "seed" && args.command !== "reset") {
    return { ok: false, error: "command must be seed or reset" };
  }
  if (!args.database) {
    return { ok: false, error: "name the local database with --database sadhanayog-dev" };
  }
  if (FORBIDDEN_NAME.test(args.database) || args.database !== LOCAL_DATABASE) {
    return {
      ok: false,
      error: `refusing database "${args.database}"; only local ${LOCAL_DATABASE} is allowed`,
    };
  }
  if (args.remote) {
    return { ok: false, error: "refusing --remote; this command is local-only" };
  }
  if (env.SADHANAYOG_ENV === "production") {
    return { ok: false, error: "refusing to run when SADHANAYOG_ENV=production" };
  }
  if (args.command === "reset" && args.confirm !== LOCAL_DATABASE) {
    return {
      ok: false,
      error: `reset requires --confirm ${LOCAL_DATABASE} (type the database name)`,
    };
  }
  return { ok: true };
}

export function buildPlan(args) {
  const actions =
    args.command === "reset"
      ? [
          `remove local persist ${PERSIST_DIR} if present`,
          `apply ${MIGRATION_FILE} to local ${LOCAL_DATABASE}`,
        ]
      : [
          `apply ${MIGRATION_FILE} to local ${LOCAL_DATABASE}`,
          "product seed is empty until Stage 3; no tenant rows are inserted",
        ];
  return {
    command: args.command,
    database: LOCAL_DATABASE,
    persistDir: join(ROOT, PERSIST_DIR),
    migrationFile: join(ROOT, MIGRATION_FILE),
    wrangler: join(ROOT, "apps/api/node_modules/.bin/wrangler"),
    actions,
  };
}

export function applyPlan(
  plan,
  { exec = execFileSync, rm = rmSync, exists = existsSync, env = process.env } = {},
) {
  if (env.CLOUDFLARE_API_TOKEN) {
    process.stderr.write(
      "warning: CLOUDFLARE_API_TOKEN is set; this command still uses --local only\n",
    );
  }
  if (plan.command === "reset" && exists(plan.persistDir)) {
    rm(plan.persistDir, { recursive: true, force: true });
  }
  if (!exists(plan.wrangler)) {
    throw new Error("wrangler is not installed; run pnpm bootstrap");
  }
  exec(
    plan.wrangler,
    [
      "d1",
      "execute",
      plan.database,
      "--local",
      "--config",
      "wrangler.jsonc",
      "--file",
      plan.migrationFile,
    ],
    { cwd: join(ROOT, "apps/api"), stdio: "inherit" },
  );
}

export function helpText() {
  return `Local D1 seed/reset. Local ${LOCAL_DATABASE} only.

Usage:
  node tools/ci/local-db.mjs seed --database ${LOCAL_DATABASE}
  node tools/ci/local-db.mjs reset --database ${LOCAL_DATABASE} --confirm ${LOCAL_DATABASE}

Flags:
  --database NAME   Must be ${LOCAL_DATABASE}
  --confirm NAME    Required for reset; must equal the database name
  --dry-run         Print the plan and exit
  --help            Show this help

Refuses --remote and any name matching prod, production, staging, or shared.
`;
}

export function run(argv, io = {}) {
  const write = io.write ?? ((s) => process.stdout.write(s));
  const apply = io.apply ?? applyPlan;
  const env = io.env ?? process.env;
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    return { status: 2, error: err.message };
  }
  const check = validateArgs(args, env);
  if (check.help) {
    write(helpText());
    return { status: 0, help: true };
  }
  if (!check.ok) {
    return { status: 2, error: check.error };
  }
  const plan = buildPlan(args);
  write(`plan: ${plan.command} ${plan.database}\n`);
  for (const action of plan.actions) {
    write(`- ${action}\n`);
  }
  if (args.dryRun) {
    write("dry-run: no changes\n");
    return { status: 0, plan };
  }
  apply(plan);
  write(`${plan.command} complete\n`);
  return { status: 0, plan };
}

function invokedAsCli() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (invokedAsCli()) {
  const result = run(process.argv.slice(2));
  if (result.error) console.error(result.error);
  process.exit(result.status);
}
