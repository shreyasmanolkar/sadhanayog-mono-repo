# Agent instructions and skills

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0014](../issue-tracking/issues/SY-0014.md)  
Sources: [engineering foundation](../architecture/engineering-foundation.md) §18, §26–27;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 1 item 6

This is the named SY-0014 outcome. Root `AGENTS.md` stays the compact
router. Skills are the task-local workflows. This file is the catalog
and authority map, not a second architecture document.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | Root and scoped `AGENTS.md`, `.agents/skills`, this catalog, skill `quick_validate` and trigger tests |
| Database | None. |
| API | None. |
| Flutter | None. |
| Web | None. |
| Infrastructure | None. MCP config is [SY-0015](../issue-tracking/issues/SY-0015.md). CI workflow files are [SY-0016](../issue-tracking/issues/SY-0016.md). Skill checks are wired into `pnpm verify` so they run wherever verify runs. |

## Instruction map

Foundation §18.1: nested `AGENTS.md` files exist only where rules
genuinely differ. The nearest file adds local rules and must not repeat
the root.

| Path | Adds |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | Precedence, safety, lifecycle, verification, skill pointer |
| [`apps/api/AGENTS.md`](../../apps/api/AGENTS.md) | Worker authority, no persistence rows, local D1 |
| [`apps/web/AGENTS.md`](../../apps/web/AGENTS.md) | Route guards are UX; same-origin `/api` |
| [`apps/mobile/AGENTS.md`](../../apps/mobile/AGENTS.md) | DTO/domain split, no secrets in the binary |
| [`packages/db/AGENTS.md`](../../packages/db/AGENTS.md) | Reviewed SQL, no production push |
| [`content/AGENTS.md`](../../content/AGENTS.md) | Stable IDs, no media, no legacy iframe |
| [`docs/issue-tracking/AGENTS.md`](../issue-tracking/AGENTS.md) | Tracker conduct |
| [`.agents/notes/AGENTS.md`](../../.agents/notes/AGENTS.md) | Decision-note transitions |
| [`docs/discovery/AGENTS.md`](../discovery/AGENTS.md) | Extra to §18.1. Stage 0 evidence rules differ, so the file stays. |

Proposed Agent Notes are not authority. Implemented notes may be absent;
that means none are in force.

## Skills

Twelve skills, the foundation §18.3 set. No others. Each `SKILL.md`
follows the [Agent Skills](https://agentskills.io/specification) frontmatter
(`name`, `description`) and carries Stop, Validate, Examples, and
References.

| Skill | Invoke when |
|---|---|
| [`work-issue`](../../.agents/skills/work-issue/SKILL.md) | A named `SY-NNNN` issue or next unblocked tracker item |
| [`record-decision`](../../.agents/skills/record-decision/SKILL.md) | Durable architecture/process choice or ADR transition |
| [`model-domain`](../../.agents/skills/model-domain/SKILL.md) | Terminology, invariants, workflows; before schema/API design |
| [`change-d1-schema`](../../.agents/skills/change-d1-schema/SKILL.md) | Drizzle/SQL/D1 schema or migration |
| [`build-worker-api`](../../.agents/skills/build-worker-api/SKILL.md) | Worker route or use-case behavior |
| [`build-flutter-feature`](../../.agents/skills/build-flutter-feature/SKILL.md) | Flutter slice from an approved contract |
| [`build-web-feature`](../../.agents/skills/build-web-feature/SKILL.md) | TanStack web slice |
| [`handle-r2-object`](../../.agents/skills/handle-r2-object/SKILL.md) | Private R2 document lifecycle |
| [`review-security-privacy`](../../.agents/skills/review-security-privacy/SKILL.md) | Auth, data, files, privacy, or requested audit |
| [`audit-accessibility-parity`](../../.agents/skills/audit-accessibility-parity/SKILL.md) | Before a cross-platform feature closes |
| [`review-change`](../../.agents/skills/review-change/SKILL.md) | Independent review before merge |
| [`manage-release-incident`](../../.agents/skills/manage-release-incident/SKILL.md) | RC, production release, rollback, qualifying incident |

UI/UX, testing, documentation, and issue management stay inside those
workflows. Do not add decorative skills.

## Agent authority

The durable list is root [`AGENTS.md`](../../AGENTS.md) Safety. Do not
copy it here. Each skill adds task-local Stop rules. Bootstrap operator
detail lives under [development](README.md).

The backend is authoritative. Client checks are not authorization.

## Commands

| Command | Meaning |
|---|---|
| `pnpm skills:lint` | `quick_validate`: Agent Skills frontmatter, required set, AGENTS.md presence |
| `pnpm skills:test` | Representative trigger/use classification from `name`+`description` |
| `pnpm verify` | Includes both skill checks |

Matching is deterministic (IDF-weighted token overlap against the
`Use when` clause of each description, not the `Do not use` clause).
It guards description quality; it does not invoke a model.

No new package was added. `skills-ref` would have needed human approval
to install. The harness follows the existing Node `tools/ci` pattern.

## Stage exit this issue owns

| Stage 1 exit row | This issue |
|---|---|
| Create/validate an issue and an ADR | `work-issue` and `record-decision`; trigger tests |
| Understand protected operations from documentation | Root Safety + each skill's Stop |
| Skill trigger tests | `pnpm skills:lint` and `pnpm skills:test` |
| Clone/bootstrap, three apps, CI host workflow | Deferred: SY-0017, SY-0010, SY-0016 |
| Tracker invalid-state fixtures | Deferred: SY-0013 |

## Human decisions

None for this issue. Skill names and scoped instruction locations are
specified by foundation §18. Unsigned Stage 1 decisions (CI host, pins,
licenses, shared development environment, protected-path reviewers)
remain on [SY-0008](../issue-tracking/issues/SY-0008.md).
