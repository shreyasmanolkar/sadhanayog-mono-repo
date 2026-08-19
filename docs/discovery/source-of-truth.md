# Preservation and source-of-truth sign-off

Status: draft register — **not product-signed**  
Owner: engineering (register); product owner (signature)  
Last-reviewed: 2026-08-19  
Issue: [SY-0007](../issue-tracking/issues/SY-0007.md)  
Sources: Command Center `c724be0e116582b5c73d324d00a81ac23eb0bbf2`;
Teaching Archive `c6732f59cf66af9a238caaccc185104afa534d7f` (pin only;
inventory is [SY-0005](../issue-tracking/issues/SY-0005.md));
[engineering foundation](../architecture/engineering-foundation.md) §2–3, §28, §30;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 0;
[README.md](README.md); [repository-baseline.md](repository-baseline.md);
[feature-inventory.md](feature-inventory.md);
[legacy-data.md](legacy-data.md);
[sanitized-fixture-policy.md](sanitized-fixture-policy.md)

This file is the named SY-0007 outcome. It is the preserve / change /
remove / defer matrix and the data-source precedence register. It is
**not** a signature. Later stages may cite the **observed** rows and
the unsigned decisions. They may not treat any disposition as approved
until the signature block is filled.

## Purpose

Turn the child inventories into a single reviewable baseline so Stage 2
([SY-0018](../issue-tracking/issues/SY-0018.md)) and import tooling
([SY-0088](../issue-tracking/issues/SY-0088.md)) cannot infer
preserve/change/remove or browser-versus-Sheets precedence.

Roadmap Stage 0 item 6 also asks for 2–3 user interviews and
representative sanitized export checksums. Those have **not** been
done. This file records the protocol and the empty slots.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | `docs/discovery/source-of-truth.md` and pointers in the Stage 0 program / child inventories / fixture policy |
| Database | None. |
| API | None. |
| Flutter | None. |
| Web | None. Render/DOM walk not repeated; SY-0003 already recorded it. No screenshot. |
| Infrastructure | None. |

No production resource, secret value, or real-user export enters this
repository.

## Observation method

This issue compiles child evidence. It does not invent pages, columns,
or archive content. Foundation §3 is a **proposed** disposition table,
not a signature.

| Method | What it means here |
|---|---|
| compile | Row taken from a cited child inventory (revision/path/method already recorded there) |
| generator-check | Re-run of `python3 tools/*.py --check` and `cmp` on the pinned Command Center copy, 2026-08-19 |
| git-status | `git rev-parse HEAD` and `git status --porcelain` on both pinned copies |
| not-observed | Interviews, live stores, raw/sanitized representative exports, Teaching Archive walk, threat/axe catalogue |

Facts are labelled **Observed**, **Inferred**, **Proposed**
(foundation §3 or this register’s engineering column), or
**Approved intent**. Nothing in this file is approved intent.

## Revisions inspected

Reconfirmed 2026-08-19. Both working trees empty. Neither repository
was modified.

| Application | Local path (read-only copy) | Revision |
|---|---|---|
| Command Center | `/home/shreyas/Work/sadhanayog/sadhana-yog-command-center` | `c724be0e116582b5c73d324d00a81ac23eb0bbf2` |
| Teaching Archive | `/home/shreyas/Work/learnings/yog-documentation` | `c6732f59cf66af9a238caaccc185104afa534d7f` |

Inspection machine: Python `3.13.7`, Node `v24.11.1`. Command Center
has no `package.json`.

## Process note

SY-0007 `blocked_by` SY-0003, SY-0004, SY-0005, SY-0006.

On 2026-08-19, when a human named this issue:

| Blocker | Tracker status | Named outcome |
|---|---|---|
| SY-0003 | `in_review` | [feature-inventory.md](feature-inventory.md) exists |
| SY-0004 | `in_review` | [legacy-data.md](legacy-data.md) exists |
| SY-0005 | `backlog` | `docs/discovery/teaching-archive.md` **does not exist** |
| SY-0006 | `backlog` on `staging` | `docs/discovery/a11y-security-baseline.md` **does not exist** |

[README.md](README.md) already says the SY-0003/SY-0004 exception (start
while a blocker is `in_review` after its named outcome landed) is **not**
a rewrite of the rule for later children. This issue records the
contradiction instead of pretending the graph was satisfied.

Because SY-0005 and SY-0006 have no named outcomes, Teaching Archive
rows and quality/security/accessibility rows are **deferred**, not
invented from foundation §2.

## What this file does not do

- It does not interview users. An agent cannot substitute for the
  2–3 studio users the roadmap names.
