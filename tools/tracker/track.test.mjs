import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";

const ROOT = join(fileURLToPath(new URL("../..", import.meta.url)));
const track = join(ROOT, "docs/issue-tracking/track.mjs");

const lint = execFileSync("node", [track, "lint"], { encoding: "utf8", cwd: ROOT });
assert.match(lint, /\d+ issues/);
assert.match(lint, /0 error\(s\)/);

const next = execFileSync("node", [track, "next"], { encoding: "utf8", cwd: ROOT });
assert.match(next, /SY-0001/);

const show = execFileSync("node", [track, "show", "SY-0002"], { encoding: "utf8", cwd: ROOT });
assert.match(show, /Repository and deployment baseline/);

const stats = execFileSync("node", [track, "stats"], { encoding: "utf8", cwd: ROOT });
assert.match(stats, /status/);
assert.match(stats, /in_review/);

const exported = execFileSync("node", [track, "export"], { encoding: "utf8", cwd: ROOT });
assert.match(exported, /board\.html/);
assert.ok(existsSync(join(ROOT, "docs/issue-tracking/board.html")));

process.stdout.write("ok: tracker smoke\n");
