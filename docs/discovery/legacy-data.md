# Legacy data and rule inventory

Status: draft evidence — not product-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0004](../issue-tracking/issues/SY-0004.md)  
Sources: Command Center `c724be0e116582b5c73d324d00a81ac23eb0bbf2`;
[engineering foundation](../architecture/engineering-foundation.md) §2–3, §28;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 0;
[repository-baseline.md](repository-baseline.md);
[feature-inventory.md](feature-inventory.md);
Stage 0 program [README.md](README.md)

This file is the named SY-0004 outcome. It maps `sadhanayog.v1`, Sheet
tabs and columns, identifiers, list/JSON encodings, calculation
modules, derived sessions, the outbox, and last-write-wins. It is not
a signed preserve/change/remove matrix. The unsigned register is
[source-of-truth.md](source-of-truth.md)
([SY-0007](../issue-tracking/issues/SY-0007.md)). Page/workflow maps are
[feature-inventory.md](feature-inventory.md). Teaching Archive store
and content are [SY-0005](../issue-tracking/issues/SY-0005.md).
Threat/accessibility debt is
[SY-0006](../issue-tracking/issues/SY-0006.md).

## Purpose

Record the durable data shape and arithmetic of the current desk so
later stages cannot treat a rewrite as permission to invent a
different invoice total, pack countdown, or session identity. Later
issues may cite this file; they may not cite “the current app” or
foundation §2 as signed evidence.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | `docs/discovery/legacy-data.md`, the Stage 0 program map, and fixture-policy pointers |
| Database | None. |
| API | None. Current `POST /sync` payload shape is inventoried as the Apps Script mutation list. No new API. |
| Flutter | None. |
| Web | None. Calculation probes used synthetic numbers in a one-off Node process. No screenshot, no `localStorage` dump. |
| Infrastructure | None. |

No production resource, secret value, or real-user export enters this
repository. Catalog default identity fields (teacher name, phone,
street address) are cited by field name only. Demo-seed personal
fields were not copied.

## Observation method

Every claim names revision, path, and method.

| Method | What it means |
|---|---|
| static-read | File contents at the pinned revision |
| hash/compare | `SCHEMA` object identity between `index.html` `SY.Sync` and `apps-script/Code.gs` |
| generator-check | `python3 tools/*.py --check` in the Command Center copy |
| calculation-probe | Independent reimplementation of a cited formula with synthetic identifiers; result recorded here |
| not-observed | Searched for and not present, or deliberately not exercised (no live Sheet, no `localStorage` dump, no demo seed) |

Facts are labelled **Observed**, **Inferred**, or **Approved intent**.
Nothing in this file is approved intent. Foundation §2 is a proposed
summary; where this inventory agrees, it still re-cites evidence.

## Revisions inspected

Reconfirmed 2026-08-19 by `git rev-parse HEAD` on a clean Command
Center copy. `git status --porcelain` printed nothing. No legacy file
was modified.

| Application | Local path (read-only copy) | Revision |
|---|---|---|
| Command Center | `/home/shreyas/Work/sadhanayog/sadhana-yog-command-center` | `c724be0e116582b5c73d324d00a81ac23eb0bbf2` |

Teaching Archive (`teaching-archive.v1`) is out of this issue; it is
[SY-0005](../issue-tracking/issues/SY-0005.md).

Inspection machine: Node `v24.11.1`, Python `3.13.7`. The Command
Center has no `package.json` and does not pin either.

## Process note

SY-0004 `blocked_by` SY-0002. On 2026-08-19 SY-0002 was `in_review`
(named outcome [repository-baseline.md](repository-baseline.md)
exists) and not `done`. Work started because a human named this issue
after that inventory landed. The remaining SY-0002 gate is human
acceptance, not missing repository evidence. Recorded, not rewritten.
Same process note already sits on SY-0003.

## Store envelope

**Observed** (`index.html:2011`, `4020–4050`, `4088–4091`). Canonical
browser state is one JSON object under `localStorage` key
`sadhanayog.v1`. `SY.Store.persist` writes `JSON.stringify(state)` on
every change (debounced 250 ms for collection writes; immediate for
settings). Quota failure toasts “Could not save to this device —
storage is full”. Device bytes are unencrypted
([repository-baseline.md](repository-baseline.md)).

`blank()` shape:

| Key | Kind | Synced to Sheet? |
|---|---|---|
| `v` | number, currently 4 | No |
| `created` | ISO timestamp | No |
| `connection` | `{ mode, url, token, lastSync, lastError }` | No. JSON backup strips `url`/`token` (`index.html:4226–4229`) |
| `settings` | object of known keys | Yes, as Settings tab rows |
| `programs` … `rules` | arrays (see collections) | Yes |
| `templateLibraryVersion` | number | No. Local marker so a deleted template is not resurrected |
| `locationSeedVersion` | number | No. Same one-shot rule for the default location |
| `outbox` | array of queued mutations | No. Device-only |
| `onboarded` | boolean | No |

