# GitHub Repository Operations

This guide describes the recommended GitHub governance for KeySmith. Repository settings should reinforce the source-level security model: review security-sensitive changes, require proven automated checks, keep release publishing controlled, and route private security reports away from public issue content.

## Default branch

`main` is the primary integration/release branch. Normal substantive changes should arrive through a pull request so pull-request CI and CodeQL analyze the exact candidate before merge.

Direct maintainer pushes should be reserved for situations allowed by repository policy and should never be used to bypass a known failing release/security check.

## Recommended branch protection for `main`

Enable protection after the workflow has completed successfully at least once so the exact GitHub check names are known.

Recommended rules:

- require a pull request before merging;
- require at least one approval for non-maintainer contributions;
- dismiss stale approvals when new commits materially change a reviewed PR;
- require conversation resolution;
- require proven CI quality checks;
- require CodeQL/security checks appropriate to repository settings;
- require dependency-policy results;
- require the branch to be up to date before merge when that setting is practical;
- block force pushes;
- block branch deletion;
- restrict administrative bypass to documented emergencies.

Do not guess required-check names in branch-protection settings before observing them from a real successful pull request. Renaming workflow/job names can affect the branch rule and therefore requires a repository-settings review.

## Expected pull-request workflow suites

### CI

`.github/workflows/ci.yml` provides:

- `Frontend quality`;
- `Rust core quality`;
- `Tauri check (ubuntu-22.04)`;
- `Tauri check (windows-latest)`;
- `Tauri check (macos-latest)`;
- `Rust dependency policy`.

The exact rendered check names should be copied from an observed workflow run when configuring protection.

### Rust core

`.github/workflows/rust.yml` provides an additional focused `keysmith-core` build/test workflow. It exists as a lightweight Rust-specific signal and deliberately does not duplicate the full Linux Tauri build.

### CodeQL

`.github/workflows/codeql.yml` analyzes JavaScript/TypeScript and Rust. Depending on GitHub's security configuration, CodeQL check names/status presentation may differ from ordinary Actions jobs; configure protection from observed repository results.

## Pull request policy

A PR should explain:

- the problem/goal;
- user-visible behavior changes;
- tests/verification performed;
- security/privacy impact;
- platform impact;
- documentation changes;
- migration/version impact where relevant.

The repository PR template should remain synchronized with these expectations.

Security-sensitive pull requests should receive extra scrutiny when they change:

- `crates/keysmith-core/src/random.rs`;
- password/passphrase policy/generation;
- Tauri commands/capabilities/permissions/CSP;
- clipboard behavior;
- export behavior;
- local persistence;
- dependency policy;
- release signing/build paths.

## Merge policy

Meaningful granular maintainer commits may be preserved when each commit is independently reviewable and useful for audit/history.

For external contributions with noisy fixup history, squash merge can produce a cleaner durable history.

Regardless of merge method:

- do not merge known failing required checks;
- do not hide a failing check by removing it from protection without investigating;
- do not rewrite `main` history after a release;
- use Conventional Commit-style final messages where practical.

## Commit identity

Maintainer commit identity is documented by workspace metadata and `what_changed.md`. Repository writes for the active project should preserve that configured maintainer attribution.

A commit being unsigned is not equivalent to a failed CI result; commit-signing policy is a separate repository-governance choice. If verified commit signatures become required, document and configure that intentionally rather than implying current commits are signed.

## Issue intake

The repository contains structured issue forms:

- bug report;
- feature request;
- configuration/contact routing.

Public issue forms should explicitly discourage posting:

- real passwords/passphrases;
- exported batches;
- clipboard contents;
- tokens;
- `.env` data;
- signing/private keys.

Potential vulnerabilities that need private handling should follow `SECURITY.md` rather than a normal public bug report.

## Discussions

If GitHub Discussions is enabled, use it for non-sensitive usage help, ideas, community questions, and showcases.

Suggested categories:

- Announcements;
- Help;
- Ideas;
- Show and Tell;
- General.

Do not use Discussions for vulnerability details or private credentials. Direct security reports to `SECURITY.md`.

## Labels

Recommended labels:

- `bug`;
- `enhancement`;
- `security`;
- `accessibility`;
- `documentation`;
- `dependencies`;
- `good first issue`;
- `help wanted`;
- `platform: windows`;
- `platform: macos`;
- `platform: linux`;
- `release`;
- `ci`;
- `privacy`.

Labels describe triage, not severity proof. A public `security` label should not be used in a way that discloses a private unresolved vulnerability prematurely.

## Milestones

Milestones can follow product/release stages such as:

- `0.1 Secure MVP`;
- `0.2 Hardening`;
- `1.0 Stable`.

Only assign an issue when there is a concrete scope/completion criterion. Avoid using milestones as an unbounded wish list.

`ROADMAP.md` is the durable repository roadmap; GitHub milestones are the execution/tracking view.

## Dependabot

`.github/dependabot.yml` tracks updates for:

- Cargo;
- npm;
- GitHub Actions.

Dependency PRs still require human review. For security-sensitive dependencies, inspect upstream changes/advisories and the resolved graph rather than merging solely because Dependabot opened the PR.

Do not disable cargo-deny/license/source policy just to accept an automated update.

## CodeQL and security settings

Keep GitHub code scanning enabled for the languages configured by `codeql.yml`.

Where repository plan/settings support them, also consider:

- Dependabot alerts/security updates;
- secret scanning;
- push protection for supported secret types;
- private vulnerability reporting/security advisories.

Repository-host settings can change independently of source, so `what_changed.md` should record meaningful governance/security setting changes during release preparation.

## Funding configuration

`.github/FUNDING.yml` supplies the repository funding link. Funding metadata must remain separate from security-sensitive build/release credentials and must never become a reason to add tracking/telemetry to the application.

## Release governance

Tags matching `v*` trigger the release workflow. Stable tags should only be created after the release-candidate process in [`release.md`](release.md).

Recommended protections/practices:

- create tags from the exact verified `main` commit;
- avoid moving/reusing a published stable tag;
- keep releases draft until artifacts have been inspected/smoke-tested;
- use protected Actions secrets for signing when signing is implemented;
- never put signing/private credentials in workflow source or release notes;
- keep release body/changelog claims aligned with observed verification.

## Actions permissions

Workflows should use the least GitHub token permissions needed for their function.

Current intent:

- CI: `contents: read`;
- CodeQL: `contents: read`, `security-events: write`;
- Release: `contents: write` to create/update the draft release.

Do not grant broad repository write permissions to ordinary validation jobs.

Third-party Actions should be reviewed as dependencies. Dependabot covers GitHub Actions versions, and changes to high-privilege release/security Actions deserve extra review.

## Branch and PR naming

Use short descriptive branch names, for example:

```text
fix/clipboard-conditional-clear
docs/full-repository-reference
feat/password-policy-option
release/0.1.0-rc
```

Branch naming is not a security boundary, but clarity helps audits and handoffs.

## Repository documentation completeness

For changes that add/remove/rename files, update [`repository-reference.md`](repository-reference.md). For new navigable documentation, also update [`README.md`](README.md) within `docs/`.

`what_changed.md` is the active handoff/verification ledger and should be updated before a release-candidate branch is considered complete.

## Emergency changes

If an urgent security/release issue requires administrative bypass:

1. minimize the change;
2. preserve an auditable commit;
3. avoid publishing exploit details prematurely;
4. run the highest-value available checks before/after merge;
5. restore normal branch-protection workflow immediately afterward;
6. add regression coverage;
7. document the emergency path in the security/release handoff.

Administrative capability is not a substitute for verification.
