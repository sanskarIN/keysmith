# KeySmith — Development Handoff

Last updated: 2026-08-19
Current version: `2.0.12`
Current milestone: final `2.0.12` release-candidate verification
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Verification branch: `chore/final-verification`
Verification pull request: `#12` — `release: finalize KeySmith 2.0.12 verification`
Required maintainer commit email: `sanskarin@outlook.in`

This file is the canonical continuation and verification ledger for KeySmith. Read it together with `docs/repository-reference.md`, `docs/verification.md`, `docs/testing.md`, and `docs/release.md` before changing or releasing the project.

## Current release state

KeySmith is synchronized to version `2.0.12` across the Rust workspace, npm package, Tauri application configuration, generated dependency lockfiles, and visible application version surfaces.

The source-level feature set, security boundaries, regression tests, repository automation, dependency reproducibility controls, and documentation are implemented. PR #12 remains the release-candidate verification branch.

`2.0.12` is **not declared stable merely because the source version is complete**. A `v2.0.12` tag must not be created until the final PR head has the required CI and CodeQL matrix green and packaged applications complete the manual smoke/accessibility/screenshot gates in `docs/verification.md`.

Any green result from a commit before the final 2.0.12 head is useful historical evidence but does not replace final-head verification.

## Version 2.0.12 synchronization

These version-bearing surfaces now agree on `2.0.12`:

- `Cargo.toml` workspace package version,
- `Cargo.lock` entries for `keysmith` and `keysmith-core`,
- `package.json` package version,
- `package-lock.json` root package version,
- `src-tauri/tauri.conf.json` application version,
- footer version in `index.html`,
- Settings version text in `index.html`,
- About-dialog version text in `index.html`,
- `CHANGELOG.md`,
- `ROADMAP.md`,
- this `what_changed.md` ledger,
- PR #12 title/body.

The 2.0.12 lockfiles were regenerated on a clean GitHub hosted runner. The generated commit changed only the KeySmith workspace/root package versions in the two lockfiles. The temporary branch-only write-capable workflow used for regeneration was deleted immediately afterward and is not part of the permanent repository state.

## Implemented product scope

### Repository and architecture

- Rust 2024 workspace with a framework-independent `keysmith-core` crate.
- Tauri 2 native adapter and Vanilla TypeScript/Vite frontend.
- Windows, macOS, and Linux native bundle configuration.
- Apache-2.0 license and NOTICE.
- Security, privacy, support, contribution, and community policies.
- Structured issue forms and pull-request template.
- Funding configuration and Dependabot.
- CI, CodeQL, and tag-triggered release automation.
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
- Clipboard payload limit is 65,536 characters, covering the maximum valid 500 × 128-character batch plus separators.
- Command-owned Rust secret buffers are zeroized after handled clipboard operations/errors where practical.
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
- Shared password policy is represented as a named group because it is visible and active in both Password and Batch modes.
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

## Automated tests and permanent checks

### Rust core

`crates/keysmith-core/tests/security.rs` covers required enabled character classes, ambiguous-character exclusion, batch-size limits, passphrase word-count behavior, and related invalid-policy behavior.

`crates/keysmith-core/tests/properties.rs` contains property-based checks including generated length across the supported 4–128 range and digits-only output invariants.

### Tauri desktop adapter

`src-tauri/src/commands.rs` contains regression tests for the exact supported clipboard auto-clear duration set and for the clipboard payload limit remaining large enough for the maximum supported batch.

The Linux desktop CI job runs `cargo test --locked -p keysmith --lib` in addition to the Tauri compile check.

### TypeScript

`src/storage.test.ts` covers the privacy-oriented clipboard default, supported duration persistence, invalid stored-duration fallback, rejection of invalid duration writes, theme persistence, and first-run onboarding state.

### CI

`.github/workflows/ci.yml` runs:

- `npm ci`, TypeScript typecheck, ESLint, deterministic text-hygiene check, Vitest, and Vite production build,
- Rust formatting,
- strict locked Clippy for `keysmith-core`,
- locked `keysmith-core` tests,
- locked Tauri `cargo check` on Ubuntu, Windows, and macOS,
- locked desktop-adapter unit tests on Ubuntu,
- Cargo lockfile metadata validation and `cargo-deny` dependency policy.

Superseded PR runs are cancelled so only the latest head should consume the full matrix.

### CodeQL

`.github/workflows/codeql.yml` analyzes JavaScript/TypeScript and Rust on pull requests, pushes to `main`, and its scheduled run. Superseded PR runs are cancelled.

### Release workflow

`.github/workflows/release.yml` creates draft Windows/macOS/Linux release artifacts from version tags using `npm ci` and the tracked Cargo lockfile. Signing/notarization credentials are intentionally not stored in the repository.

## Defects found and fixed during release verification

