# Repository and deployment baseline

Status: draft evidence  
Owner: engineering  
Last-reviewed: 2026-08-19  
Sources: read-only copies of the four reference repositories

## Revisions inspected

| Repository | Path | Revision |
|---|---|---|
| Command Center | `/home/shreyas/Work/sadhanayog/sadhana-yog-command-center` | `c724be0e116582b5c73d324d00a81ac23eb0bbf2` |
| Teaching Archive | `/home/shreyas/Work/learnings/yog-documentation` | `c6732f59cf66af9a238caaccc185104afa534d7f` |
| Flutter samples | `/home/shreyas/Work/learnings/samples` | `0c5ca75d2985ddeca92417bb1235f361d8643e7b` |
| vivek-os | `/home/shreyas/Work/conception-labs/vivek-os` | `d41a7b294d65d004eea202ecabf78a4413b129c6` |

These match the foundation document §2.

## Command Center inventory

Observed layout:

- `index.html` — entire application (~17k lines). No `package.json`.
- `public/index.html` — static copy served by the Worker.
- `worker.js` + `wrangler.toml` — Cloudflare Worker serving assets and proxying `POST /sync` to Apps Script with `APPS_SCRIPT_URL` / `APPS_SCRIPT_ACCESS_KEY`.
- `apps-script/` — `Code.gs`, generated `Index.html`, `appsscript.json`.
- `tools/build-appsscript.py`, `tools/embed-script.py` — generators. Foundation notes `--check` reports stale generated HTML.
- `SECURITY.md`, `CLOUDFLARE_WORKER.md`, `CUSTOM_DOMAIN_APPS_SCRIPT.md`.
- Hostname in Worker config: `dash.omsadhanayog.com`. `workers_dev = false`.

Global modules in `index.html`: `SY.CAT`, `SY.DEMO`, `SY.U`, `SY.Store`, `SY.Dom`, `SY.Money`, `SY.QR`, `SY.Fin`, `SY.Geo`, `SY.Meet`, `SY.Comms`, `SY.Auto`, `SY.Sync`, `SY.UI`, `SY.Router`, `SY.C`, `SY.Viz`, `SY.Pages`, `SY.Profile`, `SY.BatchView`, `SY.Actions`, `SY.Theme`, `SY.App`.

Registered pages: today, calendar, classes, students, attendance, leads, messages, finance, invoices, tasks, places, reports, business, settings.

Persistence key: `sadhanayog.v1` via `SY.Store`. Attendance consumption: `present` and `late` consume counted membership units (`SY.CAT.CONSUMING`).

No automated test suite. No third-party JS/CSS package. CSP permits inline script because the app is one file.

## Teaching Archive inventory

Single file `index.html` plus `README.md`. Persistence key `teaching-archive.v1`. Five tabs: Today, Log, Rituals, Guide, Plan. Holds metadata and prose, not media. No identity, no remote persistence, no build, no tests.

## Flutter samples (adopt / reject)

Adopt from `compass_app`: view / view-model / repository / service, constructor DI, `go_router`, test fakes, `Result`, adaptive chrome.

Do not copy sample data models, demo repositories, or example packages.

## vivek-os (adopt / reject)

Adopt: layered `AGENTS.md`, executable Markdown issue graph (`docs/issue-tracking/track.mjs`), decision lifecycle under `.agents/notes`, issue/code co-evolution, postmortems for escaped failures.

Do not copy the mature board, every specialized agent, or operational complexity.

## Current deployment assumptions

- Cloudflare Access may protect the web hostname; it is not product identity.
- Apps Script + shared key is the only write path besides `localStorage`.
- Last-write-wins concurrent editing.
- Device data is unencrypted.

## Disposition

See foundation §3. This baseline does not change any legacy file.
