# Security

Status: living  
Owner: security reviewer  
Last-reviewed: 2026-08-19

Controls and the practice-versus-compliance distinction:
[foundation §22](../architecture/engineering-foundation.md).

Legacy quality/security/accessibility evidence is
[discovery/a11y-security-baseline.md](../discovery/a11y-security-baseline.md)
(SY-0006). Threat model refresh for the target system is
[SY-0109](../issue-tracking/issues/SY-0109.md).
OIDC provider selection is [SY-0042](../issue-tracking/issues/SY-0042.md).
CI supply-chain controls (read-only default, no secrets on fork PRs, no
sensitive artifacts, SHA-pinned Actions, license allowlist) are
[development/ci.md](../development/ci.md). Do not claim regulatory
compliance from this foundation.