### Incorrect Cargo dependency package name

The first clean hosted Linux Tauri compile failed during dependency resolution because the package key was written as `eff_wordlist`. Cargo identified the published package as `eff-wordlist`.

Resolution:

- corrected `crates/keysmith-core/Cargo.toml` to `eff-wordlist`,
- retained the correct Rust import name `eff_wordlist`,
- verified a later locked Ubuntu Tauri compile successfully passed before the version update.

### Obsolete duplicate Rust workflow

An older `.github/workflows/rust.yml` duplicated Rust coverage while trying to build the Tauri workspace on Ubuntu without installing the required Linux native prerequisites.

Resolution:

- removed the obsolete workflow,
- retained `.github/workflows/ci.yml` as the authoritative quality matrix,
- retained explicit Tauri Linux dependency installation in the maintained desktop job.

### Clipboard command hardening

The clipboard adapter accepted arbitrary `clear_after_seconds` IPC values and some early-return paths could bypass final zeroization of the command-owned secret string.

Resolution:

- allowlisted `0`, `15`, `30`, `60`, and `120` seconds at the native boundary,
- structured clipboard handling so the command-owned secret is zeroized after handled operations/errors,
- added adapter regression tests.

### Maximum Batch copy defect

A valid maximum Batch can contain 500 passwords × 128 characters plus separators, while the clipboard adapter previously rejected payloads above 4,096 characters.

Resolution:

- raised the guarded clipboard limit to 65,536 characters,
- added a regression test proving the maximum supported Batch plus separators fits the boundary.

### Persisted clipboard preference validation

The UI offered only supported values, but the persistence helper accepted arbitrary numeric writes.

Resolution:

- centralized supported values in `src/storage.ts`,
- invalid stored values fall back to 30 seconds,
- unsupported writes are ignored,
- added Vitest coverage.

### Batch policy visibility/accessibility defect

Batch generation used password-policy state while those controls were hidden in Batch mode. The original Password-only tab-panel semantics also became inaccurate once the controls were shared.

Resolution:

- keep password-policy controls visible in Password and Batch modes,
- explicitly state that Batch uses the policy shown above,
- represent the shared controls as a named `Password policy` group.

### Dependency reproducibility gap

The repository initially lacked npm and Cargo lockfiles because the earlier local execution shell could not access package registries normally.

Resolution:

- generated `package-lock.json` with npm package-lock-only mode and lifecycle scripts disabled,
- generated `Cargo.lock` on a clean GitHub hosted runner,
- committed both lockfiles,
- converted permanent CI/release automation to `npm ci` and locked Cargo resolution,
- synchronized setup/development/testing/release/verification/README documentation with that model,
- regenerated both lockfiles again after the explicit `2.0.12` version synchronization,
- removed both temporary branch-only generation workflows after their jobs completed.

## Verification evidence before final 2.0.12 head

On PR #12 head `fae6d30ac819159a28efea4927ce58cd8ec2f21a`, before the explicit version change:

- Ubuntu Tauri job completed successfully, including `npm ci`, `cargo check --locked -p keysmith --all-targets`, and desktop-adapter unit tests.
- JavaScript/TypeScript CodeQL completed successfully.
- Other jobs were still queued/in progress when the request to move the project to `2.0.12` arrived.

Those checks proved the underlying fixes could compile/run in the observed environments, but the version-bearing files and lockfiles changed afterward. The final `2.0.12` head therefore requires its own complete check suite.

## 2.0.12 lockfile evidence

Generated commit:

- `d41f7e28` — `build: regenerate lockfiles for 2.0.12`

Observed diff:

- `Cargo.lock`: `keysmith` version `0.1.0` → `2.0.12`
- `Cargo.lock`: `keysmith-core` version `0.1.0` → `2.0.12`
- `package-lock.json`: root package version `0.1.0` → `2.0.12`
- `package-lock.json`: `packages[""]` version `0.1.0` → `2.0.12`

No dependency package/version graph change was introduced by that regeneration beyond the local KeySmith package version fields.

Temporary workflow removal commit:

- `bbb06a19` — `ci: remove temporary 2.0.12 lockfile workflow`

The permanent branch therefore retains the generated lockfiles without retaining the temporary repository-write workflow.

## Documentation set

The maintained documentation includes:

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

`docs/repository-reference.md` is the deep file-by-file codebase map and must be updated whenever tracked project structure changes.

## Dependency reproducibility contract

- `package.json` and `package-lock.json` must stay synchronized.
- Clean verification/release installs use `npm ci`.
- Rust manifests and `Cargo.lock` must stay synchronized.
- CI/release Cargo commands use the tracked graph with `--locked` where supported or validate it through locked metadata.
- Dependency/version manifest changes and corresponding lockfile changes belong in the same pull request.
- Do not retain a permanent write-capable lockfile-generation workflow.

