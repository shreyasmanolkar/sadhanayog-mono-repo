# Quality, security, and accessibility baseline

Status: draft evidence — not product-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0006](../issue-tracking/issues/SY-0006.md)  
Sources: Command Center `c724be0e116582b5c73d324d00a81ac23eb0bbf2`;
Teaching Archive `c6732f59cf66af9a238caaccc185104afa534d7f`;
[engineering foundation](../architecture/engineering-foundation.md)
§2–3, §22, §28;
[implementation roadmap](../roadmap/implementation-roadmap.md)
Stage 0;
[repository-baseline.md](repository-baseline.md);
[feature-inventory.md](feature-inventory.md);
[legacy-data.md](legacy-data.md);
Stage 0 program [README.md](README.md)

This file is the named SY-0006 outcome. It is a threat sketch plus
localStorage / Access / shared-key findings, CSP and DOM sinks,
privacy data classes, keyboard / focus / semantics / responsive
findings, and the observed absence of tests. It is not a signed
preserve/change/remove matrix, not a legal conclusion, and not a
compliance claim. The unsigned register is
[source-of-truth.md](source-of-truth.md)
([SY-0007](../issue-tracking/issues/SY-0007.md)). Identity/permission
modelling is [SY-0020](../issue-tracking/issues/SY-0020.md). Threat
model refresh is [SY-0109](../issue-tracking/issues/SY-0109.md).
Teaching Archive content IDs remain
[teaching-archive.md](teaching-archive.md)
([SY-0005](../issue-tracking/issues/SY-0005.md)).

## Purpose

Record the quality, security, and accessibility debt of the two
legacy applications so later stages cannot treat a rewrite as
permission to drop an observed control, or to silently keep a
shared-key door, an unlabelled control, or a sink that currently
happens to be escaped. Later issues may cite this file; they may
not cite “the current app” or foundation §2 as signed evidence.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | `docs/discovery/a11y-security-baseline.md`, the Stage 0 program map, and fixture-policy pointers |
| Database | None. |
| API | None. Current `POST /sync` is inventoried as a trust boundary. No new API. |
| Flutter | None. |
| Web | None. Rendered keyboard/DOM/axe inspection only. No screenshot committed. |
| Infrastructure | None. Current Worker / Apps Script / Access notes only. No production resource was contacted. |

No production resource, secret value, or real-user export enters
this repository. Catalog default identity fields and demo-seed
personal fields were not copied.

## Observation method

Every claim names revision, path, and method.

| Method | What it means |
|---|---|
| static-read | File contents at the pinned revision |
| generator-check | `python3 tools/*.py --check` in the Command Center copy |
| render | Chromium headless walk. Command Center: empty local desk (onboarding “Start with my own students”) at `127.0.0.1:8875`. Teaching Archive: welcome then Begin at `127.0.0.1:8876`. 2026-08-19. puppeteer-core against `/usr/bin/chromium`. Fresh profile. Chromium applied a dark `data-theme` from system preference. |
| keyboard | Synthetic key events on that desk |
| axe | axe-core 4 injected through the DevTools protocol (bypasses page CSP). Tags: wcag2a/aa, wcag21a/aa, best-practice. |
| token-contrast | WCAG 2 relative-luminance ratio of CSS custom properties, independent of axe |
| not-observed | Searched for and not present, or deliberately not exercised (no live hostname, no Access dashboard, no Sheets, no demo seed, no production cookie) |

Facts are labelled **Observed**, **Inferred**, or **Approved intent**.
Nothing in this file is approved intent. Foundation §2 is a proposed
summary; where this inventory agrees, it still re-cites evidence.

This is a security-practice and privacy-handling inventory
(foundation §22.2). It does not claim DPDP, GDPR, WCAG conformance,
or any other legal result.

## Revisions inspected

Reconfirmed 2026-08-19 by `git rev-parse HEAD` on clean copies.
`git status --porcelain` printed nothing in either tree. No legacy
file was modified.

| Application | Local path (read-only copy) | Revision |
|---|---|---|
| Command Center | `/home/shreyas/Work/sadhanayog/sadhana-yog-command-center` | `c724be0e116582b5c73d324d00a81ac23eb0bbf2` |
| Teaching Archive | `/home/shreyas/Work/learnings/yog-documentation` | `c6732f59cf66af9a238caaccc185104afa534d7f` |

Inspection machine: Chromium `/usr/bin/chromium`, Node `v24.11.1`,
axe-core 4 (injected; not a repository dependency). Neither app
pins a browser.

