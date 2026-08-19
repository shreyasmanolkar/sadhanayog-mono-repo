---
name: build-flutter-feature
description: Implement a Flutter mobile slice from an approved contract and parity row. Use when adding Dart widgets, go_router destinations, or Flutter feature view-models. Do not use for the web app, HTTP APIs, or secrets in the binary.
---

# build-flutter-feature

Input: approved contract/DTO plus the parity row for this slice.

## Steps

1. Map transport DTO → Dart domain. Generated DTOs never reach widgets.
2. Constructor DI. Feature-first packages. `go_router`.
3. Cover loading, empty, error, permission, and success UI states. Adaptive and accessible.
4. Do not copy Flutter sample models.

## Stop

No secrets or client credentials in the binary. Route guards are not authorization.

## Validate

`cd apps/mobile && flutter analyze && flutter test`. Unit, widget, router, integration, and semantics checks as the issue requires.

## Examples

- Match: "implement the Flutter attendance screen from the contract"; "add a Dart widget and go_router destination".
- Do not match: "TanStack web page"; "Worker route".

## References

- [`apps/mobile/AGENTS.md`](../../../apps/mobile/AGENTS.md)
- engineering-foundation.md §7
