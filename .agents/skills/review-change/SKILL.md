---
name: review-change
description: Independent code and architecture review before merge. Use when asked to review a diff, label findings by severity, or check that an issue matches its implementation. Do not use to rewrite the author's work or run a security/privacy audit.
---

# review-change

Input: issue ID and the reviewable diff.

## Steps

1. Inspect issue scope, architecture fit, data/authz/security, behavior, tests, generated code, docs, operations.
2. Do not rewrite the author's work. Label findings by severity with reproduction.
3. Style-only comments do not block unless a documented rule is violated.

## Stop

Protected paths still need a human. Do not mark `done` for the author.

## Validate

Severity-labelled findings and a checked reproduction. Review order: intent → architecture → data/authz → behavior → tests → operations → maintainability.

## Examples

- Match: "independent code review of the diff before merge"; "label review findings by severity without rewriting the author's work".
- Do not match: "implement SY-0014"; "threat-model IDOR".

## References

- [`AGENTS.md`](../../../AGENTS.md)
- [`.github/pull_request_template.md`](../../../.github/pull_request_template.md)
- engineering-foundation.md §26
