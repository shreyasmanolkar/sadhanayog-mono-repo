import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const loaded = await import(pathToFileURL(join(root, "../dist/index.js")).href);

const dest = join(root, "../openapi/openapi.json");
mkdirSync(dirname(dest), { recursive: true });
const document = {
  ...loaded.openApiDocument,
  "x-generated-from": "packages/contracts/src/openapi.ts",
  "x-generated-by": "packages/contracts/scripts/write-openapi.mjs",
};
writeFileSync(dest, `${JSON.stringify(document, null, 2)}\n`);
