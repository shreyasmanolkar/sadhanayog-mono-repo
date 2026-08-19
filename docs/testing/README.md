# Testing

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

Policy is foundation §15. There is no single coverage percentage target.

Current evidence: contract schema tests, db schema-export and client-factory
tests, Worker health tests under `apps/api/test/contract/`, web shell Testing
Library test, Flutter Result/config/widget tests, CI checker tests (secrets,
workflow policy), local D1 seed/reset guards (`pnpm bootstrap:test`), bootstrap
artifact check (`pnpm bootstrap:check`). License allowlist tests belong to
SY-0011.

PR gates are documented in [development/ci.md](../development/ci.md).
Playwright, axe, and D1 upgrade suites are deferred until those layers
exist.
