# Agent Note: Modular monolith on a Cloudflare Worker

ID: ADR-0001
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

- **Status quo (single HTML file plus Apps Script sync):** rejected; it cannot
  authorize, test, or evolve a schema safely.
- **Microservices / Kubernetes:** rejected because there is no scale or team
  to operate them.
- **Separate web host plus API:** rejected; it splits deploy and loses
  same-origin session cookies.

## Impact

- **Security:** authorization stays on the Worker. Clients are not the
  security boundary.
- **Operations:** one deployable backend and one D1 per environment.
- **Data:** one transactional store; no second database in this proposal.

## Affected components

`apps/api`, `apps/web`, `packages/db`, Cloudflare account layout.

## Approvers

Human architectural reviewer. Not self-approved.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
