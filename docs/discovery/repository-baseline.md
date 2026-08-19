# Repository and deployment baseline

Status: draft evidence — not product-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0002](../issue-tracking/issues/SY-0002.md)  
Sources: read-only copies of the four reference repositories;
[engineering foundation](../architecture/engineering-foundation.md) §2–3, §28;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 0  
Stage 0 program: [README.md](README.md)

This file is the named SY-0002 outcome. It inventories files, dependencies,
build, deploy, tests, generator drift, environment assumptions, revisions,
and ownership. It is not a signed preserve/change/remove matrix. The
unsigned register is [source-of-truth.md](source-of-truth.md)
([SY-0007](../issue-tracking/issues/SY-0007.md)).

## Purpose

Record how the two legacy applications are stored, generated, and deployed,
and which patterns from the two reference repositories this project adopts
or rejects. Later stages may not treat a rewrite as permission to invent a
different operational topology without an explicit decision.

## Layer effects

| Area | This issue |
|---|---|
| Files/docs | `docs/discovery/repository-baseline.md` and the Stage 0 program map |
| Database | None. |
| API | None. Current `POST /sync` is inventoried here as a Worker route. Collection and column mapping is [SY-0004](../issue-tracking/issues/SY-0004.md). |
| Flutter | None. Adopt/reject notes only. |
| Web | None. Page/workflow maps are [SY-0003](../issue-tracking/issues/SY-0003.md). |
| Infrastructure | None. Current Worker / Apps Script / DNS / Access notes only. No production resource was created or contacted. |

No production resource, secret value, or real-user export enters this
repository.

## Observation method

Every claim names revision, path, and method. Methods used here:

| Method | What it means |
|---|---|
| static-read | File contents at the pinned revision |
| git-status | `git rev-parse HEAD`, `git status --porcelain`, `git ls-files` |
| hash/compare | `sha256sum`, `cmp`, generator `--check` |
| generator-check | `python3 tools/*.py --check` in the Command Center copy |
| not-observed | Searched for and not present, or deliberately not contacted |

Facts are labelled **Observed**, **Inferred**, or **Approved intent**.
Nothing in this file is approved intent. Foundation §2 is a proposed
summary; where this inventory agrees, it still re-cites evidence.

## Revisions inspected

Reconfirmed 2026-08-19 by `git rev-parse HEAD` on clean copies. All four
working trees were empty (`git status --porcelain` printed nothing). No
legacy file was modified.

| Repository | Local path (read-only copy) | Revision | Role |
|---|---|---|---|
| Command Center | `/home/shreyas/Work/sadhanayog/sadhana-yog-command-center` | `c724be0e116582b5c73d324d00a81ac23eb0bbf2` | Product baseline |
| Teaching Archive | `/home/shreyas/Work/learnings/yog-documentation` | `c6732f59cf66af9a238caaccc185104afa534d7f` | Product baseline |
| Flutter `samples` | `/home/shreyas/Work/learnings/samples` | `0c5ca75d2985ddeca92417bb1235f361d8643e7b` | Pattern reference |
| `vivek-os` | `/home/shreyas/Work/conception-labs/vivek-os` | `d41a7b294d65d004eea202ecabf78a4413b129c6` | Pattern reference |

These match foundation §2. Flutter samples and vivek-os are **not**
product baselines.

Inspection machine (not a legacy pin): Python `3.13.7`, Node `v24.11.1`.
Command Center has no `package.json` and does not pin either.

## Command Center — file inventory

**Observed** (`git ls-files` at `c724be0e…`). Fourteen tracked files.
No `package.json`, lockfile, `LICENSE`, `.github/`, or test path.

