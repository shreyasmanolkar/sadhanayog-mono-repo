# Testing

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

Policy is foundation §15. There is no single coverage percentage target.

Current evidence: contract schema tests, db schema-export test, Worker health
tests, web shell Testing Library test, Flutter Result/widget tests, CI
checker tests (secrets, licenses, workflow policy).

PR gates are documented in [development/ci.md](../development/ci.md).
Playwright, axe, and D1 upgrade suites are deferred until those layers
exist.
