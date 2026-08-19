# Sadhana Yog Agentic Development Environment

Status: research briefing and evaluation, not an approved architecture decision  
Owner: engineering  
Last-reviewed: 2026-08-19  
Evidence cutoff: repository state inspected on 2026-08-19

## Executive overview

Sadhana Yog is building an unusually explicit **repository-native operating system for AI-assisted development**. It is not a standalone agent platform. It is a set of durable, reviewable repository artifacts that turn otherwise ephemeral agent context into governed engineering work:

```text
intent and constraints
  → instructions + architecture + discovery evidence
  → dependency-aware Markdown issue
  → bounded implementation and verification
  → review / human gates
  → decisions, postmortems, and updated documentation
  → durable context for the next agent
```

The central idea is that agents should work from the same versioned sources as people: Markdown, code, tests, Git, and deterministic local tools. `AGENTS.md` routes an agent to authority. `docs/` separates types of knowledge. `.agents/notes/` holds decision rationale through a lifecycle. `docs/issue-tracking/` provides a dependency graph and work state that travel with code. Scoped instructions and skills convert high-risk architectural rules into task-local prompts. CI turns a subset of those claims into repeatable checks.

This is a strong foundation for a small, security-sensitive product with agents working in the repository. It is deliberately optimized for traceability, local/offline operation, low external-tool dependence, and human control of irreversible decisions—not for maximum unattended autonomy or a large multi-team portfolio.

There is an important maturity distinction. The repository is at its engineering-foundation stage: the agentic governance system, app shells, tracker, and CI are materially present, while most domain, production operations, migrations, product documentation, postmortems, and implemented decisions are planned rather than accumulated experience. Therefore this document labels evidence carefully:

| Evidence label | Meaning in this document |
|---|---|
| **Observed** | Directly present in code, configuration, a checked-in document, or a command run during this study. |
| **Documented intent** | A rule or target described in a repository authority, but not necessarily enforced or yet used. |
| **Inference** | Interpretation of multiple observed artifacts; it is not a repository policy. |
| **Recommendation** | A proposed improvement, not current behavior or an approved decision. |

## Design philosophy reconstructed from evidence

The environment appears to be built around the following principles.

1. **Put working context next to work.** Issues, decisions, documentation, scripts, and code share a repository and a Git history. This avoids making an agent depend on a proprietary tracker API, a prompt archive, or a human's private memory.
2. **Make authority typed rather than monolithic.** Executable behavior belongs to code and tests; intended behavior, architecture, work state, and decision rationale have different homes. The root instruction explicitly says contradictions between them are defects, not choices an agent may silently resolve.
3. **Constrain agents by blast radius, not by blanket distrust.** Agents may handle low-risk, local, deterministic work; people retain decisions affecting product behavior, production state, secrets, identity, destructive action, and durable architecture.
4. **Convert plans into a graph of executable work.** The tracker encodes dependencies and task state rather than leaving a roadmap as prose an agent must reinterpret each session.
5. **Prefer small, reviewable technology and process surfaces.** Markdown/Node/Git are preferred over a remote work-management dependency; a modular monolith is preferred over distributed operational machinery; skills are intentionally concise rather than encyclopedic.
6. **Keep the backend authoritative and safeguards non-negotiable.** This is product architecture, but it also shapes agent behavior: agents are told not to weaken tests, turn client checks into authorization, use production mutations, or bypass security controls.
7. **Treat learning as a first-class engineering artifact.** Agent Notes record choices; postmortems translate systemic failures into corrective work; issues and docs are expected to evolve with code.
8. **Preserve legacy knowledge before rewriting it.** The discovery baseline and roadmap prevent a coding agent from treating an existing product as an underspecified UI mockup.

The likely unifying goal (inference) is to make an agent's next correct action discoverable, bounded, and auditable with ordinary repository tools.

## Repository and knowledge architecture

### Authority map

The root [`AGENTS.md`](../../AGENTS.md) is the routing layer. It gives the following hierarchy, reproduced conceptually rather than as a second source of truth:

| Knowledge type | Canonical location | Function in an agent workflow |
|---|---|---|
| Executable behavior | `apps/`, `packages/`, tests | What the system demonstrably does now. |
| Intended technical architecture | [`engineering-foundation.md`](engineering-foundation.md) | Boundaries, quality rules, planned platform design, and agent authority. |
| Decision rationale | `.agents/notes/implemented/` | Why a shipped material choice exists. |
| Proposed choices | `.agents/notes/proposed/` | Input to review; explicitly not authority. |
| Work lifecycle | [`docs/issue-tracking`](../issue-tracking/README.md) | What may be picked up, dependencies, acceptance evidence, and progress. |
| Product language and behavior | `docs/product/` once Stage 2 exists | Terms, workflows, and parity requirements. |
| Legacy evidence | `docs/discovery/` | Observed behavior to preserve or explicitly retire. |
| Failure learning | `docs/postmortems/` | Root causes, remediation, and guard updates for qualifying incidents. |

[`docs/README.md`](../README.md) adds ownership and update triggers. This is valuable because an agent does not merely find a document; it can tell whether it owns product language, a deployment procedure, a schema policy, or a temporary implementation detail.

### Physical map and information flow

```text
README.md ── product purpose and bootstrap
AGENTS.md ── authority, safety, required reading, lifecycle
   │
   ├── docs/discovery ───── observed legacy evidence ────────┐
   ├── docs/architecture ─ intended system / guardrails       │
   ├── docs/product ────── future canonical behavior          │
   ├── docs/{api,database,security,testing,operations} ───────┼─→ issue.resource
   ├── docs/roadmap ────── staged plan                         │
   ├── docs/issue-tracking ─ dependency DAG + status + proof ─┤
   ├── .agents/notes ──── decision lifecycle                   │
   └── docs/postmortems ─ systemic failure learning ──────────┘
                  │
                  └─ implementation in apps/ and packages/
                         → focused tests + pnpm verify + review evidence
```

The `resource:` field on each issue intentionally connects execution back to the document that owns design. The tracker states that a guide wins when it conflicts with an issue. That reduces the common agent failure mode of treating a stale ticket as higher authority than an approved design.

### Agent-specific ecosystem

`.agents/` is compact and purpose-specific:

| Element | Observed role | Agent/human benefit |
|---|---|---|
| [`.agents/README.md`](../../.agents/README.md) | Entry point to notes and skills. | Fast orientation without another handbook. |
| [`.agents/notes/`](../../.agents/notes/README.md) | ADR-like lifecycle: `proposed`, `implemented`, `rejected`, `archived`, split by class. | Preserves rationale and prevents proposals becoming accidental authority. |
| [`.agents/skills/`](../../.agents/skills) | Twelve concise project workflow triggers, e.g. `work-issue`, `change-d1-schema`, `review-security-privacy`. | Supplies task-type reminders at point of use. |
| scoped `AGENTS.md` | API, web, mobile, database, content, tracker, and notes rules. | Reduces irrelevant global context and makes local invariants visible. |

The intended precedence is nearest scoped instruction over root instruction; root over informal chat memory. This is a pragmatic context-compression strategy: agents receive a short universal safety kernel, then only the domain-specific instructions for files they touch.

## Component analysis

### Root and scoped instructions

**What and why.** The root `AGENTS.md` is a conductor, not a replacement architecture document. It defines safety stops, the source-of-truth map, mandatory reading, lifecycle, and validation. Scoped files add concise local invariants: for example API responses cannot expose persistence rows, web route guards are UX rather than authorization, Flutter DTOs cannot reach widgets, and D1 work must use reviewed SQL.

**Problem solved.** A general coding agent otherwise starts with an arbitrary subset of source files, may conflate UX with security, or make a locally plausible but globally invalid change. The instructions offer a discovery algorithm and explicit escalation boundaries.

**Information flow.** An issue names relevant architecture resources; root instructions send the agent to the issue and its blockers; scoped instructions refine implementation constraints; tests and verification return evidence to the issue.

**Assumptions and limits.** This assumes agents discover the nearest instruction before editing and can distinguish “guidance” from enforced policy. It does not mechanically prevent editing outside scope. The required path `.agents/notes/implemented/` is currently absent, so a literal implementation agent would encounter a missing mandatory-reading location. That is an observed bootstrap gap, not evidence that the policy is wrong.