- It does not read `localStorage`, Sheets, or a production hostname.
- It does not copy `SY.DEMO` or catalog identity field values.
- It does not write `teaching-archive.md` or
  `a11y-security-baseline.md`.
- It does not change a product disposition from Unsigned.
- It does not close Stage 0.

## Sign-off status

| Gate | Status 2026-08-19 |
|---|---|
| Preserve/change/remove/defer matrix exists and is reviewable | Yes — every product row is **Unsigned** |
| Product owner signature | **Missing** |
| User interviews (2–3) | **None conducted** |
| Browser vs Sheets precedence | **Unsigned** (mechanism observed in SY-0004) |
| Representative sanitized exports / checksums | **None captured** |
| Teaching Archive inventory | **Missing** — SY-0005 |
| Quality/security/accessibility inventory | **Missing** — SY-0006 |
| Human acceptance of SY-0002–SY-0004 | Issues remain `in_review`, not `done` |

## Interviews

Roadmap Stage 0: “interview 2–3 users.” **Not conducted.**

Protocol for the product owner (outside Git, no raw exports in the
prompt):

1. Walk the pinned Command Center empty desk and, separately, the
   teacher’s real desk on their device. Do not paste personal fields
   into chat or this repository.
2. Cover at least: Today, Attendance, Students, Invoices, Messages,
   Settings → Your data, and one report. Ask whether Business
   (`#/business`) is used.
3. Ask the questions in the table below. Record answers in the
   signature block (disposition only) and, if needed, a private note
   that never contains names, contacts, health notes, invoice ids,
   keys, or live URLs.

| Ask | Feeds row |
|---|---|
| If this device and the spreadsheet disagree, which one is true? | S-01 |
| Do you still open the desk as a local file, a Google URL, or `dash.omsadhanayog.com`? | D-01 |
| Which of WhatsApp / mail / SMS / Meet / Zoom / Teams / Maps / UPI / hosted pay-link do you actually tap? | I-01–I-09 |
| Do you keep health, goal, or emergency notes on student records, and for how long? | R-16 |
| Should a used-up pack be allowed to go below zero? | R-05 |
| Is the Business monthly page still wanted, should it join the sidebar, or should Finance replace it? | W-13 |
| “Enquiries” or “Leads”? | W-06 |
| Which screens could wait until after first cutover? | W-15, T-\* |
| Does the Teaching Archive stay a first-class area with no media inside the app? | T-01 (after SY-0005) |

A walk of the agent’s empty desk is **not** an interview.

## Data-source precedence

Three stores exist today. A fourth is the **proposed** target
(foundation §1, §28). Precedence among the live stores is unsigned.

| Id | Store | Role today | Evidence | Proposed (foundation §3, unsigned) | Product disposition |
|---|---|---|---|---|---|
| S-01 | Browser `localStorage` `sadhanayog.v1` | Canonical **device** store; always writable | [legacy-data.md](legacy-data.md) store envelope; [repository-baseline.md](repository-baseline.md) | Rewrite the mechanism; migrate the entities | **Unsigned** |
| S-02 | Google Sheet + Apps Script (`SCHEMA` tabs, last-write-wins pull replace) | Optional **shared** store. Sync comments and Settings copy say “the spreadsheet stays the source of truth.” Pull replaces each collection array. Device remains writable offline. | [legacy-data.md](legacy-data.md) last-write-wins; `index.html:6910–6911`, `7080–7112`, `13518`; `Code.gs:412–440` | **Deprecate** as operational source of truth; keep read-only during a verified cutover window | **Unsigned** |
| S-03 | Browser `localStorage` `teaching-archive.v1` | Archive progress/metadata; no identity; no remote persistence | [repository-baseline.md](repository-baseline.md); starter vector `teaching-archive.no-media`. **Detail inventory is SY-0005.** | Migrate progress; preserve no-media and privacy intent | **Unsigned** — blocked on SY-0005 |
| S-04 | Target D1 per environment | Not a legacy store | foundation §1, §28 | Authoritative after cutover; no dual-write with Sheets | **Unsigned** as a product cutover date; architecture remains proposed |

**Observed** conflict behaviour (SY-0004, not exercised live):

- Normal pull flushes the outbox first, then **replaces** collections
  from the sheet. A local row whose id is absent from the sheet
  disappears.
- Settings keys on the sheet overwrite known device keys; device-only
  keys stay.
- Concurrent editors beyond `LockService` (25 s around one push) are
  last-write-wins at **row** grain.
- JSON backup omits outbox and sheet credentials. Restore keeps the
  current device connection.

Until S-01 vs S-02 is signed, import tooling ([SY-0088](../issue-tracking/issues/SY-0088.md))
must not guess. Foundation §30 already names this as a blocking
decision before migration tooling.

