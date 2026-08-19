# KeySmith — Development Handoff

Last updated: 2026-08-19
Current version: `0.1.0`
Current milestone: final release-candidate verification
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Verification branch: `chore/final-verification`
Verification pull request: `#12` — `chore: finalize release verification and documentation`
Required maintainer commit email: `sanskarin@outlook.in`

This file is the canonical continuation and verification ledger for KeySmith. Read it together with `docs/repository-reference.md` and `docs/verification.md` before changing or releasing the project.

## Current release state

KeySmith's planned `0.1.0` feature set, security boundaries, tests, repository automation, dependency lockfiles, and documentation are implemented. The final verification pull request performs the clean hosted-runner checks and contains the defects found during that process.

`0.1.0` is **not yet declared stable in this file**. A stable tag must not be created until the final pull-request head is green for the required CI and CodeQL matrix and the packaged applications have completed the manual smoke-test/accessibility/screenshot gates in `docs/verification.md`.

The live check state for the current head is the check suite on PR #12. This ledger intentionally does not claim a pending check passed merely because an earlier commit passed or progressed farther.

## Implemented product scope

### Repository and architecture

- Rust 2024 workspace with a framework-independent `keysmith-core` crate.
- Tauri 2 native adapter and Vanilla TypeScript/Vite frontend.
- Windows, macOS, and Linux native bundle configuration.
- Apache-2.0 license, NOTICE, security/privacy/support/community policies, contribution guide, code of conduct, issue forms, pull-request template, funding configuration, Dependabot, CI, CodeQL, and tag release workflow.
- Tracked `Cargo.lock` and `package-lock.json` dependency graphs.
- Locked dependency consumption in CI and release automation.
- Architecture decisions under `docs/adr/`.
- File-by-file repository map in `docs/repository-reference.md`.

### Password generation

- Operating-system CSPRNG through Rust `getrandom`.
- Rejection sampling for unbiased bounded random selection.
- Secure Fisher-Yates-style shuffle backed by the same unbiased sampler.
- Password length validation from 4 to 128 characters.
- Lowercase, uppercase, digit, symbol, custom-symbol, and ambiguous-character controls.
- At least one character from each enabled class when the requested length permits it.
- Batch generation from 1 to 500 passwords.
- Balanced, Maximum, Legacy-compatible, and Alphanumeric presets.
- Batch mode exposes the same password-policy controls actually used for generation.

### Passphrases and strength

- EFF large Diceware list through the Cargo package `eff-wordlist` and Rust crate import `eff_wordlist`.
- 3–12 word selection.
- Separator validation, optional capitalization, and optional two-digit suffix.
- Selection-space entropy estimate.
- zxcvbn strength score/guess estimate adapter.
- Word-list provenance and selection model documented in `docs/wordlists.md`.

### Clipboard and export handling

- Explicit native clipboard copy command.
- Supported auto-clear choices are exactly: never (`0`), `15`, `30`, `60`, or `120` seconds.
- Native command boundary rejects unsupported auto-clear values even if a caller bypasses the UI.
- Frontend persistence rejects unsupported clipboard-clear values and falls back to the privacy-oriented 30-second default.
- Auto-clear erases the clipboard only when it still contains the exact value KeySmith copied.
- Explicit clear-now action.
- Clipboard payload limit is 65,536 characters, which safely covers the maximum valid 500 × 128-character batch plus separators.
- The clipboard command's Rust secret buffer is zeroized after use on successful and handled error paths where practical.
- OS clipboard/clipboard-manager copies remain outside KeySmith's memory-zeroization boundary.
- Batch export is explicit plaintext, includes an in-product warning, and writes a warning header into the exported file.

### UI/UX and accessibility

- Responsive desktop layout and reusable design tokens.
- Password, Passphrase, and Batch modes.
- Live strength presentation.
- Safe defaults and presets.
- Light, dark, and system themes.
- First-run onboarding with only a non-secret completion flag persisted.
- Settings surfaces for appearance, privacy/data, accessibility, updates, and onboarding help.
- About surface with version, Apache-2.0, repository, support/business contacts, Buy Me a Coffee, and `Made by the Sanskar`.
- Keyboard tab navigation, skip link, visible focus, semantic controls/labels, aria-live status, reduced-motion support, responsive touch targets, and non-color-only status text.
- Shared password policy is represented as a named group rather than a Password-only tab panel because it is also visible and active in Batch mode.
- Editable SVG logo and native PNG/ICO/ICNS icons.

