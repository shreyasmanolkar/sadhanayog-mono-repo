---
name: model-domain
description: Change terminology, entities, invariants, or workflows. Use when modelling domain language, the glossary, ownership, time, or money states, or before schema or API feature design. Do not use to invent persistence columns, HTTP routes, or screens; Stage 2 owns the first model.
---

# model-domain

Input: the concept to change and the discovery evidence it must match.

## Steps

1. Separate domain language from UI copy.
2. Map legacy behavior from [`docs/discovery`](../../../docs/discovery/README.md) before proposing a change.
3. Identify ownership, time-zone/date meaning, and money states.
4. Record unresolved product questions; do not fill gaps by invention.

## Stop

Do not invent schema columns or API routes here. Do not treat foundation §2 as a signed inventory. Stakeholder review is required before this model authorizes persistence.

## Validate

Glossary consistency, domain examples, and stakeholder review. First owned by SY-0019–SY-0024.

## Examples

- Match: "define membership consumption invariant in the domain glossary"; "model terminology before schema design".
- Do not match: "add a D1 table"; "new Worker route".

## References

- [`docs/discovery/README.md`](../../../docs/discovery/README.md)
- [`docs/product/README.md`](../../../docs/product/README.md)
- engineering-foundation.md §4, Stage 2
