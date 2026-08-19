# Command Center feature/workflow inventory

Status: draft evidence — not product-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0003](../issue-tracking/issues/SY-0003.md)  
Sources: Command Center `c724be0e116582b5c73d324d00a81ac23eb0bbf2`;
[engineering foundation](../architecture/engineering-foundation.md) §2–3, §28;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 0;
[repository-baseline.md](repository-baseline.md); Stage 0 program [README.md](README.md)

This file is the named SY-0003 outcome. It inventories every Command
Center page, nested surface, hash, action, empty/loading/error path,
shortcut, responsive behaviour, and outbound deep link. It is not a
signed preserve/change/remove matrix. Sign-off is
[SY-0007](../issue-tracking/issues/SY-0007.md). Collection encodings,
calculation modules, outbox, and last-write-wins are
[SY-0004](../issue-tracking/issues/SY-0004.md). Keyboard/focus/semantics
debt as a quality baseline is
[SY-0006](../issue-tracking/issues/SY-0006.md).

## Purpose

Record how a teacher actually moves through the current desk so later
stages cannot treat a rewrite as permission to invent a different
information architecture. Later issues may cite this file; they may not
cite “the current app” or foundation §2 as signed evidence.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | `docs/discovery/feature-inventory.md` and the Stage 0 program map |
| Database | None. |
| API | None. |
| Flutter | None. |
| Web | None. Navigation maps and rendered inspection only. No screenshot committed. |
| Infrastructure | None. |

No production resource, secret value, or real-user export enters this
repository. Demo-seed personal fields were not copied. Catalog defaults
that look like identity (teacher name, phone, street address) are cited
by field name only.

## Observation method

Every claim names revision, path, and method.

| Method | What it means |
|---|---|
| static-read | File contents at the pinned revision |
| render | Chromium headless walk of `index.html` served from the read-only copy on `127.0.0.1:8765`, empty local desk (onboarding “Start with my own students”). 2026-08-19. puppeteer-core against `/usr/bin/chromium`. No demo seed loaded. |
| keyboard | Synthetic key events on that desk, not inside an input |
| not-observed | Searched for and not present, or deliberately not exercised (no live Maps/Meet/WhatsApp/Sheets call, no demo seed, no production hostname fetch) |

Facts are labelled **Observed**, **Inferred**, or **Approved intent**.
Nothing in this file is approved intent. Foundation §2 is a proposed
summary; where this inventory agrees, it still re-cites evidence.

## Revisions inspected

Reconfirmed 2026-08-19 by `git rev-parse HEAD` on a clean Command Center
copy. `git status --porcelain` printed nothing. No legacy file was
modified.

| Application | Local path (read-only copy) | Revision |
|---|---|---|
| Command Center | `/home/shreyas/Work/sadhanayog/sadhana-yog-command-center` | `c724be0e116582b5c73d324d00a81ac23eb0bbf2` |

Teaching Archive is out of this issue; it is [SY-0005](../issue-tracking/issues/SY-0005.md).

Inspection machine: Chromium `/usr/bin/chromium`, Node `v24.11.1`. The
Command Center has no `package.json` and does not pin a browser.

## Process note

SY-0003 `blocked_by` SY-0002. On 2026-08-19 SY-0002 was `in_review` (named
outcome [repository-baseline.md](repository-baseline.md) exists) and not
`done`. Work started because a human named this issue after that
inventory landed. The remaining SY-0002 gate is human acceptance, not
missing repository evidence. Recorded, not rewritten.

## Empty desk versus empty collections

**Observed** (`index.html:4029–4086`, render). Choosing “Start with my
own students” calls `SY.Store.createEmpty`. Student, membership,
attendance, payment, event, instructor, invoice, expense, task, message,
reminder, and lead collections are empty. The desk is **not** empty of
catalog:

| Seeded on empty desk | Source |
|---|---|
| Programmes | `SY.CAT.PROGRAMS` |
| Packages | `SY.CAT.defaultPackages()` |
| Recurring batches | `SY.CAT.defaultBatches()` (eight weekly rules) |
| One location | `SY.CAT.defaultLocations()` (`loc-sunderban`) |
| Message templates | `SY.CAT.defaultTemplates()` |
| Reminder rules | `SY.CAT.defaultReminderRules()` |
| Settings | `SY.CAT.defaultSettings()`, then onboarding overwrites `studio` and `teacher` only |

**Observed** (render, Wednesday 2026-08-19): Today therefore showed
scheduled classes (default batches include Monday–Thursday evening and
Monday/Wednesday/Friday morning). Places showed the seeded location,
not “No places yet”. Students, enquiries, invoices, and tasks showed
their empty states. Search with an empty query listed the four nearest
catalog batches under “Classes” plus every “Go to” screen, including
**Business**.

`createEmpty` does not clear catalog identity fields other than the
onboarding overlay. `defaultSettings()` still pre-fills teacher, phone,
and location text. Those values are not repeated here.

## Navigation map

**Observed** (`index.html:16424–16492`, render).

Sidebar `NAV` (desktop always; phone after hamburger / More), grouped:

| Group | id | Sidebar label | Phone tab? | tabLabel |
|---|---|---|---|---|
| Teaching | `today` | Today | yes | Today |
| Teaching | `calendar` | Calendar | no | Cal (unused — not a tab) |
| Teaching | `attendance` | Attendance | yes | Attend |
| Teaching | `classes` | Classes | no | — |
| People | `students` | Students | yes | Students |
| People | `leads` | **Enquiries** | no | — |
| People | `messages` | Messages | no | — |
| Money | `finance` | Finance | yes | Money |
| Money | `invoices` | Invoices | no | — |
| Running it | `tasks` | Tasks | no | — |
| Running it | `places` | Places | no | — |
| Running it | `reports` | Reports | no | — |
| Running it | `settings` | Settings | no | — |

Registered router pages (`PAGES()`, `index.html:16485–16492`), confirmed
by render of `Object.keys(SY.Router.pages)`:

`today`, `calendar`, `classes`, `students`, `attendance`, `leads`,
`messages`, `finance`, `invoices`, `tasks`, `places`, `reports`,
`business`, `settings`.

**Business is registered and reachable. It is not in `NAV`.** Comment at
`index.html:16481–16484`: kept because people have it bookmarked; it
answers “one month of teaching, on one page,” which Finance does not.
Render: `#/business` draws the page; sidebar has no `business` item.
Search “Go to” includes Business (`index.html:14829–14836`).

Phone tab bar (`buildTabbar`, `index.html:16891–16907`, render at 390×844):
Today, Attend, Students, Money, **More**. More opens the same sidebar.
Five slots are intentional (comment: four constant screens and one that
opens the rest).

`html lang="en"` (`index.html:2`). Brand subtitle is “Teaching desk”
(`index.html:1960`). Document title becomes `{page title} · {studio}`
(`index.html:7489`).

### Hash routing

**Observed** (`SY.Router`, `index.html:7454–7497`).

- Pattern: `#/{id}` or `#/{id}/{param}` with `decodeURIComponent` on param.
- Missing or unknown `id` draws Today (`pageFor(id) || pageFor("today")`).
- `#/constructor` is rejected via `hasOwnProperty` so it cannot pick
  `Object.prototype.constructor` (`index.html:7465–7468`). Render:
  current=`today`, no draw error.
- Default hash on first `start()`: `#/today` (`index.html:16828`).
- `go(id, param)` writes the hash; `hashchange` redraws; `refresh()`
  redraws keeping scroll.
- A render exception is caught and shown as “This screen could not be
  drawn.” plus the message (`index.html:7480–7485`). Not observed in the
  empty-desk walk (zero `renderError`).

Param meaning is per page (table below). A param that is also a tab id
switches the tab; otherwise it opens a nested record.

## Global chrome

**Observed** (`index.html:1951–1983`, `16868–17078`, render).

| Control | Role | Notes |
|---|---|---|
| Sidebar | `aria-label="Main navigation"` | Group labels, nav counts only for work that needs doing (`paintCounts`) |
| Hamburger | `aria-label="Open navigation"` | Visible at `max-width: 1000px`. `aria-expanded` toggled. Backdrop click, close button, Escape, and swipe-left &gt; 72px close it |
| Topbar title | current page title | Ellipsis on narrow |
| Sync pill | storage/sync status | Click: retry `flush` when sheets+error, else `#/settings`. States in `SY.Sync.describe` (`index.html:6959–6969`): Sample studio / On this device / Offline / Saving… / N waiting / Not saved / Synced |
| Search | `aria-label="Search students and classes"` | Opens command palette |
| Theme | `aria-label="Switch between light and dark"` | Render: `data-theme` `dark` → `light` |
| Help | `aria-label="Help and keyboard shortcuts"` | Hidden in CSS at `max-width: 1000px`; phone uses sidebar “How this works” |
| FAB `+` | quick-add menu | Hidden in CSS at `min-width: 1001px`; hidden in JS on Attendance (`index.html:17021`); hidden when overlay/sidebar/keyboard open |
| Phone tab bar | five items | Fixed bottom; `Attend` not `Attendance` |
| Setup banner | hosted/custom-domain only | “This desk is not using your spreadsheet yet” + “Use this spreadsheet” (`index.html:17066–17078`) |
| Toasts | `role="status"` | Optional Undo action |
| Modal | `role="dialog" aria-modal="true"` | Focus trap, Escape, overlay click (unless `dismissable: false`), autofocus first field |
| Drawer | `role="dialog" aria-modal="true"` | Same trap; phone sheet-handle swipe-down &gt; 110px closes |
| Menu | `role="menu"` | Desktop popover; phone action sheet with Cancel |

Sidebar counts (`paintCounts`, `index.html:17028–17054`): today (alerts),
attendance (unmarked), invoices and finance (overdue invoices), tasks
(due today; hot if overdue), messages (due now; hot if overdue
reminders), leads (open enquiries whose next date is due). A count is
hidden at zero. Phone More-dot lights for invoices/tasks/messages/leads
work.

Day rollover: while visible, a 60s timer refreshes Today and runs
`SY.Auto.run({ quiet: true })` when the civil date changes
(`index.html:16836–16848`).

## First run

**Observed** (`index.html:16504–16540`, `17158–17278`, render).

Standalone file / `http.server` (not Apps Script, not custom domain):

1. Desk hidden. Card **Your teaching desk**. Studio name (required-ish;
   blank becomes “Sadhana Yog”) and teacher (optional). **Continue**
   calls `createEmpty({ studio, teacher })`.
