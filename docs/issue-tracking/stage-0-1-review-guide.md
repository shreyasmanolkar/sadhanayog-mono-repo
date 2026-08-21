# Stage 0 and Stage 1 review guide

Status: human review handoff  
Validated locally: 2026-08-21

Use this guide to understand what each foundation stage delivers, run the
appropriate checks, and record the human evidence needed before moving its
issues to `done`. A green automated check is necessary but does not replace a
product or architecture decision.

| Stage | Delivers | Current gate |
|---|---|---|
| 0 — Discovery | An evidence-backed inventory of the two legacy apps and an approval register | **Not ready to close:** the register is unsigned; interviews and representative sanitized-export checks are missing. |
| 1 — Engineering foundation | A cloneable monorepo with empty Web/API/Flutter shells, governance, and CI controls | Automated checks pass; architecture/foundation, tool, CI, licence, and reviewer decisions still require human approval. |

## Stage 0 — review the baseline, then decide it

Start at [the discovery program](../discovery/README.md). It is documentation
only: it must not change legacy applications, use real-user data, or silently
redesign a legacy behaviour.

| Issues | Review focus | Evidence |
|---|---|---|
| SY-0001–SY-0002 | Discovery policy, pinned revisions, deployment and integration assumptions | [README](../discovery/README.md), [repository baseline](../discovery/repository-baseline.md) |
| SY-0003–SY-0004 | Command Center workflows and its data/rule calculations | [feature inventory](../discovery/feature-inventory.md), [legacy data](../discovery/legacy-data.md) |
| SY-0005–SY-0006 | Teaching Archive behaviour; accessibility, security, and privacy debt | [Teaching Archive](../discovery/teaching-archive.md), [quality baseline](../discovery/a11y-security-baseline.md) |
| SY-0007 | The one preserve/change/remove/defer and data-source-precedence decision register | [source of truth](../discovery/source-of-truth.md) |

Complete these human checks before closing Stage 0:

- [ ] Accept the evidence in SY-0002 through SY-0006, correcting an observation only with a cited revision, path, and method.
- [ ] Interview 2–3 users without putting names, contacts, health notes, invoices, keys, or exports in Git.
- [ ] Capture representative active-store exports outside this repository, create sanitized derivatives, and fill the checksum/count/invariant evidence required by the source-of-truth register.
- [ ] In `source-of-truth.md`, decide every W/R/S/I/D/C/T/Q row: Preserve, Change, Remove, or an explicit Defer with its follow-up issue. In particular, choose browser versus Sheets precedence (S-01/S-02).
- [ ] Product owner completes the signature block. Do not have an agent sign it.

The known legacy Apps Script generated HTML is **STALE**. It is an observed
legacy defect, not a Stage 0 failure to repair. Keep it recorded; do not fix it
as part of this closeout.

## Stage 1 — test the empty foundation, not product features

Start at [the development program](../development/README.md). This stage is
successful when the workspace, controls, and empty shells work; attendance,
finance, identity, and learning features must still be absent.

| Issues | Review focus | Evidence |
|---|---|---|
| SY-0008–SY-0010 | Program, pinned toolchain, and compiling empty API/Web/Flutter/DB shells | [development README](../development/README.md), [toolchain](../development/toolchain.md) |
| SY-0011–SY-0015 | Code quality, docs/ADRs, tracker, skills, and restricted MCP configuration | [style](../development/style.md), [agent instructions](../development/agent-instructions.md), [MCP](../development/mcp.md) |
| SY-0016–SY-0017 | CI policy, bootstrap, local-only D1 guardrails, and operator documentation | [CI](../development/ci.md), [setup](../development/setup.md), [commands](../development/commands.md) |

Run from the repository root:

```bash
pnpm verify
cd apps/mobile && flutter analyze && flutter test && flutter build bundle
```

Results on 2026-08-21: both commands passed. `pnpm verify` reported 152
issues / 21 projects with zero tracker errors or warnings; Flutter 3.35.4 / Dart
3.9.2 reported no analysis issues, all five tests passed, and the bundle was
created.

Then do one brief manual shell check:

```bash
pnpm dev
```

- Web (`http://127.0.0.1:5173`) shows “The desk is empty on purpose.” and
  points to `/health/live`.
- API (`http://127.0.0.1:8787/health/live`) responds as live; `/health/ready`
  may return the documented not-ready result until configuration is supplied.
- On a mobile host, run `cd apps/mobile && flutter run` and confirm the same
  empty-desk message. No login or product workflow should appear.

Before closing Stage 1, a human must also approve or explicitly defer the
foundation as architecture authority, exact tool pins, CI host and required
checks, package licence position, and protected-path reviewers. These are
listed in the [Stage 1 decision register](../development/README.md#required-human-decisions).

## Close in dependency order

First record the reviewer and reproducible evidence in each issue. Then use
the tracker CLI to move only the reviewed issue to `done`.

```text
Stage 0: SY-0002 → SY-0003/SY-0004/SY-0005 → SY-0006 → SY-0007 → SY-0001
Stage 1: SY-0009 → SY-0010/SY-0011/SY-0012 → SY-0013 → SY-0014 →
         SY-0015 → SY-0016, with SY-0017 after SY-0010/SY-0011 → SY-0008
```

Stage 2 must remain blocked until SY-0007 has the product-owner signature and
all its required Stage 0 evidence. Do not mark an issue done solely because
its files exist or an earlier check was green.
