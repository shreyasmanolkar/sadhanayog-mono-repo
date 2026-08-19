# Stage 0 — Discovery and baseline

Status: draft program — not product-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0001](../issue-tracking/issues/SY-0001.md)  
Sources: [engineering foundation](../architecture/engineering-foundation.md) §2–3, §28, §30;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 0

This file is the named Stage 0 outcome. It makes discovery executable and
reviewable. It is not a signed behavioral baseline. The unsigned register
is [source-of-truth.md](source-of-truth.md)
([SY-0007](../issue-tracking/issues/SY-0007.md)). The signed baseline is
that file after a product owner fills the signature block.

## Purpose

Create the working rules, artifact map, unsigned decision register, and
fixture policy needed to inventory the two legacy applications **without
modifying them**. Later stages may not treat a rewrite as permission to
redesign workflows.

## Layer effects

| Area | This epic |
|---|---|
| Files/docs | `docs/discovery/*` only |
| Database | None. |
| API | None. Current `POST /sync` is noted in [repository-baseline.md](repository-baseline.md); column/rule mapping is [legacy-data.md](legacy-data.md). |
| Flutter | None. |
| Web | None. Command Center navigation maps are [feature-inventory.md](feature-inventory.md). Teaching Archive workflow walk is [teaching-archive.md](teaching-archive.md). Quality/a11y catalogue is [a11y-security-baseline.md](a11y-security-baseline.md). |
| Infrastructure | None. Current Worker / Apps Script / DNS notes are [SY-0002](../issue-tracking/issues/SY-0002.md). |

No production resource, secret value, or real-user export enters this
repository.

## Observation method

Every discovery claim must name all three:

| Field | Meaning |
|---|---|
| Revision | Full Git SHA of the inspected legacy copy |
| Path | File path inside that revision (and line range when a rule is cited) |
| Method | How it was observed: static read, generator `--check`, hash/compare, rendered walkthrough, keyboard/DOM inspection, or sanitized export probe |

Do not cite “the current app” or “as designed.” Foundation §2 is a
**proposed** summary. It is a starting index, not signed evidence.

Label each recorded fact:

- **Observed** — seen in a cited revision
- **Inferred** — deduced; must say from what
- **Approved intent** — product owner signed preserve / change / remove / defer

An accidental implementation detail stays **Observed** until SY-0007.

## Pinned revisions

Reconfirmed 2026-08-19 by `git rev-parse HEAD` on clean `main` copies.
Neither working tree was dirty. Neither repository was modified.

| Application | Local path (read-only copy) | Revision | Size (static read) |
|---|---|---|---|
| Command Center | `/home/shreyas/Work/sadhanayog/sadhana-yog-command-center` | `c724be0e116582b5c73d324d00a81ac23eb0bbf2` | `index.html` 17,286 lines |
| Teaching Archive | `/home/shreyas/Work/learnings/yog-documentation` | `c6732f59cf66af9a238caaccc185104afa534d7f` | `index.html` 1,875 lines |

These match foundation §2 and [repository-baseline.md](repository-baseline.md).
Flutter `samples` and `vivek-os` are reference patterns, not product
baselines; their adopt/reject notes stay on SY-0002.

## Artifact map

Roadmap Stage 0 names these files. This epic owns the program, the fixture
policy, and the scoped instructions. Child issues own the inventories.

| Artifact | Owner | Status 2026-08-19 |
|---|---|---|
| [README.md](README.md) (this program) | SY-0001 | Draft, reviewable |
| [AGENTS.md](AGENTS.md) | SY-0001 | Draft |
| [sanitized-fixture-policy.md](sanitized-fixture-policy.md) | SY-0001 | Draft, reviewable |
| [repository-baseline.md](repository-baseline.md) | [SY-0002](../issue-tracking/issues/SY-0002.md) | Draft evidence, reviewable; human gate to `done` |
| [feature-inventory.md](feature-inventory.md) | [SY-0003](../issue-tracking/issues/SY-0003.md) | Draft evidence, reviewable; human gate to `done` |
| `docs/discovery/legacy-data.md` | [SY-0004](../issue-tracking/issues/SY-0004.md) | Draft evidence, reviewable; human gate to `done` |
| [teaching-archive.md](teaching-archive.md) | [SY-0005](../issue-tracking/issues/SY-0005.md) | Draft evidence, reviewable; human gate to `done` |
| [a11y-security-baseline.md](a11y-security-baseline.md) | [SY-0006](../issue-tracking/issues/SY-0006.md) | Draft evidence, reviewable; human gate to `done` |
| [source-of-truth.md](source-of-truth.md) | [SY-0007](../issue-tracking/issues/SY-0007.md) | Draft **unsigned** register, reviewable; signature, interviews, and representative exports still missing |