2. **How would you like to start?** Three exclusive picks, Start disabled
   until one is chosen:
   - Have a look around first — `loadSample()` / `createDemo()`. Invented
     studio. Not walked; demo personal fields stay out of this inventory.
   - Start with my own students — empty operational collections, catalog
     seeded as above, `connection.mode = "local"`, then `start()`.
   - Connect my Google Sheet — `start()` then `#/settings` with a toast
     to follow the sheet steps.

Hosted Apps Script / custom-domain (`onboarding({ hosted: true })`):
single card **Use this spreadsheet?** with **Use this spreadsheet**
(`startProduction`) and **Have a look around first**. Sample data is
described as device-only and never written to the bound sheet. If
`google.script.run` never arrives after 8s, **The page loaded, the link
to the sheet didn't** (`bridgeMissing`, `index.html:16594–16607`).
Production write failure: **Couldn't write to the sheet** plus Try again.

**Not observed:** hosted onboarding, production `startProduction`, live
`/sync`, or Cloudflare Access interstitial. Topologies remain
[repository-baseline.md](repository-baseline.md).

If `!loaded \|\| !loaded.onboarded` on standalone, onboarding runs
instead of the desk (`index.html:16537`).

## Pages

Hash column is what `SY.Router.go` writes. Empty copy is the `C.empty`
title observed in code and, where the empty desk reached it, in render.

### Today — `#/today`

**Observed** (`SY.Pages.today`, `index.html:8200–8656`, render).

No hash param. Greeting is time-of-day + optional teacher first name.
Headline names next class, unmarked classes, due reminders.

Primary actions: Walk-in; Join class (only if `SY.Meet.canJoin` — today,
online/hybrid, link present, from 20 minutes before start to 15 minutes
after end, `index.html:6026–6032`); Take attendance for the next live or
upcoming session.

KPI strip (each is a control that routes): Today's classes, Active
students, Turn-up rate, Taken this month, Profit this month, Owed to you.
Derived panels are behind `safely()` so a throwing insight does not
blank the page (`index.html:8251–8255`).

Body: “What needs you” (up to four `D().insights()`, All-N modal);
today's class rail (or “No classes today” with Add a one-off / Manage
classes); side column of reminders, tasks, and “Student by student”
alerts (empty title **Nobody needs chasing**). Session rows link to
attendance, batch, join, restore.

Auto-refresh while the tab is visible (60s and `visibilitychange`).

### Calendar — `#/calendar/{YYYY-MM-DD}`

**Observed** (`index.html:10274–10573`).

Param: a valid date key becomes `view.cursor`. Modes: Month, Week, Day,
List (`C.seg`). Actions: prev/next, Today, Add (`SY.Actions.addEvent`).
Day cells open day view. Session chips open attendance. Empty week:
**Nothing this week**. Empty day: **No classes on this day**. Empty
month list: **Nothing in the next month**. Phone week view adds “Swipe
sideways to see the whole week” (`index.html:10440`). Event kinds:
holiday, cancelled, special, workshop, note (`SY.CAT.EVENT_KINDS`).
Cancelling kinds remove the derived session.

### Classes — `#/classes/{tab\|batchId}`

**Observed** (`index.html:9753–10061`, render).

Tabs: Classes, Courses, Teachers (`team`). Param `classes` / `courses` /
`team` selects a tab; any other param opens `SY.BatchView` for that id.

Actions: Export calendar (`.ics`), Add a class. Empty classes: **No
classes yet**. Empty teachers: **Just you, then** (render). Courses
empty: **No courses set up** with Open courses.

A class is a **batch rule** (repeating days+time, or one-off), not a
stored row per occurrence (`index.html:9747–9750`). Sessions are
derived. Batch card: take attendance for next session, pause/resume,
delete. Teachers tab lists instructors and add/edit.

Batch drawer (`SY.BatchView`, `index.html:10068–10267`) tabs: Details,
Students, Classes. Foot: Edit, Join (if canJoin), Take attendance.
Waiting list and offer-place live on the Students tab.

### Students — `#/students/{filter\|studentId}`

**Observed** (`index.html:8992–9252`, `SY.Profile` `9260–9741`, render).

Filters (also legal hash params): Everyone, Needs attention, Running
low, Expiring soon, Lapsed, Payment due, Owes money, Not been in a
while, Walk-ins, Archived. A param that is not a filter id opens the
profile drawer (`index.html:9012–9016`).

Actions: Export (CSV), Add student. Search (name, phone, email). Optional
tag chips and class filter. Sort by name. Empty everyone: **Your student
list is empty** (render). Empty other filter: **Nobody in this group**
(render on `#/students/attention`). Empty search: **Nobody matches “…”**.

Add-student modal: name required; phone/email optional; optional package
+ start date; “More details” fold for level, format, region, source,
address, time zone, class ticks. Duplicate warning by name/phone
(`findDuplicates`). Health/goal/emergency fields exist on the student
record and are filled later; values are SY-0004 / privacy (SY-0006).

Profile drawer tabs: Overview, Practice, Packages, Money, Messages,
History. Foot: Message, and either Ask for outstanding money or Sell a
package. More menu: edit details, change classes, message, new invoice,
record payment, add a task, archive/restore, delete permanently
(cascades attendance, memberships, payments, invoices, messages,
reminders — confirm copy says so). Archive keeps invoices; outstanding
money still shows as owed.

