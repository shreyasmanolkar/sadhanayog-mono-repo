# Agent Note: REST and OpenAPI as the client boundary

ID: ADR-0003
Status: proposed

## Problem

Web (TypeScript) and Flutter (Dart) must share a reviewable contract. Sharing
TypeScript types only would leave Flutter behind.

## Proposal

Keep Zod request/response schemas in `packages/contracts`, generate OpenAPI
3.1, and give Flutter a generated transport client that maps into Dart
domain models.

## Rationale

Language-neutral, reviewable compatibility, and no second conceptual layer.

## Alternatives considered

- **Status quo (no contract, browser-only modules):** rejected; Flutter cannot
  import them and there is no reviewable compatibility surface.
- **tRPC:** rejected; it does not naturally serve Dart.
- **GraphQL:** rejected; the resource/workflow scale does not justify it.

## Impact

- **Security:** contracts validate shape, not authorization. The Worker still
  authorizes.
- **Operations:** OpenAPI is committed; drift is a CI failure.
- **Data:** wire DTOs are not persistence rows.

## Affected components

`packages/contracts`, `apps/api`, `apps/web`, `apps/mobile`.

## Approvers

Human architectural reviewer. Not self-approved.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