| Path | Lines | Bytes | Notes |
|---|---:|---:|---|
| `index.html` | 17,286 | 937,528 | Single application source. SHA-256 `ae0509b3…e3560ee`. |
| `apps-script/Code.gs` | 649 | 26,544 | Sheets backend. `ACCESS_KEY` is the empty string. |
| `apps-script/appsscript.json` | 10 | 205 | V8, `Asia/Kolkata`, `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS`. |
| `worker.js` | 211 | 6,268 | Serves `ASSETS` HTML and `POST /sync`. |
| `wrangler.toml` | 23 | 869 | Worker name `sadhana-yog-dashboard-reverse-proxy`; `workers_dev = false`. |
| `tools/build-appsscript.py` | 125 | 4,765 | Generates hosted `Index.html` (CSP + marker). |
| `tools/embed-script.py` | 55 | 1,833 | Embeds `Code.gs` into `index.html`. |
| `README.md` | — | 15,234 | Product/ops guide. |
| `SECURITY.md` | — | 10,055 | Hosted vs standalone. |
| `CLOUDFLARE_WORKER.md` | — | 6,767 | **Stale** relative to `worker.js`. See contradictions. |
| `CUSTOM_DOMAIN_APPS_SCRIPT.md` | — | 13,277 | Mixed current Worker + leftover reverse-proxy verification. |
| `resources/Sadhana_Yog_Tracker.xlsx` | — | 49,579 | Predecessor spreadsheet template. Not opened. |
| `resources/Sadhana_Yog_Tracker_Guide.md` | — | 21,635 | Describes name-matched attendance. |
| `.gitignore` | 12 | 426 | Ignores generated HTML and clasp ids. |

**Observed** (`.gitignore:1–10`, `git check-ignore -v`): `apps-script/Index.html`
and `public/index.html` exist on this disk but are **not tracked**. The
gitignore comment says `Index.html` is generated and `public/index.html`
is copied from `index.html` immediately before `wrangler deploy`.

Local working copies on 2026-08-19 (not Git history):

| Path | Relation to `index.html` |
|---|---|
| `public/index.html` | `cmp` identical; same SHA-256 |
| `apps-script/Index.html` | Different SHA-256 `0422c183…a90cf`; generator `--check` reports STALE |

Remote: `origin` is `git@github.com:shreyasmanolkar/sadhana-yog-command-center.git`.
Branch: `main` only. Tip commit subject is a sidebar/layout refactor dated
2026-08-18. `.clasp.json` is absent (gitignored and not present on disk).

### Application modules

**Observed** (`index.html` assignments). Feature behaviour is SY-0003 / SY-0004.
This table is a repository map only.

| Module | First assignment |
|---|---|
| `SY.CAT` | 2751 |
| `SY.DEMO` | 3243 |
| `SY.U` | 3851 |
| `SY.Store` | 4020 |
| `SY.Dom` | 4268 |
| `SY.Money` | 5102 |
| `SY.QR` | 5187 |
| `SY.Fin` | 5491 |
| `SY.Geo` | 5848 |
| `SY.Meet` | 5994 |
| `SY.Comms` | 6082 |
| `SY.Auto` | 6522 |
| `SY.Sync` | 6932 |
| `SY.UI` | 7208 |
| `SY.Router` | 7454 |
| `SY.C` | 7505 |
| `SY.Viz` | 7880 |
| `SY.Pages` | 8198 |
| `SY.Profile` | 9260 |
| `SY.BatchView` | 10068 |
| `SY.Actions` | 13787 |
| `SY.Theme` | 16363 |
| `SY.App` | 16416 |

Persistence key: `sadhanayog.v1` (`index.html:2011`, `index.html:4022`).
Registered router pages (`PAGES()` at `index.html:16485–16492`): today,
calendar, classes, students, attendance, leads, messages, finance,
invoices, tasks, places, reports, business, settings. Sidebar `NAV`
(`index.html:16424–16442`) has no `business` item. That navigation gap
is SY-0003, not a deploy fact.

### Predecessor spreadsheet

**Observed** (`resources/Sadhana_Yog_Tracker_Guide.md:1–20`,
`README.md` “What changed from the old spreadsheet”). The Excel file is
a Google-Sheets-era tracker that matches attendance **by name**. The
HTML app uses `studentId` / `membershipId`. The binary was not opened
and is not treated as a user export.

## Command Center — dependency inventory

**Observed** (static-read of `index.html:1–25`, `apps-script/appsscript.json`,
`wrangler.toml`, absence of `package.json`):