### Agent Notes / decision records

**What and why.** Agent Notes are lifecycle-managed ADRs under `.agents/notes/<lifecycle>/<class>/YYYY-MM-DD-<topic>.md`. Their rule set requires a record when behavior, architecture, shared contracts, process, testing strategy, or a durable format changes. Proposed notes list problem, proposal, rationale, alternatives, affected components, and related records. Implemented notes additionally require consequences, implementation, and verification.

**Problem solved.** Coding agents readily rediscover a technical choice without discovering why alternatives were rejected. Separating proposed from implemented prevents “a well-written draft” from acquiring accidental authority. Immutable rejected and archived notes preserve negative knowledge.

**Mechanism and enforcement.** `tools/ci/lint-decisions.mjs` checks note heading and status requirements, including archived dates. The human-review rule for high-impact transitions is documented, and `.github/CODEOWNERS` assigns `.agents/notes/` to the human owner.

**Current state.** Five proposed notes exist (Worker modular monolith, Vite SPA, REST/OpenAPI, D1/SQLite, and Markdown tracking); no implemented, rejected, or archived note directory exists. These choices should therefore be treated as proposals, even where the current foundation and code point in the same direction.

**Limit.** The linter validates document shape, not unique IDs, alternative quality, cross-links, whether an index is complete, or whether a human actually approved a transition. [`decisions.md`](decisions.md) calls itself a generated/readable index, but no index-generation tool was found; it is currently a manually maintained derivative. These are concrete drift risks.

### Git-native issue tracker

**What and why.** `docs/issue-tracking` is a Markdown issue store and local board. Each `SY-NNNN.md` file has YAML front matter and a task body; `config.yml` supplies the schema; `track.mjs` is parser, validator, CLI, board server, and exporter. It uses an OKF 0.1 profile and preserves unknown front-matter keys.

**Problem solved.** It makes work state versioned, branchable, reviewable, offline, readable by agents without tokens, and co-committable with code. The Board is explicitly a view, not a second database. `blocked_by` captures build order as a DAG and `pnpm tracker:next` answers the key operational question: what is unblocked now?

**Observed operating data.** On the inspected revision, `tracker:lint` reported 152 issues, 21 projects, and no warnings/errors. `tracker:stats` showed one `ready` issue (`SY-0001`), eleven `in_review`, and 140 `backlog`. `tracker:next` returned only `SY-0001`. This means the workflow can focus an agent rather than leaving it to choose among 152 roadmap items.

**What an agent gains.** A specific unit of work has scope, architecture references, acceptance criteria, testing/security/documentation requirements, blockers, and a status protocol. A person gains reviewable historical intent and avoids a separate issue update after a code change.

**What is enforced.** The lint command checks ID/file consistency, enums, links, project/cycle/member references, exclusive tag groups, missing blocker/duplicate rationale, ready issues with open blockers, dependency and parent cycles, and `done` completion evidence (checked Acceptance Criteria plus Review Evidence). Asymmetric `blocked_by`/`blocks` relations are errors. Writes that set `blocked_by` mirror `blocks` on the peer. `next` returns only unblocked `ready` issues; `next --all` lists unblocked triage/backlog/todo. `timestamp` is refreshed by tracker writes, and `index.md` is generated by command.

**Remaining gaps.** Ownership, independent review, and human sign-off are still social contracts: lint does not require an approver field to close. One-agent file reservation has no lock. `done` now refuses missing acceptance/evidence, but it does not prove that a human actually reviewed the change.

### Architecture foundation, roadmap, and discovery

**What and why.** The engineering foundation is an unusually detailed prospective system specification: boundaries, security posture, data, contracts, testing, operations, documentation, agent authority, and staged migration. The roadmap translates it into twenty stages and issue work packages. Discovery records read-only observations of legacy applications and their source revisions.

**Problem solved.** The combination prevents agents from treating a rewrite as permission to redesign behavior. It also keeps technical design in a guide and work scheduling in issues, reducing duplicated specs.

