import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";

const ROOT = join(fileURLToPath(new URL("../..", import.meta.url)));
const track = join(ROOT, "tools/tracker/track.mjs");

const lint = execFileSync("node", [track, "lint"], { encoding: "utf8", cwd: ROOT });
assert.match(lint, /ok: \d+ issues/);

const next = execFileSync("node", [track, "next"], { encoding: "utf8", cwd: ROOT });
assert.match(next, /SY-0001|SY-0002/);

const show = execFileSync("node", [track, "show", "SY-0002"], { encoding: "utf8", cwd: ROOT });
assert.match(show, /Repository and deployment baseline/);

const board = execFileSync("node", [track, "board"], { encoding: "utf8", cwd: ROOT });
assert.match(board, /# Board · \d+ issues/);
assert.match(board, /ready \(\d+\)/);
assert.match(board, /SY-0001 /);

const readyBoard = execFileSync("node", [track, "board", "ready"], {
  encoding: "utf8",
  cwd: ROOT,
});
assert.match(readyBoard, /ready \(\d+\)/);
assert.match(readyBoard, /SY-0001 /);

process.stdout.write("ok: tracker smoke\n");