| Kind | Present? | Evidence |
|---|---|---|
| npm / third-party JS or CSS package | No | No `package.json`. No `unpkg` / `jsdelivr` / `cdn` hosts in the page. Favicon is a data SVG. |
| Apps Script libraries | No | `appsscript.json` `"dependencies": {}` |
| Python packages | No | Generators use `pathlib`, `re`, `sys` only |
| Runtime network from the page | Limited | CSP `connect-src` is `'self'` plus `https://script.google.com` and `https://script.googleusercontent.com`. `frame-src` allows `https://www.google.com` and `https://maps.google.com`. |
| User-initiated outbound schemes | Yes (deep links) | `SY.Meet` / `SY.Comms` (`index.html:2845+`, `2917+`): Zoom, Teams, WhatsApp, mail/SMS. Whether any are in live use is SY-0007. |
| Worker upstream | Yes | `POST` to an `https://script.google.com/macros/s/…/exec` URL from `env.APPS_SCRIPT_URL` (`worker.js:133–151`) |

CSP also permits `'unsafe-inline'` script and style because the app is
one file (`index.html:14`). Clickjacking: the meta CSP cannot set
`frame-ancestors`; `worker.js:73` sends `X-Frame-Options: DENY` on the
custom-domain HTML. Hosted Apps Script `doGet` sets
`HtmlService.XFrameOptionsMode.ALLOWALL` (`Code.gs:303–307`) — that
comment assumes the Worker still serves Google's wrapper; see
contradictions.

## Command Center — build and generator inventory

There is no bundler. Two Python generators keep copies of the two
sources in sync.

| Tool | Write | `--check` |
|---|---|---|
| `tools/embed-script.py` | Re-embeds `apps-script/Code.gs` into `index.html` `#apps-script-src` | Exit 0 if the block matches |
| `tools/build-appsscript.py` | Writes `apps-script/Index.html` with hosted CSP + `window.__SY_HOSTED_BUILD = true`; writes `appsscript.json` only if missing | Exit 1 if `Index.html` ≠ built output |

`--no-csp` is documented as a diagnostic, not a deploy setting
(`build-appsscript.py:23–29`).

Hosted CSP (`build-appsscript.py:47–58`) additionally allows
`ssl.gstatic.com`, `apis.google.com`, `*.googleusercontent.com`, and
Google font hosts so `google.script.run` can load.

Generator template `appsscript.json` (`build-appsscript.py:66–76`) uses
`"access": "MYSELF"`. The committed file uses `"access": "ANYONE_ANONYMOUS"`.
The generator does not overwrite an existing manifest.

Deploy commands recorded in `README.md` / `SECURITY.md` (not run here):

```text
python3 tools/embed-script.py
python3 tools/build-appsscript.py
cd apps-script && clasp push
npx wrangler secret put APPS_SCRIPT_URL
npx wrangler secret put APPS_SCRIPT_ACCESS_KEY
npx wrangler deploy
```

`clasp` and `wrangler` are operator tools. They are not repository
dependencies.

## Command Center — test and CI inventory

**Observed** (`find` for `*test*` / `*spec*` excluding `.git`; no
`.github/` directory; `SECURITY.md:216–218`):

- No automated test suite.
- No CI workflow.
- The only consistency checks are the two generator `--check` flags,
  intended for humans before deploy. They are not wired to GitHub.

## Command Center — deployment topologies

Four topologies are documented in-repo. Which one is **currently live
for the studio** was not observed from this machine (no live HTTP, no
Cloudflare dashboard, no Apps Script project).