**Inferred** (from SY-0002 topologies, not a live probe): a teacher
who never connected a sheet has only S-01. A teacher on custom-domain
Worker has S-01 plus S-02 behind `/sync`. Which topology the studio
actually uses is D-01.

## Disposition legend

| Value | Meaning |
|---|---|
| **Unsigned** | No product owner has chosen. Default for every row in this file. |
| Preserve | Observed behaviour is a requirement. Rewrite the mechanism if needed, keep the outcome. |
| Change | Observed behaviour is real, and the replacement is an explicit product decision recorded here or on the implementing issue. |
| Remove | Observed behaviour must not ship. Say what happens instead. |
| Defer | Out of initial release. Must name the surviving issue. |

Foundation §3 column is **Proposed**, never Approved intent.

A rewrite of localStorage / Apps Script / inline CSS/JS is **not**
permission to change the workflows in the matrix. That is foundation
§4.2, still proposed.

## A. Command Center pages and workflows

Evidence: [feature-inventory.md](feature-inventory.md), Command Center
`c724be0e…`. Proposed column is foundation §3 “Migrate navigation
concepts” unless a more specific §3 row exists.

| Id | Item | Observed (short) | Proposed (§3) | Product disposition |
|---|---|---|---|---|
| W-01 | Today `#/today` | Operational desk: alerts, today’s classes, KPIs, walk-in, join, take attendance | Preserve behaviour / migrate nav | **Unsigned** |
| W-02 | Calendar `#/calendar/{date}` | Civil-date pager over derived sessions | Migrate | **Unsigned** |
| W-03 | Classes `#/classes/{tab\|id}` | Recurring batches, one-offs, courses, team; capacity, waitlist, cancel/reschedule, meeting links | Preserve session semantics; migrate nav | **Unsigned** |
| W-04 | Students `#/students/{filter\|id}` | CRM, filters (attention/package/debt), profile tabs, archive | Migrate | **Unsigned** |
| W-05 | Attendance `#/attendance/{sessionId}` | Per session/student marks; missing session empty state; FAB hidden | Preserve consumption; migrate nav | **Unsigned** |
| W-06 | Enquiries `#/leads` | Router id `leads`; NAV label **Enquiries**. Pipeline, trial, source, convert | Migrate; terminology is SY-0019 | **Unsigned** (term: Enquiries vs Leads) |
| W-07 | Messages `#/messages/{tab\|id}` | Templates, audiences, WhatsApp/mail/SMS deep links, log | Preserve “opened”; migrate | **Unsigned** |
| W-08 | Finance `#/finance/{tab}` | Income, expenses, profit, cash, receivables, aging, payouts, taxes | Preserve arithmetic; migrate | **Unsigned** |
| W-09 | Invoices `#/invoices/{id}` | Draft/sent/paid/void/overdue family, print, reminders, UPI QR, lines | Preserve arithmetic; migrate | **Unsigned** |
| W-10 | Tasks `#/tasks/{tab}` | Tasks, repeat, My Day, reminders | Migrate | **Unsigned** |
| W-11 | Places `#/places/{id}` | Locations, coordinates, Maps iframe and directions | Migrate; integration reality is I-07 | **Unsigned** |
| W-12 | Reports `#/reports/{id}` | Ten families: Revenue, Expenses, Profit, Student growth, Attendance, Course performance, Instructors, Outstanding, Invoices, Class utilisation. Print + CSV | Migrate | **Unsigned** (any family may be deferred only by naming it) |
| W-13 | Business `#/business` | Bookmark/search/hash only. Not in sidebar or phone tabs. Monthly teaching view; Finance does not replace it (`index.html:16481–16484`) | — (gap vs §2) | **Unsigned**: keep bookmark-only, add to NAV, or fold into Finance/Reports |
| W-14 | Settings `#/settings/{section}` | Thirteen sections listed in the feature inventory | Migrate settings | **Unsigned** as a family; Security/Your data also tied to D-\* and S-\* |
| W-15 | First-run / onboarding | Standalone: studio card then sample / empty / connect-sheet. Hosted: use-spreadsheet vs sample. Empty desk still seeds catalog (C-01) | — | **Unsigned**: which topologies must survive strangler is D-02 |
| W-16 | Chrome: sidebar, phone tabs (Today/Attend/Students/Money/More), search, FAB, shortcuts | Letter shortcuts, `/` and Ctrl+K, shortcuts ignored in fields | Migrate nav | **Unsigned** as a set; a different IA is an explicit change (SY-0019) |
| W-17 | Add menu / command palette | Quick-add order and palette categories as inventoried | Migrate | **Unsigned** |
| W-18 | Unknown hash / `#/constructor` | Unknown id → Today; `constructor` rejected | Preserve the fail-safe | **Unsigned** |

