# Documentation map

Status: draft program — not architecture-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0012](issue-tracking/issues/SY-0012.md)  
Sources: [engineering foundation](architecture/engineering-foundation.md) §5, §17–18, §21;
[implementation roadmap](roadmap/implementation-roadmap.md) Stage 1

This file is the named SY-0012 outcome: the documentation hierarchy, owners,
indexes, Agent Note lifecycle, postmortem template, and runbook placeholders.
It is not a signed architecture approval and it does not close sibling Stage 1
work.

## Purpose

Make the repository navigable and the decision trail enforceable. A contributor
or agent can find the owner of a document, create and lint an ADR, and see
which operations documents are placeholders versus executable runbooks.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | This map; `.agents/notes` lifecycle, templates, and validator; generated [architecture/decisions.md](architecture/decisions.md); postmortem template; runbook name placeholders. |
| Database | None. |
| API | None. |
| Flutter | None. |
| Web | None. |
| Infrastructure | None. No production resources, DNS, identity apps, or secret values. |

Sibling issues still own the tracker ([SY-0013](issue-tracking/issues/SY-0013.md)),
skills ([SY-0014](issue-tracking/issues/SY-0014.md)), MCP
([SY-0015](issue-tracking/issues/SY-0015.md)), CI
([SY-0016](issue-tracking/issues/SY-0016.md)), and developer bootstrap
([SY-0017](issue-tracking/issues/SY-0017.md)).

## Artifact map

| Artifact | Owner | Status 2026-08-19 |
|---|---|---|
| [README.md](README.md) (this map) | SY-0012 | Draft, reviewable |
| [architecture/decisions.md](architecture/decisions.md) | SY-0012 | Generated from Agent Notes |
| [`.agents/notes/README.md`](../.agents/notes/README.md), [AGENTS.md](../.agents/notes/AGENTS.md) | SY-0012 | Lifecycle and conduct |
| `.agents/notes/templates/*.md` | SY-0012 | proposed / implemented / rejected / archived |
| `.agents/notes/{proposed,implemented,rejected,archived}/` | SY-0012 | `proposed/` has stack notes; other lifecycle dirs exist for transitions |
| `tools/ci/lint-docs.mjs`, `tools/ci/lint-decisions.mjs` | SY-0012 | Hierarchy, headers, links, note schema, index drift |
| [postmortems/README.md](postmortems/README.md), [postmortems/template.md](postmortems/template.md) | SY-0012 | Template only; no incident files |
| [operations/runbooks/](operations/runbooks/README.md) | SY-0012 names; [SY-0119](issue-tracking/issues/SY-0119.md) writes | Placeholders |
| [development/setup.md](development/setup.md), [commands.md](development/commands.md) | [SY-0017](issue-tracking/issues/SY-0017.md) | Present; clean-machine evidence still on SY-0017 |

Do not close a sibling because its files exist on this branch.

## Hierarchy and owners

Each `docs/**/README.md` carries `Status`, `Owner`, and `Last-reviewed`.
`pnpm docs:lint` enforces that and the links.

| Location | Canonical responsibility | Maintainer trigger |
|---|---|---|
| [../README.md](../README.md) | Product purpose, quick start | Bootstrap/workflow change |
| [discovery](discovery/README.md) | Legacy inventories and migration evidence | New evidence |
| [product](product/README.md) | Terminology, workflows, parity | Product decision (Stage 2) |
| [architecture](architecture/README.md) | System view and ADR index | Architectural change |
| [architecture/agentic-development-environment.md](architecture/agentic-development-environment.md) | Research briefing on the repository-native agentic environment | Agent-process evolution |
| [api](api/README.md) | API conventions | Contract change |
| [database](database/README.md) | Schema, dictionary, migrations | Schema change |
| [security](security/README.md) | Threat model, authz matrix | Threat/control change |
| [development](development/README.md) | Stage 1 program, setup, commands, [style](development/style.md) | Tooling change or Stage 1 exit account |
| [development/agent-instructions.md](development/agent-instructions.md) | Agent instruction map and skill catalog | Instruction or skill change |
| [development/mcp.md](development/mcp.md) | Project MCP inventory and tool permissions | MCP server or agent-tool policy change |
| [testing](testing/README.md) | Test policy | Quality-gate change |
| [deployment](deployment/README.md) | Environments and promotion | Deploy change |
| [operations](operations/README.md) | Runbooks and troubleshooting | Incident or drill |
| [issue-tracking](issue-tracking/README.md) | Work lifecycle | Every work transition |
| [../.agents/notes](../.agents/notes/README.md) | Why a choice was made | Architecture choice |
| [postmortems](postmortems/README.md) | Systemic failure learning | Qualifying incident |
| [roadmap](roadmap/README.md) | Staged implementation intent | Sequencing decision |