| Topology | How the page is served | How the sheet is reached | Offline | Authz at the edge |
|---|---|---|---|---|
| Local file | Open `index.html` (or `python3 -m http.server`) | Optional standalone `POST` + `ACCESS_KEY` | Yes (`localStorage` + outbox) | None |
| Hosted Apps Script | `doGet` → `HtmlService` `Index.html` at a `script.google.com` URL | `google.script.run` | No | Google account / deployment ACL |
| Standalone static + Anyone script | Disk or any static host | `POST` `/exec` with key in `localStorage` | Yes | Shared key ≥ 20 chars |
| Custom-domain Worker | Worker serves `public/index.html`, injects `window.__SY_CUSTOM_DOMAIN__={syncPath:"/sync"}` | Browser `POST /sync`; Worker attaches `APPS_SCRIPT_ACCESS_KEY` and forwards to `/exec` | Page requires network; device still has `localStorage` | **Inferred from docs:** Cloudflare Access in front of the hostname; Apps Script set to Anyone so the Worker can call it |

**Observed** production-shaped config in Git (not a live probe):

- Hostname `dash.omsadhanayog.com` as a Custom Domain (`wrangler.toml:11–13`,
  `custom_domain = true`).
- `workers_dev = false` (`wrangler.toml:6`).
- `SY.Sync.isCustomDomain` treats that hostname (and `*.omsadhanayog.com`)
  as custom-domain even if the Worker fails to inject the marker
  (`index.html:6989–6998`).
- `isSheetFronted` also matches `/omsadhanayog\.com$/`
  (`index.html:16494–16496`).
- Committed Apps Script access is `ANYONE_ANONYMOUS`
  (`apps-script/appsscript.json:8`), which matches the custom-domain
  instructions in `Code.gs:31–40` and `CUSTOM_DOMAIN_APPS_SCRIPT.md:74–80`.

**Not observed:** whether Cloudflare Access is actually attached; the
live Worker secret values; the live Apps Script deployment id; whether
anyone still uses hosted Google-URL or standalone-file mode.

`SECURITY.md` still **prefers** hosted Google-URL mode. The Worker files
in the same revision describe a different production path. That is a
documentation split, not a product decision.

### Worker routes

**Observed** (`worker.js:16–36`, `39–76`, `78–152`, `154–164`):

| Route | Behaviour |
|---|---|
| `GET/HEAD /_health` | `200 {"ok":true}`; never contacts Apps Script |
| `POST /sync` | JSON body; Worker sets `payload.token` to `APPS_SCRIPT_ACCESS_KEY`; `POST` text/plain JSON to the `/exec` URL; rejects non-`script.google.com` `/macros/s/…/exec` URLs |
| `GET/HEAD *` | Always fetches `/index.html` from `ASSETS` (SPA); injects the custom-domain snippet |
| Other methods | 405 |

Headers on the app HTML: `Cache-Control: no-store`,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: no-referrer`.

The Worker does **not** reverse-proxy HtmlService, rewrite HTML, map
`/static/macros/client/…`, follow Google login redirects, or honour
`HTML_REWRITE` / `ORIGIN_REFERER_MODE` / `CORS_ALLOW_ORIGIN` /
`STRIP_X_FRAME_OPTIONS` / `LOG_REQUESTS`. Those flags exist only in
`CLOUDFLARE_WORKER.md`.

### Apps Script entry points

**Observed** (`Code.gs:242–307`, `412–419`):

- `doPost`: requires usable `ACCESS_KEY`; eight failures pause fifteen
  minutes; actions `ping` / `pull` / `push` / `setup`.
- `doGet`: serves `Index` via HtmlService when that file exists; otherwise
  returns `{ ok: true }` (standalone).
- `push` takes `LockService.getScriptLock()` for 25 seconds. Concurrent
  editors are last-write-wins beyond that lock. Collection semantics are
  SY-0004.

Empty `ACCESS_KEY` (`Code.gs:57`) means `doPost` refuses every request.
That is the hosted-Google-URL posture. Custom-domain and standalone
require a 20+ character key that matches Worker secret
`APPS_SCRIPT_ACCESS_KEY` (`Code.gs:53–56`, `wrangler.toml:22–23`).
The live key was not read.

`ALLOWED_USERS` is `[]` (`Code.gs:76`) with a comment that a non-empty
list throws on custom-domain loads because Google does not name the
caller.

### DNS and Access

**Observed in config/docs only:**

- Custom Domain on `dash.omsadhanayog.com` is intended to create DNS and
  the certificate (`wrangler.toml:8–10`, `CUSTOM_DOMAIN_APPS_SCRIPT.md:119–138`).
- Cloudflare Access is **recommended** for that hostname
  (`CUSTOM_DOMAIN_APPS_SCRIPT.md:91–108`). Foundation §2 **assumes** it.
  This issue did not open Zero Trust, so Access remains **not observed**.

## Command Center — secrets and environment (names only)

| Name | Where it lives | In Git? |
|---|---|---|
| `APPS_SCRIPT_URL` | Wrangler secret; Worker `env` | No. Comment only (`wrangler.toml:22`, `worker.js:12`). Must be `https://script.google.com/macros/s/…/exec`. |
| `APPS_SCRIPT_ACCESS_KEY` | Wrangler secret | No. Must match Apps Script `ACCESS_KEY`. |
| `ACCESS_KEY` | Apps Script project | Committed value is `''`. Live value must not be committed. |
| `ALLOWED_USERS` | Apps Script project | Committed `[]`. |
| clasp `scriptId` | `.clasp.json` | Gitignored; file absent on this disk. |
| Standalone key in the browser | `localStorage` beside `sadhanayog.v1` | Never. |

