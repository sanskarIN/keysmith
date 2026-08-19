# GitHub Repository Operations

## Branch protection for `main`

Do not guess required check names before the release-candidate workflows have completed successfully on the final configuration. First obtain one same-commit green CI/CodeQL run, then configure protection using the exact check names GitHub reports.

Recommended rules:

- require a pull request before merging,
- require at least one approval for non-maintainer changes,
- dismiss stale approvals when new commits are pushed,
- require conversation resolution,
- require branches to be up to date before merge,
- require the proven frontend quality check,
- require the proven Rust core quality check,
- require the proven Tauri Linux, Windows, and macOS checks,
- require the proven CodeQL JavaScript/TypeScript and Rust checks,
- retain dependency/advisory/license policy as a blocking gate where surfaced as its own required check,
- block force pushes and branch deletion,
- allow repository administrators to bypass only for a documented emergency.

Never weaken protection merely to publish a release. Fix the failed source/configuration or explicitly document why a formerly required check was intentionally replaced.

## Release-candidate pull requests

A release-candidate PR should remain open until the exact head commit has green automated evidence and all review conversations are resolved. Every code/configuration change invalidates older evidence for release purposes even when GitHub still displays previous green runs in history.

Large maintainer release branches may retain meaningful atomic commits when they improve auditability. Do not manufacture empty/no-op commits solely to increase commit count.

## Security automation

Current repository automation is intended to cover:

- npm high-severity dependency audit,
- high-confidence repository secret patterns,
- TypeScript typecheck/lint/tests/build,
- Rust formatting/core Clippy/tests,
- cargo-deny advisory/license/source policy,
- Tauri check and Clippy on Linux, Windows, and macOS,
- CodeQL JavaScript/TypeScript,
- CodeQL Rust after a complete workspace build,
- tag/version preflight before release artifact builds.

Workflow edits are security-sensitive repository changes and should be reviewed like application code.

## Discussions

Enable GitHub Discussions for usage questions, ideas, and community help when community support is desired. Keep security reports out of Discussions and direct them to `SECURITY.md`.

Suggested categories: Announcements, Help, Ideas, Show and Tell, and General.

## Labels

Recommended labels: `bug`, `enhancement`, `security`, `privacy`, `accessibility`, `documentation`, `dependencies`, `good first issue`, `help wanted`, `platform: windows`, `platform: macos`, `platform: linux`, and `release`.

Security-sensitive reports that should be private must not be converted into public label-driven issue workflows.

## Milestones

Use milestones matching supported releases, beginning with `0.1 Secure MVP`, `0.2 Hardening`, and `1.0 Stable`. Issues should only be placed in a milestone when there is an owner or a concrete completion criterion.

## Merge policy

Prefer squash merge for contribution pull requests when intermediate commits are noisy. Preserve meaningful multi-commit history for larger maintainer branches when individual commits are independently reviewable. Never merge a known failing required check.

For the `0.1.0` release candidate, do not merge merely because GitHub says the PR is mergeable; mergeability is separate from release readiness.

## Tags and releases

- Create an annotated version tag only after the release commit is merged and verified.
- The tag must equal `v` plus the package version.
- Keep tag-triggered artifacts in draft state until platform artifact inspection is complete.
- Describe unsigned/notarized status accurately.
- Do not store signing keys or tokens in source, issues, PR comments, workflow artifacts, or release notes.

## Funding and support

Funding links must remain optional and must never unlock security/privacy features. Usage/help questions belong in support/community channels; vulnerability reports must follow `SECURITY.md`.
