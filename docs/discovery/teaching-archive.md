# Teaching Archive inventory

Status: draft evidence — not product-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0005](../issue-tracking/issues/SY-0005.md)  
Sources: Teaching Archive `c6732f59cf66af9a238caaccc185104afa534d7f`;
[engineering foundation](../architecture/engineering-foundation.md) §2–3, §28;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 0;
[repository-baseline.md](repository-baseline.md);
Stage 0 program [README.md](README.md)

This file is the named SY-0005 outcome. It catalogues content IDs,
the five navigation areas, journey phases, rituals, class reviews,
benchmarks, the `teaching-archive.v1` shape, privacy wording, and
the no-media invariant. It is not a signed preserve/change/remove
matrix. The unsigned register is
[source-of-truth.md](source-of-truth.md)
([SY-0007](../issue-tracking/issues/SY-0007.md)).
Command Center pages are [feature-inventory.md](feature-inventory.md).
Command Center collections and arithmetic are
[legacy-data.md](legacy-data.md). Threat/accessibility debt is
[SY-0006](../issue-tracking/issues/SY-0006.md). Domain modelling of
this content is [SY-0023](../issue-tracking/issues/SY-0023.md).

## Purpose

Record how the current Teaching Archive actually behaves so later
stages cannot treat a rewrite as permission to invent different
journey-day maths, filename rules, ritual due windows, or a media
upload path. Later issues may cite this file; they may not cite
“the current app” or foundation §2.2 as signed evidence.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | `docs/discovery/teaching-archive.md`, the Stage 0 program map, and fixture-policy pointers |
| Database | None. |
| API | None. |
| Flutter | None. |
| Web | None. Navigation maps and a one-off rendered walk of the pinned file. No screenshot committed. |
| Infrastructure | None. |

No production resource, secret value, or real-user export enters this
repository. The render walk used a fresh Chromium profile and one
synthetic topic string (`hips`).

## Observation method

Every claim names revision, path, and method.

| Method | What it means |
|---|---|
| static-read | File contents at the pinned revision |
| render | Chromium headless walk of `index.html` served from the read-only copy on `127.0.0.1:8766`. Fresh profile. 2026-08-19. puppeteer-core against `/usr/bin/chromium`. Began with start date `2026-08-01` and weekly day Wednesday. |
| calculation-probe | Independent reimplementation of a cited formula with synthetic dates; result recorded here |
| not-observed | Searched for and not present, or deliberately not exercised (no live Netlify host, no real export, no home-screen install) |

Facts are labelled **Observed**, **Inferred**, or **Approved intent**.
Nothing in this file is approved intent. Foundation §2.2 is a proposed
summary; where this inventory agrees, it still re-cites evidence.

## Revisions inspected

Reconfirmed 2026-08-19 by `git rev-parse HEAD` on a clean Teaching
Archive copy. `git status --porcelain` printed nothing. No legacy
file was modified.

| Application | Local path (read-only copy) | Revision |
|---|---|---|
| Teaching Archive | `/home/shreyas/Work/learnings/yog-documentation` | `c6732f59cf66af9a238caaccc185104afa534d7f` |

Command Center was used only to re-run generator `--check` (recorded
below). Its collections stay in [legacy-data.md](legacy-data.md).

Inspection machine: Chromium `/usr/bin/chromium`, Node `v24.11.1`.
The archive has no `package.json` and does not pin a browser.

## Process note

SY-0005 `blocked_by` SY-0002. On 2026-08-19 SY-0002 was `in_review`
(named outcome [repository-baseline.md](repository-baseline.md)
exists) and not `done`. Work started because a human named this
issue after that inventory landed. The remaining SY-0002 gate is
human acceptance, not missing repository evidence. Recorded, not
rewritten. Same process note already sits on SY-0003 and SY-0004.

## Product identity

**Observed** (`README.md:1–13`, `index.html:5–12`, `522–528`,
`1839–1863`). One HTML file. Title “The Teaching Archive”. No
account, no sign-up, no network call. Welcome copy: “Everything
stays in this browser. Nothing is uploaded, nothing is shared, and
there is no account.”

It holds daily lines, recording *metadata*, class reviews,
benchmark checklists, plan/station checkboxes, and suggested
filenames. **It does not hold videos or audio**
(`README.md:11–13`). The product sentence in the README: “This app
is the notebook beside the camera, not the archive itself.”

Deploy options are inventoried in
[repository-baseline.md](repository-baseline.md). This issue does
not re-open them.

## Store envelope

**Observed** (`index.html:588–652`). Canonical device state is one
JSON object under `localStorage` key `teaching-archive.v1`.
`persist` writes `JSON.stringify(state)`. Collection writes are
debounced 300 ms; settings, import, erase, and “mark complete”
call `saveNow`. Quota failure toasts “Storage is full — export a
backup from Plan → Settings”. Device bytes are unencrypted
([repository-baseline.md](repository-baseline.md)).