`connection.mode` values observed: `demo`, `local`, `sheets`
(`createDemo`, `createEmpty`, `SY.Sync.connect`). Hosted Apps Script
and custom-domain boot treat the live mode as sheets even if the
stored mode differs (`index.html:7154–7156`).

`connection.token` is the standalone access key. It must never be
committed. This issue did not read a live value.

Store version `v: 4` matches `TEMPLATE_LIBRARY_VERSION`
(`index.html:4023–4030`). Load fills missing top-level keys and
missing settings keys from `blank()` (`index.html:4057–4060`). It
does not migrate or rewrite unknown collection fields.

## Collections

**Observed** (`index.html:4097–4098`, `6936–6937`). Eighteen named
collections share one write path `SY.Store.write`. Settings are not
in this list; they travel as key/value mutations.

```text
students, memberships, attendance, payments, events, packages,
batches, programs, instructors, locations, invoices, expenses,
tasks, messages, reminders, leads, templates, rules
```

`write` throws on any other entity name. Upsert merges into the
existing row by `id` (`{ ...list[i], ...row }`) or appends. Delete
splices by `id`. There is no soft-delete flag except where a
collection has its own `status` (`Archived`, `void`, …).

Sheet tab names **Observed** (`Code.gs:123–130`, `index.html:7170–7194`):

| Collection | Tab |
|---|---|
| students | Students |
| memberships | Memberships |
| attendance | Attendance |
| payments | Payments |
| events | Events |
| packages | Packages |
| batches | Batches |
| programs | Programs |
| instructors | Instructors |
| locations | Locations |
| invoices | Invoices |
| expenses | Expenses |
| tasks | Tasks |
| messages | Messages |
| reminders | Reminders |
| leads | Leads |
| templates | Templates |
| rules | Rules |
| (settings object) | Settings |

`SCHEMA` in `SY.Sync` (`index.html:7170–7194`) equals `SCHEMA` in
`Code.gs:96–120` after quote/whitespace normalisation
(hash/compare, 2026-08-19).

New columns are **appended**. `setup()` widens a narrower tab and
rewrites the header; it never reorders or deletes columns
(`Code.gs:87–95`, `376–401`). A cell is stored as plain text
(`setNumberFormat('@')`) so `=` does not become a formula and dates
do not become serial numbers.

### Column lists

**Observed** (`Code.gs:96–120`). Empty cells decode as described
under Encodings. Field **values** that look like identity or health
are not repeated here.

**Students:** `id`, `name`, `preferred`, `phone`, `email`, `region`,
`format`, `level`, `batches`, `status`, `joined`, `notes`, `goals`,
`health`, `emergency`, `created`, `tags`, `address`, `tz`, `source`,
`referredBy`, `dob`, `waiting`.

Add-student writes `status: "Active"`, empty `notes` / `goals` /
`health` / `emergency`, `waiting: []`
(`index.html:13939–13947`). Walk-in writes `status: "Walk-in"`
(`index.html:14317`). Archive writes `status: "Archived"` and keeps
invoices (`index.html:9711–9718`). Permanent delete cascades
attendance, memberships, payments, invoices, messages, and reminders
whose `subjectId` is the student (`index.html:9721–9733`).

**Memberships:** `id`, `studentId`, `packageId`, `packageName`,
`model`, `start`, `validity`, `classes`, `price`, `paid`,
`paymentStatus`, `status`, `notes`, `created`, `autoRenew`,
`invoiceId`. Remaining classes and expiry are **not** stored; they
are derived (`memberState`).

**Attendance:** `id`, `date`, `batchId`, `program`, `studentId`,
`studentName`, `status`, `membershipId`, `via`, `checkIn`, `notes`.
One row per student per session (date + batch + student), not per
derived session id.

**Payments:** `id`, `studentId`, `membershipId`, `date`, `amount`,
`method`, `packageName`, `reference`, `status`, `notes`,
`invoiceId`, `category`, `upiTransactionId`. Refunds reuse the
payment row with `status: "Refunded"` (summary excludes them from
revenue).

**Events:** `id`, `date`, `kind`, `batchId`, `title`, `note`.
`kind` from `SY.CAT.EVENT_KINDS`. A holiday with empty `batchId`
cancels every batch that day.

**Packages:** `id`, `name`, `model`, `classes`, `validity`, `region`,
`price`, `active`, `notes`.

**Batches:** `id`, `program`, `name`, `days`, `start`, `end`,
`format`, `location`, `capacity`, `active`, `from`, `until`,
`notes`, `instructorId`, `locationId`, `delivery`, `platform`,
`meetingUrl`, `oneOff`, `courseId`. Sessions are not a collection.