No secret values, cookies, or live `/exec` URLs were read or written.

## Command Center — generator consistency checks

Run 2026-08-19 against Command Center `c724be0e116582b5c73d324d00a81ac23eb0bbf2`.
Results recorded; **nothing was fixed**.

| Check | Command | Result |
|---|---|---|
| Embedded `Code.gs` vs `index.html` | `python3 tools/embed-script.py --check` | **in sync** — exit 0 |
| Apps Script generated HTML | `python3 tools/build-appsscript.py --check` | **STALE** — exit 1; `Index.html is STALE — run: python3 tools/build-appsscript.py` |
| Worker static copy (local, gitignored) | `cmp index.html public/index.html` | **identical** |
| Teaching Archive generators | none in `c6732f59…` | Not applicable |

Foundation §2 already notes the stale Apps Script HTML. Repair is out of
Stage 0 scope.

## Teaching Archive — repository and deployment

**Observed** (`git ls-files` at `c6732f59…`): two tracked files.

| Path | Lines | Bytes |
|---|---:|---:|
| `index.html` | 1,875 | 113,072 |
| `README.md` | 140 | 6,717 |

No `package.json`, tests, CI, Worker, Apps Script, generator, CSP meta
tag, or `fetch(`. Persistence key `teaching-archive.v1` (`index.html:590`).
Tabs (`index.html:1784–1789`): Today, Log, Rituals, Guide, Plan.

**Observed deploy options** (`README.md:19–41`), none of them a studio
control plane:

1. Open the file locally (offline).
2. Drag `index.html` onto a Netlify Drop host, then add to home screen.
   Entries stay in that browser; the public URL serves a blank copy.
3. Email the file to yourself (discouraged; storage may not persist).

Identity, remote persistence, and media bytes: not present. Content and
privacy wording are SY-0005.

Remote: `origin` is `git@github.com:shreyasmanolkar/yog-documentation.git`.
Single commit on the inspected copy.

## Flutter samples — adopt / reject

**Observed** at `0c5ca75d2985ddeca92417bb1235f361d8643e7b`. The official
`samples` tree is large. Only these paths were used as pattern evidence.

### Adopt

From `compass_app/` (architecture sample, `compass_app/README.md`,
`compass_app/app/lib/`):

| Pattern | Path |
|---|---|
| View / view-model / repository / service | `lib/ui/*/view_models`, `lib/ui/*/widgets`, `lib/data/repositories`, `lib/data/services` |
| Constructor DI | `lib/config/dependencies.dart` (`Provider` graph) |
| `go_router` | `pubspec.yaml` `go_router: ^16.0.0`; `lib/routing/router.dart` |
| `Result` success/error | `lib/utils/result.dart` |
| Test fakes | `app/testing/fakes/` |

From `platform_design/README.md`: platform-adaptive chrome (Material
drawer vs iOS tab bar) around shared content. Compass itself is
Material-first; adaptive chrome is this sibling sample, not Compass
widgets.