`defaults()` shape:

| Key | Kind | Notes |
|---|---|---|
| `v` | number, currently `1` | No migration function was observed |
| `settings` | object | See settings table |
| `days` | object, date key → day row | Created in memory by `day(k)`; not persisted until a field is saved |
| `entries` | array | Recording metadata + suggested filename inputs |
| `reviews` | array | Class self-reviews; newest unshifted to index 0 |
| `rituals` | object | Keyed by period id, not an array |
| `benchmarks` | array | Newest unshifted to index 0 |
| `setup` | object | Station checklist, keyed by `STATION.k` |
| `plan` | object | Week-1 and milestone checkboxes |
| `seen` | object | Accordion open-state (`acc-<guideId>`, `p-<planId>`) |

Load fills missing top-level keys and missing settings keys from
`defaults()`. It does not migrate or rewrite unknown fields. A
parse failure returns `null` and the welcome screen runs again
(`index.html:607–616`, `1811–1815`).

There is no identity, token, remote URL, outbox, or sync field.

### Settings

**Observed** (`index.html:596`, `1737–1771`, `1839–1861`).

| Key | Type | Written by | Read by |
|---|---|---|---|
| `start` | `YYYY-MM-DD` | Welcome “Starting from”; Plan → Settings “Started” | `TA.Cur.dayNum`, phases, ritual due windows |
| `weeklyDay` | `0–6` (Sunday = 0) | Welcome “Weekly review day”; Plan → Settings | `dueRitual` weekday gate; Rituals “Every \<weekday\>” |
| `theme` | `system` \| `dark` \| `light` | Theme button; default `system` | `applyTheme` |
| `name` | string, default `""` | **Not observed** | **Not observed** |
| `teaches` | boolean, default `true` | **Not observed** | **Not observed** |

`name` and `teaches` exist only in `defaults()`. No control writes
them. No renderer reads them. They survive export/import because
the whole settings object is stored.

Theme button (`index.html:1821–1824`):
`theme = theme === "dark" ? "light" : "dark"`. First click from
`system` always becomes `dark`. Render on a dark host confirmed
the attribute stayed `dark` after the first click.

### Day row

**Observed** (`index.html:598`, `631–635`, `1226–1258`). Comment
at 598 lists `{line, rec, voice, taught, note}`.

| Field | Written by | Effect |
|---|---|---|
| `line` | Today one-line textarea (debounced 500 ms) | Counts as a logged day when trimmed non-empty |
| `rec` | “Recorded something” checkbox; also set `true` when an entry is filed | Counts as a logged day even without a line |
| `taught` | “I taught today” | Reveals the voice-note checkbox and prompt list |
| `voice` | “Post-class voice note” | Flag only; no audio is captured |
| `note` | **Not observed** | Named in the comment; no writer or reader |

`TA.Store.day(k)` inserts `{}` for a missing date. That empty
object is **not** persisted until `save` runs. Render after Begin
showed `dayKeys: []` in `localStorage` even though Today had
called `day(today)`.

### Entry row

**Observed** (`index.html:598`, `1299–1346`). Created by “Log a
recording”.

| Field | Role |
|---|---|
| `id` | `Date.now().toString(36)` + 5 random base-36 chars |
| `date` | `YYYY-MM-DD`, default today |
| `type` | One of the nine `TYPES` |
| `topic` | Filename segment; empty becomes `untitled` |
| `note` | Distinguishing filename segment; omitted if blank |
| `why` | “What was I exploring?” |
| `worked` | “What worked” |
| `didnt` | “What didn't” |
| `revisit` | “What to revisit” |
| `what` | Initialised to `""`; **no field writes it** |

Delete removes the metadata row only. Confirm copy: “The recording
itself isn't touched — only this note.” (`index.html:1483`).

### Review row

**Observed** (`index.html:1351–1412`).

| Field | Values / role |
|---|---|
| `id`, `date` | Same id/date helpers as entries |
| `cls` | Free text, “Which class” |
| `filler` | Integer tally, default 0 |
| `pace` | `too fast` \| `right` \| `too slow` |
| `timing` | `mostly` \| `sometimes` \| `rarely` |
| `looked` | `yes` \| `partly` \| `no` |
| `logic` | `yes` \| `mostly` \| `no` |
| `clearest`, `unclear`, `unseen`, `energy` | `REVIEW_FIELDS` text |
| `overuse` | Initialised; **no writer observed** |
| `presence` | “One honest word for how I was” |
| `safety` | boolean, “Options offered before the shape” |
| `oneThing` | The single carried-forward change |
| `prevHit` | `Yes` \| `Partly` \| `No` answering the previous review’s `oneThing` |

`prevHit` is stored on the *new* review, not written back onto the
previous row. The next review reads `S.reviews[0].oneThing`.

### Ritual record