Code and tests are executable truth. Product docs are intended behavior.
Decision records explain why. Issues track work state. Contradictions are
defects; agents must not silently choose one.

## Decision system

Path: `.agents/notes/<lifecycle>/<class>/YYYY-MM-DD-<topic>.md`.

- Lifecycles: `proposed` → `implemented` or `rejected`; `implemented` → `archived`.
- Classes: `feature`, `bug-fix`, `simplification`, `architecture`, `process`, `testing`.
- Stable id: `ID: ADR-NNNN` inside the file. IDs and slugs are never reused.
- [architecture/decisions.md](architecture/decisions.md) is generated
  (`pnpm decisions:index`). It is not a second store.
- Proposed notes are not authority. Only a human architectural reviewer moves
  high-impact notes into `implemented/`.
- Copy a template from `.agents/notes/templates/`. Validate with
  `pnpm docs:lint`.

Foundation §18.2 names files `proposed/ADR-NNNN-slug.md`. The on-disk
convention already used class/date-slug paths. That contradiction is recorded
in [ADR-0009](../.agents/notes/proposed/process/2026-08-19-decision-record-paths.md)
and is **not** resolved here.

## Setup, commands, generated files, environment, authority

Operational bootstrap evidence belongs to SY-0017. This map only fixes the
nouns.

| Topic | Where it lives | Rule |
|---|---|---|
| Setup | [development/setup.md](development/setup.md) | `mise install` then `pnpm bootstrap`. Copy names from [`.env.example`](../.env.example); values stay out of Git. |
| Commands | [development/commands.md](development/commands.md) | `pnpm verify`, `pnpm dev`, tracker CLIs, `db:*`, Flutter from `apps/mobile`. |
| Troubleshooting | [operations/troubleshooting/README.md](operations/troubleshooting/README.md) | Tracker, Wrangler assets, missing Flutter, health ready 503. |
| Generated files | [architecture/decisions.md](architecture/decisions.md) (this issue); `packages/contracts/openapi/openapi.json` (committed); `docs/issue-tracking/index.md` (tracker); `apps/web/src/routeTree.gen.ts` (gitignored) | Drift: `pnpm docs:lint` and `pnpm generated:check`. Never commit `.dev.vars`, D1/R2 state, or signing files. |
| Dependencies | Root `package.json` / `pnpm-lock.yaml`; Flutter `pubspec.lock` | One JS lockfile. No Turborepo/Nx. License SPDX is unsigned. |
| Environment matrix | [deployment/README.md](deployment/README.md) | Local and CI only in Stage 1. No shared development, staging, or production resources from this issue. |
| Agent authority | Root [AGENTS.md](../AGENTS.md), scoped `AGENTS.md`, [CODEOWNERS](../.github/CODEOWNERS), this file, [record-decision](../.agents/skills/record-decision/SKILL.md) | Proposed notes are not authority. Production, secrets, migrations, and protected paths need a human. The backend remains authorization. |

## Postmortems and runbooks

Create a postmortem only for a production, security, privacy, data-loss, failed
migration, prolonged outage, or repeatedly escaped systemic defect. Template:
[postmortems/template.md](postmortems/template.md). Never paste credentials or
unnecessary personal data.

Runbook **names** live under [operations/runbooks/](operations/runbooks/README.md).
They are placeholders. Stage 15 ([SY-0119](issue-tracking/issues/SY-0119.md))
writes the first executable runbooks. Restore/disaster drill is
[SY-0126](issue-tracking/issues/SY-0126.md).

