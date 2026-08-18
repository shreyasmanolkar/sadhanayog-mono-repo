# AGENTS.md — Mobile

Constructor DI, feature-first packages, `go_router`. Generated DTOs never
reach widgets.

- No secrets or client credentials in the binary.
- Secure storage only for refresh/session material (Stage 5).
- Do not copy Flutter sample models.

Validate: `flutter analyze && flutter test`