**Observed** (`index.html:600`, `1416–1440`). Object key is the
period id. Value: `{ steps: { [index]: boolean }, note, done? }`.
`done` is the completion date key, set only by “Mark complete”.
Checking steps persists the record without setting `done`.
`dueRitual` treats any truthy `S.rituals[id]` as “already due this
period” — a started-but-uncompleted ritual still suppresses the
Today card.

### Benchmark row

**Observed** (`index.html:601`, `1443–1464`).

| Field | Role |
|---|---|
| `id`, `date` | Same helpers |
| `quarter` | `YYYY-Qn` from `quarterOf(today)` |
| `done` | Object of item index → boolean |
| `note` | Spoken end-of-set sentence (text only) |

Suggested filename is shown, not stored:
`{date}_BENCHMARK_{quarter-without-hyphen}.mp4`.

## Content IDs

All of these are compile-time constants in `TA.DATA`
(`index.html:718–964`). They are the stable IDs later content
migration ([SY-0090](../issue-tracking/issues/SY-0090.md)) must
map. Wording below is the on-screen title, not a product sign-off.

### Camera frames — `TA.DATA.FRAMES`

| id | Name |
|---|---|
| `class` | Full class |
| `solo` | Solo practice (default chip) |
| `standing` | Standing asana |
| `floor` | Floor practice |
| `demo` | Close demo |
| `rehearse` | Rehearsal |
| `breath` | Breathwork |
| `medit` | Meditation |

Each row also has height, distance, angle degrees, and a tip.
The frame card is a placement diagram. It does not capture media.

### Guide cards — `TA.DATA.GUIDE`

| id | Title | One-line subtitle |
|---|---|---|
| `start` | The whole system | Eight steps. Under two minutes. |
| `settings` | Phone settings | Choose once. Never touch again. |
| `lens` | The lens trap | Ultra-wide distorts alignment. |
| `light` | Light and room | You need contour, not beauty. |
| `audio` | Audio first | Your voice is the instrument. |
| `voice` | The post-class note | Two minutes. The highest-value habit here. |
| `names` | Files and names | Metadata goes in the filename. |
| `folders` | Folder structure | Make it once. Don't elaborate for a year. |
| `backup` | Backup | Three copies. Two media. One elsewhere. |
| `privacy` | Privacy and students | Read before pointing a camera at anyone. |
| `review` | How to watch yourself | Sample. Split the channels. |
| `bench` | The benchmark | Quarterly. Same conditions. Never daily. |
| `gear` | Gear, in order | Nothing until a real frustration demands it. |
| `station` | The recording station | Under one minute, or it won't last. |
| `stuck` | When something breaks | It never means the practice failed. |
| `prompts` | Reflection prompts | For when the page is cold. |

Accordion open-state is `seen["acc-" + id]`. Search is a
case-insensitive substring over title, subtitle, and
`JSON.stringify(body)`. Render of query `consent` opened only
“Privacy and students”.

### Week-1 tasks — `TA.DATA.WEEK1`

Seven objects, `d: 1…7`. Checkbox key `plan["w1-" + d]`.

| d | Title | Minutes |
|---:|---|---:|
| 1 | Position and settings | 20 |
| 2 | Record a practice | 17 |
| 3 | Record a teaching segment | 10 |
| 4 | Test your audio | 15 |
| 5 | Folders and names | 20 |
| 6 | Transfer and backup drill | 30 |
| 7 | Review and simplify | 30 |

Today surfaces the task for `min(dayNum, 7)` only while
`phase.id === "week1"`. After day 7 the card disappears; Plan
keeps the seven-row timeline.

### Milestones — `TA.DATA.PLAN`

Checkbox key `plan[id + "-" + itemIndex]`. Accordion:
`seen["p-" + id]`.

| id | Window | Title | Item count |
|---|---|---|---:|
| `d30` | Days 1–30 | Foundation | 8 |
| `d60` | Weeks 5–8 | Audio and station | 6 |
| `d90` | Weeks 9–13 | Writing and backup | 7 |
| `y1` | Months 4–12 | Intermediate | 7 |
| `y2` | Year 2+ | Advanced | 6 |

Each block also has a “Not yet” exclusion list. Items are
checkboxes only; the app does not verify that a recording or
backup exists.

### Ritual kinds — `TA.DATA.RITUALS`

| kind | Title | Duration | Steps | Period id |
|---|---|---|---:|---|
| `weekly` | The weekly sit | 30–45 min | 5 | `weekly-` + Monday of the week |
| `monthly` | The monthly ritual | 1–2 hrs | 5 | `monthly-` + `YYYY-MM` |
| `quarterly` | The quarterly review | half a day | 8 | `q-` + `YYYY-Qn` |
| `annual` | The annual review | 1–2 days | 8 | `annual-` + calendar year |

### Closed recording types — `TA.DATA.TYPES`

```text
PRACTICE  TEACHING  DEMO  EXPERIMENT  REVIEW
WORKSHOP  TRAINING  REFLECTION  BENCHMARK
```