### Attendance — `#/attendance/{sessionId}`

**Observed** (`index.html:8668–8982`, render).

No param: picker. Title **Take attendance**. Action **Another day** →
calendar. Sections: Today’s sessions; **Still unmarked** from the last
two weeks (max 8). Empty today: **No classes today**.

Unknown session id: **That class isn't in the schedule** + Choose a
class (render on `#/attendance/does-not-exist`).

Roster: back, class options (open batch, add a note, cancel/restore
class). Marks `present` / `late` / `excused` / `absent`
(`SY.CAT.MARKS`). Tap again clears. Present/late consume a counted pack
(`CONSUMING`, `index.html:2800–2801`) — the rule itself is SY-0004; the
workflow is: mark, balance chip flashes, toast with Undo on bulk
operations. **Mark everyone present** / remaining N. Walk-in, Someone
else (add existing). Search appears when roster &gt; 10. Clear all
confirms and restores pack counts (copy: “any classes taken off packs
will be given back”). Footer tallies; **Done** goes to the next unmarked
session today or back to Today.

Cancelled session: danger banner + Restore. FAB hidden on this page
(JS). Empty enrolled roster: **Nobody is enrolled in this batch yet**.

Walk-in (`SY.Actions.walkIn`): add a guest onto this session without
full enrolment. That path was not clicked in render; static-read only.

### Enquiries — `#/leads`

**Observed** (`index.html:11705–11808`, render). Page title **Enquiries**.
No hash param. Actions: Add an enquiry. Empty: **No enquiries yet**
(render). KPIs when rows exist. Pipeline columns from
`SY.CAT.LEAD_STAGES`: New enquiry, Contacted, Trial booked, Joined, Not
now. Desktop drag-and-drop; phone uses Move on the card or stage chips
in the detail (`index.html:11742–11743`). Convert (`convertLead`) creates
a student and sets stage `won`.

### Messages — `#/messages/{tab\|studentId}`

**Observed** (`index.html:12083–12370`, render).

Tabs: To send (`reminders`), Conversations (`threads`), Broadcast,
Templates. Param that is a tab id selects it; a student id opens that
thread. Actions: Rules → `#/settings/notifications`, New message.

Honesty banner on To send (render): every message is written, not sent;
Send opens WhatsApp / mail / SMS and the teacher presses send. Empty To
send: **Nothing to send**. Empty threads: **No conversations yet**.
Broadcast banner: a queue, not a blast. Reminder row actions: send,
snooze a day, snooze a week, mark handled, not needed. Opened log lines
offer **did it send?** → `SY.Comms.markSent` (`index.html:9672–9674`,
`12261–12263`).

### Finance — `#/finance/{tab}`

**Observed** (`index.html:10783–11169`, render).

Tabs: Overview, Money in, Money out, Payouts. Range picker: 7 days, 30
days, This month, Last month, 90 days, This year, All time
(`C.RANGES`, `index.html:7842–7850`). Actions: Record a cost, Record a
payment. Empty overview (render): **Nothing spent in this period**,
**Nothing outstanding**. Income empty: **No payments in this period**.
Expenses empty: **Nothing recorded**. Payouts empty: **Nobody to pay
yet**. Payment row can refund/restore/delete.

### Invoices — `#/invoices/{invoiceId}`

**Observed** (`index.html:11185–11512`, `SY.Fin.statusOf` `5524–5532`,
`invoiceMenu` `16270–16294`).

Param opens the invoice drawer. Filters: Open, Everything, Overdue,
Drafts, Paid, Cancelled (`void`). Actions: Chase N (when overdue), New
invoice. Empty: **No invoices yet** (render). Search empty: **Nothing
matches “…”**. Filter empty when others exist: **Nothing in this group**.

Stored status is `draft` / `sent` / `void` (plus paid amounts/dates).
**Displayed** status is derived: draft and void stay; otherwise paid if
balance ~0, else overdue/partial/sent from due date and amount paid.
Receivable counts `sent`, `partial`, `overdue` (`COUNTS_AS_RECEIVABLE`).
Cancel (void) keeps payments; delete does not. Duplicate creates a new
draft number. Print uses `#print-root` so the PDF is the document, not
the screen (`index.html:1807–1818`). UPI QR when settings allow.

### Tasks — `#/tasks/{tab}`

**Observed** (`index.html:11523–11692`, render).

Tabs: My day, Open, Coming up, Done. Optional assignee filter when more
than one active instructor. Empty My day: **Nothing due today** (render).
Empty Open: **No tasks**. Row actions include message student, move to
tomorrow, move a week, drop (undoable), delete (confirm). Repeat rules:
none, daily, weekly, fortnightly, monthly, quarterly, yearly
(`SY.CAT.REPEATS`). States: To do, In progress, Done, Dropped.

### Places — `#/places/{locationId}`

**Observed** (`index.html:11822–12069`, render).

