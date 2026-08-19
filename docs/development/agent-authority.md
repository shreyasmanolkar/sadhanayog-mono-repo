# Agent authority

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0017](../issue-tracking/issues/SY-0017.md)

This page points at the rules. It is not a second architecture document.

| Kind of fact | Where it lives |
|---|---|
| Executable behavior | `apps/`, `packages/`, tests |
| Intended architecture | [engineering-foundation.md](../architecture/engineering-foundation.md) (still Proposed) |
| Current decision rationale | [Agent Notes](../../.agents/notes/README.md) (`implemented/` appears when a human accepts a note) |
| Proposed decisions | [proposed Agent Notes](../../.agents/notes/README.md) — **not authority** |
| Work lifecycle | [docs/issue-tracking/AGENTS.md](../issue-tracking/AGENTS.md) |
| Protected-path reviewers | [`.github/CODEOWNERS`](../../.github/CODEOWNERS) (placeholder: `@shreyas`) |

Root [AGENTS.md](../../AGENTS.md) and the nearest scoped `AGENTS.md` win over chat habit.

## An agent may, unprompted

Read the tree, create a local branch, implement a **ready** issue whose blockers are `done`, run local deterministic tools, create synthetic fixtures, file a `triage` issue, and propose an Agent Note.

## An agent must stop and ask

- Approved product behavior, roles, retention, or durable architecture
- Raw user data, secrets, production logs, or backups
- Creating or deleting remote resources, DNS, identity, or CI permissions
- Remote / shared / production migrations, restores, imports, or deletes
- Weakening tests or security controls
- Mobile signing, store submission, or production deploy
- Destructive legacy cleanup

The backend is authoritative. Client checks are not authorization.

Local D1 seed/reset commands, when they exist, are SY-0017. They are not permission to touch a Cloudflare account.

Project MCP is documented in [mcp.md](mcp.md). Agents may query Context7 and Cloudflare **documentation**. They must stop before adding a server, committing a token, enabling headed Playwright against a personal profile, or calling a Cloudflare account API through MCP.