Any UI difference from [feature-inventory.md](feature-inventory.md)
must be an explicit product decision on the issue that would
implement the difference. It must not be inferred cleanup.

## B. Durable rules

Evidence: [legacy-data.md](legacy-data.md) unless noted.

| Id | Item | Observed (short) | Proposed (§3) | Product disposition |
|---|---|---|---|---|
| R-01 | Present/late consume counted membership units | `SY.CAT.CONSUMING`; used derived from marks | **Preserve** | **Unsigned** |
| R-02 | Absent/excused do not consume | Same | **Preserve** | **Unsigned** |
| R-03 | One attendance row per student per session; retap clears | Idempotent write | **Preserve** | **Unsigned** |
| R-04 | Sessions derived from batch rules + exceptions; not stored | `makeSession` / `sessionsOn` | **Preserve** unless an ADR shows a better invariant | **Unsigned** |
| R-05 | `allowNegative` | Default claims packs cannot go below zero; **no reader** of the flag. Marking still writes unpaid present | — (not in §2) | **Unsigned**: preserve (then implement), change, or remove |
| R-06 | Invoice `totals` exclusive/inclusive, `r2`, discount cap | Calculation-probe 2500/250/405/2655/1655 overdue; inclusive 1180@18% → 1000/180 | **Preserve** | **Unsigned** |
| R-07 | Invoice `nextNumber` floor | Probe prefix `SY-`, `invNext` 3, existing `SY-0007` → `SY-0008` | **Preserve** | **Unsigned** |
| R-08 | Displayed invoice status vs stored | `statusOf` derives paid/partial/overdue; stored writes draft/sent/void plus automation rewrite | Migrate; family listed in §2 | **Unsigned**: stored, derived, or both |
| R-09 | Receivable / aging buckets | sent/partial/overdue; 1–30 / 31–60 / over 60 | **Preserve** | **Unsigned** |
| R-10 | Membership expiry = start + validity days | Probe 2026-01-01 + 90 → 2026-04-01 | **Preserve** | **Unsigned** |
| R-11 | Waitlist offer order | Copy says longest wait; code is `students` array order, no queue time | — | **Unsigned**: preserve copy, preserve code, or change both |
| R-12 | Communications log `opened`, not delivered | Feature inventory + fixture vector | **Preserve** | **Unsigned** |
| R-13 | Automation / quiet hours only while the page is open | Settings copy; no server | Change with a server is Stage 9, not silent | **Unsigned** for initial release |
| R-14 | Streak = consecutive **weeks** with a consuming visit | `settings.weekStart` | Preserve behaviour | **Unsigned** |
| R-15 | Course progress capped at `program.sessions` | Consuming attendance on that programme | Preserve | **Unsigned** |
| R-16 | Health / goal / emergency **fields** | Present on Students schema. **Values never copied.** Necessity and retention unsigned | — | **Unsigned** (product/privacy). Blocks production import (foundation §30) |
| R-17 | Civil dates `YYYY-MM-DD` local; instants ISO; `tz` IANA; session clock `HH:MM` | [legacy-data.md](legacy-data.md) other durable rules | Aligns with foundation §4.7 | **Unsigned** as a product date model |
| R-18 | JSON backup envelope and 40 MB / `students` array guards | Credentials never restore | Reuse fixtures after sanitising | **Unsigned** |
| R-19 | Outbox: device-only, 200/flush, 500 Apps Script max, omitted from backup | [legacy-data.md](legacy-data.md) | Rewrite mechanism (online-first) | **Unsigned** whether last-write-wins outbox is acceptable **until** cutover |
| R-20 | Cross-currency arithmetic | Settings have symbol + ISO code; code does not forbid mixed currencies. Foundation §30 assumes INR at launch | Forbid mixed arithmetic | **Unsigned** (finance invariants SY-0022) |
| R-21 | Predecessor `.xlsx` matched attendance **by name** | Not opened; not a user export | Do not use as import source | **Unsigned** |

## C. Catalog and empty desk

| Id | Item | Observed | Proposed | Product disposition |
|---|---|---|---|---|
| C-01 | Empty-studio seed | “Start with my own students” still installs programmes, packages, eight weekly batches, one location, templates, reminder rules | — | **Unsigned**: preserve, change, or remove |
| C-02 | Demo seed `SY.DEMO` | Invented personal-looking rows. Never loaded in Stage 0 inventories | Must not enter Git or fixtures | **Unsigned** as a shipping feature (sample studio); **forbidden** as a data source |
| C-03 | Catalog identity-like defaults | `defaultSettings()` teacher/phone/location text cited by field name only | Do not copy values | Values stay out of Git regardless of disposition |