Nine types, closed list (`index.html:781`, `950`). Guide copy
says “Resist a tenth”. `REFLECTION` is the only type whose
suggested extension is `.m4a`; all others `.mp4`
(`index.html:1306`).

### Station checklist — `TA.DATA.STATION`

| k | Title |
|---|---|
| `spot` | Camera spot chosen |
| `tape` | Floor tape down |
| `cable` | Charging cable, permanent |
| `tripod` | Tripod left standing |
| `mic` | Mic charging at the station |
| `card` | Checklist card on the wall |
| `folders` | Folders created |
| `backup` | Backup copies working |

Stored as `setup[k] = boolean`.

### Review field ids — `TA.DATA.REVIEW_FIELDS`

`clearest`, `unclear`, `unseen`, `energy` (`index.html:943–948`).

### Advised filesystem folders (content, not stored)

**Observed** (`index.html:787`). Guide card `folders` prints this
tree. The app never creates these folders and never checks they
exist.

```text
TEACHING-ARCHIVE/
  00_INBOX/
  01_PRACTICE/
  02_TEACHING/
  03_DEMOS/
  04_CLASSES/
  05_WORKSHOPS/
  07_AUDIO/
  08_WRITING/
  13_ARCHIVE/
  99_STUDENTS/
```

Numbers `06` and `09–12` are absent. That gap is observed
wording, not a missing collection.

## Five navigation areas

**Observed** (`index.html:1064–1098`, `1784–1800`, render).
Router ids equal tab ids. Hash form `#/{id}`. `parse` accepts
`[\w-]+`. Unknown or empty hash renders Today. `#/constructor`
and `#/no-such-page` both opened Today in render (topbar
“Today”). There is no 404 page and no nested hash.

| id | Tab label | Title | What it is |
|---|---|---|---|
| `today` | Today | Today | Day number, phase, optional welcome-back, week-1 task, at most one due ritual, one line, daily loop, capture actions, frame card, month stats |
| `log` | Log | Log | Searchable entries, type chips, last 30 daily lines, “Log a recording”, “Benchmark” |
| `rituals` | Rituals | Rituals | Four period cards (always this week/month/quarter/year), class reviews, filler trend, benchmarks. Gold tab dot when `dueRitual()` is non-null |
| `guide` | Guide | Guide | Searchable accordion of the 16 cards |
| `plan` | Plan | Plan | Week-1 timeline, five milestone blocks, station checklist, printable wall-card copy, settings |

Class review and benchmark are **sheets**, not tabs. They open
from Today, Log, and Rituals.

There is no Command Center deep link, no shared store, and no
iframe of either app into the other.

### Today

**Observed** (`index.html:1178–1287`, render 2026-08-19, start
`2026-08-01`). Heading “Day 19” / “First month — Record. Name.
Log. That's all.” Due card: “The weekly sit”. Loop checkboxes:
Recorded something (labelled Optional), I taught today, and
conditional Post-class voice note. Capture: “Log a recording”,
“Review a class”. Frame card defaults to `solo`. Month strip:
days logged this month, returns after a gap, recordings filed.

Welcome-back banner (`index.html:1191–1196`) when
`stats.gap >= 3`: “Welcome back — N days” and “No back-filling.”
Not shown on the Day 19 fresh-profile walk (no prior lines).

Prompt button toasts one of five stock sentences; it does not
fill the textarea.

### Log

**Observed** (`index.html:1501–1557`, render). Empty title:
“No recordings filed yet”. Filter empty: “Nothing matches”.
Daily lines section appears only when at least one trimmed
`days[k].line` exists; capped at 30, newest first.

### Rituals

**Observed** (`index.html:1562–1630`, render). The four period
cards are always the *current* period, even when `dueRitual`
would not surface them on Today. Empty reviews: “No reviews
yet”. Benchmarks empty: explanatory card plus “Start a
benchmark”. Filler sparkline renders when more than two reviews
exist (not reached in render).

### Guide

**Observed** (`index.html:1635–1669`, render). Intro: “Reference,
not homework.” Cards `settings` and `lens` also embed the frame
card. Search `consent` → only `privacy`.

### Plan

**Observed** (`index.html:1674–1775`, render). Settings card:
weekly day, start date, privacy sentence, Export, Import, Erase
all data. Wall card is static copy, not a generated PDF.

### Onboarding

**Observed** (`index.html:1839–1863`, render). Shown when
`load()` returns `null`. App shell and tab bar `display: none`.
Fields: start date (default today), weekly review day (default
Sunday). “Begin” calls `Store.create({ start, weeklyDay })` and
`start()`. There is no demo seed.

### Empty / error

| Situation | Behaviour |
|---|---|
| First visit | Welcome. No store key. |
| Corrupt JSON | `load` returns `null`; welcome again. Console warning only. |
| Unknown hash | Today. |
| Empty log | “No recordings filed yet” |
| Empty log search | “Nothing matches” |
| Empty reviews | “No reviews yet” |
| Empty benchmarks | Explanatory card, not the `.empty` component |
| Empty guide search | “Nothing found” with suggested words |
| Storage quota | Toast pointing at Plan → Settings export |
| Import bad file | Toast “That file isn't a Teaching Archive backup.” |

