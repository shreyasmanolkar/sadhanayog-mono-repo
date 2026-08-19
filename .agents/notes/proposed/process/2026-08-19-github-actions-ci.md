# Agent Note: GitHub Actions as the CI host

ID: ADR-0011
Status: proposed

## Problem

Stage 1 needs a CI host that runs docs/tracker/decision lint, secret scan,
TypeScript and Flutter smoke, generated drift, and dependency policy on
every pull request without granting production credentials.

## Proposal

Use GitHub Actions on this GitHub remote. Workflow permissions stay
`contents: read`. Actions are pinned by commit SHA. Fork pull requests
receive no repository secrets because the workflow references none.
Dependabot opens weekly grouped non-major PRs with no automerge.

## Rationale

The repository already lives on GitHub. A second CI product would add
credentials and a second permission model for three operators. Actions can
express least privilege in the workflow file, which agents and `ci:policy`
can lint. Staging already used ADR-0006–0010, so this note is ADR-0011.

## Alternatives considered

- **No CI, local `pnpm verify` only:** rejected; clean-checkout evidence
  would depend on a developer's laptop and would skip Flutter when the SDK
  is absent.
- **Cloudflare Workers CI / GitLab / Buildkite:** rejected for Stage 1;
  they need another identity, secret store, and reviewer path while the
  code host is already GitHub.

## Impact

- **Security:** workflow is read-only, fork PRs get no repository secrets,
  artifacts are not uploaded, Actions are SHA-pinned.
- **Operations:** four parallel jobs on every PR and on `main`/`staging`.
  `pnpm ci:policy` is part of `pnpm verify`.
- **Data:** none. Secret scan looks for credential-like strings, not product
  records.

## Affected components

`.github/workflows/ci.yml`, `.github/CODEOWNERS`,
`.github/pull_request_template.md`, `.github/dependabot.yml`,
`tools/ci/check-secrets.mjs`, `tools/ci/check-ci-policy.mjs`,
`docs/development/ci.md`.

## Approvers

Human architectural reviewer. Not self-approved.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
