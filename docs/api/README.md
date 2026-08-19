# API

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

Conventions live in the [engineering foundation](../architecture/engineering-foundation.md)
§9 and §12. The committed spec is
[`packages/contracts/openapi/openapi.json`](../../packages/contracts/openapi/openapi.json).

Current routes: `GET /health/live`, `GET /health/ready`,
`GET /api/v1/health/live`, `GET /api/v1/health/ready`.
Product routes arrive in later stages. `/health/ready` is a placeholder;
authorization for readiness lands in SY-0034.