There is no loading spinner. There is no render-error banner
(unlike Command Center). A thrown page render would be an
uncaught exception; **not observed**.

No keyboard shortcuts were observed. Tab bar is the only
navigation chrome besides hashes.

Responsive: `--maxw: 640px`. At `min-width: 700px` the tab bar
becomes a floating pill (`index.html:458–466`). Render at
390×844 and 1280×900 both showed the same five tabs. Detailed
semantics/focus debt is SY-0006.

## Journey phases and day number

**Observed** (`index.html:655–668`), calculation-probe.

```text
dayNum = max(1, dayDiff(settings.start, today) + 1)
```

`today` is the device's local calendar date (`TA.U.todayKey`).
There is no IANA time-zone field.

| dayNum | `phase.id` | Label | Note |
|---:|---|---|---|
| 1–7 | `week1` | First week | Building confidence, not quality. |
| 8–30 | `month1` | First month | Record. Name. Log. That's all. |
| 31–90 | `found` | Foundation | Audio, station, writing, backup. |
| 91–365 | `inter` | Intermediate | Reviewing, sequencing, methodology. |
| 366+ | `estab` | Established | The archive is answering questions now. |

Probe: day 1/7 → `week1`; 8/30 → `month1`; 31/90 → `found`;
91/365 → `inter`; 366 → `estab`. Render with start
`2026-08-01` on `2026-08-19` showed Day 19 / First month.

Changing `settings.start` in Plan recalculates immediately
(`index.html:1744–1745`).

Phases are derived. They are not stored.

## Returns, not streaks

**Observed** (`index.html:670–685`, `1286`), calculation-probe.

A day is **logged** when `(line || "").trim()` is non-empty **or**
`rec` is truthy. Blank/whitespace lines do not count. A `rec`
flag without a line does count.

`returns` counts, in sorted logged keys, each step where
`dayDiff(prev, next) > 2` — two or more calendar days skipped
(Tuesday then Friday counts; Tuesday then Thursday does not).

`gap` is `dayDiff(lastLogged, today)`. The welcome-back banner
uses `gap >= 3`. That is one day stricter than the return
increment (`> 2` vs `>= 3` on the current gap).

The UI sentence: “Returns are counted here, not streaks. The
strength of a lifelong practice is how quickly you come back.”
Guide copy says never count consecutive days
(`index.html:670`).

No streak counter, no heat map, no back-fill UI.

## Ritual due rules

**Observed** (`index.html:687–708`), calculation-probe. Today
surfaces **at most one** ritual, most significant first:
annual → quarterly → monthly → weekly.

Week key is the Monday of that week (`index.html:573–576`).
Sunday 2026-08-16 → `2026-08-10`. Wednesday 2026-08-19 →
`2026-08-17`.

Quarter is `YYYY-Q{1–4}` from `floor(month / 3) + 1`.
August → `2026-Q3`. Quarter-end months are March, June,
September, December (`[2, 5, 8, 11]`).

| Kind | Gates | Period id |
|---|---|---|
| weekly | `dayNum >= 7` and today is `weeklyDay` and no `rituals[id]` | `weekly-{monday}` |
| monthly | `dayNum >= 28` and `date >= lastDay - 3` and no `rituals[id]` | `monthly-{YYYY-MM}` |
| quarterly | `dayNum >= 80` and month is quarter-end and `date >= lastDay - 10` and no `rituals[id]` | `q-{YYYY-Qn}` |
| annual | `dayNum >= 350` and (`dayDiff(start, today) % 365 > 358` or `< 8`) and no `rituals[id]` | `annual-{calendarYear}` |

Monthly window `date >= lastDay - 3` is the last **four**
calendar days (31-day month: 28–31). Quarterly is the last
eleven days of the quarter-end month.

Annual uses elapsed-day modulo 365, not the calendar anniversary
of `start`. Probe: start `2025-08-25`, today `2026-08-19` →
`anniv = 359` → due, id `annual-2026`. The `dayNum >= 350`
gate alone is not enough: day 350 is not yet in the modulo
window.

Presence of `S.rituals[id]` (even without `done`) suppresses
that kind. Completing a ritual does not open the next kind the
same day unless it was already a candidate; `dueRitual`
recomputes from remaining candidates.

The Rituals page does **not** apply these gates. It always
offers the current four period ids. A teacher can start the
weekly sit on a Thursday even though Today would not surface it.

## Class reviews

**Observed** (`index.html:1351–1412`, `1588–1618`, render).
Sheet title “Class review”. Intro: sample first 3 minutes, one
mid-class transition, last 3 — not the whole class.

