# Issue tracking

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

`docs/issue-tracking/issues/SY-NNNN.md` is the source of truth. IDs are
zero-padded, monotonic, never reused. Close with `canceled` or `duplicate`;
never delete a file.

```bash
pnpm tracker:lint
pnpm tracker:next
pnpm tracker:board
pnpm tracker:show SY-0002
pnpm tracker:move SY-0002 in_progress
```

See [AGENTS.md](AGENTS.md) for conduct and [templates](templates/task.md).
The seed rule is [implementation-roadmap.md](../roadmap/implementation-roadmap.md) §23.
