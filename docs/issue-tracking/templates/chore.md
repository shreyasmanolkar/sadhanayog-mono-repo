---
type: Template
id: chore
title: Chore
description: Maintenance, cleanup, dependency work. Often the safest thing to hand an agent.
---

## Context

_What is being cleaned up, and what made it safe to clean up now?_ Deletions usually depend on something else having landed first — name it in `blocked_by`.

## Tasks

- [ ]

## Verify

- [ ] Grep gate: `rg -n "<the thing being deleted>"` → zero hits
- [ ] `pnpm verify`
