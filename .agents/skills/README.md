# Skills

Foundation §18.3 set. Each directory is an [Agent Skills](https://agentskills.io/specification)
package: `SKILL.md` with `name` and `description`. Do not add a thirteenth
skill without changing that list.

| Skill | Invoke when |
|---|---|
| [work-issue](work-issue/SKILL.md) | Named `SY-NNNN` issue or next unblocked tracker item |
| [record-decision](record-decision/SKILL.md) | Agent Note / ADR |
| [model-domain](model-domain/SKILL.md) | Terminology, invariants, workflows |
| [change-d1-schema](change-d1-schema/SKILL.md) | Drizzle / D1 migration |
| [build-worker-api](build-worker-api/SKILL.md) | Worker route or use case |
| [build-flutter-feature](build-flutter-feature/SKILL.md) | Flutter slice |
| [build-web-feature](build-web-feature/SKILL.md) | TanStack web slice |
| [handle-r2-object](handle-r2-object/SKILL.md) | Private R2 lifecycle |
| [review-security-privacy](review-security-privacy/SKILL.md) | Threat-based review |
| [audit-accessibility-parity](audit-accessibility-parity/SKILL.md) | Cross-platform a11y/parity |
| [review-change](review-change/SKILL.md) | Independent review before merge |
| [manage-release-incident](manage-release-incident/SKILL.md) | RC, production, rollback, postmortem |

Validate: `pnpm skills:lint` and `pnpm skills:test`.
