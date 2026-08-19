import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import {
  isAllowedLicense,
  normalizeLicense,
  splitLicenseExpr,
  checkLicenses,
  exceptionMatches,
} from "./check-licenses.mjs";

const allow = ["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "CC-BY-4.0"];

assert.equal(normalizeLicense("MIT"), "MIT");
assert.equal(normalizeLicense({ type: "ISC" }), "ISC");
assert.equal(normalizeLicense([{ type: "MIT" }, { type: "Apache-2.0" }]), "MIT OR Apache-2.0");
assert.equal(normalizeLicense(undefined), "UNKNOWN");

assert.deepEqual(splitLicenseExpr("(MIT OR Apache-2.0)"), ["MIT", "Apache-2.0"]);

assert.equal(isAllowedLicense("MIT", allow), true);
assert.equal(isAllowedLicense("MIT OR Apache-2.0", allow), true);
assert.equal(isAllowedLicense("GPL-3.0", allow), false);
assert.equal(isAllowedLicense("MIT AND GPL-3.0", allow), false);
assert.equal(isAllowedLicense("UNKNOWN", allow), false);

assert.equal(
  exceptionMatches(
    { name: "@img/sharp-libvips-linux-x64", version: "1.3.1" },
    { name: "@img/sharp-libvips-*", version: "*" },
  ),
  true,
);
assert.equal(
  exceptionMatches(
    { name: "left-pad", version: "1.0.0" },
    { name: "@img/sharp-libvips-*", version: "*" },
  ),
  false,
);

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const errors = checkLicenses(repoRoot);
assert.deepEqual(errors, [], errors.join("\n"));

process.stdout.write("ok: license tests\n");
