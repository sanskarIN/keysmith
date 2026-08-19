# Maintainer Guide

This guide defines the repository-maintenance workflow for KeySmith. It complements `CONTRIBUTING.md`, `docs/development.md`, `docs/testing.md`, `docs/github.md`, `docs/release.md`, and the canonical continuation ledger in `what_changed.md`.

## Maintenance principles

1. Keep credential-generation logic in `keysmith-core` whenever possible.
2. Keep Tauri privileges narrow and explicit.
3. Store only non-secret preferences.
4. Never make network access a hidden requirement for generation.
5. Treat clipboard/export behavior as an explicit user action with clear warnings.
6. Make CI reflect commands contributors can run locally.
7. Keep documentation synchronized with the repository in the same commit/PR.
8. Prefer small Conventional Commits that are independently reviewable.

## Commit conventions

Use clear Conventional Commit prefixes:

- `feat:` user-visible capability;
- `fix:` defect correction;
- `test:` test-only change;
- `docs:` documentation-only change;
- `refactor:` internal restructuring without behavior change;
- `perf:` performance improvement;
- `build:` build/dependency/tooling behavior;
- `ci:` GitHub Actions/automation behavior;
- `chore:` repository maintenance.

Project-maintainer commits use the identity documented in `what_changed.md` and root workspace metadata.

## Change classification

### Rust core change

Review and normally update:

- affected file under `crates/keysmith-core/src/`;
- Rust tests;
- `docs/core-api.md`;
- `docs/architecture.md` when responsibilities/trust boundaries change;
- `THREAT_MODEL.md` for security-model changes;
- `CHANGELOG.md` for user-visible behavior;
- TypeScript types when serialized structures change.

### Tauri command/capability change

Review and normally update:

- `src-tauri/src/commands.rs`;
- `src-tauri/src/lib.rs` command registration;
- `src-tauri/permissions/keysmith.toml`;
- `src-tauri/capabilities/default.json` when scope changes;
- `src/api.ts`;
- `src/types.ts` for data-shape changes;
- `docs/desktop-bridge.md`;
- `THREAT_MODEL.md` and `PRIVACY.md` if privilege/data behavior changes.

### Frontend behavior change

Review and normally update:

- `index.html`;
- `src/main.ts`;
- `src/styles.css`;
- `src/storage.ts` if persistence changes;
- frontend tests;
- `docs/frontend.md`;
- `docs/user-guide.md`;
- `docs/accessibility.md` for interaction changes.

### CI/build/release change

Review and normally update:

- relevant `.github/workflows/*.yml`;
- `package.json`, Cargo manifests, or config as applicable;
- `docs/testing.md`;
- `docs/development.md`;
- `docs/release.md`;
- `docs/github.md` for required check names/branch protection;
- `what_changed.md` if verification expectations change.

### New repository file

Before merge:

1. add the file for a defined purpose;
2. add it to `docs/repository-reference.md`;
3. link it from `docs/README.md` if it is documentation intended for regular navigation;
4. ensure formatting/CI covers it where appropriate.

## Development verification ladder

Run the smallest relevant checks during implementation, then the full applicable suite before merge.

### Frontend

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