### Privacy/security boundaries

- No account requirement.
- No telemetry or analytics.
- No password/passphrase history.
- No generation-time network dependency.
- Only non-secret preferences are written to application local storage.
- Restrictive Tauri CSP with prototype freezing.
- Least-privilege Tauri capability: core defaults plus only KeySmith generation/preset and clipboard commands.
- No broad filesystem, shell, or network command permission is granted to the frontend.
- Typed core errors with user-safe messages.
- Threat model covering assets, boundaries, threats, mitigations, and residual risks.
- `.env.example` contains no credential.
- `deny.toml` defines Rust advisory/license/source policy.

## Persisted local preference contract

These are the only application local-storage keys intentionally maintained:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Generated passwords, passphrases, batch values, strength inputs, custom symbols, clipboard contents, and export contents are not written to application local storage.

## Automated tests and checks

### Rust core

`crates/keysmith-core/tests/security.rs` covers security/policy behavior such as:

- required enabled character classes,
- ambiguous-character exclusion,
- batch-size limits,
- passphrase word-count behavior.

`crates/keysmith-core/tests/properties.rs` includes property-based checks such as:

- generated length across the complete supported 4–128 range,
- digits-only output invariant.

### Tauri desktop adapter

`src-tauri/src/commands.rs` contains regression tests for:

- the exact supported clipboard auto-clear duration set,
- the clipboard payload limit remaining large enough for the maximum supported batch.

The Linux desktop CI job runs `cargo test --locked -p keysmith --lib` in addition to the Tauri compile check.

### TypeScript

`src/storage.test.ts` covers:

- privacy-oriented clipboard default,
- supported clipboard duration persistence,
- invalid stored duration fallback,
- rejection of invalid clipboard setting writes,
- theme persistence,
- first-run onboarding completion state.

### Permanent CI gates

`.github/workflows/ci.yml` currently runs:

- `npm ci`, TypeScript typecheck, ESLint, deterministic text-hygiene check, Vitest, and Vite production build,
- Rust formatting,
- strict locked Clippy for `keysmith-core`,
- locked `keysmith-core` tests,
- locked Tauri `cargo check` on Ubuntu, Windows, and macOS,
- locked desktop-adapter unit tests on Ubuntu,
- Cargo lockfile metadata validation and `cargo-deny` dependency policy.

The workflow cancels superseded pull-request runs so only the current head consumes the full matrix.

`.github/workflows/codeql.yml` analyzes JavaScript/TypeScript and Rust on pull requests, `main`, and its scheduled run, with superseded PR runs cancelled.

`.github/workflows/release.yml` creates draft Windows/macOS/Linux release artifacts from version tags using `npm ci` and the tracked Cargo lockfile. Signing/notarization credentials are deliberately not stored in the repository.

## Final verification work performed on PR #12

### Clean-run defect 1 — incorrect Cargo dependency name

The first real hosted Linux Tauri compiler run failed during dependency resolution. Cargo reported that no package named `eff_wordlist` could be found and identified the package as `eff-wordlist`.

Resolution:

- corrected `crates/keysmith-core/Cargo.toml` from the invalid package key `eff_wordlist` to `eff-wordlist`,
- retained the correct Rust import name `eff_wordlist` in source,
- reran the PR through the clean hosted pipeline.

This was a real release-blocking manifest defect discovered by verification, not a documentation-only issue.

### Clean-run defect 2 — obsolete duplicate Rust workflow

The repository contained an older `.github/workflows/rust.yml` workflow that duplicated Rust coverage while attempting a whole Tauri workspace build on Ubuntu without installing the Linux Tauri system prerequisites.

Resolution:

- removed the obsolete workflow,
- retained `.github/workflows/ci.yml` as the authoritative quality matrix,
- kept the explicit Linux dependency installation in the maintained Tauri job.

### Clipboard hardening defects

The clipboard adapter accepted an arbitrary `clear_after_seconds` value from IPC and some early-return error paths could bypass final zeroization of the command-owned secret string.

Resolution:

