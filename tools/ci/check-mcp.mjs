#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const INVENTORY_PATH = join(ROOT, "tools/ci/mcp-inventory.json");
const CODEX_PATH = join(ROOT, ".codex/config.toml");
const GROK_PATH = join(ROOT, ".grok/config.toml");
const ENV_EXAMPLE_PATH = join(ROOT, ".env.example");

const FORBIDDEN_NAME_RE =
  /github|sentry|figma|filesystem|shell|sqlite|postgres|^d1$|d1_|_d1|r2_|_r2|^r2$|secret|observability|logpush|auditlog|cloudflare[_-]?api/;

export function stripTomlComment(line) {
  let out = "";
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      out += ch;
      if (ch === quote && line[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) break;
    out += ch;
  }
  return out.replace(/\s+$/, "");
}

function splitTopLevel(src, sep = ",") {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      cur += ch;
      if (ch === quote && src[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth += 1;
    if (ch === "]" || ch === "}") depth -= 1;
    if (ch === sep && depth === 0) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

export function parseTomlValue(raw) {
  const src = raw.trim();
  if (src === "true") return true;
  if (src === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(src)) return Number(src);
  if ((src.startsWith('"') && src.endsWith('"')) || (src.startsWith("'") && src.endsWith("'"))) {
    return src.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (src.startsWith("[") && src.endsWith("]")) {
    const inner = src.slice(1, -1).trim();
    if (!inner) return [];
    return splitTopLevel(inner).map((item) => parseTomlValue(item));
  }
  if (src.startsWith("{") && src.endsWith("}")) {
    const inner = src.slice(1, -1).trim();
    const obj = {};
    if (!inner) return obj;
    for (const part of splitTopLevel(inner)) {
      const eq = part.indexOf("=");
      if (eq === -1) throw new Error(`bad inline table entry: ${part}`);
      const key = part
        .slice(0, eq)
        .trim()
        .replace(/^["']|["']$/g, "");
      obj[key] = parseTomlValue(part.slice(eq + 1));
    }
    return obj;
  }
  throw new Error(`unsupported TOML value: ${src}`);
}

function completeValue(src) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quote) {
      if (ch === quote && src[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth += 1;
    if (ch === "]" || ch === "}") depth -= 1;
  }
  return depth === 0 && quote === null;
}

export function parseSimpleToml(src) {
  const tables = { "": {} };
  let current = "";
  const lines = src.split(/\r?\n/).map(stripTomlComment);
  let pending = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed && !pending) continue;
    if (pending) {
      pending.value += ` ${trimmed}`;
      if (completeValue(pending.value)) {
        tables[pending.table][pending.key] = parseTomlValue(pending.value);
        pending = null;
      }
      continue;
    }
    if (trimmed.startsWith("[")) {
      current = trimmed.slice(1, -1).trim();
      tables[current] ??= {};
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) throw new Error(`bad TOML line: ${trimmed}`);
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    tables[current] ??= {};
    if (!completeValue(value)) {
      pending = { table: current, key, value };
      continue;
    }
    tables[current][key] = parseTomlValue(value);
  }
  if (pending) throw new Error(`unclosed TOML value for ${pending.key}`);
  return tables;
}

export function mcpServersFromToml(tables) {
  const servers = {};
  for (const [name, table] of Object.entries(tables)) {
    const match = name.match(/^mcp_servers\.([A-Za-z0-9_-]+)(?:\.(.+))?$/);
    if (!match) continue;
    const [, server, nested] = match;
    servers[server] ??= {};
    if (nested) servers[server][nested] = { ...table };
    else Object.assign(servers[server], table);
  }
  return servers;
}

export function looksLikeSecret(value) {
  if (typeof value !== "string") return false;
  if (/\$\{[A-Z][A-Z0-9_]*\}/.test(value)) {
    const without = value.replace(/\$\{[A-Z][A-Z0-9_]*\}/g, "");
    if (!/Bearer\s+[A-Za-z0-9._-]{16,}/.test(without)) return false;
  }
  return (
    /sk-[A-Za-z0-9]{10,}/.test(value) ||
    /ghp_[A-Za-z0-9]{20,}/.test(value) ||
    /github_pat_[A-Za-z0-9_]{20,}/.test(value) ||
    /AKIA[0-9A-Z]{16}/.test(value) ||
    /BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/.test(value) ||
    (/Bearer\s+[A-Za-z0-9._-]{24,}/.test(value) && !value.includes("${"))
  );
}

function collectStrings(value, acc = []) {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, acc));
  else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, acc);
  }
  return acc;
}