**Interaction.** The tracker’s projects/cycles mirror roadmap stages. Issues point back via `resource:`. `model-domain` sends agents to discovery evidence before schema/API work. The foundation’s Section 27 gives the intended end-to-end agent workflow and Section 26 defines done/review criteria.

**Limit.** The foundation labels itself “Proposed foundation for human approval”; product documentation is still placeholder; discovery has one baseline document and several planned inventories. It is a rich future model, not a replacement for accepted domain behavior. Its 32 sections also create a significant context-load risk if agents read it indiscriminately rather than following section citations.

### Skills

**What and why.** Skills are concise task classifiers and checklists. Their triggers map directly to product risk domains: modelling, schema changes, API changes, client features, storage, security, review, and release/incident work.

**Problem solved.** A generic “implement the issue” routine under-specifies migration, object lifecycle, cross-platform parity, and security review. Skills put the smallest relevant reminder set in the agent’s working context.

**Limit.** Most project `SKILL.md` files are 5–10 lines and do not link to deeper instructions despite the foundation’s intended design saying they should. They contain high-value constraints but lack command sequences, artifact templates, decision criteria, and machine-readable inputs/outputs. Their reliability therefore depends greatly on the agent already knowing how to turn prompts such as “negative authz tests” into work.

### Verification, CI, and review scaffolding

**What and why.** `pnpm verify` composes tracker lint and smoke test, documentation/decision lint, secret scan, import-boundary scan, lint, types, tests, build, and generated OpenAPI drift. CI runs that TypeScript verification job plus Flutter analysis/tests. The PR template asks for issue, verification, security, and rollback evidence. CODEOWNERS marks high-risk paths human-owned.

**Problem solved.** It transforms parts of the written environment into reproducible feedback and normalizes evidence capture. It also makes a single command the agent’s final local quality gate.

**Observed limits.** Documentation lint only verifies that required docs exist and Markdown links resolve; it does not check owners, last-reviewed dates, stale statuses, required document metadata, or semantic consistency. The secret scan detects only a narrow set of private-key/AWS-key patterns and explicitly reports success if `rg` is unavailable. The boundary check is a source-regex scan, not a semantic import graph. CODEOWNERS expresses ownership but its enforcement depends on unobserved GitHub branch-protection settings. The tracker smoke test needs a child Node process and failed in this restricted execution sandbox with `spawnSync node EPERM`; its direct tracker commands otherwise worked. This is environmental evidence, not a project-test failure.

### Postmortems and organizational learning

**What and why.** The postmortem README provides a clear threshold and template for production/security/privacy/data-loss incidents, failed migrations, prolonged outages, and repeatedly escaped systemic defects. Required sections ask for safeguards that failed, recovery/reconciliation, corrective issues, lessons, and guard updates; language must be blameless and non-sensitive.

**Strength.** The template is oriented toward changing controls, not narrating blame. Combined with issue links and decisions, it could create a high-quality closed loop from escape → cause → remediation → lasting instruction/test/runbook change.

**Current state and limit.** No postmortem files exist, which is appropriate for a foundation without production behavior but leaves the learning loop untested. There is no tooling that requires corrective issue links, verifies their completion, extracts recurring themes, or confirms that a prevention/detection guard was actually changed. The loop is designed, not yet operationalized.

## Coherent system model: a repository-native agent operating system

The environment can be understood as six interacting planes.

| Plane | Main artifacts | Primary question answered | Feedback output |
|---|---|---|---|
| Orientation | root/scoped `AGENTS.md`, README, docs map | “What rules and sources apply here?” | Correctly scoped context acquisition. |
| Knowledge | discovery, architecture, product, API/security/testing/ops docs | “What is true, intended, or known?” | Updated canonical documentation. |
| Decision | Agent Notes and decisions index | “Why is this choice in force or still unresolved?” | Proposed/implemented/rejected historical record. |
| Work control | roadmap, projects, issues, DAG, board | “What may happen next, by whom, with what proof?” | Status and completion evidence tied to code. |
| Execution | apps, packages, content, local tooling | “What changed?” | Tests, artifacts, diff, and implementation evidence. |
| Assurance and learning | `verify`, CI, review, postmortems, runbooks | “Was it safe/correct, and what changes after failure?” | Guard improvements and new bounded work. |