## Verification required before stable 2.0.12

The authoritative command and packaged-app checklist is `docs/verification.md`.

Do not call `2.0.12` stable until the final PR/release-candidate commit has direct evidence for:

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

When automated checks are pending or queued, PR #12's live checks are the source of truth. Do not infer success from configuration alone.

## Known limitations / deliberate design decisions

- KeySmith is a credential generator, not a password vault; password history is intentionally absent.
- No cloud synchronization or telemetry is planned for the offline-by-design model.
- Batch exports are plaintext by design and intentionally warn the user.
- Clipboard security depends on the operating system; other processes or clipboard managers can observe values before a clear operation.
- KeySmith can zeroize application-owned Rust buffers where practical but cannot promise zeroization of OS clipboard internals, webview/runtime copies, allocator remnants, or external clipboard-manager history.
- No silent automatic update check is implemented because normal product operation does not require network access.
- Real release screenshots are intentionally deferred until they can be captured from a verified packaged release candidate; placeholders are not presented as real output.
- Branch protection should use exact check names proven by the final green `2.0.12` PR matrix.
- Platform signing/notarization requires external/protected credentials and therefore is not represented as repository source material.

## Remaining exact release tasks

1. Keep PR #12 open until its **final 2.0.12 head** has the complete CI and CodeQL matrix green; inspect every failed job log and fix root causes rather than rerunning blindly.
2. If another behavior/security defect is found, add a regression test at the closest stable layer before considering it resolved.
3. Build native `2.0.12` release candidates on Windows, macOS, and Linux using tracked lockfiles.
4. Run every packaged-app smoke/accessibility step in `docs/verification.md`, including maximum Batch copy and all clipboard durations.
5. Capture real release screenshots from verified packaged applications and add them to README/release material.
6. Enable `main` branch protection using the proven required-check names.
7. Set the actual `2.0.12` release date in `CHANGELOG.md` only after the stable gate is satisfied.
8. Tag the verified stable commit as `v2.0.12` and let the release workflow create draft artifacts.
9. Inspect/sign/notarize artifacts as applicable before publishing the GitHub Release.

## Migration notes

There is no credential database and therefore no secret-data migration. The version change to `2.0.12` does not introduce secret-data migration. Future preference schema changes must preserve safe defaults and must never turn local preference storage into credential history.

## Release notes draft — 2.0.12

KeySmith 2.0.12 is an offline-first desktop password and passphrase generator with operating-system cryptographic randomness, unbiased random selection, EFF Diceware passphrases, zxcvbn strength estimates, configurable password policies and presets, Batch generation, guarded plaintext export, conditional clipboard auto-clear, first-run onboarding, privacy/accessibility/settings surfaces, tracked reproducible dependencies, cross-platform Tauri packaging configuration, deep security/architecture/repository documentation, and automated quality/security workflows.

Final verification hardening for 2.0.12 includes corrected EFF package resolution, clipboard trust-boundary validation, secret-buffer cleanup improvements, maximum Batch-copy support, persistence validation, Batch-policy accessibility corrections, desktop-adapter regression tests, locked dependency workflows, and removal of obsolete CI automation.

No account, telemetry, cloud sync, or password-history service is included.

## Important verification commits

The verification PR intentionally uses granular commits. Important pre-2.0.12 commits include:

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
- `9a663ef8` — `build: commit reproducible dependency lockfiles`
- `a51884d6` — `ci: remove temporary lockfile generation workflow`
- `f569c465` — `ci: enforce locked dependency installs`
- `b27144cc` — `ci: enforce release lockfiles`
- `2694e505` — `fix: align batch accessibility and repository link`
- `fae6d30a` — `docs: update final verification handoff ledger`

Version 2.0.12 commits include:

- `95f688d0` — `release: set Rust workspace version to 2.0.12`
- `06ea6548` — `release: set npm package version to 2.0.12`
- `9c9ad6ab` — `release: set Tauri app version to 2.0.12`
- `a3f1a8f3` — `release: show version 2.0.12 in the UI`
- `79953491` — `docs: prepare changelog for version 2.0.12`
- `3f1ac5e8` — `docs: align roadmap with 2.0.12 release candidate`
- `5f88d2de` — `docs: update GitHub operations for 2.0.12`
- `22df88da` — `docs: update handoff ledger for version 2.0.12`
- `3c0315a6` — `ci: regenerate lockfiles for version 2.0.12`
- `d41f7e28` — `build: regenerate lockfiles for 2.0.12`
- `bbb06a19` — `ci: remove temporary 2.0.12 lockfile workflow`

Continue recording version/verification commits here when they materially change release status.

## Commit identity

Maintainer commits for this work use `Sanskar <sanskarin@outlook.in>`. Continue using that email for project-maintainer commits.
