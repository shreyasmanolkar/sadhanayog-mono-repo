# Agent Note: Modular monolith on a Cloudflare Worker

Status: proposed

## Problem

The studio has 2–3 operators. A microservice mesh, a separate web host, and a
second database would add operations without users.

## Proposal

Ship one Worker containing the versioned REST API and the built web app as
static assets. Keep module boundaries in code so a hotspot can be extracted
later.

## Rationale

Matches current Worker hosting, keeps same-origin cookies, and matches the
user count.

## Alternatives considered

- **Microservices / Kubernetes:** rejected because there is no scale or team
  to operate them.
- **Separate web host plus API:** rejected; it splits deploy and loses
  same-origin session cookies.

## Affected components

`apps/api`, `apps/web`, `packages/db`, Cloudflare account layout.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