### Persistent memory strategy

Rather than asking an LLM to remember project history, the repository externalizes memory by **durability and authority**:

- Brief, always-read policy lives in root instructions.
- Local rules live next to the code or documents they govern.
- Long-lived architectural rationale is lifecycle-separated from unapproved ideas.
- Execution history travels with issue Markdown and Git.
- Legacy facts are separated from target design.
- Failure learning has a dedicated record with links to corrective work.

An agent should not load all of this. The intended progressive disclosure path is: root/scoped instructions → ready issue/parent/blockers → cited foundation sections → applicable API/schema/security documents → actual code/tests/history. Skills only enter when the work category requires them. This produces useful context compression while preserving a route to deeper detail.

### Intended end-to-end workflow

1. **Receive or select work.** For autonomous implementation, run `pnpm tracker:next`; do not infer priority from a roadmap list. For a named issue, inspect status, parent, and every blocker.
2. **Acquire authority.** Read root and nearest scoped instructions, the issue’s `resource`, relevant foundation sections, implemented notes if present, and touched-area docs. Treat a material contradiction as a defect requiring an explicit record/human decision.
3. **Assess authority and risk.** Use issue tags and scope to distinguish `agent-ok` work from human-gated auth, schema, secrets, deploy, data, or design work. Stop when the action crosses the root safety boundary.
4. **Plan a smallest coherent slice.** State assumptions; preserve observed legacy behavior unless approved otherwise; identify tests, documentation, migration/recovery, and review consequences. Create a linked issue for newly discovered out-of-scope work.
5. **Claim and bound work.** The documented process moves the owned issue to `in_progress`, names branch/file scope, and lets one agent own it at a time.
6. **Implement with local invariants.** Apply scoped rules and the relevant skill. Keep server authority, boundaries, privacy, generated output, and non-destructive behavior intact.
7. **Verify.** Run focused checks first, then `pnpm verify` and Flutter checks when applicable. Record actual commands/results rather than claiming success.
8. **Self-review and synchronize memory.** Inspect the diff; update code, tests, generated artifacts, docs, notes, and issue checkboxes in the same change. Move to `in_review`, not `done`, when evidence or human approval remains.
9. **Independent review and human gate.** Review in the documented order: intent → architecture → data/authz/security → behavior → tests → operations → maintainability. Protected and high-blast-radius changes require a person.
10. **Close and learn.** Mark done only with acceptance evidence. For qualifying escapes, create a postmortem and corrective issues that improve tests, guards, docs, skills, or runbooks.

This is an effective human-agent collaboration model because humans set direction, approve durable/irreversible changes, and judge product/operational evidence; agents perform evidence gathering, bounded implementation, deterministic checks, documentation updates, and proposal drafting.

## End-to-end example using actual mechanisms

### Example: a ready low-risk foundation task

Suppose an agent is asked to work `SY-0002` after its parent Stage 0 has been properly advanced. The actual process would be:

```text
human/agent request
  → pnpm tracker:show SY-0002
  → inspect SY-0002.blocked_by and parent, then root AGENTS.md
  → read docs/discovery/repository-baseline.md and cited foundation sections
  → decide whether this is read-only discovery (no remote/raw-data access)
  → move own issue to in_progress through tracker CLI
  → inspect legacy copies and record revision/path/observation method
  → update only the discovery evidence and check issue criteria with proof
  → pnpm tracker:lint + pnpm docs:lint (+ appropriate generator checks)
  → self-review citations/redaction; move to in_review
  → human reviews evidence and signs off before downstream domain work
```

The key is that the agent does not “implement a feature”; it creates a trusted behavioral baseline. It must not copy real user data into Git or prompts. This uses the environment’s safety gate, discovery separation, issue DAG, tracker lint, and human acceptance model as one system.

### Example: a future schema/API vertical slice

For a future attendance change, an agent would begin with `model-domain`, then use `change-d1-schema` and `build-worker-api`; web/mobile changes invoke their relevant skills and eventually `audit-accessibility-parity`. The evidence path becomes:

```text
approved domain language/invariants
  → proposed/implemented decision when durable choice changes
  → migration issue with human gates and reviewed SQL
  → contract + server authz/tenant negative tests
  → web/mobile state and accessibility tests
  → parity matrix / review evidence
  → issue completion and compatible release/rollback record
```

This is a good illustration of vertical-slice thinking: shared contracts, server authority, clients, tests, and documentation evolve together rather than one client becoming an independent source of business rules.

## Strengths

1. **Clear separation of kinds of truth.** The source-of-truth table and “contradictions are defects” rule are unusually important for LLMs, which otherwise privilege the most recent text they happen to see.
2. **Git-native work graph.** The Markdown issue system gives agents a dependency-aware queue without external credentials. It is transparent, portable, grep-friendly, and reviewable beside code.
3. **Practical authority boundaries.** The environment gives agents room to act while reserving irreversible, product, security, and production decisions for humans.
4. **Strong security framing at the point of implementation.** “Backend authoritative,” tenant-scoped repositories, no production migrations, no weakening tests, and privacy/data stops appear in multiple relevant places.
5. **Deliberate context layering.** Root plus narrow scoped instructions are more likely to be read and followed than a giant all-purpose prompt.
6. **Excellent prospective traceability.** Issues cite architecture; roadmap stages create order; notes explain rationale; PR template requests verification/security/rollback; CI checks a useful baseline.
7. **Legacy-preservation orientation.** Discovery and characterization before rewrite protect the product’s real operational knowledge.
8. **Healthy treatment of failure.** The postmortem template ties systemic learning to changed safeguards, not blame.
9. **Minimal external dependency.** A local tracker and ordinary shell/Git tools make the environment robust to agent permissions, API quotas, and tool availability.

## Weaknesses, risks, and likely agent failure modes

### Evidence/authority gaps

- **Foundation versus current state can be confused.** The same detailed document describes current shells, proposed architecture, and future controls. Agents may implement a proposed choice as if approved unless they respect the status line and Note lifecycle.
- **The mandatory implemented-notes directory is absent.** This produces an avoidable first-task ambiguity.
- **The architecture decisions index is not generated despite calling itself generated.** It can silently diverge from Notes.
- **No automated contradiction detection exists.** “Contradictions are defects” is excellent policy but identifying semantic conflicts across issues, roadmap, decisions, and docs is manual.

### Workflow enforcement gaps

- Tracker lifecycle and Definition of Done are mostly norms beyond `done` evidence. The CLI still allows other state jumps; independent review and an approver field are not machine-checked.
- `next` is ready-only by default. `next --all` still lists unblocked triage/backlog/todo; agents must not treat `--all` as permission to start unspecified work.
- One-agent ownership and bounded file reservation have no lock, lease, or merge-conflict protocol; concurrency will rely on social coordination.

### Knowledge maintenance and context risks

- “Status/living/last-reviewed/owner” metadata has no freshness validation. The amount of up-front architecture prose can become stale and expensive to read.
- Product and operations documentation are acknowledged placeholders. An agent may find an elaborate architecture path but insufficient current acceptance behavior.
- Skills are too terse to independently standardize complex task execution. They are trigger labels more than executable playbooks.
- The roadmap is comprehensive but very large relative to the active implementation. It may create planning certainty that has not yet been validated by discovery or users.

### Verification and organizational risks

- Documentation and secret scanning are intentionally lightweight, so a green `pnpm verify` must not be read as comprehensive documentation/security assurance.
- CODEOWNERS only expresses expected review; repository branch settings and audit evidence are outside this repository.
- No postmortem has exercised the corrective-learning loop, and no mechanism checks whether corrective issues actually close the causal gap.
- Tracker fixture tests import `track.mjs` in-process so they do not depend on spawning a child Node process. Remaining sandbox/EPERM risk is limited to other verify steps that still spawn.

## Missing or underdeveloped capabilities

These are not claims about existing behavior.