function originSet(arg) {
  const prefix = "--allowed-origins=";
  if (!arg.startsWith(prefix)) return null;
  return new Set(arg.slice(prefix.length).split(";").filter(Boolean));
}

export function validateServers(label, servers, inventory, { requireCodexFields }) {
  const errors = [];
  const expectedNames = Object.keys(inventory.servers);
  const actualNames = Object.keys(servers).sort();
  if (actualNames.join(",") !== [...expectedNames].sort().join(",")) {
    errors.push(
      `${label}: servers must be {${expectedNames.join(", ")}}; found {${actualNames.join(", ")}}`,
    );
  }

  for (const name of actualNames) {
    if (FORBIDDEN_NAME_RE.test(name)) {
      errors.push(`${label}: forbidden server name ${name}`);
    }
    const server = servers[name];
    for (const text of collectStrings(server)) {
      if (looksLikeSecret(text)) {
        errors.push(`${label}.${name}: secret-like value committed`);
      }
      if (
        /^https?:\/\/.+mcp\.cloudflare\.com\//.test(text) &&
        !text.startsWith("https://docs.mcp.cloudflare.com/")
      ) {
        errors.push(`${label}.${name}: forbidden Cloudflare MCP URL ${text}`);
      }
    }
  }

  const context7 = servers.context7;
  if (context7) {
    if (context7.url !== inventory.servers.context7.url) {
      errors.push(`${label}.context7.url: expected ${inventory.servers.context7.url}`);
    }
    if (context7.enabled !== true) errors.push(`${label}.context7.enabled must be true`);
    if (requireCodexFields) {
      if (context7.bearer_token_env_var !== inventory.context7TokenEnv) {
        errors.push(`${label}.context7.bearer_token_env_var must be ${inventory.context7TokenEnv}`);
      }
      const tools = [...(context7.enabled_tools ?? [])].sort();
      const expected = [...inventory.context7Tools].sort();
      if (tools.join(",") !== expected.join(",")) {
        errors.push(`${label}.context7.enabled_tools must be exactly ${expected.join(", ")}`);
      }
      if (context7.default_tools_approval_mode !== inventory.servers.context7.approval) {
        errors.push(
          `${label}.context7.default_tools_approval_mode must be ${inventory.servers.context7.approval}`,
        );
      }
    }
  }

  const docs = servers.cloudflare_docs;
  if (docs) {
    if (docs.url !== inventory.servers.cloudflare_docs.url) {
      errors.push(
        `${label}.cloudflare_docs.url: expected ${inventory.servers.cloudflare_docs.url}`,
      );
    }
    if (docs.enabled !== true) errors.push(`${label}.cloudflare_docs.enabled must be true`);
    if (
      requireCodexFields &&
      docs.default_tools_approval_mode !== inventory.servers.cloudflare_docs.approval
    ) {
      errors.push(
        `${label}.cloudflare_docs.default_tools_approval_mode must be ${inventory.servers.cloudflare_docs.approval}`,
      );
    }
  }

  const playwright = servers.playwright;
  if (playwright) {
    if (playwright.enabled !== false) {
      errors.push(`${label}.playwright.enabled must be false by default`);
    }
    if (playwright.command !== "npx") {
      errors.push(`${label}.playwright.command must be npx`);
    }
    const args = playwright.args ?? [];
    if (!args.includes("-y")) errors.push(`${label}.playwright.args must include -y`);
    if (!args.includes(inventory.playwrightPackage)) {
      errors.push(`${label}.playwright must pin ${inventory.playwrightPackage}`);
    }
    if (args.some((arg) => String(arg).includes("@latest"))) {
      errors.push(`${label}.playwright must not use @latest`);
    }
    if (!args.includes("--headless")) {
      errors.push(`${label}.playwright.args must include --headless`);
    }
    if (!args.includes("--isolated")) {
      errors.push(`${label}.playwright.args must include --isolated`);
    }
    const originsArg = args.find((arg) => String(arg).startsWith("--allowed-origins="));
    const origins = originsArg ? originSet(String(originsArg)) : null;
    const expectedOrigins = new Set(inventory.allowedOrigins);
    if (
      !origins ||
      origins.size !== expectedOrigins.size ||
      [...expectedOrigins].some((origin) => !origins.has(origin))
    ) {
      errors.push(`${label}.playwright --allowed-origins must be the local web/API hosts only`);
    }
    if (!args.includes(`--output-dir=${inventory.playwrightOutputDir}`)) {
      errors.push(`${label}.playwright --output-dir must be ${inventory.playwrightOutputDir}`);
    }
    if (
      requireCodexFields &&
      playwright.default_tools_approval_mode !== inventory.servers.playwright.approval
    ) {
      errors.push(
        `${label}.playwright.default_tools_approval_mode must be ${inventory.servers.playwright.approval}`,
      );
    }
  }

  return errors;
}