Render labels matched the static fields: Which class; Filler
words in 3 minutes; Pace; Cues arrived before the movement; Did
I look at the room?; Did the sequence logic hold?; the four
`REVIEW_FIELDS`; One honest word; Options offered before the
shape; The one thing I'll change next class.

`navigator.vibrate(8)` fires on filler increment when the API
exists. That is a device haptic, not a network call.

Carry-forward: if `reviews[0].oneThing` is set, the next sheet
asks Yes / Partly / No. Foundation §2.2’s “one carried-forward
improvement” is this field.

Reviews are about the teacher. Guide and README say not to put
student names or health here. The form does not enforce that.

## Benchmarks

**Observed** (`index.html:811–816`, `1443–1464`). Ten movements
are the `bul` list inside guide card `bench`. The sheet clones
that list; it does not have its own copy. Changing the guide
wording would change the checklist.

Fixed-conditions copy is product content: same tape marks,
height, distance, time of day, fitted clothing, same order.
Quarterly, not daily. Compare to own past. Drop the visual
benchmark if it harms the relationship with the body.

The app stores ticks and a spoken sentence. It does not store
or play the film.

## Filename convention

**Observed** (`index.html:580`, `1150–1152`, `777–783`, render).

```text
{date}_{TYPE}_{slug(topic) || "untitled"}_{slug(note)?}.{mp4|m4a}
```

`slug`: lower-case, trim, non-alphanumerics to `-`, strip edge
hyphens, max 40 characters.

Render: default `2026-08-19_PRACTICE_untitled.mp4`; topic `hips`
→ `2026-08-19_PRACTICE_hips.mp4`. Probe:
`Hips & hamstrings` + `shin cue` →
`2026-08-19_PRACTICE_hips-hamstrings_shin-cue.mp4`.

The string is copied to the clipboard. The app never writes a
file of that name and never reads the filesystem.

## Privacy wording

**Observed** as product copy, not as an enforceable control.

| Source | Wording |
|---|---|
| `README.md:124–128` | Student names, health information, and anything told in confidence do not go in here. Use initials, or don't write it at all. Class reviews are about *your* teaching. Notes are not encrypted. |
| `README.md:11–13` | Does not hold videos or audio. |
| `README.md:85–97` | Notes live in one browser on one device. Clearing site data, Private/Incognito, or another origin/device hides or erases them. iPhone Safari may drop unused site data in about a week unless added to the home screen. |
| Welcome (`index.html:1848–1849`) | Nothing uploaded, nothing shared, no account. |
| Settings (`index.html:1746`) | Everything lives in this browser only. |
| Guide `privacy` (`index.html:796–802`) | Default: do not record students. Prefer audio-only class recordings. Consent must be written, specific, revocable. Separate consent for private review vs any public use. Never put health info in a filename. Consent register (name, date, scope, expiry) is advised, not stored. Architect for deletability: student material in one encrypted folder, 12-month default retention, excluded from the permanent cold archive. Points at GDPR, India's DPDP Act, US state laws — “Check yours once.” |
| Entry delete (`index.html:1483`) | Deleting a log row does not touch the recording. |

Foundation §2.2 already says this guidance is useful product
content and not an enforceable compliance control. This inventory
agrees: no consent register, no retention job, no encryption,
no filename scanner.

`99_STUDENTS` is a folder *name in a guide card*. It is not a
`localStorage` collection.

## No-media invariant

**Observed** (static-read + render).

- Store defaults have metadata fields only (`index.html:594–605`).
- No `fetch(`, no `XMLHttpRequest`, no `WebSocket`, no
  `getUserMedia`, no `<video>`/`<audio>` capture, no Service
  Worker, no `manifest.json`.
- The only `input type="file"` is created on click of Import
  and accepts `application/json,.json` (`index.html:1757`).
- Render: `mediaCount` 0 on every page; no outbound request
  left the origin; final store 193 bytes; no `data:` / `base64`
  / `video/` / `audio/` in the JSON.
- Filing an entry sets `days[date].rec = true` and stores text.
- Delete copy states the recording is not in the app.
- Suggested extensions `.mp4` / `.m4a` are filename suffixes.

The starter vector `teaching-archive.no-media` in
[sanitized-fixture-policy.md](sanitized-fixture-policy.md)
stands. Additional vectors below do not replace it.

## Import, export, erase

**Observed** (`index.html:637–649`, `1748–1770`),
calculation-probe.

Export blob:

```json
{ "app": "teaching-archive", "exported": "<ISO>", "data": <state> }
```

Download name `teaching-archive-{today}.json`.

Import accepts either that wrapper (`p.data.settings` present)
or a bare state object (`p.settings` present). Anything else
throws “That file isn't a Teaching Archive backup.” Missing
top-level keys are filled from `defaults()`. **The imported
object replaces the in-memory state** — not a per-field merge.
There is no device-vs-file conflict UI.

Erase: confirm “Erase everything?”, then
`localStorage.removeItem(KEY)` and `location.reload()`.