## D. Integrations

User-initiated URL schemes. No provider APIs. Reality vs demo is
unsigned (SY-0002, SY-0003).

| Id | Integration | Observed | Proposed (§3) | Product disposition |
|---|---|---|---|---|
| I-01 | WhatsApp `wa.me` | Opens chat; log `opened`; 10-digit numbers get `91` | Allowlist / migrate | **Unsigned**: real or demonstrative |
| I-02 | SMS `sms:` | Same honesty board: working as a link | Allowlist | **Unsigned** |
| I-03 | Mail `mailto:` | Same | Allowlist | **Unsigned** |
| I-04 | Phone `tel:` | Same | Allowlist | **Unsigned** |
| I-05 | Google Meet | Create/join https links; `normalise` rejects non-https | Allowlist | **Unsigned** |
| I-06 | Zoom / Teams / other https meeting URL | No Zoom/Teams API | Allowlist | **Unsigned** |
| I-07 | Google Maps embed + directions | CSP `frame-src`; Places iframe | Allowlist | **Unsigned** |
| I-08 | Hosted payment page `payLink` | Teacher-configured; do not commit live URLs | Allowlist | **Unsigned** |
| I-09 | UPI QR / request link | Client-side `SY.QR`; cannot confirm payment | Allowlist | **Unsigned** |
| I-10 | Apps Script `/exec` sync | Only shared write path besides `localStorage` | **Deprecate** as operational SoT after cutover | **Unsigned** timing; mechanism is M-03 |
| I-11 | Cloudflare Access | **Assumed** in docs; **not observed** live | Edge gate, not product identity | **Unsigned** (also SY-0006) |
| I-12 | WhatsApp Business API / SMTP / SMS gateway / in-app cards | Honesty board: **Needs a server** | Not present | **Unsigned** if any must exist at launch |

## E. Deployment topologies and mechanisms

Evidence: [repository-baseline.md](repository-baseline.md).

| Id | Item | Observed | Proposed (§3) | Product disposition |
|---|---|---|---|---|
| D-01 | Which of the four topologies is production | Git is shaped for custom-domain Worker + `dash.omsadhanayog.com`. Live Access, live `/exec`, and whether anyone still uses hosted Google-URL or standalone file were **not observed** | Target is Worker + D1 (foundation §1) | **Unsigned** |
| D-02 | Hosted Google-URL and standalone-file during strangler | Both still exist in code | Keep or retire only after decommission checklist (foundation §28 step 10) | **Unsigned** |
| D-03 | Standalone shared-key sync | `ACCESS_KEY` ≥ 20 chars in `localStorage` | **Deprecate** | **Unsigned** |
| D-04 | Public/static page as the security boundary | Anyone-anonymous Apps Script; device data unencrypted | **Deprecate** | **Unsigned** as a product risk acceptance until Stage 5 |
| D-05 | `build-appsscript.py --check` STALE HTML and Worker/Apps Script doc drift | Reconfirmed 2026-08-19 (see generator section) | Delete generated artifacts only after proof | **Not Stage 0.** Recorded, not fixed |

Mechanism rows (engineering, still unsigned as product impact):

| Id | Mechanism | Proposed (§3) | Product note |
|---|---|---|---|
| M-01 | Global DOM/state layer, inline CSS/JS | **Rewrite** | Must not silently redesign W-\* |
| M-02 | `localStorage` persistence | **Rewrite** | Preserve S-01 **data** until import |
| M-03 | Apps Script synchronization | **Rewrite** / deprecate as SoT | S-02 |
| M-04 | Worker HTML + `/sync` proxy | **Rewrite** (keep hostname decision as D-01) | Do not treat `CLOUDFLARE_WORKER.md` as the running Worker |
| M-05 | Client-authoritative rules | **Rewrite** (server authoritative) | Preserve R-\* outcomes in characterization tests |

## F. Teaching Archive (deferred)

`docs/discovery/teaching-archive.md` does not exist. Foundation §2.2
is a **starting index**, not signed evidence
([AGENTS.md](AGENTS.md)). This table is a reminder of what SY-0005
must make signable. Rows are **not observed here**.

