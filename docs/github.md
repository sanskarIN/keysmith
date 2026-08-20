# GitHub Repository Operations

## Recommended branch protection for `main`

Enable branch protection only after the v2.7.4 release-candidate workflows have completed successfully and GitHub has established the exact rendered required-check names. Recommended rules:

- require a pull request before merging,
- require at least one approval for non-maintainer changes when project governance makes that practical,
- dismiss stale approvals when new commits are pushed,
- require conversation resolution,
- require all maintained CI and CodeQL checks used by the release gate,
- require branches to be up to date before merge when this does not create an unmaintainable merge queue,
- block force pushes and branch deletion,
- allow repository administrators to bypass only for documented emergencies.

For the v2.7.4 candidate, the maintained automation currently defines these job names:

- `Frontend quality`
- `Rust core quality`
- `Tauri check (ubuntu-22.04)`
- `Tauri check (windows-latest)`
- `Tauri check (macos-latest)`
- `Rust dependency policy`
- CodeQL `analyze (javascript-typescript)`
- CodeQL `analyze (rust)`

GitHub may display required checks with workflow prefixes. Select the exact successful check names shown on the verified PR/`main` commit rather than guessing them from this document.

The removed legacy `.github/workflows/rust.yml` workflow must not be configured as a required check. Its generic Ubuntu `cargo build`/`cargo test` duplicated maintained coverage and did not install the Linux Tauri system dependencies.

## Release branches and tags

Use focused release branches such as `release/v2.7.4` for release-candidate hardening and verification. A release branch being mergeable does not make it stable.

Before creating a stable tag:

1. require the exact candidate SHA to pass the complete automated release gate,
2. complete the platform package/smoke-test steps in `docs/release.md`,
3. merge the verified candidate according to repository policy,
4. verify the resulting `main` commit,
5. create the exact semantic tag (`v2.7.4` for this release) only after version metadata and the merge commit are confirmed.

## Discussions

Enable GitHub Discussions for usage questions, ideas, and community help when community volume justifies it. Keep security reports out of Discussions and direct them to `SECURITY.md`.

Suggested categories: Announcements, Help, Ideas, Show and Tell, and General.

## Labels

Recommended labels: `bug`, `enhancement`, `security`, `accessibility`, `documentation`, `dependencies`, `good first issue`, `help wanted`, `platform: windows`, `platform: macos`, `platform: linux`, and `release`.

Add labels only when they are actively useful for triage; avoid creating large unused label taxonomies.

## Milestones

Use milestones that match real maintained release work rather than historical placeholder phases. The current milestone is `v2.7.4` release verification. Future milestones should be created only when they have concrete scope and completion criteria, for example a specific `v2.7.x` maintenance release or a clearly approved hardening release.

Do not recreate the superseded `0.1 Secure MVP`, `0.2 Hardening`, or `1.0 Stable` placeholder sequence as the active roadmap; `ROADMAP.md` is the source of truth for current release direction.

## Merge policy

Prefer squash merge for contribution pull requests when their intermediate commits are noisy. Preserve meaningful multi-commit history for larger maintainer branches when individual commits are independently reviewable.

Never merge a known failing required check. For security/release branches, also do not merge while required checks are merely queued, pending, skipped unexpectedly, or unavailable without investigation.

## Workflow maintenance

Keep one authoritative workflow path for each verification responsibility. Remove obsolete duplicate workflows when the maintained matrix supersedes them, and update branch protection afterward so deleted check names do not block future pull requests.

When changing workflow job names, update this document, `docs/release.md`, and branch-protection configuration together after a successful run proves the new names.