Param selects a place. Action: Add a place. Empty (no rows): **No places
yet** — not hit on the empty desk because `defaultLocations()` seeds
one pin. Map: Google Maps embed from coordinates (`frame-src` allows
`https://www.google.com` / `https://maps.google.com`). Directions:
`https://www.google.com/maps/dir/?api=1&destination=…`. Open-in-Maps:
`maps/search/?api=1`. Coordinates can be parsed from a pasted Maps URL
(`parseLatLng`). Distances are haversine, shown as m/km and a walking /
road estimate. Hosted stale-bundle fallback registers a minimal Places
page if `SY.Pages.places.render` is missing (`index.html:16445–16478`).

**Not observed:** the Maps iframe network response (embed src is
constructed; the walk did not assert tiles).

### Reports — `#/reports/{reportId}`

**Observed** (`index.html:12383–12802`, render). Ten families:

Revenue, Expenses, Profit, Student growth, Attendance, Course
performance, Instructors, Outstanding, Invoices, Class utilisation.

Range picker as Finance. Actions: Print, Export CSV. Empty course
report: **No courses set up**. Empty instructors: **No teachers
recorded**. Empty utilisation: **No classes ran in this period**.

### Business — `#/business`

**Observed** (`index.html:10584–10769`, render). Bookmark / search only.
Month pager (cannot step into the future). Stats: classes taught,
student visits, students practising, turn-up rate, plus visit sparkline
and further month-to-date blocks. Export CSV. Comment: original monthly
view; Finance does not replace it. Not in sidebar.

### Settings — `#/settings/{section}`

**Observed** (`index.html:12813–13776`, render of `#/settings` and
`#/settings/security`). Rail `role="tablist"`. Thirteen sections:

| id | Label | What it edits (workflow, not schema) |
|---|---|---|
| `business` | Business | Studio identity, week start, currency, brand colour |
| `team` | Team | Instructors |
| `programmes` | Programmes | Programme catalog + course details |
| `packages` | Packages | Sellable packs |
| `invoicing` | Invoicing | Prefix, next number, due days, terms, tax |
| `payments` | Getting paid | UPI, hosted payment page, bank details |
| `notifications` | Reminders | Reminder rules, quiet hours, browser notifications |
| `automation` | Automation | Flags for auto reminders, overdue, recurring, waitlist; “only while this page is open” |
| `integrations` | Integrations | Honesty board (`SY.Comms.INTEGRATIONS`) — live / pending / off / not here |
| `flags` | When to flag | Attention thresholds |
| `appearance` | Appearance | Theme, reduced motion (`data-anim`) |
| `data` | Your data | Sheet connect/pull/flush, JSON backup restore, clear sample, load sample, erase this device |
| `security` | Security | Shared-key / Anyone-on-the-internet copy. Render showed the “deployment address answers the whole internet” banner |

Settings save on change (no page-level Save). Section draw errors become
“This section could not be drawn.” Data actions that destroy state
confirm first (`index.html:13722–13763`).

## Nested surfaces and the Add menu

**Observed** (`quickAdd` `index.html:14736–14754`, render phone action
sheet). Order: Add a student, Walk-in, Add an enquiry, Take attendance,
New invoice, Record a payment, Record a cost, Add a task, Write a
message, Add a class, Add to the calendar. Phone sheet appends Cancel.

Command palette (`search`, `index.html:14756–14868`, render `/` and
Ctrl+K): dialog `aria-label="Search"`. Categories: Students, Classes,
Coming up, Invoices, Tasks, Enquiries, Places, Teachers, Costs,
Messages, Go to (includes Business), Create (add “query” as student or
task). Empty query lists catalog classes + Go to. Arrow keys + Enter.
Empty result: **Nothing found.**

Other drawers/modals (static-read, not all opened in render): session
detail (`openSession`), invoice document, lead detail, location editor,
package/membership sell, expense, instructor, template, broadcast queue,
course details, help.

## State transitions (UI)

These are workflow transitions. Arithmetic and consumption rules are
SY-0004.

| Domain | States a teacher sees | How they move |
|---|---|---|
| Session phase | upcoming, live, done, missed, cancelled | Derived from now + attendance + cancel events (`SESSION_PHASES`) |
| Attendance mark | none, present, late, excused, absent | Toggle buttons; bulk present; clear-all with confirm+undo |
| Student | Active, Archived | Archive/restore in profile menu; delete is a separate confirm |
| Lead | new → contacted → trial → won \| lost | Drag, Move menu, or chips; convert writes student + `won` |
| Invoice (stored) | draft, sent, void | Send, cancel, delete, duplicate-to-draft |
| Invoice (shown) | + paid, partial, overdue | Derived in `statusOf` |
| Task | open, doing, done, dropped | Toggle, menus, My day vs Done tabs |
| Message log | opened, sent, logged (notes) | Channel open records `opened`; teacher confirms sent |
| Connection | demo, local, sheets (+ offline/queued/error/saving) | Onboarding and Settings → Your data |
| Package on a student | sold / counted down / expired / used up / pending pay | Sell package, attendance consume, record payment — details SY-0004 |

Automation (`SY.Auto`, help copy and `index.html:17104–17108`): prepares
reminders, flags overdue invoices, raises recurring invoices as drafts,
watches waiting lists. **Nothing is sent or charged without a button.**
Reminders only fire as browser notifications while the page is open
(`index.html:13207`, `16851–16865`).

## Empty, loading, error

**Observed** empty titles (static-read + render where reached):