Do not create empty inventory stubs. A missing file means the child has
not produced evidence.

## Exit criteria

Stage 0 is done only when every row below is satisfied. This epic records
the criteria and defers the unsatisfied rows.

| Stage 0 exit criterion | This epic | Remainder |
|---|---|---|
| All Command Center pages, workflows, empty/loading/error, shortcuts, responsive behavior, and deep links inventoried | Satisfied as draft evidence in [feature-inventory.md](feature-inventory.md) | Human acceptance of SY-0003 (issue remains `in_review` / not `done`) |
| Collections, encodings, calculation modules, derived sessions, outbox, last-write-wins inventoried | Satisfied as draft evidence in [legacy-data.md](legacy-data.md) | Human acceptance of SY-0004 (issue remains `in_review` / not `done`) |
| Teaching Archive content IDs, five areas, journey/rituals/reviews/benchmarks, privacy wording, no-media invariant inventoried | Satisfied as draft evidence in [teaching-archive.md](teaching-archive.md) | Human acceptance of SY-0005 (issue remains `in_review` / not `done`) |
| External dependencies and deployment assumptions inventoried | Satisfied as draft evidence in [repository-baseline.md](repository-baseline.md) | Human acceptance of SY-0002 (issue remains `in_review` / not `done`) |
| Security and accessibility debt inventoried | Satisfied as draft evidence in [a11y-security-baseline.md](a11y-security-baseline.md) | Human acceptance of SY-0006 (issue remains `in_review` / not `done`) |
| Product owner signs preserve/change/defer matrix and data-source precedence | Unsigned register exists in [source-of-truth.md](source-of-truth.md) | Human signature, interviews, and representative exports |
| Sanitized fixtures can exercise critical rules | Format, starter vectors, SY-0004 rule vectors, and SY-0005 journey/ritual/filename vectors | Representative exports and vector approval: [source-of-truth.md](source-of-truth.md) |
| No legacy file changed | Satisfied 2026-08-19 | Keep for every child |

This epic therefore **does not close Stage 0**. It closes only the
program, policy, unsigned decision register, and generator-check record.

## Required human decisions

Recorded here so implementation of later stages cannot proceed by
inference. **None of these are decided by this epic.**

Canonical unsigned register: [source-of-truth.md](source-of-truth.md).
Child inventories keep local copies for traceability.

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Approve the behavioral baseline (preserve / change / remove / defer per workflow) | Product owner | SY-0007 close; blocks Stage 2 | Unsigned — matrix drafted |
| Browser `localStorage` vs Google Sheets precedence when they diverge | Product owner | SY-0007; migration tooling ([SY-0088](../issue-tracking/issues/SY-0088.md)) | Unsigned |
| Whether health notes are necessary, and their retention | Product / privacy owner | Production data import (foundation §30) | Unsigned |
| Which legacy integrations are real versus demonstrative (Maps, Meet, Zoom, Teams, WhatsApp, mail/SMS, payment page, Apps Script sync) | Product owner | SY-0007 | Unsigned |
| Which low-value features may be deferred from initial release | Product owner | SY-0007 | Unsigned |
| Any UI or rule difference from the current applications | Product owner | The issue that would implement the difference | Unsigned |

Differences from the current UI must be explicit product decisions, not
inferred cleanup (roadmap Stage 0).

## Generator consistency checks

Run 2026-08-19 against Command Center `c724be0e116582b5c73d324d00a81ac23eb0bbf2`.
Results recorded; **nothing was fixed**.

| Check | Command | Result |
|---|---|---|
| Apps Script generated HTML | `python3 tools/build-appsscript.py --check` in the Command Center copy | **STALE** — exit 1; tool printed `Index.html is STALE — run: python3 tools/build-appsscript.py` |
| Embedded `Code.gs` vs `index.html` | `python3 tools/embed-script.py --check` | **in sync** — exit 0 |
| Worker static copy | `cmp index.html public/index.html` | **identical** |
| Teaching Archive generators | None exist in `c6732f59cf66af9a238caaccc185104afa534d7f` | Not applicable |

