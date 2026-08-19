# Agent Note: GitHub Actions as the CI host

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
can lint.

## Alternatives considered

- **No CI, local `pnpm verify` only:** rejected; clean-checkout evidence
  would depend on a developer's laptop and would skip Flutter when the SDK
  is absent.
- **Cloudflare Workers CI / GitLab / Buildkite:** rejected for Stage 1;
  they need another identity, secret store, and reviewer path while the
  code host is already GitHub.

## Affected components

`.github/workflows/ci.yml`, `.github/CODEOWNERS`,
`.github/pull_request_template.md`, `.github/dependabot.yml`,
`tools/ci/check-*.mjs`, `docs/development/ci.md`.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
