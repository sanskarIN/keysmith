# GitHub Repository Operations

## Recommended branch protection for `main`

Enable branch protection after CI has completed successfully at least once. Recommended rules:

- require a pull request before merging,
- require at least one approval for non-maintainer changes,
- dismiss stale approvals when new commits are pushed,
- require conversation resolution,
- require the CI, CodeQL, and dependency-policy checks,
- require branches to be up to date before merge,
- block force pushes and branch deletion,
- allow repository administrators to bypass only for documented emergencies.

## Discussions

Enable GitHub Discussions for usage questions, ideas, and community help. Keep security reports out of Discussions and direct them to `SECURITY.md`.

Suggested categories: Announcements, Help, Ideas, Show and Tell, and General.

## Labels

Recommended labels: `bug`, `enhancement`, `security`, `accessibility`, `documentation`, `dependencies`, `good first issue`, `help wanted`, `platform: windows`, `platform: macos`, `platform: linux`, and `release`.

## Milestones

Use milestones matching supported releases, beginning with `0.1 Secure MVP`, `0.2 Hardening`, and `1.0 Stable`. Issues should only be placed in a milestone when there is an owner or a concrete completion criterion.

## Merge policy

Prefer squash merge for contribution pull requests when their intermediate commits are noisy. Preserve meaningful multi-commit history for larger maintainer branches when individual commits are independently reviewable. Never merge a known failing required check.
