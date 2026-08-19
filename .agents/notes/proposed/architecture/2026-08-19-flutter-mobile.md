# Agent Note: Flutter iOS and Android shell

Status: proposed

## Problem

The studio needs one native mobile client for iOS and Android. Sharing
TypeScript business implementations with Flutter would fight language
conventions and make the Worker less authoritative.

## Proposal

Ship one Flutter application with constructor DI, `go_router`, and a sealed
`Result` type. Dart maps generated transport DTOs into domain models later.
Native product flavors stay a Stage 8 concern; Stage 1 ships a dart-define
config shell only.

## Rationale

Official Flutter MVVM/repository samples match the intended client shape.
One codebase covers both stores without a second native team.

## Alternatives considered

- **React Native:** rejected; the chosen mobile architecture is Flutter MVVM
  with Dart domain models.
- **Separate Kotlin and Swift apps:** rejected; too much duplication for 2–3
  operators.
- **Share TypeScript business rules into Dart:** rejected; the Worker remains
  authoritative and Flutter maps DTOs locally.

## Affected components

`apps/mobile`.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