export function runSelfTest() {
  const inventory = JSON.parse(readFileSync(INVENTORY_PATH, "utf8"));
  const errors = [];
  const okToml = readFileSync(CODEX_PATH, "utf8");
  const okServers = mcpServersFromToml(parseSimpleToml(okToml));
  const okErrors = validateServers("self.ok", okServers, inventory, {
    requireCodexFields: true,
  });
  if (okErrors.length) errors.push(`self-test ok fixture failed: ${okErrors.join("; ")}`);

  const latest = okToml.replace("@playwright/mcp@0.0.79", "@playwright/mcp@latest");
  const latestErrors = validateServers(
    "self.latest",
    mcpServersFromToml(parseSimpleToml(latest)),
    inventory,
    { requireCodexFields: true },
  );
  if (!latestErrors.some((err) => err.includes("@latest"))) {
    errors.push("self-test: @latest must fail");
  }

  const withGithub = `${okToml}\n[mcp_servers.github]\nurl = "https://example.com/mcp"\n`;
  const githubErrors = validateServers(
    "self.github",
    mcpServersFromToml(parseSimpleToml(withGithub)),
    inventory,
    { requireCodexFields: true },
  );
  if (!githubErrors.some((err) => err.includes("github"))) {
    errors.push("self-test: github server must fail");
  }

  if (!looksLikeSecret("Bearer supersecrettokenvalue1234567890")) {
    errors.push("self-test: bearer token must look like a secret");
  }
  if (looksLikeSecret("Bearer ${CONTEXT7_API_KEY}")) {
    errors.push("self-test: env reference must not look like a secret");
  }

  return errors;
}

function readTomlServers(path) {
  if (!existsSync(path)) throw new Error(`missing ${path}`);
  return mcpServersFromToml(parseSimpleToml(readFileSync(path, "utf8")));
}

export function checkRepository() {
  const errors = [];
  if (!existsSync(INVENTORY_PATH)) errors.push("missing tools/ci/mcp-inventory.json");
  if (!existsSync(CODEX_PATH)) errors.push("missing .codex/config.toml");
  if (!existsSync(GROK_PATH)) errors.push("missing .grok/config.toml");
  if (errors.length) return errors;

  const inventory = JSON.parse(readFileSync(INVENTORY_PATH, "utf8"));
  const envExample = readFileSync(ENV_EXAMPLE_PATH, "utf8");
  if (!envExample.includes(inventory.context7TokenEnv)) {
    errors.push(`.env.example must name ${inventory.context7TokenEnv}`);
  }

  try {
    errors.push(
      ...validateServers("codex", readTomlServers(CODEX_PATH), inventory, {
        requireCodexFields: true,
      }),
    );
  } catch (err) {
    errors.push(`codex: ${err instanceof Error ? err.message : String(err)}`);
  }

  try {
    errors.push(
      ...validateServers("grok", readTomlServers(GROK_PATH), inventory, {
        requireCodexFields: false,
      }),
    );
  } catch (err) {
    errors.push(`grok: ${err instanceof Error ? err.message : String(err)}`);
  }

  errors.push(...runSelfTest());
  return errors;
}

function main() {
  const errors = checkRepository();
  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  process.stdout.write("ok: mcp inventory, .codex/config.toml, .grok/config.toml\n");
}

main();
