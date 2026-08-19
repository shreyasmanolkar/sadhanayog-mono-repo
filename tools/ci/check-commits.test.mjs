import { strict as assert } from "node:assert";
import { isValidCommitMessage } from "./check-commits.mjs";

assert.equal(isValidCommitMessage("chore: add code quality conventions"), true);
assert.equal(isValidCommitMessage("feat(api): add health live route"), true);
assert.equal(isValidCommitMessage("fix(web)!: drop unused shell prop"), true);
assert.equal(isValidCommitMessage("docs(quality): describe generated files"), true);
assert.equal(isValidCommitMessage("Merge pull request #7 from shreyas/sy-0007"), true);
assert.equal(isValidCommitMessage('Revert "Add node_modules symlinks"'), true);

assert.equal(isValidCommitMessage("Updated the tracker"), false);
assert.equal(isValidCommitMessage("chore: add a trailing period."), false);
assert.equal(isValidCommitMessage("chore:"), false);
assert.equal(isValidCommitMessage("feat(API): bad scope case"), false);
assert.equal(isValidCommitMessage(""), false);

process.stdout.write("ok: commit convention tests\n");