| Id | Topic (from foundation §2.2 index only) | Product disposition |
|---|---|---|
| T-01 | First-class experience (not an iframe); Today / Log / Class review / Rituals / Guide / Plan | **Unsigned** — blocked on SY-0005 |
| T-02 | Benchmarks and journey phases (elapsed days, returns not streaks) | **Unsigned** — blocked on SY-0005 |
| T-03 | No-media invariant (`teaching-archive.v1` metadata only) | Starter vector exists; **Unsigned** until SY-0005 |
| T-04 | Privacy wording (no recording by default, revocable consent, no health data in filenames, limited retention) | **Unsigned** — blocked on SY-0005. Wording is not an enforceable control |
| T-05 | Content IDs / five navigation areas / data shape | **Unsigned** — blocked on SY-0005 |

Do not close [SY-0005](../issue-tracking/issues/SY-0005.md) from this
file.

## G. Quality, security, accessibility (deferred)

`docs/discovery/a11y-security-baseline.md` does not exist. Workflow-
facing DOM notes in [feature-inventory.md](feature-inventory.md) are
not a threat model. Foundation §2 lists CSP inline script/style,
unencrypted device data, last-write-wins, and a11y risks as a
**proposed** summary.

| Id | Topic | Product disposition |
|---|---|---|
| Q-01 | Threat sketch, localStorage/Access/shared-key, CSP/DOM sinks | **Unsigned** — blocked on SY-0006 |
| Q-02 | Keyboard / focus / semantics / responsive debt, absence of tests | **Unsigned** — blocked on SY-0006 |
| Q-03 | Privacy data classes beyond the fixture policy | **Unsigned** — blocked on SY-0006; R-16 still unsigned here |

Do not close [SY-0006](../issue-tracking/issues/SY-0006.md) from this
file. That issue is `security_impact: high`.

## Characterization vectors

A vector is not a product requirement until this file marks it
**approved**. All remain unsigned. No new vector was added here;
this is the Stage 0 index.

| Vector | Home | Status |
|---|---|---|
| `attendance.consume.present-late` | [sanitized-fixture-policy.md](sanitized-fixture-policy.md) | observed, **unsigned** |
| `comms.opened-not-delivered` | [sanitized-fixture-policy.md](sanitized-fixture-policy.md) | observed, **unsigned** |
| `teaching-archive.no-media` | [sanitized-fixture-policy.md](sanitized-fixture-policy.md) | observed starter; archive inventory SY-0005 |
| `nav.business-bookmark-only` | [feature-inventory.md](feature-inventory.md) | observed, **unsigned** |
| `router.unknown-and-constructor` | [feature-inventory.md](feature-inventory.md) | observed, **unsigned** |
| `chrome.fab-hidden-on-attendance` | [feature-inventory.md](feature-inventory.md) | observed, **unsigned** |
| `shortcut.ignored-in-fields` | [feature-inventory.md](feature-inventory.md) | observed, **unsigned** |
| `onboard.empty-still-has-catalog` | [feature-inventory.md](feature-inventory.md) | observed, **unsigned** |
| `hash.attendance-missing-session` | [feature-inventory.md](feature-inventory.md) | observed, **unsigned** |
| `session.derived-not-stored` | [legacy-data.md](legacy-data.md) | observed, **unsigned** |
| `attendance.idempotent-consume` | [legacy-data.md](legacy-data.md) | observed, **unsigned** |
| `invoice.totals-exclusive` | [legacy-data.md](legacy-data.md) | observed + probe, **unsigned** |
| `invoice.number-floor` | [legacy-data.md](legacy-data.md) | observed + probe, **unsigned** |
| `sync.pull-replaces-collections` | [legacy-data.md](legacy-data.md) | observed, **unsigned** |
| `membership.expiry-from-start` | [legacy-data.md](legacy-data.md) | observed + probe, **unsigned** |

Journey-day / returns vectors wait for SY-0005. Security
characterization waits for SY-0006.

Sanitized fixtures **cannot** yet exercise critical rules against a
representative studio export. Synthetic probes in SY-0004 can
exercise arithmetic. That is not the Stage 0 exit row.

## Representative exports and checksums

**None captured.** An agent must not read a live `localStorage` dump
or Sheet. Handling remains
[sanitized-fixture-policy.md](sanitized-fixture-policy.md).

When a human captures a representative export:

1. Export each **active** device store and each connected Sheet into
   an access-controlled location **outside** this clone (`exports/`,
   `backups/`, and `scratch/` are gitignored; prefer a path outside
   the repo).
2. Record device/store label, export time, byte size, and SHA-256 of
   the **raw** file in a private note. The raw hash may be copied
   into the table below; the bytes must not.
3. Produce a sanitized or synthetic derivative before any agent
   reads the material.
4. Destroy the raw file on the schedule in the signature block.
   Until that schedule exists, destroy it when the capture session
   ends (fixture policy step 4).
5. Never paste raw JSON into an issue, chat, or prompt.

