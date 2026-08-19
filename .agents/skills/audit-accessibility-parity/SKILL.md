---
name: audit-accessibility-parity
description: Compare web and mobile feature outcomes before a cross-platform feature closes. Use when checking accessibility, keyboard, screen-reader, text-scale, or responsive parity across web and Flutter. Do not use for pixel-perfect visual QA, security review, or implementing a single-platform slice.
---

# audit-accessibility-parity

Input: the feature's parity row and both client implementations.

## Steps

1. Matrix all states on web and mobile.
2. Keyboard, screen reader, text scale, responsive layout, and intentional platform differences.
3. Outcome parity, not pixel parity.

## Stop

Do not close a cross-platform feature without this audit. Do not treat a single screenshot as evidence.

## Validate

Automated checks plus a recorded manual protocol. Cite both client paths.

## Examples

- Match: "compare web and mobile accessibility before the feature closes"; "keyboard and screen-reader parity matrix".
- Do not match: "implement the TanStack page"; "threat-model IDOR".

## References

- [`docs/testing/README.md`](../../../docs/testing/README.md)
- engineering-foundation.md §15, Stage 12