## Process note

SY-0006 `blocked_by` SY-0003, SY-0004, SY-0005. On 2026-08-19
SY-0003 and SY-0004 were `in_review` (named outcomes
[feature-inventory.md](feature-inventory.md) and
[legacy-data.md](legacy-data.md) exist) and not `done`. Work
started because a human named this issue after those inventories
landed. SY-0005's named outcome
[teaching-archive.md](teaching-archive.md) has since merged to
`staging` (PR #5) and is on this branch after the merge. Teaching
Archive security/a11y claims below still re-cite the pinned
revision; the content-ID catalogue remains that file. Recorded,
not rewritten.

## Threat sketch

Assets, actors, and paths **Observed** in the pinned files.
Likelihood and whether any path is acceptable are unsigned.

### Assets

| Asset | Where it lives today | Class |
|---|---|---|
| Student identity and contacts (`name`, `phone`, `email`, `address`) | `sadhanayog.v1`; Students tab | confidential |
| Health, goals, emergency notes | student fields `health`, `goals`, `emergency` ([legacy-data.md](legacy-data.md)) | highly sensitive |
| Money (invoices, payments, UPI ids, balances) | same store / Invoices, Payments, Memberships tabs | confidential |
| Message bodies and templates | Messages / Templates | confidential |
| Standalone access key | `connection.token` inside `sadhanayog.v1` on standalone; Worker secret `APPS_SCRIPT_ACCESS_KEY` on custom domain | secret |
| Apps Script `/exec` URL | `connection.url` on standalone; Worker secret `APPS_SCRIPT_URL` on custom domain | secret |
| Google Sheet of the studio | Apps Script project + spreadsheet sharing | confidential / highly sensitive |
| Teaching reflections, daily lines, class reviews | `teaching-archive.v1` | confidential (teacher; must not contain student health) |
| Suggested recording filenames | generated client-side; not a media store | internal |

### Actors (assumed, not a live user census)

| Actor | What they can do today if they reach the surface |
|---|---|
| Teacher with an unlocked device | Read and change the whole store. No app PIN, no role. |
| Co-teacher on the same custom-domain hostname | Same: there is no application user. Access (if attached) is the only person-gate. |
| Anyone on the internet who can `POST /sync` | Pull and push every collection. The Worker attaches the sheet key. |
| Anyone with the standalone `/exec` URL | Guess or reuse the shared key; eight failures pause fifteen minutes (`Code.gs:79–81`, `2268–2285`). |
| Anyone who opens a stolen JSON backup | Student rows; not the sheet URL/token (Command Center export strips them). Teaching Archive backup is the whole state. |
| Malicious page / extension on the same origin | Read `localStorage`; the origin *is* the security boundary. |
| Search-index or screenshot of a hosted file | Teaching Archive public URL is a blank copy; entries never leave the device (`README.md:38–39`). |

### Trust boundaries

```text
unlocked device ──localStorage──▶ browser origin
     │
     ├─ standalone: POST /exec + token in localStorage
     ├─ hosted Google URL: google.script.run (Google account ACL)
     └─ custom domain: POST /sync (Worker adds APPS_SCRIPT_ACCESS_KEY)
              │
              ▼
        Apps Script ──▶ Google Sheet
              ▲
Cloudflare Access (documented, not observed live)
```

**Observed** (`worker.js:78–151`, `Code.gs:242–270`,
`index.html:6988–7000`):

1. There is no application identity, session, or role. Foundation
   §2 already says so; re-cited from the absence of any auth
   module other than the shared key / Google ACL / assumed Access.
2. Custom-domain `/sync` overwrites `payload.token` with the
   Worker secret. The browser on `dash.omsadhanayog.com` is not
   supposed to hold the sheet key.
3. `/sync` does not check `Origin`, `Sec-Fetch-Site`, or a CSRF
   token. Authorization is “could the caller reach this Worker
   route?” plus the Worker-held key.
4. Cloudflare Access in front of the hostname is **recommended**
   (`CUSTOM_DOMAIN_APPS_SCRIPT.md:91–108`) and **assumed**
   (foundation §2). This issue did not open Zero Trust. Access
   remains **not observed**.
5. Teaching Archive has no network boundary. The device origin
   is the whole world of the app.

### Attack paths (observed mechanisms, not exploits)

| Path | Mechanism | Current mitigator | Residual |
|---|---|---|---|
| Stolen unlocked phone/laptop | Unencrypted `localStorage` | Device passcode (advice in `SECURITY.md:209–211`, not a control) | Full studio / archive disclosure |
| Custom domain without Access | `POST /sync` + Worker-held key | None in `worker.js` | Internet-readable sheet |
| Standalone `/exec` published Anyone | Shared key ≥ 20 chars, timing-safe compare, 8-failure / 15-minute pause | Guessing is slowed, not prevented (`SECURITY.md:36`) | Key in `localStorage`; URL is the door |
| Hosted Google URL | `doGet` + `rpc` | Google account ACL; empty `ACCESS_KEY` shuts `doPost` | Spreadsheet sharing can undo it (`SECURITY.md:207–208`) |
| Clickjacking | Meta CSP cannot set `frame-ancestors` (`index.html:11–13`) | Worker `X-Frame-Options: DENY` (`worker.js:73`). Hosted `doGet` sets `ALLOWALL` (`Code.gs:303–307`) | Hosted Google-URL can be framed. Standalone file has no framing header |
| XSS via student name | `SY.U.h` appends text nodes; comment forbids an `html` attribute (`index.html:3863–3865`) | Text encoding in the hyperscript | Viz tooltips still assign `innerHTML` (escaped today) |
| XSS via backup import | `JSON.parse` then known-key copy (Command Center) or whole-state replace (Archive) | Command Center filters collections and `id: string`. Archive does not | Archive import is last-write replace |
| Formula injection into Sheets | `setNumberFormat('@')` on data cells (`Code.gs:396–399`) | Values starting with `=` stay text | Only as long as that format remains |
| CSRF against `/sync` | Cookie-authenticated Access user + cross-site `POST` | **Inferred:** depends on Access cookie `SameSite` (not observed) | Worker has no Origin check |
| Privacy leak via filename | Archive slug of topic/note (`index.html:580`, `1150–1152`) | Guide says no health in filenames; no scanner | Wording ≠ control |

No exploit was written or run.

## Identity, Access, and the shared key

Re-cites [repository-baseline.md](repository-baseline.md)
deployment topologies. This section is the authorization reading.

### Four Command Center doors

| Topology | Who is the caller? | What stops a stranger? |
|---|---|---|
| Local file | Nobody | Nothing. Device possession. |
| Hosted Apps Script | Google account | Deployment ACL (`Only myself` / named accounts). `ALLOWED_USERS` is a second lock only when Google names the caller (`Code.gs:342–356`). Committed list is `[]`. |
| Standalone static + Anyone script | Bearer of `ACCESS_KEY` | 20+ character key, timing-safe `keyMatches`, cooldown. Key lives in `localStorage`. |
| Custom-domain Worker | Whoever can `GET` the HTML and `POST /sync` | **Documented:** Cloudflare Access. **Observed in code:** no app user. Worker rejects a key shorter than 20 characters (`worker.js:91–97`). |

`SECURITY.md` still **prefers** hosted Google-URL mode. Git config
is shaped for the Worker topology
([repository-baseline.md](repository-baseline.md) contradiction 1).
Which topology is live is unsigned (SY-0002 / SY-0007).

### Shared-key properties

**Observed** (`Code.gs:53–57`, `2268–2285`, `worker.js:109`):

- Empty `ACCESS_KEY` refuses every `doPost`. That is the hosted
  posture.
- Comparison is constant-time over the longer string.
- The pause after eight failures also blocks the *right* key
  (`Code.gs:2291–2296`). Availability nuisance, not a lockout of
  data already on the device.
- Custom-domain Worker overwrites any client-supplied token.
  Standalone uses `connection.token`.
- JSON backup strips `connection.url` and `connection.token`
  (`index.html:4226–4229`). Restore keeps the device connection.

### What is not authorization

**Observed** by absence:

- No per-teacher account in either app.
- No object-level permission (any reachable caller reads health
  notes and invoices).
- `GET /_health` is unauthenticated `{ok:true}` (`worker.js:154–164`).
- Teaching Archive: no identity, no remote persistence, no Access.

## Device storage

**Observed** (`index.html:4022`, `4054–4089`; Teaching Archive
`index.html:590`, `609–625`).

| App | Key | Encryption | Quota failure |
|---|---|---|---|
| Command Center | `sadhanayog.v1` | None | Toast “Could not save to this device — storage is full” |
| Teaching Archive | `teaching-archive.v1` | None | Toast pointing at Plan → Settings export |

Corrupt JSON: Command Center load falls back to a blank/onboard
path ([legacy-data.md](legacy-data.md)); Teaching Archive `load`
returns `null` and shows welcome (`index.html:616`).

Neither origin uses IndexedDB, a Service Worker, or
`crypto.subtle`.

## CSP and DOM sinks

### Command Center CSP

**Observed** (`index.html:14`):

```text
default-src 'self' data: blob:;
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self' https://script.google.com https://script.googleusercontent.com;
frame-src https://www.google.com https://maps.google.com;
base-uri 'none';
object-src 'none';
form-action 'none'
```

`'unsafe-inline'` is required because the application is one file.
`frame-ancestors` is absent (meta CSP cannot set it). There is no
CSP *header* on the Worker; HTML meta is the policy. The Worker
injects `window.__SY_CUSTOM_DOMAIN__` as an inline script
(`worker.js:60–63`), which the policy allows.

Hosted Apps Script CSP is looser: `'unsafe-eval'`,
`ssl.gstatic.com`, `apis.google.com`, `*.googleusercontent.com`,
Google fonts (`build-appsscript.py:47–58`;
`apps-script/Index.html:14`). That is the `google.script.run`
bridge.

Worker HTML headers **Observed** (`worker.js:68–75`):
`Cache-Control: no-store`, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`. No HSTS,
no Permissions-Policy, no CSP header. HSTS may exist at the
Cloudflare edge; **not observed** from this file.

### Command Center sinks

**Observed** (`index.html`):

| Sink | Line | What flows in | Escaped? |
|---|---:|---|---|
| `SY.U.h` children | 3875–3879 | Any string | `createTextNode`. No `html` attribute (3863–3865) |
| `root.innerHTML = ""` (and similar) | many | empty string | Clear only |
| `SY.Viz.tip.show` | 7887 | HTML string | Callers wrap labels with `SY.U.esc` (7924, 7977, 8081–8082, 8123–8124). Series colour is interpolated from hardcoded CSS variables, not user input |
| `iframe src` | 11969–11973, 16467–16472 | Maps embed | `mapEmbedUrl` uses numeric lat/lng and `encodeURIComponent` (`5911–5914`). CSP `frame-src` limits hosts |
| `a.href` `tel:` / `mailto:` | 7674–7676 | student phone/email | Prefix added; not a `javascript:` URL |
| `a.href` Maps / Meet / payment | 5904–5923, 16202 | stored URL or built `https://` | `mapsUrl` accepts `place.mapsUrl` only if it matches `/^https:\/\//i` (5906) |
| `JSON.parse` of backups | 4232–4256 | file text | Size cap 40e6; requires `data.students` array; copies known collections whose rows have string `id`; settings known keys only; connection stays on-device |

`eval`, `new Function`, `document.write`, and
`insertAdjacentHTML` were not found in `index.html`.

The viz tooltip is a **latent** HTML sink: a future caller that
skips `U.esc` would execute markup. Current call sites escape.

### Teaching Archive CSP and sinks

**Observed** (`index.html` head, `536–558`, `1036–1044`, `1808`):

- No Content-Security-Policy meta tag. Render confirmed
  `csp: null`.
- No `fetch(`, no `XMLHttpRequest`, no `WebSocket`.
- `TA.U.h` **has** an `html` attribute (`543`) and uses it for
  guide `md()` output, icons, and the camera diagram.
- `md` runs `TA.U.esc` first, then wraps `**` / `*` / backticks
  (`1036–1037`). Guide cards are static strings in the file, not
  student input.
- Theme button assigns a static SVG string (`1808`).
- User-typed notes go through `add()` → `createTextNode` (`552–556`).
- `importJSON` assigns the parsed object as `state` and fills
  missing keys (`640–647`). It does not filter unknown keys the
  way Command Center does.

## Privacy data classes

Field **names** only. Values were not copied. Demo seed was not
loaded.

### Command Center

| Class | Fields / surfaces | Handling today |
|---|---|---|
| Highly sensitive | student `health`, `goals`, `emergency` | Stored in `localStorage` and the Students tab. Unencrypted. Syncs to Sheets when connected. Necessity/retention unsigned (program register; foundation §30) |
| Confidential contact | `name`, `preferred`, `phone`, `email`, `address`, instructor/lead equivalents | Same store. `tel:` / `mailto:` / `wa.me` deep links |
| Confidential money | invoices, payments, `upiTransactionId`, balances, expenses | Same store. Print/CSV export |
| Confidential comms | message `body`, template `body` | Logged as `opened`, not delivered ([legacy-data.md](legacy-data.md)) |
| Secret | `connection.token`, `connection.url` | Stripped from JSON backup. Present on standalone devices |
| Internal | catalog, derived sessions, settings | Catalog default identity field *values* are not repeated here |

`SY.DEMO` plants personal-looking names and health-like notes.
Those strings are **not** a user export and must not be copied
(fixture policy). The detector `isDemoStudio`
(`index.html:16619–16631`) keys off well-known demo ids.

### Teaching Archive

| Class | Fields / surfaces | Handling today |
|---|---|---|
| Confidential teacher notes | `days.line`, `entries.*`, `reviews.*`, `rituals`, `benchmarks` | Device-only, unencrypted |
| Filename metadata | `slug(topic)`, `slug(note)` | Copied to clipboard; no media bytes |
| Privacy *wording* | Guide id `privacy` (`index.html:796–802`); `README.md:124–128` | Default: do not record students; written specific revocable consent; no health in filenames; 12-month *advice* for a `99_STUDENTS` folder. **No** consent register, retention job, encryption, or filename scanner in the running app |

Foundation §2.2 already says the archive privacy guidance is not
an enforceable compliance control. This inventory agrees.

`99_STUDENTS` is a folder name in a guide card, not a
`localStorage` collection.

## Keyboard, focus, semantics, responsive

Workflow maps stay in [feature-inventory.md](feature-inventory.md).
This section is the quality debt.

### Command Center — positives (empty Today, 1280×900 and 390×844)

**Observed** (static-read + render + keyboard):

- `html lang="en"`
- `#main` `tabindex="-1"`
- Sidebar `aria-label="Main navigation"`; phone tab bar
  `aria-label="Sections"` (hidden on desktop, visible on phone)
- Topbar icon buttons labelled (search, theme, help, hamburger)
- Unlabelled visible `button` / `a` / `[role=button]` count: **0**
  at both viewports on empty Today
- Modal/drawer `role="dialog" aria-modal="true"` with focus trap
  and restore (`index.html:7264–7353`)
- Help (`?`): twelve consecutive Tabs stayed inside the dialog;
  Escape closed it. `aria-label="Help"`. Desktop help contains
  15 `<kbd>` nodes
- Search (`/`): `aria-label="Search"` `aria-modal="true"`
- Letter shortcuts `t` → `#/today`, `c` → `#/calendar`
  (empty desk, focus not in an input)
- `C.stat` is `role="button"` with Enter/Space when clickable
  (`7617–7618`)
- `:focus-visible` outline (`218–219`);
  `prefers-reduced-motion: reduce` (`1800–1802`);
  `.sr-only` class exists (`220`)
- `C.listrow` interactive rows are `<button class="listrow">`,
  not clickable `<div>`s
- Phone 390×844: hamburger visible; five tab items; FAB
  `display: grid`; help header button `display: none`; `?` still
  opened Help **without** `<kbd>` (matches SY-0003)

### Command Center — risks (not a verdict)

**Observed:**

1. **No skip link.** `.sr-only` is defined and unused. Render
   `skipLink: false`, `srOnlyCount: 0`.
2. **Sync pill** is a `<button>` with `title` and visible
   `#sync-text`, no `aria-label`. Axe did not flag a name; it
   did flag `#sync-text` colour contrast.
3. **Settings rail** (`#/settings/security`): `role="tablist"`,
   13 `role="tab"`, one `aria-selected="true"`, **zero**
   `role="tabpanel"`, no `aria-controls` (matches SY-0003
   “thin pairing”).
4. **Drawer tabs** set `aria-selected` without `aria-controls` /
   `tabpanel` (`7368–7386`).
5. **Autofocus delay.** Modal focuses the first field after
   50 ms (`7300–7301`). Opening Search with `/` then Tabbing
   immediately landed once outside the dialog, then stayed
   inside. Help, after the dialog was up, trapped.
6. **Heat-map cells** `tabindex="-1"`; value is a hover tooltip
   (`7969–7978`). Keyboard and screen-reader users do not get
   the cell value.
7. **Help hidden** at `max-width: 1000px` (CSS). Keyboard users
   on a phone still have `?`.
8. **No live region** on route change beyond toasts
   `role="status"`.
9. **`C.field`** wires `label for=` only when `opts.for` is
   passed (`7624–7626`). Many forms rely on visual proximity.

### Command Center — contrast

Inspection Chromium used **dark** theme (`data-theme="dark"`).

axe-core on empty Today: **one** rule, `color-contrast`,
**serious**, 35 nodes desktop / 29 phone. First targets were
KPI labels/notes (`.kpi-l`, `.kpi-note`) and `#sync-text`.

Token ratios (WCAG relative luminance, static CSS):

| Pair | Light | Dark |
|---|---:|---:|
| `--ink` on `--page` | 15.50 | 15.94 |
| `--ink-2` on `--page` | 6.79 | 7.54 |
| `--ink-3` on `--page` | **3.18** | **4.01** |
| `--ink-3` on `--card` | **3.50** | **3.75** |
| `--accent` on `--page` | 5.38 | 5.99 |
| `--accent-ink` on `--accent` | 5.93 | (dark accent-ink is page colour; primary button measured 5.99) |
| `--danger` on `--page` | 4.64 | — |

Body text meets AAA in both themes. `--ink-3` (muted labels,
section eyebrows, KPI footnotes) is **below 4.5:1** on page and
card in both themes. That is the axe cluster. It is a token
choice, not a one-off.

Light-theme axe was **not** run; token maths above covers it.
Colour is not the only status cue for chips (icon + copy;
SY-0003). Heat cells *are* colour-only plus a hover tooltip.

### Teaching Archive — positives

**Observed** (welcome, then Begin, then five hashes):

- `html lang="en"`
- `#main` `tabindex="-1"`; tab bar `aria-label="Main"`
- Theme button `aria-label="Switch theme"`
- After Begin, Today / Log / Rituals / Guide had **0** unlabelled
  visible controls. Plan had **1**: the settings date `<input>`
- `:focus-visible` (`456`); `prefers-reduced-motion` (`452–454`)
- `--tap: 46px`; `--maxw: 640px`; tab bar becomes a floating
  pill at `min-width: 700px`
- Log filename copy button is labelled
- Sheet (log-a-recording) is `role="dialog" aria-modal="true"`

### Teaching Archive — risks (not a verdict)

**Observed:**

1. **No keyboard shortcuts.** Tab bar and hashes only (also
   noted as a workflow fact for SY-0005).
2. **Sheet does not trap focus and does not close on Escape.**
   Render: ten Tabs after opening the log sheet all landed
   *outside* the dialog (theme button, chips, inputs on the
   page). Escape left `role="dialog"` in the tree
   (`sheetAfterEsc: true`). `TA.UI.sheet` has no `keydown`
   listener (`index.html:982–1008`). Close is scrim click or
   the labelled X.
3. **Sheet has no accessible name.** `aria-label` and
   `aria-labelledby` were both null. Title is an `<h3>` not
   wired to the dialog.
4. **Welcome and Plan settings: visual `<label>` not associated.**
   axe `label` and `select-name`, **critical**. The date input
   and weekly-day `<select>` sit next to a `<label>` without
   `for`/`id` (`1851–1855`, `1740–1745`).
5. **Welcome hides landmarks.** `#main` / header / nav are
   `display:none` during welcome. axe `landmark-one-main` and
   `region` on the welcome card.
6. **Heading outline is uneven.** Log empty: a single `h4`.
   Guide: no headings (cards are buttons). Plan: `h2` only
   (axe `page-has-heading-one`). Today: `h1` plus `h2`/`h3`.
7. **Tab bar buttons** have no `aria-selected` / `aria-current`.
   Active is a class.
8. **Theme button innerHTML** replaces the icon and drops the
   `aria-label` only if the button node itself is replaced —
   the button remains; the inner SVG is not `aria-hidden` on
   the replacement (`1808`).
9. **No skip link.**

### Teaching Archive — contrast

Dark theme (render) body 15.14:1. axe on Plan (last tab walked)
reported `color-contrast` **serious**, 37 nodes. First targets
were `.sec-h > h2` and `.sec-note`, which CSS sets to
`--ink-3` (`index.html:180`). Token `--ink-3` on `--paper` is
**3.76:1** dark and **2.88:1** light. Same muted-token problem
as Command Center, slightly worse in light.

Welcome axe also flagged the two field labels and `.tiny`
(3 nodes).

## Absence of tests

**Observed** (find for `*test*` / `*spec*` excluding `.git`;
no `.github/` in either legacy copy;
[repository-baseline.md](repository-baseline.md)):

| Check | Command Center | Teaching Archive |
|---|---|---|
| Unit / integration / e2e | None | None |
| CI | None | None |
| axe / keyboard suite | None | None |
| Generator `--check` | Two Python flags, human-run, not CI | No generator |

Re-run 2026-08-19 against Command Center `c724be0e…`. Results
recorded; **nothing was fixed**.

| Check | Command | Result |
|---|---|---|
| Embedded `Code.gs` vs `index.html` | `python3 tools/embed-script.py --check` | **in sync** — exit 0 |
| Apps Script generated HTML | `python3 tools/build-appsscript.py --check` | **STALE** — exit 1 |
| Worker static copy (local, gitignored) | `cmp index.html public/index.html` | **identical** |
| Teaching Archive generators | none | Not applicable |

Those absences are observations, not defects to repair in
Stage 0. Characterization vectors below are the start of the
replacement suite, not a test run.

## Characterization vectors

Format from [sanitized-fixture-policy.md](sanitized-fixture-policy.md).
These are **observed** security/a11y behaviours. They are not
signed requirements. Attendance consume, comms “opened”, and
archive no-media stay in the fixture policy.

### cc.h.text-nodes-only

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:3856–3879`
- Method: static-read
- Given: a student name containing `<` or `&`
- When: any screen renders that name through `SY.U.h`
- Then: the characters appear as text
- Not then: an `html` attribute; markup execution from `h()`

### cc.viz-tip.escapes-labels

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:7887`, `7924`, `8081–8082`
- Method: static-read
- Given: a chart label
- When: a tooltip is shown
- Then: the label is passed through `SY.U.esc` before
  `innerHTML`
- Not then: a second encoding path; a guarantee that a future
  caller will escape

### cc.export.strips-credentials

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:4226–4229`
- Method: static-read
- Given: a connected standalone desk
- When: JSON backup is built
- Then: `connection.url` and `connection.token` are empty;
  sheets mode is rewritten to `local`
- Not then: the access key in the download

### cc.sync.worker-attaches-key

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `worker.js:99–109`
- Method: static-read
- Given: a JSON `POST /sync`
- When: the Worker forwards to Apps Script
- Then: `payload.token` is set to `APPS_SCRIPT_ACCESS_KEY`
- Not then: a browser-supplied token surviving to `/exec`

### cc.shortcut.letters-from-chrome

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:16937–16961`
- Method: keyboard, render (empty desk, 1280×900, dark)
- Given: focus not in an input
- When: `t` then `c` is pressed
- Then: hash is `#/today` then `#/calendar`
- Not then: a shortcut to Settings, Places, Enquiries, or Business

### cc.dialog.help-traps-tab

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:7264–7301`
- Method: keyboard, render
- Given: empty desk, Help open via `?`
- When: Tab is pressed twelve times
- Then: focus stays inside `[role=dialog]`; Escape closes it
- Not then: a skip link; phone Help containing `<kbd>`

### ta.sheet.no-trap-no-escape

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:982–1008`
- Method: keyboard, render (after Begin, Log → log-a-recording)
- Given: the sheet is open
- When: Tab or Escape is pressed
- Then: Tab moves to chrome outside the dialog; Escape leaves
  the dialog in the tree
- Not then: a focus restore; an accessible name on the dialog

### ta.csp.absent

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:1–14`
- Method: static-read, render
- Given: the file is opened
- When: the document head is read
- Then: there is no Content-Security-Policy
- Not then: a network call (no `fetch(` in the file)

### ta.privacy.wording-not-control

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `index.html:796–802`; `README.md:124–128`
- Method: static-read
- Given: a teacher types a class review
- When: they save it
- Then: the store accepts the string; no filename scanner, no
  encryption, no retention job runs
- Not then: a consent register row; a claim of DPDP/GDPR
  compliance

## Required human decisions

None of these are decided here. They block treating this file as
a build spec or as a compliance report.

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Whether Cloudflare Access is actually attached to the live hostname, and to which IdP | Product / security | Production identity (Stage 5); already unsigned on SY-0002 | Unsigned; **not observed** |
| Whether `/sync` may stay shared-key + edge-gate until OIDC ([SY-0042](../issue-tracking/issues/SY-0042.md)) | Product / security | Stage 5; identity model ([SY-0020](../issue-tracking/issues/SY-0020.md)) | Unsigned |
| Whether hosted Google-URL, standalone-file, and custom-domain must all survive strangler cutover | Product | SY-0007; decommission (foundation §28 step 10) | Unsigned (also on SY-0002) |
| Whether health / goals / emergency notes are necessary, and their retention | Product / privacy | Production data import (foundation §30) | Unsigned |
| Whether Teaching Archive privacy rules stay wording or become controls (consent, retention, filename scanner, encryption) | Product / privacy | SY-0007; Teaching Archive domain ([SY-0023](../issue-tracking/issues/SY-0023.md)) | Unsigned |
| Whether muted `--ink-3` contrast below 4.5:1 is preserve, change, or defer | Product | The issue that would restyle tokens; web a11y ([SY-0038](../issue-tracking/issues/SY-0038.md)) | Unsigned |
| Whether Command Center skip-link / settings `tabpanel` / Archive sheet trap are preserve or change | Product | SY-0007; the implementing a11y issues | Unsigned |
| Whether viz `innerHTML` must be replaced with DOM APIs before cutover | Engineering / security | Web CSP hardening (foundation §22.1) | Unsigned |
| Any UI or control difference from this inventory | Product owner | The issue that would implement the difference | Unsigned |

Legal/privacy applicability remains the qualified-owner row on
the Stage 0 program register (foundation §30). This spike does
not fill it.

## Stage exit

| Stage 0 exit criterion | This issue |
|---|---|
| Security and accessibility debt inventoried | Satisfied as **draft evidence** in this file. Human acceptance of SY-0006 is still required before `done`. |
| Teaching Archive content IDs / journey / rituals | Not this issue. Walked for a11y/security only. SY-0005. |
| Product owner signs preserve/change/defer | Deferred to SY-0007 |
| Sanitized fixtures can exercise critical rules | Security/a11y vectors begun here; starters remain in the fixture policy |
| No legacy file changed | Satisfied 2026-08-19 |

## Open contradictions

Conflicts are defects. They are listed, not resolved.

1. **`SECURITY.md` hosted clickjacking versus `Code.gs`.**
   `SECURITY.md:202–206` says hosted uses
   `XFrameOptionsMode.DEFAULT` (SAMEORIGIN) and that `ALLOWALL`
   is “the one to avoid.” `Code.gs:303–307` sets `ALLOWALL`
   because “the Worker serves Google's wrapper.” The Worker at
   this revision does not serve that wrapper
   ([repository-baseline.md](repository-baseline.md)
   contradiction 2). Prefer the executable `Code.gs` as
   observed hosted behaviour.
2. **Foundation §2 versus Access.** §2 assumes Cloudflare Access
   on the web hostname. Config *recommends* it. Live attachment
   is **not observed**.
3. **Foundation §2 accessibility positives versus axe.** §2 lists
   focus-visible, reduced-motion, labels, large controls,
   responsive CSS, and not relying exclusively on colour. Empty
   Today confirmed those positives *and* 35 dark-theme contrast
   failures on muted tokens. Both are true. §2 is not a signed
   axe baseline.
4. **Archive privacy copy versus running controls.** Guide and
   README describe consent, retention, and encryption of a
   student folder. The app stores unencrypted teacher notes and
   enforces none of those rules. Foundation §2.2 already names
   this split.
5. **`SECURITY.md` prefers hosted Google-URL; Git is shaped for
   the Worker.** Already on SY-0002. The authorization reading
   here inherits it.

## Out of scope (owned elsewhere)

| Topic | Owner |
|---|---|
| Every page, shortcut, empty/loading/error, responsive behaviour | SY-0003 |
| `sadhanayog.v1` collections, encodings, derived sessions, outbox | SY-0004 |
| Archive content IDs, journey/rituals, filename rules, no-media catalogue | [teaching-archive.md](teaching-archive.md) (SY-0005) |
| Preserve/change/remove and source-of-truth sign-off | SY-0007 ([source-of-truth.md](source-of-truth.md), unsigned) |
| Identity/permission model | SY-0020 |
| OIDC provider | SY-0042 |
| Document / malware policy | SY-0050 |
| Threat model refresh for the *target* system | SY-0109 |

## Security and redaction

Follow [sanitized-fixture-policy.md](sanitized-fixture-policy.md).

This issue did not open a production profile, did not read a live
`localStorage` dump, did not fetch Sheets, did not load `SY.DEMO`,
and did not contact `dash.omsadhanayog.com`. Hostname is already
in Worker config (SY-0002); it was not fetched. Catalog default
identity field **values** are not repeated. Access keys and
`/exec` URLs were not read.

Render used an empty local Command Center desk and a fresh
Teaching Archive profile (Begin with the default start date).
axe ran in-process via protocol injection; the page CSP was not
weakened on disk.

## Rollback

Documentation only. Revert an incorrect baseline through review
and keep the Git history of the rejected text. Do not rewrite
evidence in place to hide a bad observation.