**Programs:** `id`, `name`, `gloss`, `level`, `color`, `sessions`,
`description`, `price`, `outline`. A programme with `sessions > 0`
is treated as a course (`isCourse`).

**Instructors:** `id`, `name`, `phone`, `email`, `role`, `rate`,
`rateType`, `color`, `status`, `notes`, `created`.

**Locations:** `id`, `name`, `address`, `city`, `lat`, `lng`,
`capacity`, `mapsUrl`, `notes`, `active`, `created`.

**Invoices:** `id`, `number`, `studentId`, `studentName`, `issued`,
`due`, `status`, `items`, `currency`, `subtotal`, `discount`,
`discountType`, `taxRate`, `tax`, `total`, `paid`, `notes`,
`terms`, `membershipId`, `recurring`, `recurNext`, `sentAt`,
`paidAt`, `created`. Displayed status is derived (`statusOf`).

**Expenses:** `id`, `date`, `category`, `vendor`, `description`,
`amount`, `tax`, `method`, `instructorId`, `recurring`,
`recurNext`, `status`, `notes`, `created`.

**Tasks:** `id`, `title`, `notes`, `due`, `dueTime`, `priority`,
`status`, `assignee`, `repeat`, `links`, `tags`, `created`,
`doneAt`.

**Messages:** `id`, `at`, `channel`, `direction`, `studentId`,
`leadId`, `to`, `subject`, `body`, `status`, `kind`, `refId`,
`templateId`, `notes`. `at` is an ISO instant, not a date key.

**Reminders:** `id`, `kind`, `due`, `atTime`, `channel`,
`subjectType`, `subjectId`, `title`, `detail`, `status`, `ruleId`,
`refId`, `created`, `doneAt`. Automation ids are deterministic
(see Identifiers).

**Leads:** `id`, `name`, `phone`, `email`, `source`, `stage`,
`interest`, `note`, `owner`, `created`, `nextAt`,
`trialSessionId`, `convertedTo`, `value`, `tags`. Convert copies
name/phone/email/source onto a student and sets `stage: "won"`
(`index.html:15875–15887`).

**Templates:** `id`, `name`, `channel`, `kind`, `subject`, `body`,
`active`.

**Rules:** `id`, `kind`, `on`, `offset`, `atTime`, `channel`,
`template`, `label`.

**Settings tab:** `key`, `value`. Not a row-per-entity table.

## Identifiers

**Observed** (`index.html:3954`). Runtime ids:

```text
uid(prefix) = prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
```

They are unique-enough for one studio, not opaque server ids. Prefixes
observed at write sites:

| Prefix | Entity |
|---|---|
| `s` | student |
| `m` | membership |
| `a` | attendance |
| `p` | payment |
| `inv` | invoice |
| `e` | calendar event |
| `b` | batch |
| `pr` | programme |
| `pk` | package |
| `tk` | task |
| `ex` | expense |
| `in` | instructor |
| `loc` | location |
| `ld` | lead |
| `tpl` | template |
| `msg` | message |
| `q` | outbox item |

Catalog seed ids are stable literals (`nitya`, `pk-10`,
`b-nitya-eve`, `loc-sunderban`, `tpl-class`, `rr-class`, …).

**Derived, never stored as a collection row:**

- Session id = `` `${batchId}@${date}` `` (`index.html:4359–4360`).
  Unknown or malformed ids fail `sessionById` and the attendance
  page shows “That class isn't in the schedule”
  ([feature-inventory.md](feature-inventory.md)).
- Reminder id = `` `rm_${ruleId}_${subjectId}_${due}` ``
  (`index.html:6533`). Class reminders further qualify
  `subjectId` as `studentId + "_" + sessionId` in the id, then
  store the real student id on the row (`index.html:6566–6572`).
  Waitlist reminders use `` `rm_waitlist_${batchId}_${studentId}_${today}` ``.

Invoice **numbers** are not the row id. `nextNumber` takes
`max(settings.invNext, max(existing prefixed numbers)+1)` and
zero-pads to four digits (`index.html:5545–5556`). Two offline
devices can still mint different ids; the number floor is what
stops silent number reuse after a pull.

## Encodings

**Observed** (`Code.gs:132–169`, `565–613`, `634–648`). Round-trip
is encode on push, decode on pull.

