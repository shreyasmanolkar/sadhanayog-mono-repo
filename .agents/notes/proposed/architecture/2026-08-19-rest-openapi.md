# Agent Note: REST and OpenAPI as the client boundary

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

- **tRPC:** rejected; it does not naturally serve Dart.
- **GraphQL:** rejected; the resource/workflow scale does not justify it.

## Affected components

`packages/contracts`, `apps/api`, `apps/web`, `apps/mobile`.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