Checksum slots (empty):

| Store / device label | Kind | Exported (UTC) | Raw SHA-256 (private note may match) | Sanitized SHA-256 | Row counts | Invariant totals |
|---|---|---|---|---|---|---|
| _none_ | `sadhanayog.v1` | — | — | — | — | — |
| _none_ | Google Sheet | — | — | — | — | — |
| _none_ | `teaching-archive.v1` | — | — | — | — | — |

Algorithm: SHA-256. Also record, on the sanitized set only:
attendance consuming-mark count, open-invoice sum, membership
remaining totals. Do not commit the hashed files if they contain any
redaction-catalog class.

## Required human decisions

Canonical Stage 0 register. Child inventories keep their local copies
for traceability; this table is what SY-0007 asks a product owner to
sign. **None are decided here.**

| Decision | Owner | Due before | Status | Rows |
|---|---|---|---|---|
| Approve the behavioral baseline (preserve / change / remove / defer per workflow) | Product owner | SY-0007 close; blocks Stage 2 ([SY-0018](../issue-tracking/issues/SY-0018.md)) | Unsigned | W-\*, R-01–R-15, R-17–R-19 |
| Browser `localStorage` vs Google Sheets precedence when they diverge | Product owner | SY-0007; [SY-0088](../issue-tracking/issues/SY-0088.md) | Unsigned | S-01, S-02, R-19 |
| Whether health / goals / emergency notes are necessary, and retention | Product / privacy owner | Production data import (foundation §30) | Unsigned | R-16 |
| Which legacy integrations are real versus demonstrative | Product owner | SY-0007 | Unsigned | I-01–I-12 |
| Which low-value features may be deferred from initial release | Product owner | SY-0007 | Unsigned | W-12, W-13, W-15, T-\* |
| Any UI or rule difference from the inventories | Product owner | The issue that would implement the difference | Unsigned | W-\*, R-\* |
| Keep Business bookmark-only, add to NAV, or fold into Finance/Reports | Product owner | SY-0007; Stage 2 IA ([SY-0019](../issue-tracking/issues/SY-0019.md)) | Unsigned | W-13 |
| Canonical term: Leads vs Enquiries | Product owner | SY-0019 | Unsigned | W-06 |
| Empty-studio catalog batches/location/templates: preserve, change, or remove | Product owner | SY-0007 | Unsigned | C-01 |
| Whether hosted, standalone, and custom-domain first-run must survive strangler | Product owner | SY-0007; foundation §28 step 10 | Unsigned | D-01, D-02, W-15 |
| Which of the four topologies is the studio’s real production path | Product / operations | SY-0007; cutover | Unsigned | D-01 |
| Whether Cloudflare Access is actually attached, and to which IdP | Product / security | Stage 5 identity; SY-0006 | Unsigned | I-11, D-04 |
| Whether `allowNegative` is preserve, change, or remove | Product owner | Attendance slice | Unsigned | R-05 |
| Whether derived sessions stay derived | Product owner | Scheduling invariants ([SY-0021](../issue-tracking/issues/SY-0021.md)) | Unsigned | R-04 |
| Whether last-write-wins row replace is acceptable until cutover | Product owner | SY-0007; online-first ADR | Unsigned | R-19, S-02 |
| Whether invoice displayed status must be stored, derived, or both | Product owner | Finance slice | Unsigned | R-08 |
| Cross-currency: forbid arithmetic, or INR-only at launch | Product owner | Finance invariants ([SY-0022](../issue-tracking/issues/SY-0022.md)) | Unsigned | R-20 |
| Waitlist: longest-wait copy vs collection order | Product owner | Classes slice | Unsigned | R-11 |
| Teaching Archive dispositions | Product owner | After SY-0005; native learning area | Unsigned | T-01–T-05 |
| Quality/security/accessibility residual risk | Product / security | After SY-0006 | Unsigned | Q-01–Q-03 |
| Raw-export destruction date | Product / privacy | Before any capture | Unsigned | checksum table |
| Repair STALE Apps Script HTML / Worker doc drift | Engineering after a tagged legacy revision | Not Stage 0 | Unsigned; recorded not fixed | D-05 |

## Open contradictions

Conflicts are defects. They are listed, not resolved. Signing this
file later must name a disposition for each.

1. **Sheet as source of truth vs always-writable device** (SY-0004).
   S-01 vs S-02.
2. **Business page vs navigation** (SY-0003). W-13.
3. **Leads vs Enquiries** (SY-0003). W-06. Terminology is SY-0019;
   the workflow still needs preserve/change/remove here.
