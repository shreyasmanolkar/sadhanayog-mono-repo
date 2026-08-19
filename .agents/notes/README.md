# Agent Notes

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0012](../../docs/issue-tracking/issues/SY-0012.md)

An Agent Note records a decision — the why and what we gave up. It is the
ADR system. [docs/architecture/decisions.md](../../docs/architecture/decisions.md)
is a generated index, not a second store.

Path: `.agents/notes/<lifecycle>/<class>/YYYY-MM-DD-<topic>.md`

| Piece | Values |
|---|---|
| lifecycle | `proposed` · `implemented` · `rejected` · `archived` |
| class | `feature` · `bug-fix` · `simplification` · `architecture` · `process` · `testing` |
| file | `YYYY-MM-DD-` plus a lowercase kebab slug. Never reuse a slug or an `ID`. |

Every note starts with:

```text
# Agent Note: <title>

ID: ADR-NNNN
Status: proposed
```

Copy [templates](templates/). Conduct: [AGENTS.md](AGENTS.md). Skill:
[record-decision](../skills/record-decision/SKILL.md).

## Lifecycles

| Directory | Meaning |
|---|---|
| [proposed/](proposed/) | Not current authority |
| [implemented/](implemented/) | Shipped and reflected in code/config/docs |
| [rejected/](rejected/) | Frozen permanently |
| [archived/](archived/) | Former implemented note, frozen |

Only a human architectural reviewer moves high-impact records into
`implemented/`. IDs/slugs are never reused.

## Commands

```bash
pnpm docs:lint          # notes schema + index drift + docs links
pnpm decisions:index    # regenerate docs/architecture/decisions.md
pnpm docs:test          # fixture tests for the linters
```
