# Issue tracking

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

`docs/issue-tracking/issues/SY-NNNN.md` is the source of truth. IDs are
zero-padded, monotonic, never reused. Close with `canceled` or `duplicate`;
never delete a file.

```bash
node tools/tracker/track.mjs lint
node tools/tracker/track.mjs next
node tools/tracker/track.mjs show SY-0002
node tools/tracker/track.mjs move SY-0002 in_progress
```

See [AGENTS.md](AGENTS.md) for conduct and [templates](templates/task.md).
The seed rule is [implementation-roadmap.md](../roadmap/implementation-roadmap.md) §23.
