# Maintainer Guide

This guide defines the operational workflow for maintaining KeySmith. It complements `CONTRIBUTING.md`, [`development.md`](development.md), [`testing.md`](testing.md), [`verification.md`](verification.md), [`github.md`](github.md), [`release.md`](release.md), and the canonical handoff ledger in root `what_changed.md`.

## Maintenance principles

1. Keep credential selection/validation in `keysmith-core`.
2. Keep native Tauri authority narrow, explicit, and testable.
3. Store only non-secret preferences.
4. Keep runtime generation offline and telemetry-free.
5. Treat clipboard, native save, and external opener behavior as explicit security-sensitive side effects.
6. Keep localization separate from policy/command identifiers.
7. Never log generated secrets, export destinations, tokens, or private filesystem data.
8. Make CI reproduce commands contributors can run and make release claims only from observed results.
9. Update documentation/tests in the same change as behavior.
10. Prefer small Conventional Commits that are independently reviewable.

## Commit conventions

Use focused prefixes:

- `feat:` user-visible feature;
- `fix:` defect correction;
- `test:` test-only regression/coverage;
- `docs:` documentation;
- `refactor:` behavior-preserving internal change;
- `perf:` measured performance improvement;
- `build:` build/dependency/tooling;
- `ci:` GitHub Actions/automation;
- `chore:` maintenance.

Do not split one atomic behavior across commits in a way that leaves intermediate commits misleading or security-invalid merely to increase commit count.

## Change classification

### Rust core

Normally review/update:

- relevant `crates/keysmith-core/src/*` module;
- unit/security/property/validation/serialization tests;
- [`core-api.md`](core-api.md);
- [`architecture.md`](architecture.md) if ownership/trust changes;
- `THREAT_MODEL.md` for security-model changes;
- `CHANGELOG.md` for user-visible behavior;
- TypeScript interfaces when serialized shapes change.

### Native/Tauri boundary

Review/update:

- `src-tauri/src/commands.rs` or `src-tauri/src/export.rs`;
- `src-tauri/src/lib.rs` registration/plugin setup;
- `src-tauri/permissions/keysmith.toml`;
- `src-tauri/capabilities/default.json`;
- `src-tauri/tauri.conf.json` for CSP/global-bridge/build scope;
- `src/api.ts` / `src/types.ts`;
- static native security tests;
- [`desktop-bridge.md`](desktop-bridge.md);
- `THREAT_MODEL.md` / `PRIVACY.md` / ADR when authority/data changes.

### External destination

Adding/changing an About destination requires synchronized changes to:

- `index.html` `data-external-url`;
- `src/external-links.ts` allowlist;
- `src-tauri/capabilities/default.json` opener scope;
- external-link drift/integration tests;
- public documentation/contact references.

Never broaden the opener capability to arbitrary `https:`/`mailto:` as a shortcut.

### Native batch export

Changes require review of:

- pure frontend `src/export.ts` content construction;
- native `src-tauri/src/export.rs` independent validation/bound;
- `keysmith-export` permission;
- native dialog plugin/capability implications;
- export/integration tests;
- plaintext warning language;
- privacy/threat/release/manual verification docs.

Do not accept frontend-provided arbitrary filesystem paths.

### Clipboard behavior

Review:

- supported native delay allowlist;
- max clipboard size and maximum batch calculation;
- single-worker replacement/cancel behavior;
- exact-value conditional clearing;
- Zeroizing secret lifetime;
- command/unit/integration/manual tests;
- documented OS clipboard residual risk.

### Frontend behavior

Review/update:

- `index.html`, `src/main.ts`, pure helper modules, styles;
- real-markup/integration/static accessibility tests;
- stale async-result behavior using `generationRevision`;
- localization catalog/attributes;
- [`frontend.md`](frontend.md), [`user-guide.md`](user-guide.md), accessibility docs.

### Persistent preference

Only add demonstrably non-secret values. Use namespaced keys, strict accepted values, safe fallbacks, tests, and privacy documentation. Never store generated values, clipboard text, export paths, strength/entropy, or history.

### Localization

Keep translation data from changing security policy/native identifiers. Update catalog, markup keys, preset/strength adapters, tests, [`i18n.md`](i18n.md), and ADR 0003 when the boundary changes.

### Logging

Diagnostic changes must use structural/non-secret metadata. Review `src/logging.ts`, redaction tests, [`logging.md`](logging.md), and ensure no real values/paths/emails/tokens are added to logs or test snapshots.

### CI/build/release

Review/update:

- `.github/workflows/*.yml`;
- package/Cargo manifests/config;
- test/setup/release/GitHub docs;
- release template/verification checklist;
- `what_changed.md`.

Actions token permissions should remain least-privilege. Release is the only normal workflow needing repository content write permission.

## Quality ladder

### Frontend

