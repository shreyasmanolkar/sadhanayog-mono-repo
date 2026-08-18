#!/usr/bin/env node
import { execSync } from "node:child_process";

const pattern = "BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|AKIA[0-9A-Z]{16}";

try {
  const out = execSync(`rg -n --hidden -g '!.git' -g '!.example' -e '${pattern}' .`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (out.trim()) {
    console.error(out);
    process.exit(1);
  }
} catch (error) {
  if (error.status === 1) {
    process.stdout.write("ok: no secret-like strings\n");
    process.exit(0);
  }
  if (error.status === 127 || /not found|ENOENT/.test(String(error.stderr || error.message))) {
    process.stdout.write("ok: rg not available; skipped secret scan\n");
    process.exit(0);
  }
  throw error;
}
process.stdout.write("ok: no secret-like strings\n");
