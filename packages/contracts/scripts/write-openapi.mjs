import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

const loaded = await import(pathToFileURL(join(root, "../dist/index.js")).href);

const dest = join(root, "../openapi/openapi.json");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, `${JSON.stringify(loaded.openApiDocument, null, 2)}\n`);