From `form_app/README.md`: form widget and validation examples. Do not
copy its HTTP sign-in sample as product auth.

### Reject

- Compass data models, demo itineraries, `assets/*.json`, and the dummy
  `compass_app/server`
- Example packages merely because they appear (`google_fonts`,
  `cached_network_image`, `share_plus`, GenKit history in the Compass README)
- `add_to_app/`, `google_maps/`, `web_embedding/`, and other samples not
  named above

These notes do not implement Flutter. They constrain SY-0009 / later
mobile issues.

## vivek-os — adopt / reject

**Observed** at `d41a7b294d65d004eea202ecabf78a4413b129c6`.

### Adopt

| Pattern | Path |
|---|---|
| Layered `AGENTS.md` with instruction precedence | `AGENTS.md` |
| Executable Markdown issue graph | `docs/issue-tracking/track.mjs`, `config.yml`, `SPEC.md` |
| Decision lifecycle | `.agents/notes/{proposed,implemented,rejected,archived}` |
| Issue/code co-evolution | `docs/issue-tracking/AGENTS.md` |
| Postmortems for escaped failures | `docs/postmortem/README.md` |

This monorepo already carries a Sadhana Yog-scoped copy of the tracker
and notes lifecycle. SY-0002 records the source of those patterns; it
does not re-scaffold them.

### Reject

- The mature SMRT board (~300 issues), bootcamp, GTM, compliance packs
- Specialized skills (`ask-matt`, `grill-me`, `wayfinder`, …)
- On-prem / airgap / Keycloak / Postgres / Docker operational stack
- White-label / reseller complexity

## External dependencies and deployment assumptions

Stage 0 exit row owned by this issue. Status: inventoried, unsigned.

| Dependency | Role today | Observation |
|---|---|---|
| Browser `localStorage` | Canonical device store (`sadhanayog.v1`, `teaching-archive.v1`) | Observed in both apps |
| Google Sheet + Apps Script | Optional shared store; only write path besides `localStorage` | Observed `Code.gs`, `SY.Sync` |
| Cloudflare Worker | Custom-domain HTML + `/sync` proxy | Observed `worker.js` / `wrangler.toml` |
| Cloudflare Access | Assumed hostname gate | Documented, **not observed** live |
| Google account ACL | Hosted Google-URL mode | Documented; committed `appsscript.json` is Anyone-anonymous |
| Google Maps embed / directions | Places iframe + `maps/dir` links | Observed CSP `frame-src` and `placesFallback` (`index.html:16467–16477`) |
| WhatsApp / mail / SMS / Meet / Zoom / Teams | User-initiated deep links | Observed catalogs; reality vs demo is SY-0007 |
| Configured payment page / UPI QR | Client-side; `SY.QR` | Observed module; no payment API |
| Netlify Drop (archive only) | Optional static host for a blank copy | Observed README; not used by Command Center |
| npm / CDN runtime | None in the page | Observed absence |

Assumptions carried forward (labelled, not approved):

1. Cloudflare Access **may** protect `dash.omsadhanayog.com`; it is not
   product identity (foundation §2; `CUSTOM_DOMAIN_APPS_SCRIPT.md`).
2. Apps Script + shared key is the only shared write path besides
   `localStorage`.
3. Concurrent editing is last-write-wins (`README.md:276–277`;
   `LockService` only serialises one `push`).
4. Device data is unencrypted (`SECURITY.md:284–287`; archive
   `README.md:126`).
5. Teaching Archive never holds media and never calls a network.

## Rendered inspection

Not executed in this issue. Desktop/mobile workflow rendering, keyboard
walkthrough, and DOM/accessibility inspection remain
[SY-0003](../issue-tracking/issues/SY-0003.md) and
[SY-0006](../issue-tracking/issues/SY-0006.md).

This issue did not open a browser profile, did not read `localStorage`,
and did not fetch the live hostname or Apps Script `/exec` URL.

## Characterization vectors