- allowlisted only `0`, `15`, `30`, `60`, and `120` seconds at the native boundary,
- structured clipboard handling so the command-owned secret is zeroized after handled clipboard operations/errors,
- added adapter regression coverage.

### Maximum Batch copy defect

The valid maximum batch contains up to 500 passwords × 128 characters plus separators, but the clipboard adapter previously rejected any payload above 4,096 characters. Therefore a UI-supported maximum batch could not be copied in full.

Resolution:

- raised the guarded maximum clipboard character count to 65,536,
- added a regression test proving that the maximum supported batch plus separators fits within that boundary.

### Persisted clipboard preference validation

The UI writes only predefined durations, but previously the persistence helper would store any numeric value supplied programmatically.

Resolution:

- centralized the supported duration set in `src/storage.ts`,
- invalid stored values fall back to 30 seconds,
- unsupported writes are ignored,
- added a Vitest regression test.

### Batch policy visibility/accessibility defect

Batch generation used the password option state while the password controls were hidden in Batch mode, so users could generate a batch with policy values they could not see or edit in that mode. The original Password panel semantics also became incorrect once the controls were shared.

Resolution:

- keep the password-policy controls visible in Password and Batch modes,
- show a Batch hint that the policy above is used,
- represent the shared controls as a named `Password policy` group instead of a Password-only tab panel.

### Dependency reproducibility gap

The repository did not initially contain npm or Cargo lockfiles because the prior execution shell lacked normal registry access.

Resolution:

- generated `package-lock.json` with npm's package-lock-only mode while lifecycle scripts were disabled,
- generated `Cargo.lock` on a clean GitHub hosted runner,
- committed both lockfiles,
- removed the temporary branch-only write-capable lockfile workflow immediately afterward,
- converted permanent CI and release jobs to `npm ci` and locked Cargo resolution,
- synchronized setup/development/testing/release/verification/README documentation with the locked workflow.

## Documentation set

The maintained documentation now includes:

- `README.md`
- `LICENSE`
- `NOTICE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `PRIVACY.md`
- `THREAT_MODEL.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
- `docs/repository-reference.md`
- `docs/architecture.md`
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/verification.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/github.md`
- `docs/wordlists.md`
- `docs/adr/0001-rust-core-tauri-ui.md`
- `docs/adr/0002-os-csprng-and-no-secret-storage.md`
- `.github/RELEASE_TEMPLATE.md`

`docs/repository-reference.md` is the deep file-by-file codebase map; update it whenever tracked project structure changes.

## Dependency reproducibility contract

- `package.json` and `package-lock.json` must stay synchronized.
- Clean verification/release installs use `npm ci`.
- `Cargo.toml` manifests and `Cargo.lock` must stay synchronized.
- CI/release Cargo commands use the tracked graph with `--locked` where supported or validate it using locked metadata.
- Dependency-manifest changes and corresponding lockfile changes belong in the same pull request.
- Do not add a permanent workflow with repository write permission solely for dependency generation.

## Verification required before stable `0.1.0`

The authoritative command and packaged-app checklist is `docs/verification.md`.

Do not call `0.1.0` stable until the final PR/release-candidate commit has direct evidence for:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run format:check`
5. `npm test`
6. `npm run build`
7. `cargo fmt --all -- --check`
8. `cargo clippy --locked -p keysmith-core --all-targets --all-features -- -D warnings`
9. `cargo test --locked -p keysmith-core --all-features`
10. `cargo check --locked -p keysmith --all-targets` on Windows, macOS, and Linux
11. `cargo test --locked -p keysmith --lib`
12. Cargo dependency/lock policy and `cargo-deny`
13. CodeQL for JavaScript/TypeScript and Rust
14. native Tauri release builds on Windows, macOS, and Linux
15. packaged-app smoke testing on the produced builds
16. keyboard/accessibility manual review
17. real release screenshots from the verified packaged build

When automated checks are still pending or queued, PR #12's live checks are the source of truth. Do not infer success from configuration alone.

## Known limitations / deliberate design decisions

