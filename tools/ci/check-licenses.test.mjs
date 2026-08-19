#!/usr/bin/env node
import { strict as assert } from "node:assert";
import {
  licenseAllowed,
  findDisallowed,
  packagesFromPnpmLicenses,
  parsePnpmFolder,
  flutterGitDeps,
} from "./check-licenses.mjs";

assert.equal(licenseAllowed("MIT"), true);
assert.equal(licenseAllowed("Apache-2.0"), true);
assert.equal(licenseAllowed("Apache License, Version 2.0"), true);
assert.equal(licenseAllowed("MIT OR Apache-2.0"), true);
assert.equal(licenseAllowed("(BSD-3-Clause OR MIT)"), true);
assert.equal(licenseAllowed("MIT AND ISC"), true);
assert.equal(licenseAllowed(""), false);
assert.equal(licenseAllowed("UNKNOWN"), false);
assert.equal(licenseAllowed("GPL-3.0"), false);
assert.equal(licenseAllowed("MIT AND GPL-3.0"), false);
assert.equal(licenseAllowed("AGPL-3.0"), false);
assert.equal(licenseAllowed("LGPL-3.0-or-later"), true);

const grouped = {
  MIT: [{ name: "zod", versions: ["4.1.5"] }],
  "GPL-3.0": [{ name: "evil", version: "1.0.0", license: "GPL-3.0" }],
};
const pkgs = packagesFromPnpmLicenses(grouped);
assert.equal(pkgs.length, 2);
const bad = findDisallowed(pkgs);
assert.equal(bad.length, 1);
assert.match(bad[0], /evil/);
assert.deepEqual(findDisallowed([{ name: "@sadhanayog/db", version: "0.1.0", license: "" }]), []);

assert.deepEqual(parsePnpmFolder("zod@4.1.5"), { name: "zod", version: "4.1.5" });
assert.deepEqual(parsePnpmFolder("@eslint+js@9.34.0"), {
  name: "@eslint/js",
  version: "9.34.0",
});
assert.deepEqual(parsePnpmFolder("zod@4.1.5_typescript@5.9.2"), {
  name: "zod",
  version: "4.1.5",
});

assert.deepEqual(flutterGitDeps("dependencies:\n  flutter:\n    sdk: flutter\n"), []);
assert.equal(
  flutterGitDeps("dependencies:\n  foo:\n    git: https://example.com/foo.git\n").length,
  1,
);

process.stdout.write("ok: license policy tests\n");
