---
name: handle-r2-object
description: Add or change the private R2 document lifecycle. Use when object storage, private-bucket keys, upload validation, or orphan cleanup changes. Do not use for D1 schema, public CDN assets, or giving clients raw credentials.
---

# handle-r2-object

Input: issue ID and the document type/policy under change.

## Steps

1. Private buckets. Server-generated keys. Clients never receive credentials or choose raw keys.
2. State machine: pending → ready/failed. Validate type/size. Compensating cleanup on failure.
3. Metadata and authorization stay on the Worker. Non-atomic object+row updates need compensation.

## Stop

No public buckets for private documents. No production object deletes without a human gate.

## Validate

Malicious, oversize, unauthorized, and orphan cases.

## Examples

- Match: "upload a private PDF to R2 object storage"; "change the R2 document lifecycle and orphan cleanup".
- Do not match: "Drizzle migration"; "web form".

## References

- [`docs/security/README.md`](../../../docs/security/README.md)
- engineering-foundation.md §11
