---
name: review-security-privacy
description: Threat-based review of an issue, diff, or data class. Use when reviewing auth, tenant isolation, IDOR, secrets, logs, uploads, privacy handling, or a requested security audit. Do not use for ordinary merge review, accessibility parity, or claiming legal compliance.
---

# review-security-privacy

Input: issue ID, diff, and data classes in play.

## Steps

1. Cover tenant isolation, IDOR, secrets, logs, uploads, web and mobile controls.
2. Distinguish studio practice, privacy requirement, and law. Do not claim compliance.
3. File findings as issues. Negative tests are required evidence.

## Stop

Do not waive P0/P1 findings. Do not access raw user data, production logs, or secrets to perform the review.

## Validate

Negative tests, threat-model delta, findings filed as issues.

## Examples

- Match: "threat-model this PR for IDOR and tenant isolation"; "privacy review of logs and upload handling".
- Do not match: "independent review before merge"; "keyboard parity".

## References

- [`docs/security/README.md`](../../../docs/security/README.md)
- [`AGENTS.md`](../../../AGENTS.md)
- engineering-foundation.md §22