| When | Copy |
|---|---|
| No classes today (Today / attendance picker) | No classes today |
| Attendance unknown id | That class isn't in the schedule |
| No students | Your student list is empty |
| Filter with no rows | Nobody in this group |
| Student search miss | Nobody matches “…” |
| No classes at all | No classes yet |
| No extra teachers | Just you, then |
| No enquiries | No enquiries yet |
| No places | No places yet |
| Messages to-send | Nothing to send |
| No threads | No conversations yet |
| No templates | No templates |
| Finance | Nothing spent / outstanding / recorded; No payments; Nobody to pay yet |
| No invoices | No invoices yet |
| Tasks | Nothing due today / No tasks / Nothing finished yet |
| Reports | No courses / No teachers / No classes ran in this period |
| Profile history | Nothing has happened yet |
| Nobody to chase | Nobody needs chasing |

**Loading** is not a skeleton per page. Observed waits:

- `waitForSheetTransport` up to 8s for `google.script.run`
- Hosted onboard: “Connecting to your spreadsheet” / “One moment.”
- Sync pill “Saving…”
- `SY.Store.persist` catch: “Could not save to this device — storage is full”

**Error / recovery** (static-read; some confirmed in render):

| Path | Behaviour |
|---|---|
| Page `render` throws | Banner “This screen could not be drawn.” |
| Settings section throws | Same, scoped to the section |
| Unknown hash | Today, no banner |
| `#/constructor` | Today, no throw |
| Missing student/batch | Toast “That student is no longer on the list” / “That batch no longer exists” |
| Hosted bridge missing | Dedicated onboard card, CSP diagnosis |
| Sheet write failure | Onboard error + Try again |
| Sync error | Pill “Not saved”; tap retries flush |
| Confirm-cancelled destructive action | No change |

There is no application-level HTTP spinner: the page does not fetch
itself after boot except `/sync` (Worker) or `google.script.run`.

## Keyboard shortcuts

**Observed** (`wireChrome`, `index.html:16937–16961`; help list
`17083–17087`; render on empty desk at 1280×900). Ignored when focus is
in INPUT/TEXTAREA/SELECT or contentEditable, or when a modal/drawer/action
sheet is open. Meta/Ctrl only intercepts `k` (search).

| Key | Action | Render |
|---|---|---|
| `/` | Search | dialog Search |
| Ctrl/Cmd+K | Search | dialog Search |
| `a` | Add menu | not clicked on desktop (FAB hidden; menu anchors to `#side-add`) |
| `w` | Walk-in | static-read |
| `t` | Today | ok |
| `c` | Calendar | ok |
| `s` | Students | ok |
| `m` | Attendance | ok |
| `l` | Classes | ok |
| `f` | Finance | ok |
| `i` | Invoices | ok |
| `k` | Tasks | ok |
| `n` | Messages | ok |
| `r` | Reports | ok |
| `?` | Help | static-read; help button also opens it |
| Esc | Close sidebar / dialog | ok on sidebar and help |

Typing `c` into the student search stayed on `#/students` with value
`c` (render). Help on desktop lists those keys; help on phone replaces
the keyboard block with the tab-bar explanation and has **no `<kbd>`**
(render `hasKbd: false`).

There is no shortcut to Business, Places, Enquiries, or Settings.

## Responsive behaviour

**Observed** (CSS `index.html:969`, `1446–1805`; `SY.U.isPhone` =
`max-width: 700px`; `isNarrow` = `max-width: 1000px`; render).

| Width | Render |
|---|---|
| 1280 / 1001 | Hamburger hidden, tab bar hidden, help visible, FAB hidden (`@media min-width: 1001px`) |
| 1000 | Hamburger visible, tab bar visible, help hidden, FAB visible |
| 701 | `isPhone` false, `isNarrow` true |
| 700 / 390 | `isPhone` true. Tab labels Today / Attend / Students / Money / More. FAB visible on Today. Help via sidebar. Menus become action sheets. Page actions stack to full width (`@media max-width: 700px`) |

Other CSS: `@media (max-width: 400px)` hides sync-pill text (clip);
`340px` hides Present label on mark buttons; `hover: none` kills hover
transforms; `prefers-reduced-motion: reduce` and `:root[data-anim=off]`
flatten motion; print hides chrome and can isolate `#print-root`.
Visual viewport listener toggles `kb-open` so the FAB/tab bar hide
behind the on-screen keyboard (`index.html:16998–17006`). Safe-area
insets are used throughout.

Desktop tables with `.tbl-wrap.responsive` are `display: none` under
1000px (`index.html:1491`) — lists replace them.

## External deep links and outbound schemes

**Observed** (static-read). The page does not call provider APIs. User
gesture opens a URL. Whether any are in live studio use is SY-0007.

