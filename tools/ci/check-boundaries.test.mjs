import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";
import { checkBoundaries, importedSpecifiers } from "./check-boundaries.mjs";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const current = checkBoundaries(repoRoot);
assert.deepEqual(current, [], current.join("\n"));

assert.deepEqual(importedSpecifiers(`import x from "@sadhanayog/db";\n`), ["@sadhanayog/db"]);
assert.deepEqual(importedSpecifiers(`const w = require("wrangler");\n`), ["wrangler"]);

const fixture = mkdtempSync(join(tmpdir(), "sy-boundaries-"));
try {
  mkdirSync(join(fixture, "apps/web/src"), { recursive: true });
  mkdirSync(join(fixture, "packages/contracts/src"), { recursive: true });
  mkdirSync(join(fixture, "packages/config"), { recursive: true });
  mkdirSync(join(fixture, "packages/db"), { recursive: true });
  writeFileSync(
    join(fixture, "apps/web/src/bad.ts"),
    `import { schema } from "@sadhanayog/db";\nexport const leak = schema;\n`,
  );
  writeFileSync(
    join(fixture, "packages/contracts/src/bad.ts"),
    `import { createDb } from "../../apps/api/src/index.ts";\nexport const leak = createDb;\n`,
  );
  writeFileSync(
    join(fixture, "apps/web/package.json"),
    JSON.stringify({ dependencies: { "@sadhanayog/db": "workspace:*" } }),
  );
  writeFileSync(
    join(fixture, "packages/contracts/package.json"),
    JSON.stringify({ dependencies: {} }),
  );
  writeFileSync(
    join(fixture, "packages/config/package.json"),
    JSON.stringify({ dependencies: {} }),
  );
  writeFileSync(join(fixture, "packages/db/package.json"), JSON.stringify({ dependencies: {} }));

  const errors = checkBoundaries(fixture);
  assert.ok(
    errors.some((e) => e.includes("web may not import db")),
    errors.join("\n"),
  );
  assert.ok(
    errors.some((e) => e.includes("contracts may not depend on apps or db")),
    errors.join("\n"),
  );
  assert.ok(
    errors.some((e) => e.includes("web package.json may not depend on @sadhanayog/db")),
    errors.join("\n"),
  );
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

process.stdout.write("ok: boundary tests\n");
