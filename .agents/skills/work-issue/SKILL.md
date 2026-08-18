---
name: work-issue
description: Execute one ready Sadhana Yog issue end to end. Use when the user names an SY-NNNN issue or asks to implement the next unblocked tracker item.
---

# work-issue

Input: issue ID.

1. `node tools/tracker/track.mjs show <ID>`
2. Confirm status is `ready` and every `blocked_by` is `done`.
3. Read root/scoped AGENTS.md, the issue, foundation sections, implemented notes.
4. `move` to `in_progress`. Reserve the named files only.
5. Implement the smallest slice. New scope becomes a linked issue.
6. Run focused tests, then `pnpm verify` (and Flutter if touched).
7. Update docs/notes/issue in the same change. `move` to `in_review`.

Never start a blocked issue. Never weaken a test to go green.