```bash
npm install
npm audit --audit-level=high
npm run secret:check
npm run typecheck
npm run lint
npm run format:check
npm run docs:check
npm test
npm run build
```

### Rust core

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo generate-lockfile
```

Run cargo-deny against the resolved graph.

### Native desktop

```bash
cargo check -p keysmith --all-targets
cargo clippy -p keysmith --all-targets -- -D warnings
```

Hosted CI must exercise native checks on Linux, Windows, and macOS. CodeQL Rust builds the complete workspace before analysis.

## CI ownership

### `.github/workflows/ci.yml`

Primary PR/main quality gate. It uses concurrency cancellation so only the newest commit for a PR/ref consumes runners. It covers frontend audit/secret/type/lint/hygiene/docs/tests/build, Rust core format/lint/tests/dependency policy, and native checks/Clippy on three OSes.

The frontend/core jobs also publish short-lived lockfile artifacts from actual package-manager resolution so maintainers can inspect/obtain reproducible files before stable release.

### `.github/workflows/codeql.yml`

Runs JavaScript/TypeScript and Rust analysis on PR/main plus schedule. Rust analysis performs a complete workspace build with Linux Tauri dependencies.

### `.github/workflows/release.yml`

`v*` tag workflow. A `Verify release tag` preflight checks tag/package version, frontend audit/secret/quality/build, and Rust core quality before platform artifact builds run.

Do not tag simply to test the workflow before the candidate is ready; use branch/PR verification first.

## Dependency updates

Dependabot covers Cargo, npm, and Actions. For every dependency update:

1. read upstream release/security notes for sensitive packages/plugins;
2. inspect resolved lockfile changes;
3. run audit/cargo-deny/CodeQL and relevant functional tests;
4. pay extra attention to `getrandom`, `eff-wordlist`, `zxcvbn`, `zeroize`, Tauri, clipboard/dialog/opener plugins, serialization, and build/release Actions;
5. never weaken license/source/advisory policy just to turn CI green.

## Lockfile policy

Before stable application release, commit trusted tool-generated `package-lock.json` and `Cargo.lock` from the exact dependency graph used for verification. Do not hand-author them.

After adding lockfiles:

- update [`repository-reference.md`](repository-reference.md);
- prefer reproducible install commands in CI/release where appropriate;
- rerun the full exact-commit matrix;
- record the resolution/evidence in `what_changed.md`.

## Version synchronization

Search/update all literal product versions, at minimum:

- workspace `Cargo.toml`;
- `package.json`;
- `src-tauri/tauri.conf.json`;
- visible `index.html` version surfaces;
- `CHANGELOG.md`;
- `what_changed.md`.

`src/version-consistency.test.ts` protects known version surfaces, but maintainers still review newly introduced version strings.

## Documentation completeness gate

`docs/repository-reference.md` must account for every Git-tracked project file. Run:

```bash
npm run docs:check
```

The checker uses `git ls-files` and fails for any undocumented tracked path. When adding a file, document its role before merge.

## Security review gate

Explicitly review changes involving:

- randomness/bounded selection/shuffle;
- policy validation/custom symbols/passphrase entropy;
- secret zeroization/lifetime;
- Tauri commands/plugins/capabilities/permissions/CSP/global bridge;
- clipboard worker/scheduling;
- native file export;
- external opener destinations;
- storage/logging;
- dependencies/build/release permissions.

Check for secret persistence/logging, UI-only validation, broader authority, wildcard destinations, filesystem/network side effects, unsafe error messages, and weakened dependency policy.

## Pull-request verification

1. Branch from the current intended base.
2. Make granular, coherent commits.
3. Open/update one authoritative PR.
4. Let concurrency cancel superseded workflow runs.
5. Inspect failures at job/step/log level.
6. Fix root cause and add regression coverage.
7. Repeat until checks are green on the **latest exact head**.
8. Resolve review conversations.
9. Merge only after required automated gates are green or a clearly documented non-code infrastructure limitation is accepted.
10. Verify the resulting `main` push checks.

A green older SHA is not evidence for a newer documentation/code commit.

## Packaged release gate

Before `v0.1.0` stable, complete [`verification.md`](verification.md) on actual packaged apps for Windows, macOS, and Linux, including:

- generation/presets/passphrases;
- batch native save/cancel/content;
- clipboard replacement/cancel/conditional clear;
- exact external links;
- themes/onboarding/settings;
- keyboard/screen-reader/scaling/reduced motion;
- no unexpected persistence/telemetry/network behavior;
- real release screenshots;
- accurate signing/notarization status.

## Handoff discipline

`what_changed.md` is the canonical continuation ledger. End each substantial session by recording:

- current version/milestone/active PR/head SHA;
- completed work and changed areas;
- observed verification results;
- failures and fixing commits;
- known limitations;
- exact next tasks;
- migration/preference notes;
- release-notes draft;
- recent commit hashes/messages.

Never mark a check passed because a workflow is configured; record only observed evidence.