| Kind | Where | Wire form |
|---|---|---|
| list | Students `batches`, `tags`, `waiting`; Batches `days`; Leads `tags`; Tasks `tags`; Programs `outline` | comma-separated; empty → `[]` |
| JSON | Invoices `items`; Tasks `links` | JSON text in one cell; empty → `null`; parse failure → `null` |
| number | Memberships `validity`/`classes`/`price`/`paid`; Payments `amount`; Packages `classes`/`validity`/`price`; Batches `capacity` (and each `days` token); Programs `sessions`/`price`; Instructors `rate`; Locations `lat`/`lng`/`capacity`; Invoices money fields; Expenses `amount`/`tax`; Leads `value`; Rules `offset` | empty → `null`; otherwise `Number` (NaN keeps the string) |
| bool | Packages `active`; Batches `active`, `oneOff`; Locations `active`; Templates `active`; Rules `on` | `TRUE`/`FALSE`. Blank is **true** for `BOOL_BLANK_TRUE` (active flags and `on`); blank `oneOff` is **false** |
| date | any `Date` object read back | `yyyy-MM-dd` in script timezone `Asia/Kolkata` (`appsscript.json`) |
| object (non-JSON field) | encode | written as empty string — nested objects are dropped |
| cell cap | every cell | `MAX_CELL` 10_000 characters (`Code.gs:85`, `577`) |

Settings values: `TRUE`/`FALSE` become booleans; a non-empty numeric
string becomes a number; otherwise the raw string
(`Code.gs:644–646`). Only keys the app already has on
`state.settings` are applied on pull (`index.html:7099–7106`).
`__proto__` cannot land as an assignment because pull iterates
`Object.keys(known)`.

Invoice `items` written by `invoiceForMembership`
(`index.html:5810`): `{ desc, detail, qty, rate }`. Totals read
`qty * rate` and ignore unknown properties.

Task `links` observed as `{ studentId }` when a task is created
from a profile (`index.html:9707`). Other keys were not observed.

**In-memory vs sheet.** Arrays stay arrays in `localStorage`. The
comma/JSON encodings exist only on the Sheet. A standalone desk that
never connects never applies `encodeRow`.

## Catalog, empty desk, and demo

**Observed** (`index.html:4079–4086`, `4165–4219`;
[feature-inventory.md](feature-inventory.md) empty-desk section).
`createEmpty` seeds programmes, packages, default batches, one
location, templates, reminder rules, and `defaultSettings()`.
Operational collections start empty. Identity-like defaults in
`defaultSettings()` are not copied here.

`seedCatalog` fills a collection only when that array is empty — it
does not resurrect a row the teacher deleted from a non-empty
collection. `seedTemplates` / `seedDefaultLocation` are version
markers so an intentional deletion stays deleted.

`SY.DEMO.build` invents personal-looking students. This issue did
not load it. Behaviour observed only in demo seed is labelled as
such; none of the rules below required the demo.

Billing models **Observed** (`index.html:2757–2764`):

| `model` | Counts classes? |
|---|---|
| Pack, Drop-in | yes |
| Unlimited, Monthly, Program | no (date window only) |

Unknown model → `countsClasses` false.

Attendance marks **Observed** (`index.html:2794–2801`):
`present`, `late`, `excused`, `absent`. `CONSUMING = ["present","late"]`.

## Derived sessions

**Observed** (`index.html:4355–4446`). A batch is a rule. A session
is one dated instance. Sessions are never stored, so changing a
batch cannot leave orphan occurrence rows.

`runsOn(batch, date)`:

1. `active === false` → no.
2. `oneOff` → only `from === date` (weekday list ignored).
3. Else `days` must include `dowOf(date)` (JS `getDay()`, 0 = Sunday).
4. `from` / `until` are inclusive date-key windows when set.

`sessionsOn(date)` walks every batch, then applies events:

- `kind === "holiday"` and empty `batchId` → studio closed; every
  otherwise-running batch is cancelled that day.
- `kind === "cancelled"` or `holiday` with that `batchId` → that
  batch only.

`EVENT_KINDS` `cancels` is documentation of intent; `sessionsOn`
hard-codes holiday/cancelled (`index.html:4381–4386`). `special`,
`workshop`, and `note` do not cancel.

Phase **Observed** (`makeSession`, `index.html:4391–4404`):

| Condition | `phase` |
|---|---|
| cancel event | `cancelled` |
| date &lt; today, unmarked | `missed` |
| date &lt; today, marked | `done` |
| date &gt; today | `upcoming` |
| today, now in `[start,end]` | `live` |
| today, after end, unmarked | `missed` |
| today, after end, marked | `done` |
| today, before start | `upcoming` |
| marked, not cancelled, date ≤ today, not live | forced `done` |

`present` on the session object is the count of consuming marks, not
the roster size.

Roster **Observed** (`index.html:4451–4469`): enrolled students
(`student.batches` includes the batch id, not Archived) plus anyone
already marked (walk-ins). Capacity uses enrolled count, not marks
(`capacityOf`).

**Calculation-probe** (synthetic, 2026-08-19): past unmarked session
→ `missed`; holiday cancel → `cancelled`; today with clock inside
start/end → `live`. Matches `makeSession`.