Foundation §2 already notes the stale Apps Script HTML. SY-0002 re-ran
the same checks and recorded additional Worker/Apps Script documentation
drift. Fixing either is out of Stage 0 scope.

Command Center has no `package.json` and no test files. Teaching Archive
has no build and no tests. Those absences are observations, not defects
to repair here.

## Rendered inspection

Not executed in this epic.

- Desktop/mobile workflow rendering, keyboard walkthrough, and
  page-level DOM/accessibility inspection for Command Center are
  recorded in [feature-inventory.md](feature-inventory.md) (SY-0003).
  Teaching Archive workflow walk is in
  [teaching-archive.md](teaching-archive.md) (SY-0005). The
  security/a11y debt catalogue is
  [a11y-security-baseline.md](a11y-security-baseline.md) (SY-0006).
- Sanitized characterization vectors begin in
  [sanitized-fixture-policy.md](sanitized-fixture-policy.md). Command
  Center rule vectors are in [legacy-data.md](legacy-data.md)
  (SY-0004). Teaching Archive rule vectors are in
  [teaching-archive.md](teaching-archive.md) (SY-0005). The
  unsigned approval index is
  [source-of-truth.md](source-of-truth.md); the signature is still
  missing.

## Open contradictions

Conflicts are defects. They are listed, not resolved.

1. **Foundation §2 versus signed evidence.** Foundation §2 already lists
   pages, collections, and rules, but the document status is “Proposed
   foundation for human approval.” Child inventories must re-cite
   revision/path/method. Where a child disagrees with §2, file the
   disagreement on the child issue; do not silently prefer either source.
2. **Business page versus navigation.** Command Center `index.html`
   defines `SY.Pages.business` at line 10584 and registers it in `PAGES()`
   at line 16491. The sidebar `NAV` at lines 16424–16442 has no `business`
   item. Settings also has a `business` section (line 12822). SY-0003
   confirmed the page opens from `#/business` and from search “Go to”;
   it is still absent from sidebar and phone tabs. Preserve/remove is
   SY-0007.
3. **Leads versus Enquiries.** `NAV` labels the `leads` page “Enquiries”
   (`index.html:16432`). Foundation §2 says “Leads.” Terminology waits
   for Stage 2 ([SY-0019](../issue-tracking/issues/SY-0019.md)).
4. **Demo seed versus production data.** `index.html` embeds a demo
   studio (module `SY.DEMO`) with personal-looking names, health-like
   notes, and invoice identifiers. That seed is **not** a user export
   and must not be copied into Git. SY-0003/SY-0004 must say whether a
   given behavior was observed in product code or only in demo seed.

## Security and redaction

Follow [sanitized-fixture-policy.md](sanitized-fixture-policy.md).

This epic did not open a browser profile, did not read `localStorage`,
and did not fetch Sheets. Hostname `dash.omsadhanayog.com` is already
published in Worker config and in SY-0002; no secret values were read.

Threat and accessibility findings are
[a11y-security-baseline.md](a11y-security-baseline.md) (SY-0006,
`security_impact: high`). This epic (`security_impact: low`) only
sets handling rules.

## Rollback

Documentation only. Revert an incorrect program or policy through review
and keep the Git history of the rejected text. Do not rewrite evidence
in place to hide a bad observation.

## Child execution order

```text
SY-0002 (inventory landed; human gate) ─┬─ SY-0003 ─┐
                                        ├─ SY-0004 ─┼─ SY-0006 ─ SY-0007 (human sign-off)
                                        └─ SY-0005 ─┘
```

An agent may start a child only when that child’s `blocked_by` issues
are `done`. SY-0003, SY-0004, and SY-0005 started while SY-0002 was
`in_review` because a human named each issue after the SY-0002 named
outcome had landed. Those process contradictions are recorded on the
child issues; they are not a rewrite of this rule for later children.

SY-0007 also started at human request while SY-0005/SY-0006 had **no**
named outcome on this branch. After merging `staging`, those
inventories exist and the unsigned register cites them. It still does
not invent dispositions or fill the signature block.