| Kind | How | Constraint |
|---|---|---|
| WhatsApp | `https://wa.me/{n}?text=` (`index.html:6201–6203`). Bare 10-digit numbers get `91` prefix | Opens chat; log status `opened` |
| SMS | `sms:{target}?&body=` (iOS/Android form) | Help: phone only |
| Email | `mailto:` with subject/body | — |
| Phone | `tel:` | — |
| Google Meet | `https://meet.google.com/new` to create; stored `https` meetingUrl to join | `normalise` rejects non-https |
| Zoom | `https://zoom.us/start/webmeeting`; stored URL | No Zoom API |
| Teams | `https://teams.microsoft.com/` | — |
| Other meeting | any `https` URL | — |
| Maps embed | `https://www.google.com/maps?q={lat},{lng}&z=15&output=embed` | iframe, CSP `frame-src` |
| Maps search / directions | Maps URLs `api=1` | new tab, `noopener` |
| Hosted payment page | settings `payLink` on invoices | teacher-configured; do not commit live URLs |
| UPI | request link + QR from settings UPI id | cannot confirm payment |
| Calendar export | downloaded `.ics` snapshot | not a live feed |
| Apps Script / Worker sync | `connect-src` self + `script.google.com` / `script.googleusercontent.com` | inventory in SY-0002 |

Integrations board (`index.html:6355–6476`) labels WhatsApp/email/SMS
links, `.ics`, Maps, UPI, and hosted pay-link as **Working** when
configured; WhatsApp Business API, SMTP, SMS gateway, and in-app cards
as **Needs a server**. That honesty is product copy, not a live probe.

Join uses `window.open(link, "_blank", "noopener,noreferrer")`
(`index.html:14912`). Channel open the same (`index.html:6265`).

Internal deep links are the hashes in this file. Worker `GET *` serves
the SPA (`repository-baseline.md` Worker routes), so a custom-domain
path other than `/sync` still loads the desk; the **client** then reads
`location.hash`, not the pathname.

## Rendered inspection

**Observed** 2026-08-19. Method: Chromium headless, origin
`http://127.0.0.1:8765/index.html` from the pinned copy. Empty local
desk. No demo seed. No screenshot committed (catalog class names are
fine; identity fields are not).

Walked hashes (all matched expected router id, zero draw errors):
`#/today`, `#/calendar`, `#/classes`, `#/classes/courses`,
`#/classes/team`, `#/students`, `#/students/attention`, `#/attendance`,
`#/attendance/does-not-exist`, `#/leads`, `#/messages` and its four tabs,
`#/finance` and its four tabs, `#/invoices`, `#/tasks`, `#/tasks/open`,
`#/places`, `#/reports`, `#/reports/utilisation`, `#/business`,
`#/settings`, `#/settings/security`, `#/no-such-page`, `#/constructor`.

Also walked: standalone onboarding two steps; all letter shortcuts in
the table above; `/` and Ctrl+K; shortcut suppression in an input;
theme toggle; help desktop and phone; hamburger and More; phone Add
action sheet; 700px and 1000px breakpoints.

**Not observed in render:** adding a student, marking attendance,
opening a profile (no students), sending a message, Maps tile load,
print, `.ics` download, hosted onboarding, demo studio, live Sheets.

## DOM / accessibility (workflow-facing)

Detailed threat/semantics baseline is SY-0006. This issue only records
what the walk and static chrome required.

**Observed** positives (static-read + render on empty Today at 1280×900):

- `html lang="en"`
- `#main` `tabindex="-1"`
- Icon buttons in the topbar have `aria-label`
- Help, search, theme, hamburger, sidebar close labelled
- Attendance mark group `role="group"` with per-status `aria-pressed`
  and `aria-label` (`index.html:8871–8877`)
- Settings rail `role="tablist"` / `role="tab"` / `aria-selected`
- Modal/drawer `role="dialog" aria-modal="true"` with focus trap and
  restore (`index.html:7268–7301`, `7326–7353`)
- Toasts `role="status"`
- `focus-visible` styling and reduced-motion CSS exist (foundation §2;
  re-cited from `index.html:1800–1805`)
- Render unlabeled visible `button`/`a` count on empty Today: **0**
- Decorative `svg` mostly `aria-hidden="true"` (41 counted on empty Today)

**Observed** risks, not a verdict (for SY-0006):

- Many interactive `div`/`button.listrow`/`stat.hoverable` patterns;
  `C.stat` is `role="button"` when clickable (`index.html:7617–7618`)
- Drawer tab buttons set `aria-selected` but the tablist/`tabpanel`
  pairing is thin (`index.html:7368–7386`)
- Phone information density and swipe-to-dismiss
- Help hidden on narrow; keyboard users on a 1000px window lose the
  header help button (CSS), though `?` still works if a keyboard exists
- Colour is not the only status cue (chips + icons + copy), but this
  was not contrast-tested
- No axe run in this issue

## Characterization vectors

Format from [sanitized-fixture-policy.md](sanitized-fixture-policy.md).
Attendance consumption and comms “opened” already live there. These are
**workflow** vectors. They are not signed requirements.

### nav.business-bookmark-only

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:16424–16442`, `16481–16492`, `14829–14836`
- Method: static-read, render
- Given: an empty local desk
- When: the teacher uses only the sidebar or phone tabs
- Then: Business is not listed
- Not then: `#/business` and search “Go to → Business” still open the page

### router.unknown-and-constructor

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:7461–7468`
- Method: render
- Given: the desk has started
- When: the hash is `#/no-such-page` or `#/constructor`
- Then: `SY.Router.current` is `today` and the page draws
- Not then: a draw-error banner; `#/constructor` does not throw