## Attendance consumption

**Observed** (`index.html:2800–2801`, `4472–4501`, `4293–4353`).

Marking is idempotent: one attendance row per student per session.
A second tap on the same mark clears it (`status === null` deletes
the row). Changing present → late keeps `membershipId`.

When the new status is consuming and the row has no
`membershipId`, `activeMembership(studentId, date)` supplies one:

- usable = not Archived, `date` in `[start, expiry]`, and if
  counted then `remaining > 0`
- pick the usable membership that expires soonest

If none: `via` becomes `unpaid` (or the caller’s `opts.via`). The
mark is still written. `markWarning` is UI copy plus “add a
package”; it does **not** block the write (`index.html:8847–8869`).

`memberState` used-count:

1. consuming attendance for that student
2. if `membershipId` is set, it must equal this membership
3. else (imported sheet rows) date-window: `date >= start` and
   `date <= expiry`

`remaining = classes - used` for counted models. Status:

- stored `Archived` → Archived
- else today &gt; expiry → Expired
- else counted and remaining ≤ 0 → Used up
- else Active

`allowNegative` exists on `defaultSettings`
(`index.html:3200`) and is **not read** anywhere else. Flags UI
exposes `expiringDays`, `lowBalance`, `dormantDays` only
(`index.html:13374–13376`). Happy-path marking will not attach a
used-up pack (`activeMembership` requires `remaining > 0`), so
remaining does not go negative through that path. The date-window
fallback for unlinked imported rows can over-count. Whether packs
may overdraw is unsigned (SY-0007).

Clear-all on a roster restores pack counts because it deletes the
consuming rows; used is derived, not a stored counter. Feature
inventory already records the workflow copy.

`via` values observed at write sites: `member`, `unpaid`,
`walk-in`, `trial`.

**Calculation-probe** (synthetic): four marks on membership `m1` —
present, late, absent, excused — plus a present with empty
`membershipId`. Used = 2, remaining of 10 = 8. Absent/excused do
not consume. Unlinked present does not consume `m1`.

Expiry probe: `start 2026-01-01` + `validity 90` → `2026-04-01`
(`U.addDays`).

## Invoice and money arithmetic

**Observed** (`index.html:5109–5164`, `5494–5532`, `5541–5593`).

`SY.Money.r2` rounds to two decimals at every step
(`Math.round((n + Number.EPSILON) * 100) / 100`).

`totals(invoice)`:

1. `subtotal` = Σ `qty * rate`
2. `discount` = percent of subtotal if `discountType === "pct"`,
   else absolute; capped at subtotal
3. `taxable` = subtotal − discount
4. tax from `SY.Money.split(taxable, taxRate, settings.taxInclusive)`
5. `total` = gross if inclusive, else net + tax
6. `balance` = total − `paid`

`split` exclusive: tax = amount × rate/100. Inclusive: net =
amount / (1 + rate/100), tax = amount − net.

`statusOf` (displayed; also written back when `autoOverdue` runs):

- stored `draft` or `void` never overridden
- else `balance <= 0.005` and total &gt; 0 → `paid`
- else any paid &gt; 0.005 → `overdue` if due &lt; today, else `partial`
- else `overdue` if due &lt; today, else `sent`

Receivable counts displayed `sent` / `partial` / `overdue`
(`COUNTS_AS_RECEIVABLE`). Void keeps payment rows; delete does not
(feature inventory). `uninvoicedDue` adds memberships with
`paymentStatus === "Pending"`, not Archived, and no non-void
invoice for that membership.

Aging buckets from days past due: not yet due, 1–30, 31–60, over 60
(`index.html:5578–5592`). Period profit: payments in the window
minus refunds minus expenses (amount + tax).

`nextNumber` probe: prefix `SY-`, `invNext = 3`, existing
`SY-0007` → `SY-0008`.

**Calculation-probe** (synthetic, exclusive 18% tax): items
2×1000 + 1×500, 10% discount, paid 1000, due in the past, stored
`sent`.

| Step | Value |
|---|---:|
| subtotal | 2500 |
| discount | 250 |
| taxable | 2250 |
| tax | 405 |
| total | 2655 |
| balance | 1655 |
| displayed status | overdue |

Inclusive split of 1180 at 18% → net 1000, tax 180, gross 1180.

Currency: settings hold a **symbol** (`currency`) and an ISO
`currencyCode`. Compact formatting uses lakh/crore only when code
is `INR`. Cross-currency arithmetic is not prevented in this
revision; foundation §30 assumes INR at launch. Unsigned.

## Outbox

**Observed** (`index.html:4100–4141`, `7119–7152`).

When `connection.mode === "sheets"` and `opts.noSync` is false,
every `write` / `setSettings` appends:

```text
{ id: uid("q"), entity, op, row, at: Date.now(), tries: 0 }
```

