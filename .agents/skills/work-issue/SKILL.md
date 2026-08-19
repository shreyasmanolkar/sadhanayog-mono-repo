---
name: work-issue
description: Execute one ready Sadhana Yog tracker issue end to end. Use when the user names an SY-NNNN issue to implement, asks for the next unblocked tracker item, or says work-issue. Do not use for ADR-only work, production release, incident response, or schema design without a ready issue.
---

# work-issue

Input: issue ID (`SY-NNNN`) or `next`.

## Steps

1. `pnpm tracker:show <ID>` (or `pnpm tracker:next`).
2. Confirm status is `ready` and every `blocked_by` is `done`.
3. Read root/scoped `AGENTS.md`, the issue, cited foundation sections, implemented notes.
4. `pnpm tracker:move <ID> in_progress`. Reserve named files only.
5. Implement the smallest slice. New scope becomes a linked issue.
6. Run focused tests, then `pnpm verify` (and Flutter if touched).
7. Update docs/notes/issue in the same change. `pnpm tracker:move <ID> in_review`.

## Stop

Blocked or not `ready`. Protected or human-gated work. Unclear product behavior. Never weaken a test to go green.

## Validate

`pnpm tracker:lint` plus issue acceptance evidence, then `pnpm verify`.

## Examples

- Match: "implement SY-0014"; "pick up the next unblocked tracker item".
- Do not match: "create an Agent Note"; "rollback production".

## References

- [`docs/issue-tracking/AGENTS.md`](../../../docs/issue-tracking/AGENTS.md)
- [`AGENTS.md`](../../../AGENTS.md)
- engineering-foundation.md §26–27