### chrome.fab-hidden-on-attendance

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:17018–17021`, `969`
- Method: static-read, render
- Given: desktop width ≥ 1001px, or any width on `#/attendance`
- When: the teacher is on Attendance (any width) or on a desktop-wide layout
- Then: the floating Add button is not shown
- Not then: phone Today still shows the FAB at 390×844

### shortcut.ignored-in-fields

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:16942–16944`
- Method: render
- Given: `#/students` with focus in “Search students”
- When: the teacher types `c`
- Then: the query is `c` and the router stays on `students`
- Not then: a jump to Calendar

### onboard.empty-still-has-catalog

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:4029–4086`, `3146–3155`, `17232–17241`
- Method: static-read, render
- Given: first-run standalone “Start with my own students”
- When: the desk opens
- Then: students/leads/invoices/tasks are empty collections; programmes,
  packages, default batches, default location, templates, and reminder
  rules are present
- Not then: a completely blank catalog; demo personal students are not created

### hash.attendance-missing-session

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:8673–8682`
- Method: render
- Given: `#/attendance/does-not-exist`
- When: the roster would render
- Then: empty title “That class isn't in the schedule” with “Choose a class”
- Not then: a throw or a silent Today redirect

## Contradictions with foundation §2

Conflicts are defects. They are listed, not resolved. Foundation status
is still “Proposed foundation for human approval.”

1. **Business page vs navigation.** §2 lists Business among current
   pages. The page exists. Sidebar/phone chrome omit it. Search and hash
   keep it. Same gap already in the Stage 0 program; this issue confirms
   it in render.
2. **Leads vs Enquiries.** §2 says “Leads.” `NAV` and the page title say
   “Enquiries.” Router id remains `leads`. Terminology waits for Stage 2
   ([SY-0019](../issue-tracking/issues/SY-0019.md)).
3. **“Empty desk.”** §2 does not say that “start with my own students”
   still installs eight weekly batches and a default location. Empty
   operational collections ≠ empty catalog.
4. **Thirteen settings sections / ten reports.** Render and static-read
   agree with §2’s counts. Labels differ slightly (“Getting paid” not
   “payments”; report “Class utilisation”).
5. **Demo seed vs product code.** Help, empty copy, and catalog names are
   product code. Default settings still contain identity-like fields.
   Demo students were not loaded. Any later claim that “the empty desk
   has no classes today” is false on weekdays covered by
   `defaultBatches()`.

No disagreement was found with §2 on: Today as command center; student
filter set; profile tabs; class/course/team tabs; finance/invoice
statuses as a family; communications reporting “opened”; session
derivation from batch rules.

## Required human decisions

None of these are decided here. They block treating this inventory as a
build spec.

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Keep Business as a bookmark-only monthly view, add it to NAV, or fold it into Finance/Reports | Product owner | SY-0007; Stage 2 IA ([SY-0019](../issue-tracking/issues/SY-0019.md)) | Unsigned |
| Canonical term: Leads vs Enquiries | Product owner | SY-0019 | Unsigned |
| Whether empty-studio catalog batches/location/templates are preserve, change, or remove | Product owner | SY-0007 | Unsigned |
| Whether hosted, standalone, and custom-domain first-run must all survive strangler cutover | Product owner | SY-0007 (also unsigned on SY-0002) | Unsigned |
| Which outbound integrations are real versus demonstrative | Product owner | SY-0007 | Unsigned |
| Any UI difference from this inventory | Product owner | The issue that would implement the difference | Unsigned |

Health-note necessity and Sheets vs `localStorage` precedence remain on
the Stage 0 program register; they are not workflow-shape questions.

## Generator consistency checks

Run 2026-08-19 against Command Center `c724be0e116582b5c73d324d00a81ac23eb0bbf2`.
Results recorded; **nothing was fixed**.

| Check | Command | Result |
|---|---|---|
| Embedded `Code.gs` vs `index.html` | `python3 tools/embed-script.py --check` | **in sync** — exit 0 |
| Apps Script generated HTML | `python3 tools/build-appsscript.py --check` | **STALE** — exit 1 |
| Worker static copy (local, gitignored) | `cmp index.html public/index.html` | **identical** |
| Teaching Archive generators | none | Not applicable |

Command Center still has no `package.json` and no test files.

## Stage exit

| Stage 0 exit criterion | This issue |
|---|---|
| All Command Center pages, workflows, empty/loading/error, shortcuts, responsive behaviour, and deep links inventoried | Satisfied as **draft evidence** in this file. Human acceptance of SY-0003 is still required before `done`. |
| Product owner signs preserve/change/defer | Deferred to SY-0007 |
| Sanitized fixtures can exercise critical rules | Workflow vectors begun here; attendance/comms starters remain in the fixture policy; calculation vectors wait for SY-0004 |
| No legacy file changed | Satisfied 2026-08-19 |

## Security and redaction

Follow [sanitized-fixture-policy.md](sanitized-fixture-policy.md).

This issue did not open a production profile, did not read a live
`localStorage` dump, did not fetch Sheets, and did not load `SY.DEMO`.
Hostname `dash.omsadhanayog.com` is already in Worker config (SY-0002);
it was not fetched. Catalog default identity field **values** are not
repeated. Render observations used an empty local desk.

## Rollback

Documentation only. Revert an incorrect inventory through review and
keep the Git history of the rejected text. Do not rewrite evidence in
place to hide a bad observation.