Settings mutations send only changed keys as
`{ id: key, key, value }`.

`flush`:

- no-op unless hosted, custom-domain, or mode `sheets`
- offline → status `queued`, keep the outbox
- send first **200** items (`slice(0, 200)`) as
  `{ mutations: [{ entity, op, row }] }`
- Apps Script rejects more than `MAX_MUTATIONS` 500 in one request
  (`Code.gs:84`, `412–414`)
- success: drop those ids, persist, schedule the rest
- failure: increment `tries`, exponential backoff 4s…60s, toast
  unless `silent`

Debounced schedule is 900 ms after a write. Going online flushes.
Init flushes then, if the outbox is empty and the tab is visible,
pulls every five minutes (`index.html:7159–7162`).

JSON backup **omits** the outbox and sheet credentials
(`exportJSON`). Restore keeps the current device connection and
the current outbox (`importJSON`). Disconnect with a non-empty
outbox warns that queued rows will never be sent
(`index.html:13672–13674`).

Hosted first-run pull uses `{ force: true, seed: false }` so an
empty sheet is not filled from leftover demo before the teacher
picks production (`index.html:16525`, `16676`).

## Last-write-wins

**Observed** (`index.html:7080–7112`; `Code.gs:412–440`;
Command Center `README.md:276–278`).

Pull comment: “the sheet wins.” After an optional flush, each
collection array is **replaced** by the sheet array. There is no
per-field merge and no tombstone list. A local row whose id is
absent from the sheet disappears on pull. Settings keys present
on the device and absent from the sheet stay; settings keys on
the sheet overwrite the known device keys.

Push `applyToTab` indexes rows by `id` (column A). Upsert
overwrites the **whole encoded row**. Delete removes the sheet
row (bottom-up). A repeated id in the same push updates the
pending append instead of duplicating it.

`LockService.getScriptLock()` waits 25 seconds around a push.
That serialises one script execution. Concurrent editors beyond
the lock are last-write-wins at **row** grain: the later full-row
write wins, even if the two devices changed different fields.
There is no vector clock, no `updatedAt` comparison, and no
conflict UI.

**Inferred** from the pull-replace plus outbox: a `force` pull
with a non-empty outbox replaces collections first and can then
flush the still-queued mutations, so the device outbox can win
after a forced pull. Normal pull flushes first. Not exercised
against a live sheet (`not-observed` live).

Foundation §2 and the Stage 0 program already record
localStorage-vs-Sheets precedence as unsigned. This issue adds
the mechanism, not the product choice.

## Calculation modules

**Observed** assignments. Screens are supposed to ask these
modules; they do not persist their outputs (except
`autoOverdue` writing derived invoice `status`, and automation
writing reminder/invoice/expense/task rows).

| Module | First assignment | What it computes |
|---|---:|---|
| `SY.CAT` | 2751 | enums, consuming marks, catalog seeds |
| `SY.Store` | 4020 | persistence, outbox enqueue, import/export |
| `SY.Dom` | 4268 | membership maths, session expansion, roster, mark, alerts, course progress, student finance, insights |
| `SY.Money` | 5102 | `r2`, format, parse, tax split, compact INR |
| `SY.QR` | 5187 | UPI QR drawing; no network |
| `SY.Fin` | 5491 | invoice totals/status, receivable, aging, period summary, forecast, payouts, applyPayment |
| `SY.Geo` | 5848 | haversine; does not geocode |
| `SY.Meet` | 5994 | meeting URL normalisation |
| `SY.Comms` | 6082 | template fill; log `opened` not delivered |
| `SY.Auto` | 6522 | reminders, overdue rewrite, recurring drafts, waitlist offers, sweep |
| `SY.Sync` | 6932 | pull/flush/connect; SCHEMA copy |

Automation **Observed** (`index.html:6824–6866`, `6882–6898`):
safe to re-run because reminder ids are derived. Recurring
invoices/expenses raise the next copy as `draft` / `due` and
clear `recurNext` on the parent. Repeating tasks that are `done`
mint a new `open` row and clear `repeat` on the old one.
Waitlist offers a reminder, never a silent enrolment. Nothing is
sent or charged without a button. Offer order is the `students`
array order, not a queued-at timestamp (see contradictions).

Quiet hours (`quietFrom` / `quietTo`) live on settings. Browser
notifications fire only while the page is open
([feature-inventory.md](feature-inventory.md)). This issue did
not re-derive the quiet-hour predicate beyond that.

## Other durable rules

**Dates.** Civil keys are `YYYY-MM-DD` in **local** time
(`index.html:3898–3910`). Message `at` and `connection.lastSync`
are ISO instants. Settings `tz` is IANA, used to show a student’s
clock when it differs from the studio (`localTimeFor`). Session
start/end are `HH:MM` on the civil date, not UTC instants.