There is no multi-device sync. README: export from one device
and import on the other.

## Characterization vectors

Format from [sanitized-fixture-policy.md](sanitized-fixture-policy.md).
These are **observed** rules. They are not signed requirements.
`teaching-archive.no-media` remains in the fixture policy and
is not duplicated here.

### journey.daynum-from-start

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:659`
- Method: static-read, calculation-probe, render
- Given: `settings.start = 2026-08-01` and local today `2026-08-19`
- When: `TA.Cur.dayNum()` runs
- Then: `19` and `phase.id` is `month1`
- Not then: a stored phase row; week-1 task card (that card is only `phase.id === "week1"`)

### journey.returns-not-streaks

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:670–680`
- Method: calculation-probe
- Given: logged days `2026-08-11` (line) and `2026-08-14` (`rec`)
- When: `stats()` runs
- Then: `logged = 2`, `returns = 1`
- Not then: a streak of 2; Tuesday+Thursday (`dayDiff = 2`) incrementing returns

### journey.no-backfill

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:1191–1196`
- Method: static-read
- Given: last logged day is 3 or more local days before today
- When: Today renders
- Then: “Welcome back — N days” and copy that nothing is owed
- Not then: a form to fill skipped days; a broken streak

### ritual.due-one-and-priority

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:687–708`
- Method: calculation-probe, render
- Given: start `2026-08-01`, today Wednesday `2026-08-19`, `weeklyDay = 3`, no ritual records
- When: `dueRitual()` runs and Today renders
- Then: candidate `weekly-2026-08-17` is due; Rituals tab shows a gold dot; Today shows “The weekly sit”
- Not then: monthly (19 < 28 and not in the last-four-days window); more than one Today due card

### ritual.annual-modulo-365

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:701–703`
- Method: calculation-probe
- Given: start `2025-08-25`, today `2026-08-19`
- When: `dueRitual()` runs
- Then: `anniv = 359`, due kind `annual`, id `annual-2026`
- Not then: due on day 350 merely because `n >= 350`; a calendar-anniversary test against 25 Aug

### filename.closed-types

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:580`, `1150–1152`, `1306`
- Method: static-read, calculation-probe, render
- Given: date `2026-08-19`, type `PRACTICE`, topic `hips`
- When: the log sheet paints the filename
- Then: `2026-08-19_PRACTICE_hips.mp4`
- Not then: a tenth type; a media byte written; `.m4a` unless type is `REFLECTION`

