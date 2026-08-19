# GitHub Repository Operations

KeySmith repository governance should reinforce the same least-privilege, evidence-driven model used by the application itself.

## Branch protection for `main`

Do not guess required check names before the final release-candidate workflow configuration has completed successfully. First obtain one same-commit green CI/CodeQL run, then configure protection using the exact check names GitHub reports.

Recommended rules:

- require a pull request before merging;
- require at least one approval for non-maintainer changes;
- dismiss stale approvals when new commits are pushed;
- require conversation resolution;
- require branches to be up to date before merge when practical;
- require the proven Frontend quality check;
- require the proven Rust core quality check;
- require the proven Tauri Linux, Windows, and macOS checks;
- require the proven CodeQL JavaScript/TypeScript and Rust checks;
- keep dependency/advisory/license policy blocking where it surfaces;
- block force pushes and branch deletion;
- allow administrative bypass only for a documented emergency with follow-up verification.

Never weaken protection merely to publish a release. Fix failed source/configuration or explicitly document a deliberate replacement of a check.

## Release-candidate pull requests

A release-candidate PR remains open until the **exact latest head** has required automated evidence and blocking conversations are resolved. Every tracked-file commit invalidates older release evidence, even if the change is documentation-only.

For 0.1.0, `verify/0.1.0-rc` / PR #1 is the authoritative release-candidate line. A competing/superseded branch must not be merged independently after its useful work has been reconciled.

Large maintainer branches may preserve meaningful atomic commits when they improve auditability. Do not manufacture empty/no-op commits solely to inflate commit count.

## Security and quality automation

Primary CI covers:

- npm high-severity dependency audit;
- high-confidence repository secret scanning;
- TypeScript typecheck;
- type-aware ESLint, including repository scripts;
- repository text hygiene;
- tracked-file documentation completeness (`npm run docs:check`);
- frontend unit/integration/static security/accessibility/localization tests;
- production frontend build;
- Rust formatting/core strict Clippy/tests;
- cargo-deny advisory/license/source policy;
- generated short-lived npm/Cargo lockfile artifacts during the release-candidate phase;
- Tauri check and strict Clippy on Linux, Windows, and macOS.

CodeQL covers:

- JavaScript/TypeScript;
- Rust after a complete workspace build with Linux native desktop dependencies.

Workflow edits are security-sensitive repository changes and should be reviewed like application code.

## Documentation completeness as a repository gate

`docs/repository-reference.md` must account for every path returned by `git ls-files`. Primary CI and release preflight run:

```bash
npm run docs:check
```

When a tracked file is added/renamed/removed, update the canonical reference in the same pull request. Do not exclude ordinary project files from the checker to hide incomplete documentation.

## Actions permissions

Use least GitHub token permissions per workflow/job.

Current intended model:

- primary CI: `contents: read`;
- CodeQL: repository read plus only the security-event permission needed to publish analysis results;
- release workflow default/preflight: `contents: read`;
- release platform `build` job only: `contents: write` so `tauri-action` can create/update the draft release.

Do not grant release-level write permission to ordinary verification jobs. Adding package, issue, pull-request, actions, ID-token, or other write scopes requires a specific reviewed need.

Third-party Actions are dependencies. Dependabot covers Actions version proposals, but maintainers still review changes, especially security-scanning and release-publishing Actions.

## Dependabot and dependency policy

Dependabot covers Cargo, npm, and GitHub Actions.

Automated update PRs must still pass:

- npm audit/lockfile review for frontend dependencies;
- cargo-deny/lockfile review for Rust dependencies;
- relevant tests/build/native matrix;
- CodeQL where applicable.

Do not weaken `deny.toml`, secret scanning, CSP/security tests, or Actions permissions merely to accept an automated dependency update.

## Issues and security reports

Structured bug/feature forms are available for public issues. Public reports must not contain:

- real generated credentials;
- batch exports;
- clipboard values;
- private export paths;
- tokens/environment secrets;
- signing/notarization/private-key material.

Potential vulnerabilities requiring private handling follow `SECURITY.md` rather than a normal public issue.

## Discussions

Enable GitHub Discussions for usage questions, ideas, and community help when desired. Suggested categories: Announcements, Help, Ideas, Show and Tell, General.

Security disclosures do not belong in Discussions.

## Labels

Recommended labels include:

- `bug`
- `enhancement`
- `security`
- `privacy`
- `accessibility`
- `documentation`
- `dependencies`
- `ci`
- `release`
- `good first issue`
- `help wanted`
- `platform: windows`
- `platform: macos`
- `platform: linux`

A public security label must not disclose private unresolved vulnerability details.

## Milestones

Use milestones with concrete scope/completion criteria, for example:

- `0.1 Secure MVP`
- `0.2 Hardening`
- `1.0 Stable`

`ROADMAP.md` is the durable future-direction document; milestones are execution tracking, not a substitute for implemented-behavior docs.

## Merge policy

Prefer squash merge for contribution PRs with noisy fixup history. Preserve meaningful multi-commit maintainer history when each commit is independently reviewable.

Never merge a known failing required check. GitHub's "mergeable" state only means the Git graph/conflict state permits a merge; it does not mean KeySmith is release-ready.

## Tags and releases

- Create an annotated version tag only after the release commit is merged and verified.
- The tag must equal `v` plus the package version.
- Release `Verify release tag` reruns audit, secret, frontend/docs/build, Rust core, and cargo-deny gates before artifact jobs.
- Keep artifacts in draft state until platform inspection is complete.
- Describe signing/notarization status accurately.
- Never store signing keys/tokens in source, issues, PR comments, workflow artifacts, or release notes.

## Funding and support

Funding links remain optional and must never unlock security/privacy features. Usage/help belongs in support/community channels; vulnerability reports follow `SECURITY.md`.

## Emergency repository change

If an urgent security/release incident genuinely requires administrative bypass:

1. minimize the change;
2. keep an auditable commit/PR where disclosure timing allows;
3. avoid publishing exploit-sensitive detail prematurely;
4. run the highest-value available checks before/after merge;
5. restore normal protection immediately;
6. add regression coverage;
7. record the exception and verification in `what_changed.md`/security release notes.

Administrative capability is not a substitute for evidence.