## Exit criteria

Stage 1 is done only when every row below is satisfied. This issue records
the criteria it owns and defers the rest.

| Stage 1 exit criterion | This issue | Remainder |
|---|---|---|
| Create/validate an ADR | Templates, lifecycle dirs, `ID: ADR-NNNN`, `pnpm docs:lint`, `pnpm decisions:index` | Human promotion of stack notes to `implemented/` |
| Understand protected operations from documentation | This map, notes conduct, CODEOWNERS pointer, postmortem/runbook placeholders | Reviewer identities (unsigned). Skills: SY-0014. CI permissions: SY-0016. |
| Document setup, commands, generated files, dependencies, troubleshooting, environment matrix, agent authority | Nouns and pointers in this map | Clean-machine bootstrap evidence: SY-0017 |
| Tracker lint is a DAG | This issue file remains valid | Invalid-state fixtures: SY-0013 |
| Skill trigger tests | None. | SY-0014 |
| CI green from a clean checkout | Docs/decision lint is part of `pnpm verify` | Workflow and fork-secret posture: SY-0016 |
| No product feature implemented | Docs and notes only | Keep |

This issue therefore **does not close Stage 1**. It closes the documentation
and decision system.

## Required human decisions

Recorded so later stages cannot proceed by inference. **None of these are
decided by this issue.**

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Approve the engineering foundation as authority | Architecture reviewer | Any work that treats §5–20 as approved | Unsigned. Document status is still Proposed. |
| On-disk ADR path versus foundation §18.2 literal names | Architecture reviewer | Treating either layout as signed | Unsigned. Recorded as proposed [ADR-0009](../.agents/notes/proposed/process/2026-08-19-decision-record-paths.md). This issue follows the existing class/date-slug files. Staging already used ADR-0006–0008. |
| Who may move a high-impact note into `implemented/` | Architecture reviewer | First stack ADR promotion | Unsigned. Conduct already forbids agent self-approval. |
| Protected-path reviewers beyond the CODEOWNERS placeholder | Engineering lead | Merge of notes, security docs, schema, auth, CI permissions | Unsigned. `.github/CODEOWNERS` currently names `@shreyas`. |
| Record stack selections as **implemented** ADRs after scaffolds prove viable | Architecture reviewer | Before Stage 2 treats them as given | ADR-0001–ADR-0005 remain `proposed/`. |

## Open contradictions

Conflicts are defects. They are listed, not resolved.

1. **SY-0012 started while SY-0009 is not `done`.** Roadmap Stage 1 says an
   issue may begin only when its `blocked_by` issues are Done. SY-0009 is
   `in_review` on `staging` with the workspace tree already present. A human
   named SY-0012. Recorded, not a rewrite of `blocked_by`.
2. **Foundation §18.2 versus on-disk notes.** §18.2 says
   `proposed/ADR-NNNN-slug.md`. `.agents/notes/README.md` and the five stack
   notes use `<lifecycle>/<class>/YYYY-MM-DD-<topic>.md`. ADR-0009 records the
   choice to keep the latter and put `ADR-NNNN` inside the file. Still
   proposed.
3. **Engineering foundation is still Proposed.**
   [architecture/README.md](architecture/README.md) calls it “approved
   direction.” The foundation status line does not. This map treats it as
   proposed.
4. **Sibling Stage 1 issues sit at `in_review` with empty implementation
   notes.** The bulk scaffold landed first. This issue does not move those
   siblings to `done`.

## Security

- `.agents/notes/` is a CODEOWNERS-protected path. Promotion to
  `implemented/` is a human gate, not an agent action.
- Docs and notes must not contain secret values, `.dev.vars`, production
  data, or unnecessary personal data. Postmortems restrict sensitive detail.
- `pnpm docs:lint` is part of `pnpm verify`. It does not replace
  `pnpm secrets:scan`.
- This issue’s `security_impact: medium` is the decision/authority surface,
  not a product control change.

## Rollback

Documentation, templates, and validators are reversible by Git. Do not
rewrite a rejected or archived note to hide history. Do not mutate the
legacy Command Center or Teaching Archive repositories.