4. **`allowNegative` copy vs unread flag** (SY-0004). R-05.
5. **Waitlist “longest wait” vs collection order** (SY-0004). R-11.
6. **Stored vs displayed invoice status** (SY-0004). R-08.
7. **Empty desk vs empty collections** (SY-0003). C-01.
8. **Worker markdown vs `worker.js`** (SY-0002). Executable file
   wins as observed behaviour. Product still chooses D-01.
9. **Foundation §2 versus missing SY-0005/SY-0006 evidence.** §2.2
   and the a11y/security paragraph are not inventories. This file
   does not promote them to signed rows.

## Generator consistency checks

Re-run 2026-08-19 against Command Center
`c724be0e116582b5c73d324d00a81ac23eb0bbf2`. Results recorded;
**nothing was fixed**. Neither legacy working tree was dirty.

| Check | Command | Result |
|---|---|---|
| Embedded `Code.gs` vs `index.html` | `python3 tools/embed-script.py --check` | **in sync** — exit 0 |
| Apps Script generated HTML | `python3 tools/build-appsscript.py --check` | **STALE** — exit 1; tool printed `Index.html is STALE — run: python3 tools/build-appsscript.py` |
| Worker static copy (local, gitignored) | `cmp index.html public/index.html` | **identical** |
| Teaching Archive generators | none in `c6732f59…` | Not applicable |

Command Center still has no `package.json` and no test files.
Teaching Archive still has no build and no tests.

## Rendered inspection

Not repeated in this issue. Desktop/mobile workflow rendering,
keyboard walkthrough, and page-level DOM notes are in
[feature-inventory.md](feature-inventory.md) (SY-0003). Teaching
Archive walkthrough and the security/a11y debt catalogue remain
SY-0006 (blocked on SY-0005 as well).

## Stage exit

| Stage 0 exit criterion | This issue |
|---|---|
| All Command Center pages, workflows, empty/loading/error, shortcuts, responsive behaviour, and deep links inventoried | Draft evidence in [feature-inventory.md](feature-inventory.md). Human acceptance of SY-0003 still required |
| Collections, encodings, calculation modules, derived sessions, outbox, last-write-wins inventoried | Draft evidence in [legacy-data.md](legacy-data.md). Human acceptance of SY-0004 still required |
| Teaching Archive content IDs, five areas, journey/rituals/reviews/benchmarks, privacy wording, no-media inventoried | **Deferred** — SY-0005. T-\* unsigned |
| External dependencies and deployment assumptions inventoried | Draft evidence in [repository-baseline.md](repository-baseline.md). Human acceptance of SY-0002 still required |
| Security and accessibility debt inventoried | **Deferred** — SY-0006. Q-\* unsigned |
| Product owner signs preserve/change/defer matrix and data-source precedence | **Not satisfied.** Register exists; signature block empty |
| Sanitized fixtures can exercise critical rules | Synthetic rule/workflow vectors exist and remain unsigned. Representative exports **not** captured |
| No legacy file changed | Satisfied 2026-08-19 |

This issue therefore **does not close Stage 0**. It closes only the
unsigned register, the interview/export protocols, and the generator
re-check.

## Security and redaction

Follow [sanitized-fixture-policy.md](sanitized-fixture-policy.md).

This issue did not open a production profile, did not read
`localStorage`, did not fetch Sheets, did not load `SY.DEMO`, and did
not interview anyone. Hostname `dash.omsadhanayog.com` is already in
Worker config (SY-0002); it was not fetched. No name, contact, health
note, invoice identifier, key, or live `/exec` URL was committed.

## How a product owner signs

Do not ask an agent to fill this block.

1. SY-0005 and SY-0006 named outcomes exist, or each remaining T-\*
   and Q-\* row is explicitly **Defer** with a surviving issue.
2. Interviews in the protocol above are done (2–3 users).
3. Every W/R/S/I/D/C row that is not Defer is Preserve, Change, or
   Remove. Change/Remove names the surviving behaviour.
4. S-01 vs S-02 is chosen.
5. Checksum table has at least the stores the studio actually uses,
   or an explicit “no connected Sheet” / “single device” note.
6. Fill the block. Move SY-0007 to `done` only after that.

### Signature block

| Field | Value |
|---|---|
| Product owner | _unsigned_ |
| Date | _unsigned_ |
| Users interviewed (count only, no names) | 0 |
| S-01 vs S-02 choice | _unsigned_ |
| Raw-export destruction date | _unsigned_ |
| Statement | _I have not signed this baseline._ |

## Rollback

Documentation only. Revert an incorrect register through review and
keep the Git history of the rejected text. Do not rewrite evidence
in place to hide a bad observation. Do not back-fill a signature
into an old revision.