No new vectors. Starter vectors already live in
[sanitized-fixture-policy.md](sanitized-fixture-policy.md)
(attendance consumption, comms “opened”, archive no-media). Sync /
outbox / last-write-wins vectors are in
[legacy-data.md](legacy-data.md) (SY-0004). Threat findings wait
for SY-0006.

## Required human decisions

Recorded so later stages cannot infer them. **None are decided here.**

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Which of the four Command Center topologies is the studio's real production path | Product / operations | SY-0007; cutover (foundation §28) | Unsigned. Git config is shaped for the Worker topology. |
| Whether Cloudflare Access is actually attached, and to which IdP | Product / security | Production identity (Stage 5) and SY-0006 | Unsigned; not observed |
| Whether hosted Google-URL and standalone-file modes must keep working during strangler migration | Product | SY-0007; decommission checklist (foundation §28 step 10) | Unsigned |
| Whether to repair `build-appsscript.py --check` STALE HTML, and Worker/Apps Script doc drift | Engineering after a tagged legacy revision | Not Stage 0. Foundation §3: delete generated artifacts only after proof | Unsigned; recorded not fixed |
| Which Maps / Meet / Zoom / Teams / WhatsApp / mail / SMS / payment-page integrations are real | Product | SY-0007 | Unsigned (same row as the Stage 0 program) |
| Browser `localStorage` vs Google Sheets precedence | Product | SY-0007; [SY-0088](../issue-tracking/issues/SY-0088.md) | Unsigned |

## Open contradictions

Conflicts are defects. They are listed, not resolved.

1. **`CLOUDFLARE_WORKER.md` versus `worker.js`.** The markdown describes
   an HtmlService reverse proxy (HTML rewrite, Origin/Referer translation,
   `/static/macros/client` mapping, Google redirect following). `worker.js`
   at `c724be0e…` serves local `ASSETS` and `POST /sync` only. Prefer the
   executable file as observed behaviour. Do not treat the markdown as the
   running Worker.
2. **`Code.gs` `doGet` comments versus the Worker.** `Code.gs:303–307`
   says ALLOWALL is required because “the Worker serves Google's wrapper”.
   `worker.js` does not serve that wrapper. Hosted Google-URL mode still
   uses `doGet`; custom-domain mode uses Worker HTML + `doPost`.
3. **`CUSTOM_DOMAIN_APPS_SCRIPT.md` verification versus routes.** The
   guide says `https://dash.example.com/foo?x=1` is forwarded to
   `/exec/foo?x=1`. `worker.js` answers every GET with `/index.html` and
   only forwards `POST /sync`.
4. **`appsscript.json` versus generator template.** Committed access is
   `ANYONE_ANONYMOUS`; `build-appsscript.py` would write `MYSELF` for a
   missing manifest and never updates the existing file.
5. **`.gitignore` versus `wrangler.toml`.** Assets directory is `./public`,
   but `public/index.html` is gitignored. A clean clone does not contain
   the Worker static file until someone copies `index.html`.
6. **Foundation §2 versus this inventory.** No material disagreement on
   revisions, Worker `/sync`, generator STALE, or absence of tests. The
   Access assumption remains an assumption. Child inventories still
   re-cite evidence rather than quoting §2 as signed.

## Out of scope (owned elsewhere)

| Topic | Owner |
|---|---|
| Every page, shortcut, empty/loading/error, responsive behaviour | SY-0003 |
| `sadhanayog.v1` collections, encodings, derived sessions, outbox rules | SY-0004 |
| Archive content IDs, journey/rituals, privacy prose | SY-0005 |
| Threat sketch, CSP sinks, keyboard/axe | SY-0006 |
| Preserve/change/remove and source-of-truth sign-off | SY-0007 ([source-of-truth.md](source-of-truth.md), unsigned) |
| Target monorepo scaffold | SY-0008 / SY-0009 (blocked by this issue) |

## Rollback

Documentation only. Revert an incorrect baseline through review and keep
the Git history of the rejected text. Do not rewrite evidence in place to
hide a bad observation. Do not “fix” generator drift or Worker docs as
part of reverting this file.