**Streak.** Consecutive **weeks** with at least one consuming
visit, using `settings.weekStart` (`index.html:4535–4544`). Not
a day streak.

**Course progress.** Consuming attendance on batches of that
programme (or attendance `program` field), capped at
`program.sessions` (`index.html:4723–4737`).

**Communications.** Opening WhatsApp/mail/SMS records message
`status: "opened"` (or `logged` for notes). `markSent` is an
explicit teacher action (`index.html:6233–6249`). Starter vector
already in
[sanitized-fixture-policy.md](sanitized-fixture-policy.md).

**JSON backup.** Envelope
`{ app: "sadhana-yog-teaching-desk", version: 1, exported, data }`
(`index.html:4226–4256`). Rejects payloads over 40 MB or without
a `students` array. Unknown top-level keys are dropped.
Connection credentials never restore from a file.

**Predecessor spreadsheet.**
`resources/Sadhana_Yog_Tracker_Guide.md` matches attendance **by
name**. The HTML app uses `studentId` / `membershipId`. The
`.xlsx` was not opened and is not a user export
([repository-baseline.md](repository-baseline.md)).

## Characterization vectors

Format from [sanitized-fixture-policy.md](sanitized-fixture-policy.md).
These are **rule** vectors. They are not signed requirements.
Attendance consume and comms “opened” remain in the fixture
policy; they are not duplicated here.

### session.derived-not-stored

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:4355–4386`
- Method: static-read, calculation-probe
- Given: batch `b-nitya-eve` with `days` including the weekday of
  `2026-08-19`, `oneOff` false
- When: `sessionsOn("2026-08-19")` runs
- Then: a session id `b-nitya-eve@2026-08-19` is returned and no
  `sessions` collection is written
- Not then: a stored occurrence row; a holiday event with empty
  `batchId` on that date would set `phase` `cancelled`

### attendance.idempotent-consume

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:4472–4501`, `4293–4313`
- Method: static-read, calculation-probe
- Given: student-a with counted membership `m1` of 10 classes and
  no attendance
- When: present is recorded twice on the same session
- Then: one attendance row remains (second tap clears, or the
  same id is upserted); used becomes 1 only while the row is
  present
- Not then: two classes taken for one session

### invoice.totals-exclusive

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:5494–5518`, `5524–5532`
- Method: calculation-probe
- Given: invoice-1 items 2×1000 and 1×500, 10% discount, tax 18%
  exclusive, paid 1000, due before today, stored status `sent`
- When: `SY.Fin.totals` and `statusOf` run
- Then: subtotal 2500, discount 250, tax 405, total 2655,
  balance 1655, displayed status `overdue`
- Not then: draft/void overridden; tax computed on undiscounted
  subtotal

### invoice.number-floor

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:5545–5556`
- Method: calculation-probe
- Given: prefix `SY-`, `invNext` 3, existing number `SY-0007`
- When: `nextNumber` runs
- Then: `SY-0008` and `invNext` becomes 9
- Not then: `SY-0003` from the stale counter

### sync.pull-replaces-collections

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:7080–7112`; `Code.gs:412–440`
- Method: static-read
- Given: device collections and a sheet pull payload for the
  eighteen collections
- When: `SY.Sync.pull` succeeds
- Then: each collection array is replaced by the sheet array;
  `LockService` serialises one push for 25s; later full-row
  upserts win
- Not then: per-field merge; conflict UI; `outbox` /
  `connection` replaced by the sheet

### membership.expiry-from-start

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:4297–4317`
- Method: calculation-probe
- Given: membership start `2026-01-01`, validity 90, counted
  model, used 0
- When: `memberState` runs on `2026-08-19`
- Then: expiry `2026-04-01`, status `Expired`
- Not then: validity treated as a remaining-day counter stored
  on the row

## Contradictions with foundation §2

Conflicts are defects. They are listed, not resolved. Foundation
status is still “Proposed foundation for human approval.”

1. **Sheet as source of truth vs device store.** Sync comments and
   Settings copy say the spreadsheet stays the source of truth
   (`index.html:6910–6911`, `13518`). The device is always
   writable and pull is last-write-wins replace. Foundation §2
   already calls this last-write-wins. Precedence when they
   diverge remains unsigned (SY-0007).
2. **`allowNegative`.** Foundation §2 does not mention it.
   Settings default claims packs cannot go below zero without
   asking. No reader of the flag was observed. Marking still
   writes unpaid present when no usable pack exists.
3. **Stored vs displayed invoice status.** §2 lists
   draft/sent/paid/void/overdue as a family. Stored writes are
   `draft` / `sent` / `void` plus automation rewriting
   overdue/paid/partial. Display always goes through `statusOf`.