### import.replace-state

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:640–647`
- Method: static-read, calculation-probe
- Given: a JSON object with `data.settings` or top-level `settings`
- When: `importJSON` runs
- Then: `state` becomes that object (missing keys filled from defaults) and is persisted immediately
- Not then: per-field merge; a conflict UI; acceptance of `{ foo: 1 }`

## Contradictions with foundation §2.2

Conflicts are defects. They are listed, not resolved. Foundation
status is still “Proposed foundation for human approval.”

1. **“A suggested task” every day.** §2.2 lists a suggested task
   on Today. The week-1 card is the only dated task on Today, and
   only while `phase.id === "week1"`. After day 7 Today has the
   loop checkboxes and at most one due ritual, not a daily task
   from `WEEK1` or `PLAN`.
2. **Class review as a top-level area.** §2.2 lists it in the
   same breath as Today/Log/Rituals/Guide/Plan. In the file it is
   a sheet, not a sixth tab. Benchmarks likewise live under
   Rituals and as a Log button.
3. **“Limited retention.”** Guide `privacy` *advises* a 12-month
   default for student material in `99_STUDENTS`. The running
   app has no retention clock, no student collection, and no
   deletion job. Wording ≠ control. §2.2 already says this; the
   inventory records the same split.
4. **Dead settings fields.** §2.2 does not mention `settings.name`
   or `settings.teaches`. They are in `defaults()` and unused.
   `entries.what` and `days.note` are named in comments and
   unused.
5. **Folder numbering.** Guide tree skips `06` and `09–12`.
   Foundation does not mention the tree. Later content extraction
   must not invent the missing numbers.

No disagreement was found with §2.2 on: five chrome areas;
`teaching-archive.v1`; no identity or remote persistence;
no-media; returns instead of streaks; elapsed-day phases;
privacy intent as copy.

## Required human decisions

None of these are decided here. They block treating this
inventory as a build spec.

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Preserve elapsed-day phases and returns-not-streaks, or replace them | Product owner | SY-0007; Teaching Archive domain ([SY-0023](../issue-tracking/issues/SY-0023.md)) | Unsigned — foundation §3 says preserve journey phases/content |
| Keep no-media as a product invariant (metadata only) | Product / privacy owner | SY-0007; document policy ([SY-0050](../issue-tracking/issues/SY-0050.md)); Stage 11 | Unsigned — foundation §11 already retains the default |
| Keep privacy rules as wording vs make any of them enforceable (consent, retention, filename scanner, encryption) | Product / privacy owner | SY-0007; SY-0023 | Unsigned |
| Disposition of unused `settings.name`, `settings.teaches`, `entries.what`, `days.note`, `reviews.overuse` | Product owner | SY-0007; content migration ([SY-0090](../issue-tracking/issues/SY-0090.md)) | Unsigned |
| Whether class review / benchmark stay sheets or become first-class routes | Product owner | SY-0007; Stage 2 IA ([SY-0019](../issue-tracking/issues/SY-0019.md)) | Unsigned |
| Whether Today after week 1 should keep having no daily suggested task | Product owner | SY-0007 | Unsigned |
| Whether ritual due windows (last-four-days, modulo-365 annual) are preserve, change, or unspecified | Product owner | SY-0007; SY-0023 | Unsigned |
| Whether import remains last-write replace of the whole store | Product owner | SY-0007; archive import ([SY-0094](../issue-tracking/issues/SY-0094.md)) | Unsigned |
| Canonical terms: Teaching Archive vs Learning; Log vs archive entry; returns vs streak | Product owner | SY-0019 | Unsigned |

Local-only / no-account is the observed baseline. Identity for
learning progress is a Stage 11 concern, not decided here.

## Generator consistency checks

Run 2026-08-19. Results recorded; **nothing was fixed**.

| Check | Command | Result |
|---|---|---|
| Teaching Archive generators | none in `c6732f59…` | Not applicable |
| Teaching Archive `fetch(` | `grep` of `index.html` | **absent** |
| Embedded `Code.gs` vs Command Center `index.html` | `python3 tools/embed-script.py --check` in the Command Center copy | **in sync** — exit 0 |
| Apps Script generated HTML | `python3 tools/build-appsscript.py --check` | **STALE** — exit 1 |
| Worker static copy (local, gitignored) | `cmp index.html public/index.html` | **identical** |

Teaching Archive still has no `package.json` and no test files.

## Rendered inspection

**Observed** 2026-08-19. Method: Chromium headless, origin
`http://127.0.0.1:8766/index.html` from the pinned copy. Fresh
profile (no prior `teaching-archive.v1`). Start date set to
`2026-08-01`, weekly day Wednesday, then Begin. No screenshot
committed.

Walked hashes (topbar matched the table; unknown hashes opened
Today): `#/today`, `#/log`, `#/rituals`, `#/guide`, `#/plan`,
`#/no-such-page`, `#/constructor`.

Also walked: welcome; Begin; Today due card and loop; Log empty
and “Log a recording” sheet (nine type chips, filename
generator); Class review sheet labels; Weekly sit steps; Guide
search `consent`; theme button once; Plan settings
Export/Import/Erase; 390×844 and 1280×900.

**Not observed in render:** typing a daily line, filing an
entry, completing a ritual, saving a review or benchmark,
import/export of a file, erase, home-screen install, Netlify
Drop, emailed-attachment mode, a gap ≥ 3 days, week-1 Today
card (walk started on day 19).

Workflow-facing chrome (full semantics baseline is SY-0006):

- `html lang="en"`
- `#main` `tabindex="-1"`
- Theme button `aria-label="Switch theme"`
- Sheets `role="dialog"` `aria-modal="true"` with labelled Close
- Visible buttons on the walked pages had accessible names
  (zero unlabeled)
- `prefers-reduced-motion` CSS is present (`index.html:452–455`)
- Focus-visible outline is present (`index.html:456`)

`const TA = {}` is script-scoped, not `window.TA`. That is an
implementation detail, not a product rule.

## Stage exit

| Stage 0 exit criterion | This issue |
|---|---|
| Teaching Archive content IDs, five areas, journey/rituals/reviews/benchmarks, privacy wording, no-media invariant inventoried | Satisfied as **draft evidence** in this file. Human acceptance of SY-0005 is still required before `done`. |
| Product owner signs preserve/change/defer | Deferred to SY-0007 |
| Sanitized fixtures can exercise critical rules | Journey/ritual/filename/import vectors begun here; no-media starter remains in the fixture policy; representative exports wait for SY-0007 |
| Security and accessibility debt inventoried | Deferred to SY-0006 |
| No legacy file changed | Satisfied 2026-08-19 |

## Security and redaction

Follow [sanitized-fixture-policy.md](sanitized-fixture-policy.md).

This issue did not open a production profile, did not read a live
`teaching-archive.v1`, and did not fetch a Netlify or other
public host. The render profile was created under `/tmp` and
held only the Begin settings plus the in-memory sheet state.
The synthetic topic `hips` is a product example already used in
the filename guide, not a person.

DOM sinks (`innerHTML` for icons, frame SVG, and escaped guide
markdown) are noted only so SY-0006 can catalogue them. This
issue does not grade them.

## Rollback

Documentation only. Revert an incorrect inventory through review
and keep the Git history of the rejected text. Do not rewrite
evidence in place to hide a bad observation.