| Capability | Why it matters here | Current indication |
|---|---|---|
| Machine-checkable lifecycle policy | Prevent premature closure and unsafe state transitions. | Status mutation is permissive; evidence is body prose. |
| Decision-index and cross-reference generation | Avoid stale decision/issue/roadmap links. | Decision index appears manually maintained. |
| Documentation freshness/semantic checks | Keep “living” docs trustworthy. | Link/existence lint only. |
| Agent work-claim protocol | Reduce simultaneous agents editing the same issue/files. | One-agent rule is documented only. |
| Structured evidence schema | Make test, review, human approval, and rollback proof queryable. | Evidence is free-form Markdown. |
| Closed-loop failure analytics | Detect recurring control failures and prove remediations. | Postmortem template exists; no aggregation or enforcement. |
| Evaluation telemetry | Demonstrate that this system improves agent success/cost. | No baseline experiments or task metrics found. |
| Retrieval manifest | Let agents fetch the minimal correct context by task type. | Instructions manually route agents; citations are free-form. |
| Policy-as-code for protected operations | Make human gates robust outside provider settings. | CODEOWNERS and prose depend on GitHub/admin configuration. |

## Improvement opportunities, prioritized

| Priority | Improvement | Impact / effort / risk | Expected result |
|---|---|---|---|
| 1 | Done for SY-0013: `next` is ready-only by default; `blocked_by` writes mirror `blocks`; asymmetry is a lint error. Remaining: optional `next --all` discipline. | High / done / low. | The executable queue matches the documented pickup rule. |
| 2 | Partial for SY-0013: `done` requires acceptance checklist and review evidence. Remaining: restrict an agent’s normal transition to `in_review`; support explicit approver metadata. | High / medium remaining / medium workflow friction. | Stronger truthful work history and safer autonomy. |
| 3 | Create empty lifecycle directories (with `.gitkeep`/README) and generate `docs/architecture/decisions.md` from Notes in CI. | Medium–high / low / low. | Removes a mandatory-reading hole and index drift. |
| 4 | Add a compact `agent-context` command or task manifest. It should resolve issue → scoped instructions → Note paths → cited docs/sections → validation commands, without dumping every foundation section. | High / medium / low. | Less repeated discovery and lower token consumption. |
| 5 | Expand each skill into a short operational contract: inputs, preconditions, required artifacts, stop conditions, commands, and outputs; link to source docs. | High / medium / low. | More repeatable high-risk work across different agents. |
| 6 | Strengthen documentation lint: front-matter/status/owner/date checks, approved-vs-proposed status checks, required links, and a focused stale-review report. | Medium / medium / low. | Better confidence that routing context remains valid. |
| 7 | Add a lightweight, Git-native work claim (`assignee`, branch, timestamp, optional lease) plus a conflict protocol. | Medium / medium / medium. | Safer parallel agent work without a central service. |
| 8 | Define a structured evidence block in issues (commands, result, artifact paths, reviewer, approval) while retaining narrative Markdown. | Medium / medium / medium migration. | Queryable auditability and automated closure checks. |
| 9 | Establish a postmortem-to-guard rule: each corrective issue declares a target control/test/doc; closure checks that the guard changed; periodically review recurrence. | Medium / medium / low. | Converts incidents into demonstrable reliability gains. |
| 10 | Run controlled evaluations on representative tasks with/without the environment. Track time-to-correct-context, rework, escaped-review findings, verification success, and token/tool cost. | High strategic value / medium–high / low production risk. | Evidence for what to retain, simplify, or automate. |

## SOTA evaluation framework

Give the following protocol to an independent advanced coding agent or developer-experience researcher. Require evidence links, not generic judgments.

### A. Authority and retrieval

1. For five representative issues, can the evaluator identify the applicable instructions, design authority, decisions, and acceptance criteria within a bounded time/token budget?
2. Does the task’s cited context omit any necessary source or include material irrelevant to the task?
3. When code, issue, proposed note, and architecture text conflict, does the environment reliably lead to escalation rather than silent selection?
4. Are “proposed,” “implemented,” “placeholder,” and “observed” distinguishable to an agent without external explanation?

### B. Execution reliability

1. Does `tracker:next` choose only work that policy actually permits?
2. Can an agent complete a low-risk issue end-to-end using only local tools and record verifiable evidence?
3. Can it avoid scope creep by filing/linking a discovered issue rather than folding extra work into the current change?
4. Do scoped instructions prevent known errors in API authorization, D1 migrations, client/server separation, and content handling?