4. **Collections list.** §2’s list matches the eighteen
   collections plus settings, connection, and outbox. It does
   not name `templateLibraryVersion` / `locationSeedVersion` /
   `onboarded` / `v`. Those are device envelope, not Sheet tabs.
5. **Demo seed vs product code.** Consumption, totals, and
   session derivation were read from product modules, not from
   `SY.DEMO`. Catalog prices and programme names are product
   defaults. Identity-like `defaultSettings` values were not
   copied.
6. **Waitlist “longest wait”.** `SY.Auto.describe` and Settings
   copy say the person who waited longest is offered a freed
   place (`index.html:6894–6895`, `13230`). `waitlists()` takes
   `students.filter(waiting includes batch).slice(0, free)` with
   no sort (`index.html:6772–6777`). `waiting` is a list of batch
   ids, not a queue with times. Observed behaviour is collection
   order.

No disagreement was found with §2 on: present/late consume;
absent/excused do not; sessions derived from batch rules plus
exceptions; communications “opened”; last-write-wins concurrent
edits.

## Required human decisions

None of these are decided here. They block treating this
inventory as a build spec.

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Browser `localStorage` vs Google Sheets precedence when they diverge | Product owner | SY-0007; migration tooling ([SY-0088](../issue-tracking/issues/SY-0088.md)) | Unsigned |
| Whether health / goals / emergency notes are necessary, and retention | Product / privacy owner | Production data import (foundation §30) | Unsigned |
| Whether `allowNegative` is preserve (and then must be implemented), change, or remove | Product owner | SY-0007; attendance slice | Unsigned |
| Whether derived sessions stay derived or become stored occurrences | Product owner | SY-0007; scheduling invariants ([SY-0021](../issue-tracking/issues/SY-0021.md)) | Unsigned — foundation §2 says preserve unless an ADR shows a better invariant |
| Whether last-write-wins row replace is acceptable until cutover | Product owner | SY-0007; online-first ADR already leans away from general offline mutation | Unsigned |
| Whether invoice displayed status must be stored, derived, or both | Product owner | SY-0007; finance slice | Unsigned |
| Cross-currency: forbid arithmetic, or INR-only at launch as foundation §30 assumes | Product owner | finance invariants ([SY-0022](../issue-tracking/issues/SY-0022.md)) | Unsigned |

Preserve/change/remove of catalog defaults (packages, batches,
templates) remains on the Stage 0 program register and on
SY-0003.

## Generator consistency checks

Run 2026-08-19 against Command Center
`c724be0e116582b5c73d324d00a81ac23eb0bbf2`. Results recorded;
**nothing was fixed**.

| Check | Command | Result |
|---|---|---|
| Embedded `Code.gs` vs `index.html` | `python3 tools/embed-script.py --check` | **in sync** — exit 0 |
| Apps Script generated HTML | `python3 tools/build-appsscript.py --check` | **STALE** — exit 1 |
| Worker static copy (local, gitignored) | `cmp index.html public/index.html` | **identical** |
| `SY.Sync.SCHEMA` vs `Code.gs` `SCHEMA` | quote/whitespace normalised compare | **identical** |
| Teaching Archive generators | none | Not applicable |

Command Center still has no `package.json` and no test files.

## Stage exit

| Stage 0 exit criterion | This issue |
|---|---|
| Collections, encodings, calculation modules, derived sessions, outbox, last-write-wins inventoried | Satisfied as **draft evidence** in this file. Human acceptance of SY-0004 is still required before `done`. |
| Product owner signs preserve/change/defer and data-source precedence | Unsigned matrix in [source-of-truth.md](source-of-truth.md); signature still missing |
| Sanitized fixtures can exercise critical rules | Rule vectors begun here; attendance/comms starters remain in the fixture policy; representative exports still empty in [source-of-truth.md](source-of-truth.md) |
| No legacy file changed | Satisfied 2026-08-19 |

Render/DOM/accessibility inspection was not repeated; SY-0003
already walked workflows, and SY-0006 owns the quality baseline.
Calculation probes above substitute for a live Sheet.

## Security and redaction

Follow [sanitized-fixture-policy.md](sanitized-fixture-policy.md).

This issue did not open a production profile, did not read a live
`localStorage` dump, did not fetch Sheets, and did not load
`SY.DEMO`. Hostname `dash.omsadhanayog.com` is already in Worker
config (SY-0002); it was not fetched. Access keys, `/exec` URLs,
invoice identifiers, names, contacts, and health-note **values**
were not copied. Catalog default identity field values were not
copied.

Health/goal/emergency **field names** are in the Students column
list because the schema is the deliverable. Their contents are
redacted classes.

## Rollback

Documentation only. Revert an incorrect inventory through review
and keep the Git history of the rejected text. Do not rewrite
evidence in place to hide a bad observation.