### Rust core

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
```

### Desktop adapter

```bash
cargo check -p keysmith --all-targets
```

Desktop checks must also run in hosted CI on Linux, Windows, and macOS.

### Dependency policy

CI generates a lockfile as needed for cargo-deny and evaluates advisory/license/source policy from `deny.toml`.

## GitHub Actions ownership

### `ci.yml`

Primary pull-request quality matrix:

- frontend typecheck/lint/text hygiene/tests/build;
- Rust core format/clippy/tests;
- Tauri cargo check on three operating systems;
- Rust dependency policy.

This workflow is the main source of required branch-protection checks.

### `rust.yml`

A focused Rust-core build-and-test workflow. It intentionally scopes commands to `keysmith-core` so it does not attempt a Linux Tauri build without the system packages installed by the desktop matrix.

### `codeql.yml`

Runs JavaScript/TypeScript and Rust CodeQL analysis on pushes, pull requests, and a weekly schedule.

### `release.yml`

Runs only for `v*` tags and creates draft Tauri release artifacts for Linux, Windows, and universal macOS. Release artifacts are not assumed to be signed unless protected signing configuration is added separately.

## Dependency updates

Dependabot covers Cargo, npm, and GitHub Actions.

For dependency PRs:

1. read upstream release/advisory notes for security-sensitive libraries;
2. inspect lockfile changes when lockfiles are present;
3. run the full relevant CI matrix;
4. pay special attention to `getrandom`, `eff_wordlist`, `zxcvbn`, `arboard`, Tauri, and serialization changes;
5. update documentation only if behavior, prerequisites, API, license policy, or security assumptions changed.

Do not weaken `deny.toml` merely to make a dependency-policy job green. Understand the new license/source/advisory first.

## Version synchronization

For a version change, search and synchronize all user/build surfaces that contain a literal version, including at minimum:

- root `Cargo.toml` workspace version;
- `package.json` version;
- `src-tauri/tauri.conf.json` version;
- `index.html` footer/settings/About version strings;
- `CHANGELOG.md`;
- release notes/ledger in `what_changed.md`.

The version should not be considered released until the same commit has passed the release-candidate verification matrix.

## Documentation quality gate

Before merging a substantial change, answer:

- Does `README.md` still describe current behavior?
- Is the docs portal complete?
- Does `repository-reference.md` account for every committed file?
- Are public Rust/Tauri/frontend contracts updated?
- Are security/privacy statements still true?
- Are setup/testing/release commands still correct?
- Does `what_changed.md` contain the new checkpoint and next exact tasks?

## Security review gate

Any change involving randomness, generation policy, passphrase word selection, strength scoring, clipboard handling, Tauri capabilities/permissions, CSP, local storage, exports, dependencies, or release signing requires security-specific review.

Check for:

- secret persistence;
- logging of generated values;
- weaker randomness or biased sampling;
- validation only in the UI rather than Rust;
- newly exposed Tauri privileges;
- expanded CSP/network surface;
- clipboard/file side effects without user action;
- new dependencies with unsuitable licenses/advisories/sources;
- error messages that could contain secrets.

## Pull-request verification workflow

The release-candidate process should happen on a branch and pull request so PR-triggered checks can be inspected before merging.

1. Branch from current `main`.
2. Make granular commits.
3. Open a PR targeting `main`.
4. Wait for all expected workflow suites to report a result.
5. Inspect every failure at the job/step/log level.
6. Fix the root cause and add a regression test for behavior bugs.
7. Push fixes to the same branch and repeat.
8. Merge only when the required quality/security matrix is green or a documented external limitation is explicitly accepted.
9. After merge, verify the `main` push checks too.

## Release-candidate checklist

Before tagging a stable release:

- frontend quality is green;
- Rust core quality is green;
- desktop checks are green on Linux, Windows, and macOS;
- cargo-deny is green;
- CodeQL is green;
- lockfiles are committed when produced from a trusted dependency resolution and project policy requires them;
- packaged builds succeed on every release platform;
- generation, passphrase, batch, clipboard, onboarding, settings, theme, links, and dialogs are smoke-tested;
- keyboard/accessibility manual checks are complete;
- real release screenshots are captured from the verified build;
- changelog release date is finalized;
- `what_changed.md` is updated;
- branch protection uses proven check names;
- only then create the stable tag.

## Handoff discipline

`what_changed.md` is the canonical handoff file. At the end of a work session, update:

- current version/milestone;
- completed work;
- changed files/modules;
- verification performed and observed results;
- known limitations;
- open issues;
- next exact tasks;
- migration notes;
- release notes draft;
- recent commit hashes/messages.

Do not claim a test passed unless its result was actually observed.
