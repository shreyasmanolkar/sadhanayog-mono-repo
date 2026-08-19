# AGENTS.md

Sadhana Yog Command Center is a private studio operations product. This file
routes. It does not replace architecture documents.

## Instruction precedence

More-specific scoped `AGENTS.md` files override this file when they conflict.
This file overrides informal habit and chat memory.

Conflicts between code, product docs, decision notes, and issues are defects.
Do not pick silently — record the contradiction and stop if it is material.

| Kind of fact | Where it lives |
|---|---|
| Executable behavior | `apps/`, `packages/`, tests |
| Intended architecture | [docs/architecture/engineering-foundation.md](docs/architecture/engineering-foundation.md) |
| Current decision rationale | [implemented Agent Notes](.agents/notes/implemented/) |
| Proposed decisions | [proposed Agent Notes](.agents/notes/README.md) |
| Work lifecycle | [docs/issue-tracking/AGENTS.md](docs/issue-tracking/AGENTS.md) |
| Product language | [docs/product](docs/product/README.md) once Stage 2 lands |

## Mandatory reading before implementation

1. This file and the nearest scoped `AGENTS.md`
2. The Ready issue, its parent, and `blocked_by`
3. [Engineering foundation](docs/architecture/engineering-foundation.md) sections the issue cites
4. Implemented notes in `.agents/notes/implemented/`
5. API/schema/security docs for the touched area

Proposed notes are not authority.

## Safety

Stop and ask a human before:

- changing approved product behavior, roles, retention, or durable architecture
- accessing raw user data, secrets, production logs, or backups
- creating or deleting remote resources, DNS, identity, or CI permissions
- remote/shared/production migrations, restores, imports, or deletes
- weakening tests or security controls
- mobile signing, store submission, or production deploy
- destructive legacy cleanup

The backend is authoritative. Client checks are not authorization.

## Issue lifecycle

```text
ready → in_progress → implement + test → in_review → (human gate) → done
```

Use `pnpm tracker:next` to pick work. Never start a blocked
issue. Update the issue in the same commit as the code.

Implemented notes may be absent; that means none are in force,
not that proposed notes apply.

## Skills

Workflows live in [`.agents/skills`](.agents/skills). Load the matching
skill; do not invent a parallel procedure. Catalog:
[docs/development/agent-instructions.md](docs/development/agent-instructions.md).

## Validation

```bash
pnpm verify
pnpm tracker:lint
```

On a machine with Flutter:

```bash
cd apps/mobile && flutter analyze && flutter test
```

Do not disable a control or weaken a test to make a check green.