### C. Governance and safety

1. Which prohibited operations are prevented by code/configuration versus merely requested by prose?
2. Can a branch reach `done` or merge without human review/evidence for protected paths?
3. Are security, privacy, data, and release boundaries usable by agents rather than too broad or too vague?
4. Are GitHub protections, secret handling, and remote mutation gates independently verifiable?

### D. Memory and learning

1. Does a later agent understand why a material choice was made, including rejected alternatives?
2. Does the issue/code/document history preserve the right level of traceability without duplicating design?
3. Do postmortems cause tests, runbooks, instructions, or policy to improve—and can that change be traced?
4. Is the context maintenance burden lower than the repeated rediscovery it avoids?

### E. Measured experiments

For a small balanced task suite (documentation, web, API, schema, regression review), compare:

- Baseline: repository code plus a normal README.
- Current environment: all current routing, tracker, and verification artifacts.
- Candidate improved environment: current system plus proposed lifecycle/context improvements.

Measure successful first-pass completion, time to locate authoritative context, number/severity of review findings, incorrect autonomous actions, repeated-context tokens, verification pass rate, documentation drift, and human intervention time. Use blinded human review of outputs when practical. Qualitative interviews should ask whether the system made agents more predictable and developers more confident—not merely whether it added process.

## Proposed future architecture

The recommended evolution is **not** a replacement with an agent platform. Preserve the repository-native, human-gated, authority-separated model. Add a thin policy-and-evidence layer around it.

### Conceptual future model

```text
authoritative knowledge sources
  (code/tests, docs, notes, tracker)
      │
      ├─ generated context resolver ─→ task-specific agent brief
      ├─ policy engine ──────────────→ permitted state/action transitions
      ├─ validators ────────────────→ integrity, freshness, evidence checks
      └─ learning loop ─────────────→ postmortem controls and evaluation metrics
```

The resolver does not invent knowledge. It emits a compact manifest of exact files/sections and commands for an issue. The policy engine does not decide product questions; it prevents mechanical inconsistencies such as an unreviewed `done` state or unsymmetric dependency. The learning loop does not turn agents into autonomous incident commanders; it ensures postmortem actions become explicit work with a measurable guard.

### Practical repository shape

```text
.agents/
  context-profiles/          # declarative task-type retrieval rules
  skills/<name>/             # expanded input/precondition/output workflow contracts
  notes/{proposed,...}/
docs/
  agentic-environment/       # this evaluation, metrics, evolution log
  issue-tracking/
    evidence-schema.md       # structured but human-readable proof contract
    policies.yml             # transition/approval rules, if accepted
tools/agent/
  context.mjs                # resolve an issue to minimal authoritative context
  validate-evidence.mjs      # check state evidence and approvals
  index-decisions.mjs        # generate decision index and cross-reference report
  report-learning.mjs        # postmortem/action/guard linkage report
```

Adopt this incrementally. First fix contradictions between the documented and executable tracker behavior. Next automate obvious derivatives (decision index, context manifest, documentation health report). Only then add structured evidence and work claims, after testing them on a handful of real issues. Use evaluation data to remove controls that create friction without improving correctness.

## What should remain human-controlled as agents improve

More capable models should expand investigation, implementation, test generation, review assistance, and documentation maintenance—not erase accountability boundaries. Human approval should remain required for material product behavior, durable architecture, roles/retention, production/shared-data mutation, identity/DNS/CI permissions, secrets, legal/compliance statements, mobile signing/release, destructive cleanup, and acceptance of residual risk. The current root safety rules are the correct durable core to preserve.

## Conclusion

This repository has already assembled the hard conceptual pieces of an agentic development environment: authority routing, durable context, executable work ordering, scoped rules, lifecycle rationale, verification, human gates, and a path for organizational learning. Its strongest characteristic is that it treats agents as contributors to a governed engineering system rather than as chat interfaces with code access.

The next iteration should prioritize **alignment between prose and enforcement**, then **minimal-context retrieval and structured evidence**, and finally **measured validation of the system itself**. Those changes would retain the current system’s clarity and portability while making its autonomy claims more reliable and its value empirically demonstrable.