- KeySmith is a credential generator, not a password vault; password history is intentionally absent.
- No cloud synchronization or telemetry is planned for the offline-by-design model.
- Batch exports are plaintext by design and intentionally warn the user.
- Clipboard security depends on the operating system; other processes or clipboard managers can observe values before a clear operation.
- KeySmith can zeroize application-owned Rust buffers where practical but cannot promise zeroization of OS clipboard internals, webview/runtime copies, allocator remnants, or external clipboard-manager history.
- No silent automatic update check is implemented because normal product operation does not require network access.
- Real release screenshots are intentionally deferred until they can be captured from a verified packaged release candidate; placeholder screenshots are not presented as real output.
- Branch protection should use the actual check names proven by the final green PR matrix rather than guessed names.
- Platform signing/notarization requires external/protected credentials and therefore is not represented as repository source material.

## Remaining exact release tasks

1. Keep PR #12 open until its **final head** has the complete CI and CodeQL matrix green; inspect every failed job log and fix the root cause rather than rerunning blindly.
2. If a behavior/security defect is found, add a regression test at the closest stable layer before considering it resolved.
3. Build native release candidates on Windows, macOS, and Linux using the tracked lockfiles.
4. Run every packaged-app smoke/accessibility step in `docs/verification.md`, including maximum Batch copy and all clipboard durations.
5. Capture real release screenshots from the verified packaged application and add them to the README/release material.
6. Enable `main` branch protection using the proven required-check names.
7. Set the actual release date in `CHANGELOG.md` only after the stable gate is satisfied.
8. Tag the verified stable commit as `v0.1.0` and let the release workflow create draft artifacts.
9. Inspect/sign/notarize artifacts as applicable before publishing the GitHub Release.

## Migration notes

There is no credential database and therefore no secret-data migration. Future preference schema changes must preserve safe defaults and must never turn local preference storage into credential history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 introduces an offline-first desktop password and passphrase generator with operating-system cryptographic randomness, unbiased random selection, EFF Diceware passphrases, zxcvbn strength estimates, configurable password policies and presets, Batch generation, guarded plaintext export, conditional clipboard auto-clear, first-run onboarding, privacy/accessibility/settings surfaces, locked reproducible dependencies, cross-platform Tauri packaging configuration, deep security/architecture/repository documentation, and automated quality/security workflows.

No account, telemetry, cloud sync, or password-history service is included.

## Final-verification commit trail

The verification PR intentionally uses granular commits. Important commits include:

- `0ed88f7c` — `docs: add release verification runbook`
- `c03d2298` — `ci: remove obsolete duplicate Rust workflow`
- `806d6c4` — `fix: harden clipboard command secret handling`
- `8ee96e40` — `fix: allow copying maximum supported batches`
- `4d65593e` — `test: run desktop adapter unit tests in CI`
- `c07c15a` — `ci: cancel superseded verification runs`
- `adea1f74` — `ci: cancel superseded CodeQL runs`
- `e1e074f4` — `fix: correct EFF wordlist package name`
- `05947a88` — `docs: add complete repository file reference`
- `57e97b4d` — `fix: validate persisted clipboard settings`
- `3e5c39b2` — `test: cover invalid clipboard preference writes`
- `9f5bb03c` — `fix: expose password policy in batch mode`
- `52c75a9e` — `docs: expand README documentation and verification map`
- `684af5b4` — `docs: expand testing and regression strategy`
- `a47c0225` — `docs: make release process evidence driven`
- `69a4edec` — `docs: record final verification fixes in changelog`
- `9a663ef8` — `build: commit reproducible dependency lockfiles`
- `a51884d6` — `ci: remove temporary lockfile generation workflow`
- `f569c465` — `ci: enforce locked dependency installs`
- `b27144cc` — `ci: enforce release lockfiles`
- `2694e505` — `fix: align batch accessibility and repository link`
- `fb3b67f1` — `docs: enforce locked release verification commands`
- `95f73e0c` — `docs: use lockfiles in setup instructions`
- `2befb204` — `docs: align development workflow with locked CI`
- `ed000a37` — `docs: align testing with reproducible dependency gates`
- `1115c7ce` — `docs: use locked dependencies in README`
- `83faba3a` — `docs: record tracked dependency lockfiles`
- `c1467382` — `docs: finalize verification changelog entries`

The initial pre-verification implementation history remains on `main` and is not repeated here; inspect Git history for the complete granular trail.

## Commit identity

Maintainer commits for this work use `Sanskar <sanskarin@outlook.in>`. Continue using that email for project-maintainer commits.
