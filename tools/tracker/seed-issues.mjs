#!/usr/bin/env node
/**
 * Deterministic seeder for roadmap issues (Section 23 of the implementation roadmap).
 * Re-running overwrites generated bodies but preserves Implementation Notes if present.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "docs/issue-tracking/issues");

const STAGES = {
  0: {
    title: "Discovery and baseline",
    objective:
      "Create an evidence-backed, signed-off behavioral baseline from the two legacy applications without modifying them.",
    testing:
      "Run generator consistency checks and record results without fixing them. Render workflows, inspect DOM/accessibility, and begin sanitized characterization vectors.",
    security:
      "Redact names, contacts, health notes, invoice identifiers, keys and URLs. Raw exports stay out of Git and agent prompts.",
    docs: "Documentation is the deliverable and must cite revision, path, and observation method.",
    rollback:
      "Documentation-only; revert incorrect baseline through review while preserving evidence history.",
    repo: "docs/discovery/* only. No database, API, Flutter, web, or infrastructure change.",
    architecture:
      "docs/architecture/engineering-foundation.md §2–3, §28; docs/roadmap/implementation-roadmap.md Stage 0",
  },
  1: {
    title: "Repository and engineering foundation",
    objective:
      "Create the runnable monorepo skeleton, governance, agent system and CI foundation without implementing product behavior.",
    testing:
      "Clean checkout bootstrap, deterministic format/lint/test/build smoke, tracker fixtures, skill trigger tests.",
    security:
      "CI permissions default read; fork PRs receive no secrets; artifacts exclude .dev.vars, D1/R2 data and signing files.",
    docs: "Document setup, commands, generated files, dependencies, troubleshooting, environment matrix and agent authority.",
    rollback:
      "Scaffold/config changes are reversible. Keep foundation changes separated by concern.",
    repo: "Target tree in foundation §5. Empty Drizzle package and local D1 binding only. Health placeholder only.",
    architecture:
      "docs/architecture/engineering-foundation.md §5–6, §14–20; docs/roadmap/implementation-roadmap.md Stage 1",
  },
  2: {
    title: "Domain modeling",
    objective:
      "Establish canonical business language, entities, invariants, states, ownership and permissions before persistence or feature API design.",
    testing:
      "Validate each invariant against sanitized legacy examples: DST, duplicate attendance, expired packages, partial payments, void invoices.",
    security:
      "Conduct IDOR/data-class review before finalizing ownership. Permission denial examples are first-class.",
    docs: "Glossary terms must be used consistently by roadmap, issues and later contracts.",
    rollback: "Revise proposed models/ADRs before implementation.",
    repo: "docs/product and docs/architecture only. Conceptual ER model. No migrations.",
    architecture: "docs/architecture/engineering-foundation.md §6.2, §13.2; Stage 2 of the roadmap",
  },
  3: {
    title: "Database foundation",
    objective:
      "Implement a D1-compatible Drizzle schema, migration discipline and synthetic data foundation that enforce the approved model.",
    testing:
      "Fresh and upgrade migrations, PRAGMA foreign_key_check, constraint failures, tenant-scoped negatives, EXPLAIN QUERY PLAN.",
    security:
      "No real personal data. Every tenant table includes organization ownership. Destructive SQL is a review failure.",
    docs: "Data dictionary records purpose, sensitivity, owner, retention, nullability, constraints and API exposure.",
    rollback:
      "Pre-production recreate local DB. Production later uses forward repair or human-approved restore.",
    repo: "packages/db schema, reviewed SQL migrations, tests/fixtures. No production DB.",
    architecture: "docs/architecture/engineering-foundation.md §10; Stage 3",
  },
  4: {
    title: "Backend foundation",
    objective:
      "Create the secure Worker request pipeline, module boundaries, database access, error/logging conventions and foundational API behavior.",
    testing:
      "Malformed JSON, oversized bodies, cross-org IDs, stale versions, duplicate idempotency, disallowed origin, redaction.",
    security:
      "Never treat route guard as authorization. Repository signatures require organization scope. Logs forbid body/token dumping.",
    docs: "Document middleware order, module boundary, errors, auth policy seam and local test strategy.",
    rollback:
      "Revert Worker foundation before production; DB changes remain independently compatible.",
    repo: "apps/api src and tests. /api/v1 skeleton, /health/live, protected readiness.",
    architecture: "docs/architecture/engineering-foundation.md §9, §12; Stage 4",
  },
  5: {
    title: "Authentication and authorization",
    objective:
      "Deliver the smallest secure, invite-only identity system shared by web and mobile, with authoritative application permissions.",
    testing:
      "End-to-end login/logout/expiry/refresh/revocation. Matrix every protected route against roles and wrong organization.",
    security:
      "Validate issuer/audience/algorithm/JWKS. No client secret in web/mobile. No raw session in D1/logs. CSRF and PKCE.",
    docs: "Document provider configuration without secrets, identity mapping, permission matrix and recovery.",
    rollback: "Disable callbacks, revoke sessions/tokens. Never fall back to a shared access key.",
    repo: "Worker auth module, Flutter auth service, web auth routes, threat model, runbooks.",
    architecture: "docs/architecture/engineering-foundation.md §13; Stage 5",
  },
  6: {
    title: "R2 document storage",
    objective:
      "Implement an authorized, auditable document lifecycle without exposing buckets, credentials or client-chosen paths.",
    testing:
      "Unauthorized/cross-org IDs, traversal, HTML/SVG/PDF active content, mismatch/oversize, orphan and R2 failure.",
    security:
      "Bucket credentials never reach clients. Keys contain no PII. Signed capabilities never logged.",
    docs: "Document state machine, types/limits, safe rendering, cleanup, restore and operator evidence.",
    rollback: "Disable document routes. Bucket deletion is never an automated rollback.",
    repo: "apps/api documents module, R2 adapter, policy and runbooks.",
    architecture: "docs/architecture/engineering-foundation.md §11; Stage 6",
  },
  7: {
    title: "API and shared contract layer",
    objective:
      "Turn foundational route conventions into a reproducible language-neutral contract/client pipeline.",
    testing:
      "Schema examples, server conformance, web/Dart compile tests, fixture compatibility and generated diff review.",
    security:
      "OpenAPI reveals no internal schema or secrets. Security schemes never sample real tokens.",
    docs: "Document client regeneration, compatibility classification, deprecation and error handling.",
    rollback:
      "Revert additive spec/client change. Published breaking contracts require compatibility restoration.",
    repo: "packages/contracts, committed OpenAPI, Dart transport package, API conventions.",
    architecture: "docs/architecture/engineering-foundation.md §12; Stage 7",
  },
  8: {
    title: "Flutter application foundation",
    objective:
      "Build a maintainable, adaptive, accessible mobile shell that can receive vertical feature slices.",
    testing:
      "Bootstrap failure, DI, auth redirect, deep links, offline/timeout, text scale, screen size, semantics.",
    security:
      "No secret in the binary. Refresh material only in secure storage. Clear organization data on logout.",
    docs: "Document layer/import rules, state conventions, flavors/signing boundary and accessibility checklist.",
    rollback: "Revert shell package changes; identity/API remains independent.",
    repo: "apps/mobile lib/{app,core,features}, test harness, platform config.",
    architecture: "docs/architecture/engineering-foundation.md §7; Stage 8",
  },
  9: {
    title: "TanStack web application foundation",
    objective:
      "Build an accessible, responsive, authenticated TanStack SPA shell with deliberate server-state, form and error behavior.",
    testing:
      "Direct/deep URL, auth redirect, 404, offline notice, keyboard, modal focus, axe, reduced motion, mobile overflow.",
    security: "Same-origin cookie only. Route guard is UX. User content never reaches innerHTML.",
    docs: "Document route/query/form/component conventions, browser commands and accessibility protocol.",
    rollback: "Revert web artifact independently while API remains backward compatible.",
    repo: "apps/web src and e2e. Worker static asset/CSP integration.",
    architecture: "docs/architecture/engineering-foundation.md §8; Stage 9",
  },
  10: {
    title: "Feature migration",
    objective:
      "Migrate every approved Command Center capability as secured vertical slices with backend, D1, Flutter and web parity.",
    testing:
      "Characterization/domain/API/DB/client/E2E tests per slice; money/date/attendance fixtures; cross-org/role matrix.",
    security:
      "Protect health/finance/export data. Server-side authorization. No client-authoritative calculations.",
    docs: "Update feature inventory/parity, workflow, API, schema, security, test and operator docs with each slice.",
    rollback:
      "Flags/route compatibility permit slice disable; migrations remain backward compatible.",
    repo: "Module/feature code in all apps/packages. Additive migrations only.",
    architecture: "docs/architecture/engineering-foundation.md §3, §28; Stage 10",
  },
  11: {
    title: "Teaching Archive integration",
    objective:
      "Make the self-documentation journey a first-class, private, native cross-platform area while preserving no-media default.",
    testing:
      "Snapshot/schema/link/version tests, journey/ritual vectors, import repeatability, isolation/export/erase, a11y.",
    security:
      "Reflections private by default. No class recordings uploaded. Isolation and erase are tested.",
    docs: "Document content authoring/version/migration, privacy, navigation and user export/erase.",
    rollback: "Ship previous content manifest/client; retain server entries and compatible IDs.",
    repo: "content/teaching-archive, learning module/features, no R2 media implied.",
    architecture: "docs/architecture/engineering-foundation.md §2.2, §28; Stage 11",
  },
  12: {
    title: "Cross-platform feature parity",
    objective:
      "Convert feature parity into explicit, testable outcome equivalence across legacy, web, iOS and Android.",
    testing:
      "Matching scenarios with the same seed/API state. Include roles, wrong tenant, empty/loading/error, keyboard.",
    security:
      "Parity cannot weaken a platform's security. Native convenience never bypasses server controls.",
    docs: "Every difference links to an approved product decision or issue.",
    rollback:
      "Defer a whole coherent feature on all platforms; do not silently ship one-platform capability.",
    repo: "docs/product/feature-parity.md, shared scenario fixtures, audit reports.",
    architecture: "docs/architecture/engineering-foundation.md §6.1; Stage 12",
  },
  13: {
    title: "Testing completion",
    objective:
      "Close cross-cutting test gaps, establish stable release suites and prove migrations/security-critical workflows.",
    testing:
      "This stage's output is test evidence. Security negatives run without production credentials/data.",
    security: "No production data. Screenshots/traces are scrubbed.",
    docs: "Document how to reproduce every suite and diagnose flakes/failures.",
    rollback: "Revert unstable test infrastructure only with equivalent coverage.",
    repo: "Tests/fixtures/builders across apps/packages; coverage/risk matrix.",
    architecture: "docs/architecture/engineering-foundation.md §15; Stage 13",
  },
  14: {
    title: "Security hardening",
    objective:
      "Perform a dedicated threat-based release review, remediate findings and produce accepted residual risk without claiming compliance.",
    testing: "Reproduce and retest every finding; tenant fuzz; safe DAST against local/dev only.",
    security: "P0/P1 findings block release. Agents cannot waive them.",
    docs: "Document practices versus privacy requirements versus legal obligations.",
    rollback:
      "Never roll back to a known exploitable release; disable feature/access or forward-fix.",
    repo: "Refreshed threat model, hardened code/config/tests, residual-risk record.",
    architecture: "docs/architecture/engineering-foundation.md §22; Stage 14",
  },
  15: {
    title: "Observability and operations",
    objective:
      "Provide enough redacted evidence, alerting and runbooks to detect and diagnose failures without enterprise overhead.",
    testing: "Redaction tests; synthetic alert and dependency-failure drills.",
    security: "Health does not expose secrets/schema. Audit access is authorized.",
    docs: "Every alert links to a runbook and owner.",
    rollback:
      "Disable an unsafe event sink; do not disable security audit collection without a substitute.",
    repo: "Logging/alert config, runbooks, drill report.",
    architecture: "docs/architecture/engineering-foundation.md §23; Stage 15",
  },
  16: {
    title: "Backup and recovery",
    objective:
      "Implement, document and prove restoration of data, objects, configuration and operational access.",
    testing: "Quarterly restore drill with synthetic/dev or approved isolated copy.",
    security: "Backup is at least as sensitive as source. Encrypt, audit, separate credentials.",
    docs: "Backup policy, inventories, restore/disaster runbooks and drill evidence.",
    rollback:
      "Restore the pre-action bookmark where supported; document potential data loss before action.",
    repo: "Backup policy, scripts/workflow configs, inventories.",
    architecture: "docs/architecture/engineering-foundation.md §24; Stage 16",
  },
  17: {
    title: "CI/CD and environments",
    objective:
      "Turn CI foundations into an environment-isolated, review-gated promotion and mobile release pipeline.",
    testing: "Prove dev cannot bind prod IDs; untrusted PR has no secrets; rehearse rollback.",
    security: "Every production write requires human approval.",
    docs: "Document exact environment resource map without secret values.",
    rollback:
      "Worker version rollback with compatible schema; migrations use forward repair/restore gate.",
    repo: "Production workflows/config templates, environment inventory, SBOM artifacts.",
    architecture: "docs/architecture/engineering-foundation.md §16; Stage 17",
  },
  18: {
    title: "Production readiness",
    objective:
      "Demonstrate that functionality, security, quality, data migration, recovery, operations and ownership are ready.",
    testing:
      "Full release suite, assistive/device protocol, security retest, restore evidence, UAT, reconciliation.",
    security: "Freeze secret/config changes; verify user list/roles and recovery contacts.",
    docs: "Readiness document links immutable CI/deploy/build/issue evidence.",
    rollback: "No production change yet; defer launch or reduce coherent release scope.",
    repo: "Completed readiness/UAT/migration/architecture/security evidence.",
    architecture: "docs/architecture/engineering-foundation.md §26; Stage 18",
  },
  19: {
    title: "Initial production release",
    objective:
      "Execute a controlled, observable cutover and private release with verified data, clients and rollback readiness.",
    testing:
      "Scripted smoke with approved records. Do not test destructive operations on real records.",
    security: "No raw export in logs/artifacts. Revoke temporary access after closeout.",
    docs: "Record commands/results/timestamps without secrets and link exact artifacts.",
    rollback:
      "Abort before enabling writes if import mismatches. Legacy rollback only in the agreed window.",
    repo: "Release record/checklists/reconciliation. Production migrations are human-gated.",
    architecture: "docs/architecture/engineering-foundation.md §25, §28; Stage 19",
  },
  20: {
    title: "Post-release iteration",
    objective:
      "Operate a disciplined feedback, triage, maintenance, security and architecture-evolution loop.",
    testing: "Every bug includes regression coverage; remediations are verified.",
    security: "Sensitive feedback stays out of broadly readable issues. Re-evaluate retention.",
    docs: "Update docs in the same change as behavior.",
    rollback: "Revert individual compatible releases using normal controls.",
    repo: "Feedback/triage issues, health reviews, ADRs/postmortems/runbook updates.",
    architecture: "docs/architecture/engineering-foundation.md §21, §27; Stage 20",
  },
};

const EPICS = [
  ["SY-0001", "Stage 0 — Discovery and baseline", "P1", 0, null, []],
  ["SY-0008", "Stage 1 — Repository and engineering foundation", "P1", 1, null, ["SY-0002"]],
  ["SY-0018", "Stage 2 — Domain modeling", "P1", 2, null, ["SY-0007", "SY-0012"]],
  ["SY-0025", "Stage 3 — Database foundation", "P1", 3, null, ["SY-0024", "SY-0011"]],
  ["SY-0033", "Stage 4 — Backend foundation", "P1", 4, null, ["SY-0026", "SY-0031"]],
  [
    "SY-0041",
    "Stage 5 — Authentication and authorization",
    "P1",
    5,
    null,
    ["SY-0020", "SY-0036", "SY-0038"],
  ],
  ["SY-0049", "Stage 6 — R2 document storage", "P1", 6, null, ["SY-0030", "SY-0046"]],
  [
    "SY-0056",
    "Stage 7 — API and shared contract layer",
    "P1",
    7,
    null,
    ["SY-0035", "SY-0047", "SY-0055"],
  ],
  ["SY-0063", "Stage 8 — Flutter application foundation", "P1", 8, null, ["SY-0045", "SY-0060"]],
  [
    "SY-0071",
    "Stage 9 — TanStack web application foundation",
    "P1",
    9,
    null,
    ["SY-0044", "SY-0059"],
  ],
  ["SY-0078", "Stage 10 — Feature migration", "P1", 10, null, ["SY-0062", "SY-0070", "SY-0077"]],
  [
    "SY-0089",
    "Stage 11 — Teaching Archive integration",
    "P1",
    11,
    null,
    ["SY-0023", "SY-0062", "SY-0070", "SY-0077"],
  ],
  ["SY-0096", "Stage 12 — Cross-platform feature parity", "P1", 12, null, ["SY-0088", "SY-0095"]],
  ["SY-0101", "Stage 13 — Testing completion", "P1", 13, null, ["SY-0100"]],
  ["SY-0108", "Stage 14 — Security hardening", "P1", 14, null, ["SY-0100", "SY-0102"]],
  ["SY-0115", "Stage 15 — Observability and operations", "P1", 15, null, ["SY-0039"]],
  ["SY-0121", "Stage 16 — Backup and recovery", "P1", 16, null, ["SY-0054", "SY-0116"]],
  [
    "SY-0127",
    "Stage 17 — CI/CD and environments",
    "P1",
    17,
    null,
    ["SY-0107", "SY-0114", "SY-0126"],
  ],
  [
    "SY-0134",
    "Stage 18 — Production readiness",
    "P1",
    18,
    null,
    ["SY-0100", "SY-0107", "SY-0114", "SY-0120", "SY-0126", "SY-0133"],
  ],
  ["SY-0139", "Stage 19 — Initial production release", "P1", 19, null, ["SY-0138"]],
  ["SY-0146", "Stage 20 — Post-release iteration", "P2", 20, null, ["SY-0145"]],
];

const CHILDREN = [
  ["SY-0002", "Repository and deployment baseline", "Task", "P1", 0, "SY-0001", []],
  ["SY-0003", "Command Center feature/workflow inventory", "Task", "P1", 0, "SY-0001", ["SY-0002"]],
  ["SY-0004", "Legacy data and rule inventory", "Task", "P1", 0, "SY-0001", ["SY-0002"]],
  ["SY-0005", "Teaching Archive inventory", "Task", "P1", 0, "SY-0001", ["SY-0002"]],
  [
    "SY-0006",
    "Quality/security/accessibility baseline",
    "Spike",
    "P1",
    0,
    "SY-0001",
    ["SY-0003", "SY-0004", "SY-0005"],
  ],
  [
    "SY-0007",
    "Preservation and source-of-truth sign-off",
    "Spike",
    "P1",
    0,
    "SY-0001",
    ["SY-0003", "SY-0004", "SY-0005", "SY-0006"],
  ],
  ["SY-0009", "Workspace/toolchain scaffold", "Task", "P1", 1, "SY-0008", ["SY-0002"]],
  ["SY-0010", "Empty application/package scaffolds", "Task", "P1", 1, "SY-0008", ["SY-0009"]],
  ["SY-0011", "Code quality conventions", "Task", "P1", 1, "SY-0008", ["SY-0009"]],
  ["SY-0012", "Documentation and decision system", "Task", "P1", 1, "SY-0008", ["SY-0009"]],
  ["SY-0013", "Issue tracker", "Feature", "P1", 1, "SY-0008", ["SY-0012"]],
  [
    "SY-0014",
    "Agent instructions and skills",
    "Feature",
    "P1",
    1,
    "SY-0008",
    ["SY-0012", "SY-0013"],
  ],
  ["SY-0015", "MCP/tool configuration", "Task", "P2", 1, "SY-0008", ["SY-0009", "SY-0014"]],
  [
    "SY-0016",
    "CI foundation",
    "Feature",
    "P1",
    1,
    "SY-0008",
    ["SY-0010", "SY-0011", "SY-0012", "SY-0013", "SY-0014", "SY-0015"],
  ],
  ["SY-0017", "Developer bootstrap", "Task", "P1", 1, "SY-0008", ["SY-0010", "SY-0011"]],
  [
    "SY-0019",
    "Domain glossary/context map",
    "Task",
    "P1",
    2,
    "SY-0018",
    ["SY-0003", "SY-0004", "SY-0005", "SY-0012"],
  ],
  ["SY-0020", "Identity/permission model", "Task", "P1", 2, "SY-0018", ["SY-0006", "SY-0019"]],
  [
    "SY-0021",
    "Scheduling/participation invariants",
    "Task",
    "P1",
    2,
    "SY-0018",
    ["SY-0003", "SY-0004", "SY-0019"],
  ],
  [
    "SY-0022",
    "Finance/workflow invariants",
    "Task",
    "P1",
    2,
    "SY-0018",
    ["SY-0003", "SY-0004", "SY-0019"],
  ],
  [
    "SY-0023",
    "Teaching Archive domain/content model",
    "Task",
    "P1",
    2,
    "SY-0018",
    ["SY-0005", "SY-0019"],
  ],
  [
    "SY-0024",
    "Domain examples and parity skeleton",
    "Task",
    "P1",
    2,
    "SY-0018",
    ["SY-0020", "SY-0021", "SY-0022", "SY-0023"],
  ],
  [
    "SY-0026",
    "D1 schema conventions/harness",
    "Task",
    "P1",
    3,
    "SY-0025",
    ["SY-0009", "SY-0010", "SY-0011", "SY-0019", "SY-0024"],
  ],
  [
    "SY-0027",
    "Identity/catalog schema",
    "Feature",
    "P1",
    3,
    "SY-0025",
    ["SY-0020", "SY-0021", "SY-0026"],
  ],
  [
    "SY-0028",
    "Student/participation schema",
    "Feature",
    "P1",
    3,
    "SY-0025",
    ["SY-0021", "SY-0026"],
  ],
  ["SY-0029", "Finance/work/comms schema", "Feature", "P1", 3, "SY-0025", ["SY-0022", "SY-0026"]],
  [
    "SY-0030",
    "Learning/files/system schema",
    "Feature",
    "P1",
    3,
    "SY-0025",
    ["SY-0023", "SY-0026"],
  ],
  [
    "SY-0031",
    "Seed/fixture/query verification",
    "Task",
    "P1",
    3,
    "SY-0025",
    ["SY-0027", "SY-0028", "SY-0029", "SY-0030"],
  ],
  ["SY-0032", "Migration operations", "Task", "P1", 3, "SY-0025", ["SY-0031"]],
  [
    "SY-0034",
    "Worker composition/modules",
    "Task",
    "P1",
    4,
    "SY-0033",
    ["SY-0010", "SY-0011", "SY-0026"],
  ],
  ["SY-0035", "Validation/problem details", "Feature", "P1", 4, "SY-0033", ["SY-0034"]],
  [
    "SY-0036",
    "Principal/policy middleware",
    "Feature",
    "P1",
    4,
    "SY-0033",
    ["SY-0020", "SY-0027", "SY-0034"],
  ],
  ["SY-0037", "D1 unit of work", "Task", "P1", 4, "SY-0033", ["SY-0031", "SY-0034"]],
  [
    "SY-0038",
    "Security edge policy",
    "Task",
    "P1",
    4,
    "SY-0033",
    ["SY-0006", "SY-0020", "SY-0034"],
  ],
  [
    "SY-0039",
    "Observability/health foundation",
    "Task",
    "P1",
    4,
    "SY-0033",
    ["SY-0030", "SY-0034"],
  ],
  [
    "SY-0040",
    "Worker integration suite",
    "Task",
    "P1",
    4,
    "SY-0033",
    ["SY-0031", "SY-0035", "SY-0036", "SY-0037", "SY-0038", "SY-0039"],
  ],
  ["SY-0042", "Managed OIDC decision", "Spike", "P1", 5, "SY-0041", ["SY-0006", "SY-0020"]],
  ["SY-0043", "Identity tenant/app configuration", "Task", "P1", 5, "SY-0041", ["SY-0042"]],
  [
    "SY-0044",
    "Web BFF authentication",
    "Feature",
    "P1",
    5,
    "SY-0041",
    ["SY-0027", "SY-0035", "SY-0038", "SY-0043"],
  ],
  ["SY-0045", "Mobile authentication", "Feature", "P1", 5, "SY-0041", ["SY-0010", "SY-0043"]],
  [
    "SY-0046",
    "Account provisioning/authorization",
    "Feature",
    "P1",
    5,
    "SY-0041",
    ["SY-0036", "SY-0044", "SY-0045"],
  ],
  [
    "SY-0047",
    "Identity threat/negative test suite",
    "Task",
    "P1",
    5,
    "SY-0041",
    ["SY-0044", "SY-0045", "SY-0046"],
  ],
  [
    "SY-0048",
    "Recovery/admin runbook",
    "Task",
    "P1",
    5,
    "SY-0041",
    ["SY-0043", "SY-0044", "SY-0045", "SY-0046", "SY-0047"],
  ],
  [
    "SY-0050",
    "Document policy decision",
    "Spike",
    "P1",
    6,
    "SY-0049",
    ["SY-0006", "SY-0020", "SY-0030"],
  ],
  ["SY-0051", "Private R2/environment setup", "Task", "P1", 6, "SY-0049", ["SY-0009", "SY-0050"]],
  [
    "SY-0052",
    "Upload state machine",
    "Feature",
    "P1",
    6,
    "SY-0049",
    ["SY-0037", "SY-0046", "SY-0050", "SY-0051"],
  ],
  ["SY-0053", "Authorized download/version/delete", "Feature", "P1", 6, "SY-0049", ["SY-0052"]],
  ["SY-0054", "Reconciliation/cleanup", "Task", "P1", 6, "SY-0049", ["SY-0052", "SY-0053"]],
  [
    "SY-0055",
    "R2 adversarial/integration tests",
    "Task",
    "P1",
    6,
    "SY-0049",
    ["SY-0052", "SY-0053", "SY-0054"],
  ],
  [
    "SY-0057",
    "Contract package conventions",
    "Task",
    "P1",
    7,
    "SY-0056",
    ["SY-0035", "SY-0044", "SY-0052"],
  ],
  ["SY-0058", "Deterministic OpenAPI", "Feature", "P1", 7, "SY-0056", ["SY-0057"]],
  ["SY-0059", "Web API client", "Task", "P1", 7, "SY-0056", ["SY-0044", "SY-0058"]],
  ["SY-0060", "Dart client generation/mapping", "Task", "P1", 7, "SY-0056", ["SY-0045", "SY-0058"]],
  [
    "SY-0061",
    "Collection/concurrency conventions",
    "Task",
    "P1",
    7,
    "SY-0056",
    ["SY-0037", "SY-0057"],
  ],
  [
    "SY-0062",
    "Contract compatibility suite",
    "Task",
    "P1",
    7,
    "SY-0056",
    ["SY-0040", "SY-0047", "SY-0055", "SY-0058", "SY-0059", "SY-0060", "SY-0061"],
  ],
  ["SY-0064", "Flutter composition", "Task", "P1", 8, "SY-0063", ["SY-0010", "SY-0045", "SY-0060"]],
  ["SY-0065", "Navigation/deep links", "Feature", "P1", 8, "SY-0063", ["SY-0064"]],
  ["SY-0066", "Networking/repositories", "Task", "P1", 8, "SY-0063", ["SY-0060", "SY-0064"]],
  [
    "SY-0067",
    "State/local persistence policy",
    "Task",
    "P1",
    8,
    "SY-0063",
    ["SY-0064", "SY-0065", "SY-0066"],
  ],
  ["SY-0068", "Mobile design system", "Feature", "P1", 8, "SY-0063", ["SY-0064"]],
  ["SY-0069", "Accessibility/localization foundation", "Feature", "P1", 8, "SY-0063", ["SY-0068"]],
  [
    "SY-0070",
    "Flutter test/build harness",
    "Task",
    "P1",
    8,
    "SY-0063",
    ["SY-0064", "SY-0065", "SY-0066", "SY-0067", "SY-0068", "SY-0069"],
  ],
  [
    "SY-0072",
    "Web composition/routes",
    "Task",
    "P1",
    9,
    "SY-0071",
    ["SY-0010", "SY-0044", "SY-0059"],
  ],
  ["SY-0073", "Query/data conventions", "Task", "P1", 9, "SY-0071", ["SY-0059", "SY-0072"]],
  ["SY-0074", "Forms/errors", "Feature", "P1", 9, "SY-0071", ["SY-0057", "SY-0072"]],
  ["SY-0075", "Web design system", "Feature", "P1", 9, "SY-0071", ["SY-0072"]],
  [
    "SY-0076",
    "Web security/accessibility shell",
    "Task",
    "P1",
    9,
    "SY-0071",
    ["SY-0038", "SY-0075"],
  ],
  [
    "SY-0077",
    "Web test/E2E harness",
    "Task",
    "P1",
    9,
    "SY-0071",
    ["SY-0072", "SY-0073", "SY-0074", "SY-0075", "SY-0076"],
  ],
  [
    "SY-0079",
    "Organization/settings/catalog",
    "Feature",
    "P1",
    10,
    "SY-0078",
    ["SY-0062", "SY-0070", "SY-0077"],
  ],
  ["SY-0080", "Student CRM", "Feature", "P1", 10, "SY-0078", ["SY-0079"]],
  ["SY-0081", "Classes/courses/calendar", "Feature", "P1", 10, "SY-0078", ["SY-0079", "SY-0080"]],
  [
    "SY-0082",
    "Membership/enrollment/attendance",
    "Feature",
    "P1",
    10,
    "SY-0078",
    ["SY-0080", "SY-0081"],
  ],
  [
    "SY-0083",
    "Invoices/payments/receivables",
    "Feature",
    "P1",
    10,
    "SY-0078",
    ["SY-0079", "SY-0080"],
  ],
  ["SY-0084", "Expenses/payouts/reports", "Feature", "P1", 10, "SY-0078", ["SY-0083"]],
  ["SY-0085", "Leads/tasks/automation", "Feature", "P2", 10, "SY-0078", ["SY-0079", "SY-0080"]],
  ["SY-0086", "Communications/reminders", "Feature", "P2", 10, "SY-0078", ["SY-0080", "SY-0085"]],
  [
    "SY-0087",
    "Places/search/navigation utilities",
    "Feature",
    "P2",
    10,
    "SY-0078",
    ["SY-0079", "SY-0080", "SY-0081", "SY-0082", "SY-0083", "SY-0084", "SY-0085", "SY-0086"],
  ],
  [
    "SY-0088",
    "Data import/export and cutover tooling",
    "Feature",
    "P1",
    10,
    "SY-0078",
    [
      "SY-0007",
      "SY-0032",
      "SY-0079",
      "SY-0080",
      "SY-0081",
      "SY-0082",
      "SY-0083",
      "SY-0084",
      "SY-0085",
      "SY-0086",
      "SY-0087",
    ],
  ],
  ["SY-0090", "Canonical content migration", "Task", "P1", 11, "SY-0089", ["SY-0005", "SY-0023"]],
  [
    "SY-0091",
    "Learning persistence/API",
    "Feature",
    "P1",
    11,
    "SY-0089",
    ["SY-0030", "SY-0046", "SY-0057", "SY-0090"],
  ],
  [
    "SY-0092",
    "Web Learning experience",
    "Feature",
    "P1",
    11,
    "SY-0089",
    ["SY-0059", "SY-0077", "SY-0090", "SY-0091"],
  ],
  [
    "SY-0093",
    "Flutter Learning experience",
    "Feature",
    "P1",
    11,
    "SY-0089",
    ["SY-0060", "SY-0070", "SY-0090", "SY-0091"],
  ],
  [
    "SY-0094",
    "Archive import/content migration",
    "Task",
    "P1",
    11,
    "SY-0089",
    ["SY-0032", "SY-0090", "SY-0091"],
  ],
  [
    "SY-0095",
    "Learning privacy/parity tests",
    "Task",
    "P1",
    11,
    "SY-0089",
    ["SY-0092", "SY-0093", "SY-0094"],
  ],
  ["SY-0097", "Parity matrix completion", "Task", "P1", 12, "SY-0096", ["SY-0088", "SY-0095"]],
  [
    "SY-0098",
    "Cross-client contract scenarios",
    "Task",
    "P1",
    12,
    "SY-0096",
    ["SY-0024", "SY-0062"],
  ],
  ["SY-0099", "Parity audit and remediation", "Task", "P1", 12, "SY-0096", ["SY-0097", "SY-0098"]],
  ["SY-0100", "Parity release gate", "Task", "P1", 12, "SY-0096", ["SY-0099"]],
  ["SY-0102", "Test coverage/risk audit", "Spike", "P1", 13, "SY-0101", ["SY-0100"]],
  ["SY-0103", "Domain/API/DB release suite", "Task", "P1", 13, "SY-0101", ["SY-0102"]],
  ["SY-0104", "Flutter release suite", "Task", "P1", 13, "SY-0101", ["SY-0102"]],
  ["SY-0105", "Web/Playwright release suite", "Task", "P1", 13, "SY-0101", ["SY-0102"]],
  [
    "SY-0106",
    "Migration/recovery test suite",
    "Task",
    "P1",
    13,
    "SY-0101",
    ["SY-0088", "SY-0094", "SY-0102"],
  ],
  [
    "SY-0107",
    "Flake/performance governance",
    "Technical Debt",
    "P1",
    13,
    "SY-0101",
    ["SY-0103", "SY-0104", "SY-0105", "SY-0106"],
  ],
  ["SY-0109", "Threat model refresh", "Spike", "P1", 14, "SY-0108", ["SY-0006", "SY-0100"]],
  ["SY-0110", "Authorization/IDOR review", "Task", "P1", 14, "SY-0108", ["SY-0109"]],
  ["SY-0111", "Web/API hardening", "Task", "P1", 14, "SY-0108", ["SY-0109"]],
  ["SY-0112", "Upload/data/privacy hardening", "Task", "P1", 14, "SY-0108", ["SY-0109"]],
  ["SY-0113", "Mobile/supply-chain hardening", "Task", "P1", 14, "SY-0108", ["SY-0109"]],
  [
    "SY-0114",
    "Remediation and residual-risk gate",
    "Task",
    "P1",
    14,
    "SY-0108",
    ["SY-0110", "SY-0111", "SY-0112", "SY-0113"],
  ],
  ["SY-0116", "Logging/audit completion", "Feature", "P1", 15, "SY-0115", ["SY-0039"]],
  ["SY-0117", "Metrics/alerts", "Task", "P1", 15, "SY-0115", ["SY-0116"]],
  ["SY-0118", "Health/deployment visibility", "Task", "P1", 15, "SY-0115", ["SY-0116"]],
  ["SY-0119", "Operational runbooks", "Task", "P1", 15, "SY-0115", ["SY-0117", "SY-0118"]],
  [
    "SY-0120",
    "Operations drill",
    "Task",
    "P1",
    15,
    "SY-0115",
    ["SY-0116", "SY-0117", "SY-0118", "SY-0119"],
  ],
  ["SY-0122", "Backup policy/ownership", "Task", "P1", 16, "SY-0121", ["SY-0054", "SY-0116"]],
  ["SY-0123", "D1 backup/export", "Feature", "P1", 16, "SY-0121", ["SY-0032", "SY-0122"]],
  [
    "SY-0124",
    "R2 backup/version/inventory",
    "Feature",
    "P1",
    16,
    "SY-0121",
    ["SY-0054", "SY-0122"],
  ],
  ["SY-0125", "Configuration/access recovery", "Task", "P1", 16, "SY-0121", ["SY-0048", "SY-0122"]],
  [
    "SY-0126",
    "Restore/disaster drill",
    "Task",
    "P1",
    16,
    "SY-0121",
    ["SY-0120", "SY-0123", "SY-0124", "SY-0125"],
  ],
  [
    "SY-0128",
    "Environment provisioning",
    "Task",
    "P1",
    17,
    "SY-0127",
    ["SY-0043", "SY-0051", "SY-0122"],
  ],
  [
    "SY-0129",
    "CI required checks hardening",
    "Task",
    "P1",
    17,
    "SY-0127",
    ["SY-0016", "SY-0107", "SY-0114"],
  ],
  [
    "SY-0130",
    "Worker/web pipeline",
    "Feature",
    "P1",
    17,
    "SY-0127",
    ["SY-0126", "SY-0128", "SY-0129"],
  ],
  [
    "SY-0131",
    "Database migration pipeline",
    "Feature",
    "P1",
    17,
    "SY-0127",
    ["SY-0032", "SY-0123", "SY-0128", "SY-0129"],
  ],
  [
    "SY-0132",
    "Flutter build/distribution",
    "Feature",
    "P1",
    17,
    "SY-0127",
    ["SY-0070", "SY-0128", "SY-0129"],
  ],
  ["SY-0133", "Secret/signing governance", "Task", "P1", 17, "SY-0127", ["SY-0128", "SY-0129"]],
  [
    "SY-0135",
    "Readiness evidence pack",
    "Task",
    "P1",
    18,
    "SY-0134",
    [
      "SY-0100",
      "SY-0107",
      "SY-0114",
      "SY-0120",
      "SY-0126",
      "SY-0130",
      "SY-0131",
      "SY-0132",
      "SY-0133",
    ],
  ],
  [
    "SY-0136",
    "Final migration rehearsal/UAT",
    "Task",
    "P1",
    18,
    "SY-0134",
    ["SY-0088", "SY-0094", "SY-0135"],
  ],
  [
    "SY-0137",
    "Final architecture/security review",
    "Task",
    "P1",
    18,
    "SY-0134",
    ["SY-0135", "SY-0136"],
  ],
  ["SY-0138", "Go/no-go and release checklist", "Task", "P1", 18, "SY-0134", ["SY-0137"]],
  ["SY-0140", "Release candidate freeze", "Task", "P1", 19, "SY-0139", ["SY-0138"]],
  ["SY-0141", "Legacy freeze/export", "Task", "P1", 19, "SY-0139", ["SY-0140"]],
  ["SY-0142", "Production migration/import", "Task", "P1", 19, "SY-0139", ["SY-0131", "SY-0141"]],
  [
    "SY-0143",
    "Production deploy/distribution",
    "Task",
    "P1",
    19,
    "SY-0139",
    ["SY-0130", "SY-0132", "SY-0133", "SY-0142"],
  ],
  ["SY-0144", "Smoke/user verification/monitoring", "Task", "P1", 19, "SY-0139", ["SY-0143"]],
  ["SY-0145", "Release closeout", "Task", "P1", 19, "SY-0139", ["SY-0144"]],
  ["SY-0147", "Feedback/triage cadence", "Task", "P2", 20, "SY-0146", ["SY-0145"]],
  ["SY-0148", "Release health review", "Task", "P1", 20, "SY-0146", ["SY-0145"]],
  ["SY-0149", "Legacy decommission", "Task", "P2", 20, "SY-0146", ["SY-0148"]],
  ["SY-0150", "Maintenance cadence", "Technical Debt", "P2", 20, "SY-0146", ["SY-0145"]],
  ["SY-0151", "Incident/postmortem loop", "Task", "P1", 20, "SY-0146", ["SY-0145"]],
  [
    "SY-0152",
    "Architecture/backlog evolution",
    "Technical Debt",
    "P2",
    20,
    "SY-0146",
    ["SY-0148", "SY-0149", "SY-0150", "SY-0151"],
  ],
];

function emitList(arr) {
  return `[${arr.join(", ")}]`;
}

function renderIssue(row, blocks, typeOverride) {
  const [id, title, type, priority, stage, parent, blockedBy] = row;
  const stageMeta = STAGES[stage];
  const status = blockedBy.length === 0 ? "ready" : "backlog";
  const security = /security|auth|r2|backup|identity|privacy|hardening/i.test(title)
    ? "high"
    : /schema|api|worker|ci|secret/i.test(title)
      ? "medium"
      : "low";
  const kind = {
    Epic: "epic",
    Feature: "feature",
    Task: "task",
    Bug: "bug",
    "Technical Debt": "technical-debt",
    Spike: "spike",
  }[typeOverride || type];
  if (!kind) throw new Error(`unknown type ${typeOverride || type} on ${id}`);
  const tags = security === "high" || security === "medium" ? `${kind}, security` : kind;
  const cycle = `stage-${stage}`;
  return `---
type: Issue
id: ${id}
title: ${JSON.stringify(title)}
description: ${JSON.stringify(`${stageMeta.objective} This issue is limited to: ${title}.`)}
status: ${status}
priority: ${priority}
estimate: null
assignee: unassigned
project: ${cycle}
milestone: ${JSON.stringify(`Stage ${stage}`)}
cycle: ${cycle}
rank: null
tags: [${tags}]
parent: ${parent || "null"}
blocked_by: ${emitList(blockedBy)}
blocks: ${emitList(blocks)}
relates: []
resource: docs/roadmap/implementation-roadmap.md
linear_id: null
branch: null
pr: null
created: 2026-08-19
timestamp: 2026-08-19T00:00:00Z
stage: ${stage}
security_impact: ${security}
---

## Objective

${stageMeta.objective} This issue is limited to: ${title}.

## Context/Architectural References

- ${stageMeta.architecture}
- Parent: ${parent || "none (epic)"}
- Stage ${stage}: ${stageMeta.title}

## In Scope

- ${title}
- Repository effects: ${stageMeta.repo}

## Out of Scope

- Work belonging to other issues in this stage
- Production resource creation, secret values, or real-user data
- Product features not named by this issue

## Implementation Requirements

- ${title}
- Apply only the repository areas named for this stage. Write "None." for layers this issue does not touch.
- Record every required human decision before implementation proceeds.

## Acceptance Criteria

- [ ] Named outcome for ${title} exists and is reviewable
- [ ] Stage exit criteria that this issue contributes to are satisfied or explicitly deferred
- [ ] Tracker lint is green and relations remain a DAG

## Testing Requirements

${stageMeta.testing}

## Security/Privacy Requirements

${stageMeta.security}

## Documentation Requirements

${stageMeta.docs}

## Rollback/Recovery

${stageMeta.rollback}

## Implementation Notes

_None yet._

## Review Evidence

_None yet._

## Completion Checklist

- [ ] Acceptance criteria checked
- [ ] Required verification commands recorded
- [ ] Independent review recorded
- [ ] Protected-path human approval recorded if applicable
`;
}

const rows = [...EPICS.map((e) => [e[0], e[1], "Epic", e[2], e[3], e[4], e[5]]), ...CHILDREN];

const blocks = new Map(rows.map((r) => [r[0], []]));
for (const row of rows) {
  for (const dep of row[6]) {
    if (!blocks.has(dep)) throw new Error(`Unknown blocker ${dep} on ${row[0]}`);
    blocks.get(dep).push(row[0]);
  }
}

mkdirSync(OUT, { recursive: true });
for (const row of rows) {
  const id = row[0];
  writeFileSync(join(OUT, `${id}.md`), renderIssue(row, blocks.get(id) || []));
}

process.stdout.write(`seeded ${rows.length} issues\n`);
