---
type: Template
id: bug
title: Bug
description: A defect in shipped behavior. Evidence first — a bug without a reproduction is a rumour.
---

## Context

_What is broken, and how do you know?_ Cite the file and line or the log/trace. State whether it is **live**, **dormant** (unreachable today), or **latent** (reachable only after some other change lands).

## Reproduction

1.
2.
3.

**Expected:**
**Actual:**

## Blast radius

_Who is affected, and is data at risk?_ If student/health/finance data can leak, add the `security` and `privacy` labels.

## Tasks

- [ ]

## Verify

- [ ] The reproduction above no longer reproduces
- [ ] A regression test covers it
- [ ] `pnpm verify`
