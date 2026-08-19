# Sanitized fixture policy

Status: draft  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0001](../issue-tracking/issues/SY-0001.md)  
Sources: [engineering foundation](../architecture/engineering-foundation.md) §22, §28;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 0

How Stage 0 (and later characterization work) may handle legacy data
without putting real people, secrets, or live endpoints into Git or
agent prompts.

This policy is not a legal conclusion and does not claim compliance.

## What may enter Git

- Observations that cite revision, path, and method
- Collection names, field names, types, encodings, and invariants
- Synthetic rows whose values were invented for the fixture
- Hashes, row counts, and totals taken from a sanitized or synthetic set
- Characterization vectors that use synthetic identifiers
- Redacted screenshots that contain no name, contact, health note,
  invoice number, key, or live URL

## What must never enter Git or agent prompts

- Raw `localStorage` dumps (`sadhanayog.v1`, `teaching-archive.v1`)
- Google Sheets exports, CSV/JSON downloads from a live studio
- Names, phone numbers, emails, addresses
- Health, injury, goal, or similar notes
- Invoice identifiers, payment references, UPI IDs
- Access keys, Apps Script URLs, Worker secrets, cookies, session material
- Live meeting links, personal map queries, or other user-specific URLs
- Demo-seed personal fields copied out of `SY.DEMO` (treat them as if real)

Root `.gitignore` already ignores `exports/`, `backups/`, and `scratch/`.
That is defense in depth, not permission to store raw exports in the
clone. Prefer a location **outside** this repository.

## Redaction catalog

When a string must be mentioned at all, replace it before writing:

| Class | Replacement |
|---|---|
| Person name | `student-a`, `instructor-a` |
| Phone / email / address | `[redacted-contact]` |
| Health or goal note | `[redacted-health]` |
| Invoice or payment id | `invoice-1`, `pay-1` |
| Secret or key | `[redacted-secret]` |
| Live URL | scheme plus purpose, e.g. `https://[payment-page]` |
| Studio / legal name if not already public in docs | `[studio]` |

Do not hash personal fields and then commit the hash next to enough
context to re-identify the person.

## Raw export handling

1. A human exports from a specific device or Sheet into an
   access-controlled temporary location outside the clone.
2. Record device/store label, export time, byte size, and SHA-256 of the
   **raw** file in a private note that is not committed. The hash may
   later appear in [source-of-truth.md](source-of-truth.md) without
   the bytes.
3. Produce a sanitized or synthetic derivative before any agent reads
   the material. Agents see only the derivative.
4. Destroy the raw file on the schedule
   [source-of-truth.md](source-of-truth.md) records. Until that
   schedule exists, destroy it when the immediate inventory step ends.
5. Never paste raw JSON into an issue, chat, or prompt.

[source-of-truth.md](source-of-truth.md) holds the checksum slots and
destruction protocol. Representative exports have **not** been
captured. This epic does not collect them.

## Characterization vector format

Each vector is a markdown subsection in the owning inventory
(`legacy-data.md` for Command Center rules; `teaching-archive.md` for
archive rules). Use this shape:

```markdown
### vector-id

- Status: observed | inferred | approved
- Revision: <full sha>
- Path: <file:line>
- Method: static-read | render | sanitized-export | calculation-probe
- Given: synthetic preconditions (no real identifiers)
- When: the action
- Then: the expected durable result
- Not then: adjacent outcomes that must not occur
```

A vector is not a product requirement until
[source-of-truth.md](source-of-truth.md) marks it approved. Every
Stage 0 vector is still unsigned.

## Starter vectors

These begin the Stage 0 characterization set from **static reads** of the
pinned revisions. They use synthetic data only. They are not signed.

### attendance.consume.present-late

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:2800–2801`, `index.html:4485–4493`
- Method: static-read
- Given: student-a has an active counted membership on the session date
- When: attendance status is set to `present` or `late`
- Then: the mark is in `SY.CAT.CONSUMING` and a membership id is attached
  when one is active
- Not then: `excused` and `absent` are not in `CONSUMING`

### comms.opened-not-delivered

- Status: observed
- Revision: `c724be0e116582b5c73d324d00a81ac23eb0bbf2`
- Path: Command Center `index.html:6075–6076`, `index.html:6233–6236`,
  `index.html:12073–12079`
- Method: static-read
- Given: a template is opened toward student-a on WhatsApp, mail, or SMS
- When: the channel is opened from the page
- Then: the log status is `opened` (teacher may later mark sent)
- Not then: the product does not claim the message was delivered

### teaching-archive.no-media

- Status: observed
- Revision: `c6732f59cf66af9a238caaccc185104afa534d7f`
- Path: Teaching Archive `README.md` (“It does not hold your videos or
  audio”); `index.html:590–605` (`TA.Store` defaults have metadata
  fields, no binary/media collection)
- Method: static-read
- Given: a recording is filed on a journey day
- When: the user logs it
- Then: the store keeps metadata (and a suggested filename) under
  `teaching-archive.v1`
- Not then: media bytes are not stored in the application

Workflow vectors (unknown hash, Business bookmark-only, FAB hidden on
attendance, shortcuts ignored in fields, empty-desk catalog seed,
missing attendance session) live in
[feature-inventory.md](feature-inventory.md).

Command Center rule vectors (session derivation, invoice arithmetic,
invoice number floor, pull-replace, membership expiry) live in
[legacy-data.md](legacy-data.md). Journey-day, returns, ritual due
windows, filename, and import-replace vectors live in
[teaching-archive.md](teaching-archive.md).
Security and accessibility vectors (text-node hyperscript, viz
tooltip escape, backup credential strip, Worker-attached key, Help
focus trap, Archive sheet trap, Archive CSP absence, privacy wording
versus control) live in
[a11y-security-baseline.md](a11y-security-baseline.md).

## Checksums

When [source-of-truth.md](source-of-truth.md) records a representative
export:

- Algorithm: SHA-256
- Hash the sanitized file that is allowed to be discussed, and separately
  record the raw-file hash only in the private handling note
- Also record row counts per collection and a short list of synthetic
  invariant totals (attendance consuming marks, open invoice sum)

Do not commit the files that were hashed if they contain any class from
the redaction catalog.

## Review

A reviewer of this policy checks that no raw export, secret, or
personal field is in the diff, and that starter vectors cite revision
and path. Product approval of the *rules* is the signature block in
[source-of-truth.md](source-of-truth.md), not this file.
