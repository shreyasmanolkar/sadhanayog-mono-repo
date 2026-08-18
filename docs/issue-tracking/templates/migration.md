---
type: Template
id: migration
title: Migration
description: A schema change. Ships paired with its code PR. Human sign-off required — an agent may draft it, never land it.
---

> **Blast radius: high.** Database schema and production data are ASK-first (AGENTS.md).
> Label this issue `migration` + `needs-human`. An agent may draft the SQL; a human reviews and lands it.

## Context

_What changes, and why it cannot be done additively._

## The pairing rule

A migration and the code that depends on it ship in **one deploy**. State here what breaks if they are split:

-

## Tasks

- [ ] Write the reviewed SQL migration in `packages/db`
- [ ] `pnpm db:migrate:local` on a scratch DB
- [ ] Land it **with** the code PR that consumes it

## Rollback

_What is the un-do? If there isn't one, say so plainly._

## Verify

- [ ] Applied locally; constraints and row counts as expected
- [ ] `pnpm verify`
