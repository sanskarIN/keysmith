# KeySmith — Development Handoff

Last updated: 2026-08-20
Current version: `2.7.4`
Current milestone: v2.7.4 release-candidate hardening and verification
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Release branch: `release/v2.7.4`
Verification pull request: `#13` — `release: prepare KeySmith v2.7.4`
Required commit email: `sanskarin@outlook.in`

This file is the canonical continuation ledger for future KeySmith work. Read it, the latest commits, the open release pull request, and the current workflow state before changing the repository.

## v2.7.4 status

The repository has been moved from the earlier `0.1.0` preview metadata to the requested `2.7.4` release-candidate line. The version number is now synchronized across the frontend package, Rust workspace, Tauri bundle configuration, and visible application labels.

`v2.7.4` is **not yet declared stable and must not be tagged yet**. The remaining blockers are clean CI/CodeQL evidence on the exact final candidate commit, trusted lockfile generation, native package builds, packaged-app smoke testing, real screenshots, branch-protection setup, and final release-artifact verification.

PR #13 is open and currently reported as mergeable by the connected GitHub integration. CI and CodeQL were successfully observed as queued on candidate SHA `c46f8e8c` after the redundant legacy Rust workflow was removed: the maintained CI matrix exposed six jobs and CodeQL exposed two language jobs. Additional documentation-only commits were then made to complete the repository documentation audit. At the time this ledger was finalized, the newest documentation commit had not yet exposed its replacement workflow runs through the connector. Therefore **no claim of green CI is made**. The exact final PR head must be checked again before merge or tag.

## Work completed in this v2.7.4 continuation

### 1. Version synchronization

Changed exact paths:

- `package.json`
  - package version changed from `0.1.0` to `2.7.4`.
  - `version:check` npm task added.
- `Cargo.toml`
  - `[workspace.package].version` changed from `0.1.0` to `2.7.4`.
  - both `crates/keysmith-core` and `src-tauri` continue inheriting the workspace version.
- `src-tauri/tauri.conf.json`
  - Tauri application/bundle version changed from `0.1.0` to `2.7.4`.
- `index.html`
  - footer version changed to `KeySmith v2.7.4`.
  - Settings update text changed to `Version 2.7.4`.
  - About dialog version changed to `2.7.4`.
- `CHANGELOG.md`
  - v2.7.4 release-candidate section added and expanded with the hardening fixes from this pass.
  - the old 0.1.0 checkpoint is retained only as historical preview context and is explicitly described as superseded before stable release.

### 2. Deterministic release-version integrity gate

Changed exact paths:

- `scripts/check-version.mjs`
  - new dependency-free Node script.
  - validates semantic version syntax from `package.json`.
  - compares the frontend package version with the Rust workspace version in `Cargo.toml`.
  - compares the frontend package version with `src-tauri/tauri.conf.json`.
  - scans semantic versions exposed in `index.html` and rejects visible UI mismatches.
  - optionally accepts `KEYSMITH_EXPECTED_VERSION` and strips a leading `v` so a prospective/release Git tag can be compared with repository metadata.
  - exits with an error on any mismatch.
- `package.json`
  - added `npm run version:check`.
- `.github/workflows/ci.yml`
  - frontend quality job now executes `npm run version:check`.
- `.github/workflows/release.yml`
  - tag-triggered builds now set `KEYSMITH_EXPECTED_VERSION` to `${{ github.ref_name }}` and run the version check before `tauri-apps/tauri-action`.
  - a tag such as `v2.7.5` cannot silently build artifacts while the repository manifests still identify `2.7.4`.

### 3. Custom-symbol policy hardening

A backend trust-boundary gap was found: HTML limited custom symbols to 40 characters, but direct Tauri IPC could bypass that UI constraint and could pass letters, digits, whitespace, or control characters as the requested “symbol” class. That could weaken the meaning of an enabled symbol requirement and permit unnecessarily large input.

Changed exact paths:

- `crates/keysmith-core/src/error.rs`
  - added `KeySmithError::InvalidCustomSymbols` with a user-safe validation message.
- `crates/keysmith-core/src/generator.rs`
  - added a backend maximum of 40 custom-symbol characters.
  - rejects alphanumeric custom-symbol characters.
  - rejects whitespace custom-symbol characters.
  - rejects control characters.
  - applies the existing ambiguity-exclusion set to custom symbols.
  - deduplicates repeated custom symbols before random selection so duplicate user input does not create duplicate entries in the symbol candidate set.
  - ignores stale custom-symbol text when the symbol class is disabled, so an inactive control cannot block lowercase/uppercase/digit-only generation.
  - preserves the existing default symbol set when no custom symbols are supplied.
- `crates/keysmith-core/tests/security.rs`
  - regression test rejects alphanumeric custom-symbol input.
  - regression test rejects more than 40 custom-symbol characters.
  - regression test verifies deduplication/ambiguity behavior by reducing `!!|` with ambiguity exclusion to `!`.
  - regression test verifies disabled symbol mode ignores stale invalid custom-symbol text.
  - regression test iterates every built-in preset and confirms it remains a valid generation policy after the stricter backend validation.

### 4. Clipboard secret-lifetime and IPC-duration hardening

A clipboard error-path issue was found: the input `String` was explicitly zeroized on the success path and one explicit oversize path, but early errors while opening or writing the clipboard could return before the owned input buffer was zeroized. Direct IPC could also request arbitrary clear durations that did not match the documented UI choices.

Changed exact paths:

- `src-tauri/src/commands.rs`
  - wraps the owned clipboard command secret in `zeroize::Zeroizing<String>` immediately on entry so normal return and early-error paths receive best-effort zeroization on drop.
  - wraps the delayed comparison copy in `Zeroizing<String>` while the conditional clear timer is active.
  - introduces the authoritative duration allowlist `[0, 15, 30, 60, 120]` seconds.
  - rejects undocumented IPC clear durations instead of accepting arbitrary values and silently capping them.
  - preserves the 4096-character clipboard input cap.
  - preserves conditional clearing: KeySmith clears only if the clipboard still contains the expected copied secret.
  - adds unit tests for accepted and rejected clipboard duration values.
- `.github/workflows/ci.yml`
  - desktop matrix now runs `cargo test -p keysmith --lib` on Windows, macOS, and Linux.
  - desktop matrix now installs Clippy and runs `cargo clippy -p keysmith --all-targets -- -D warnings` so adapter warnings fail CI instead of being informational only.

### 5. CI workflow consolidation

A previously undocumented `.github/workflows/rust.yml` was discovered when the first v2.7.4 PR workflows became visible. It duplicated Rust build/test coverage on Ubuntu but did not install the Linux Tauri/WebKit system dependencies required by the workspace, making it both redundant and a likely source of misleading failures.

Changed exact path:

- `.github/workflows/rust.yml`
  - removed completely.
  - the maintained `.github/workflows/ci.yml` remains authoritative for Rust-core quality, cross-platform Tauri checks, desktop adapter Clippy/tests, frontend quality, and Rust dependency policy.

Observed after removal on SHA `c46f8e8c`:

- CI workflow queued with:
  - `Frontend quality`,
  - `Rust core quality`,
  - `Rust dependency policy`,
  - `Tauri check (ubuntu-22.04)`,
  - `Tauri check (windows-latest)`,
  - `Tauri check (macos-latest)`.
- CodeQL workflow queued with:
  - `analyze (javascript-typescript)`,
  - `analyze (rust)`.
- no replacement standalone `Rust` workflow was triggered on that SHA.

### 6. Security, privacy, contributor, GitHub, and release documentation updated

Changed exact paths:

- `SECURITY.md`
  - supported release line updated to `2.7.x`.
  - older release lines are documented as unsupported for security fixes.
- `PRIVACY.md`
  - documents the exact non-secret preference keys.
  - documents the frontend fallback and backend clipboard-duration allowlist.
  - documents temporary in-memory copies across TypeScript, Rust, webview, and OS clipboard boundaries.
  - clarifies that Rust `Zeroizing<String>` is best-effort and is not a claim that JavaScript strings, OS clipboard implementations, or all process memory can be erased on demand.
  - documents clear-now semantics and plaintext batch-export persistence outside the memory-only secret policy.
  - explicitly prohibits generated-secret logging/analytics under the current privacy model.
- `THREAT_MODEL.md`
  - adds malformed custom-symbol policy as a modeled threat.
  - records the 40-character backend cap and character-category rejection.
  - records ambiguity filtering and deduplication.
  - records clipboard duration allowlisting and zeroizing wrappers.
  - records release/version mismatch as a supply/release-integrity threat.
  - adds corresponding abuse-case mitigations.
- `docs/testing.md`
  - documents Rust-core custom-symbol regression coverage.
  - documents desktop-adapter clipboard-duration tests.
  - documents `npm run version:check` and tag verification.
  - documents desktop Clippy as a required static gate.
  - distinguishes automated clipboard policy tests from manual OS clipboard integration testing.
- `docs/release.md`
  - replaces the short release checklist with a detailed release-candidate process.
  - includes version consistency, frontend checks, Rust core checks, desktop checks/tests/Clippy, cargo-deny, CodeQL, package builds, smoke tests, screenshots, merge verification, tag verification, signing/notarization, and artifact review.
  - adds the explicit v2.7.4 rule: final tag must be exactly `v2.7.4` and must not be created before the complete gate is green.
- `docs/development.md`
  - adds `npm run version:check` and exact Rust core/desktop verification commands.
  - explicitly treats webview-to-Tauri IPC as an untrusted validation boundary.
  - documents zeroization/error-path and security-regression expectations.
  - documents every version-bearing path that must change for a release.
- `docs/github.md`
  - removes the stale `0.1 Secure MVP` / `0.2 Hardening` / `1.0 Stable` milestone plan.
  - makes v2.7.4 release verification the current milestone.
  - documents the actual maintained CI/CodeQL job names observed for the candidate.
  - explicitly warns not to configure the removed legacy `Rust` workflow as a required check.
  - documents release-branch/tag and branch-protection sequencing.
- `ROADMAP.md`
  - removes the stale 0.1/0.2/1.0 phase structure.
  - makes v2.7.4 the current release candidate.
  - separates completed candidate work from exact pre-tag blockers.
  - keeps future hardening work focused on UI/accessibility automation, meaningful fuzz/property work, provenance/SBOM opportunities, and preserving KeySmith’s offline/no-history scope.
- `README.md`
  - identifies 2.7.4 as the current release-candidate line.
  - adds release-candidate badge text.
  - documents custom-symbol backend hardening.
  - documents clipboard duration/zeroization hardening.
  - documents the release-version integrity gate.
  - removes stale “Phase 5” screenshot wording and states that real screenshots must come from verified v2.7.4 packaged builds.
  - updates development/build command examples.
- `CONTRIBUTING.md`
  - aligns the contributor quality gate with v2.7.4 CI.
  - adds version consistency, desktop Clippy/tests, IPC trust-boundary validation, security regression rules, release-status truthfulness, and exact version-bearing paths.
- `.github/pull_request_template.md`
  - expands verification checkboxes for frontend, version consistency, Rust core, desktop adapter, manual OS integration, regression tests, secret exclusion, documentation, and security/privacy/accessibility/release impact.
  - adds an explicit “Remaining verification” section.
- `.github/RELEASE_TEMPLATE.md`
  - removes the stale “0.1 series” upgrade note.
  - adds tag/manifest consistency, full CI/CodeQL, package/manual smoke tests, screenshots, signing/artifact checks, documentation updates, and known-limitations requirements.
- `CHANGELOG.md`
  - records the v2.7.4 added/changed/fixed/security details from this continuation.
- `what_changed.md`
  - this canonical ledger now records all work through the final documentation audit and the observed workflow state.

## Existing implemented product scope retained

### Repository and architecture

- Rust 2024 workspace with framework-independent `crates/keysmith-core`.
- Tauri 2 desktop adapter under `src-tauri`.
- Vanilla TypeScript/Vite presentation layer under `src` plus `index.html`.
- Windows, macOS, and Linux bundle configuration.
- Apache-2.0 license and NOTICE.
- public/open-source repository metadata, funding link, issue templates, pull-request template, Dependabot, CI, CodeQL, and release workflow.
- strict design boundary: generated credentials are never intentionally persisted by application code.
- architecture decisions under `docs/adr/`.

### Password generation

- operating-system CSPRNG through `getrandom`.
- rejection sampling for unbiased bounded selection.
- Fisher-Yates-style secure shuffle backed by the same unbiased sampler.
- password length validation from 4 to 128 characters.
- lowercase, uppercase, digit, and symbol controls.
- custom symbols with v2.7.4 backend validation.
- ambiguous-character exclusion.
- at least one character from every enabled class.
- batch generation from 1 to 500 passwords.
- Balanced, Maximum, Legacy-compatible, and Alphanumeric presets.

### Passphrases and strength

- EFF large Diceware list through `eff_wordlist`.
- 3–12 word selection.
- separator validation, capitalization, and optional two-digit suffix.
- selection-space entropy estimate.
- zxcvbn strength scoring and guess estimates.
- word-list source/selection model documented in `docs/wordlists.md`.

### Clipboard and exports

- explicit clipboard copy command through the Rust desktop adapter.
- supported auto-clear settings: never, 15 seconds, 30 seconds, 1 minute, or 2 minutes.
- backend v2.7.4 allowlist for those values.
- auto-clear checks that the clipboard still equals the copied value before erasing it.
- explicit clear-now action.
- clipboard command rejects values over 4096 characters.
- owned command/expected secret buffers use best-effort zeroizing wrappers where practical.
- batch export is explicit plaintext with an in-product warning and warning header in the exported file.

### UI/UX

- responsive desktop layout and reusable design tokens.
- Password, Passphrase, and Batch tabs.
- live strength presentation.
- policy presets and safe defaults.
- light, dark, and system themes.
- first-run onboarding with a locally stored non-secret completion flag.
- Settings surface covering appearance, privacy/data, accessibility, updates, and onboarding help.
- About surface with version, Apache-2.0, support/business contacts, GitHub, Buy Me a Coffee, and `Made by the Sanskar`.
- keyboard tab navigation, skip link, visible focus, semantic fieldsets/labels, aria-live status, reduced-motion support, responsive touch targets, and non-color-only status text.
- editable SVG logo plus native PNG/ICO/ICNS application icons.

### Privacy/security baseline

- no account requirement.
- no telemetry or analytics.
- no password history.
- no generation-time network dependency.
- restrictive Tauri CSP.
- explicit least-privilege Tauri capabilities and command permissions.
- central typed Rust core errors with user-safe messages.
- documented threat model and residual risks.
- `.env.example` contains no credentials.
- `deny.toml` provides Rust advisory/license/source policy.
- CodeQL and dependency update automation are configured.

## Automated tests currently present

### Rust core

- `crates/keysmith-core/tests/security.rs`
  - required enabled classes are represented,
  - ambiguity exclusion,
  - custom-symbol validation and boundaries,
  - custom-symbol ambiguity/deduplication behavior,
  - disabled custom-symbol state behavior,
  - built-in preset validity,
  - batch-size limits,
  - passphrase word-count behavior.
- `crates/keysmith-core/tests/properties.rs`
  - generated length invariant across 4–128 characters,
  - digits-only output invariant.

### Desktop adapter

- `src-tauri/src/commands.rs` test module
  - all documented clipboard clear durations accepted,
  - undocumented durations rejected.

### TypeScript

- `src/storage.test.ts`
  - privacy-oriented clipboard default,
  - supported clipboard duration persistence,
  - invalid stored duration fallback,
  - theme persistence,
  - first-run onboarding state persistence.

## Documentation map

Primary repository/project documentation currently includes:

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
- `docs/architecture.md`
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/github.md`
- `docs/wordlists.md`
- `docs/adr/0001-rust-core-tauri-ui.md`
- `docs/adr/0002-os-csprng-and-no-secret-storage.md`
- `.github/RELEASE_TEMPLATE.md`

## GitHub automation currently present

- `.github/workflows/ci.yml`
  - frontend typecheck/lint/text-hygiene/version-consistency/tests/build,
  - Rust core format/Clippy/tests,
  - Tauri `cargo check`, adapter Clippy, and adapter unit tests on Ubuntu, Windows, and macOS,
  - cargo-deny dependency policy.
- `.github/workflows/codeql.yml`
  - JavaScript/TypeScript and Rust analysis.
- `.github/workflows/release.yml`
  - tag-triggered Windows/macOS/Linux draft release builds,
  - tag-to-manifest version check before artifact generation.
- `.github/dependabot.yml`
  - Cargo, npm, and GitHub Actions updates.
- `.github/workflows/rust.yml`
  - removed as redundant legacy automation; do not restore it unless a materially distinct verification purpose is designed.
- structured bug/feature issue forms and issue routing.
- strengthened pull-request quality/security/release checklist.
- modernized release template.
- Buy Me a Coffee funding configuration.

## Verification performed during this v2.7.4 continuation

### Repository/GitHub verification

- read the pre-existing `what_changed.md` before changing the repository.
- inspected the latest `main` commit checkpoint (`374dea7e` — `docs: add development handoff and verification ledger`).
- confirmed repository write/admin permissions through the connected GitHub integration.
- created `release/v2.7.4` from the exact prior `main` checkpoint.
- opened PR #13 against `main` so the candidate has a PR verification target.
- PR #13 is currently reported as open and mergeable by the connected GitHub integration.
- no open repository issues were returned by the connected issue search during this pass.
- discovered the legacy `.github/workflows/rust.yml` when GitHub exposed an unexpected third workflow named `Rust` on an earlier candidate SHA.
- removed that redundant workflow and observed that candidate SHA `c46f8e8c` then queued only the maintained `CI` and `CodeQL` workflows.
- observed six maintained CI jobs and two CodeQL language jobs queued on `c46f8e8c` as listed above.
- updated PR #13 body with the complete v2.7.4 scope, hardening details, and explicit release blockers.

### Local executable verification available in the current environment

The current shell has Node.js `v22.16.0` but no Rust/Cargo toolchain and no external network/DNS access. A direct `git clone` attempt against the public repository failed because the shell could not resolve `github.com`, confirming that the local shell cannot be used as a clean online build environment in this session.

A local fixture reproducing the committed `scripts/check-version.mjs` logic was executed with Node.js:

1. repository metadata values set to `2.7.4` → passed.
2. `KEYSMITH_EXPECTED_VERSION=v2.7.4` → passed.
3. `KEYSMITH_EXPECTED_VERSION=v2.7.5` → intentionally failed and the mismatch error was confirmed.

This verifies the new Node release-version gate logic itself in the available environment.

### Verification not truthfully claimable yet

The current execution environment does not provide Cargo/Rust and cannot reach package registries, so the following have **not** been locally executed here:

- Rust formatting.
- Rust Clippy.
- Rust core tests.
- Tauri adapter check/Clippy/tests.
- cargo-deny.
- fresh npm dependency installation.
- full frontend typecheck/lint/Vitest/Vite build using repository-installed dependencies.
- native Tauri package builds.

GitHub Actions is the authoritative clean verification path for these checks. Workflows were observed queued on an earlier candidate SHA after CI cleanup, but the final documentation commit must receive and complete its own runs before any green/stable claim is made.

## Known limitations / non-blocking design decisions

- KeySmith intentionally has no password history or vault; it is a generator, not a password manager.
- no cloud synchronization or telemetry is planned under the current privacy model.
- batch exports are plaintext by design and intentionally warn the user.
- clipboard security depends on the operating system; other processes or clipboard managers can observe clipboard contents before a clear operation.
- JavaScript strings and operating-system clipboard APIs can create copies that cannot be reliably zeroized by application code; `Zeroizing<String>` is used for Rust-owned command buffers where practical but is not a claim of complete process-memory erasure.
- no silent automatic update check is implemented because the app is offline by default; releases are distributed through the repository release process.
- `Cargo.lock` and `package-lock.json` are still not present because trusted clean dependency resolution has not yet been captured in this execution path.
- real screenshots remain deferred until the UI is launched from a verified packaged release candidate.
- branch protection is not enabled yet; `docs/github.md` now documents the actual maintained job names observed during this v2.7.4 pass and the recommended rule sequence.
- platform signing/notarization remains an external/protected-secret release operation and must never place private signing material in the repository.

## Next exact tasks

Continue in this order unless new CI evidence changes the priority:

1. Re-read this ledger and fetch the current PR #13 head before changing anything.
2. Inspect CI and CodeQL for the **exact latest PR head**, not an earlier candidate SHA.
3. Read every failed job/step log and fix the root cause; add a regression test whenever behavior/security is involved.
4. Repeat until `Frontend quality`, `Rust core quality`, `Rust dependency policy`, all three `Tauri check (...)` jobs, and both CodeQL language jobs are green on the same candidate SHA.
5. Generate trusted `Cargo.lock` and `package-lock.json` from clean dependency resolution and commit them if the resolved dependency graph is suitable.
6. Build/package Tauri v2.7.4 on Windows, macOS, and Linux.
7. Smoke-test password generation, all built-in presets, custom-symbol validation, ambiguity exclusion, passphrases, batch generation/export, clipboard copy, each supported auto-clear duration, conditional clear behavior, clear-now, onboarding, settings, themes, keyboard flow, reduced motion, and About/support/funding links from packaged applications.
8. Capture real release screenshots and update the README/documentation with only genuine captures from the verified candidate.
9. Enable `main` branch protection using the exact successful check names proven by GitHub Actions; do not add the removed legacy `Rust` workflow.
10. Update this ledger with final CI/build/smoke-test evidence and exact artifact information.
11. Merge PR #13 only after the candidate release gate is satisfied, then verify the `main` merge commit.
12. Create the exact `v2.7.4` tag only after the merge commit and version metadata are verified.
13. Let the release workflow create draft artifacts; verify version, artifact completeness, signing/notarization status, and installation behavior before publishing.

## Migration notes

There is no credential database and therefore no secret-data migration. Non-secret local preferences currently use:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

The v2.7.4 backend now rejects undocumented clipboard duration values presented directly over IPC, while persisted frontend values already fall back to the safe 30-second default when invalid.

The v2.7.4 backend also enforces custom-symbol policy independently of the UI. Integrations invoking Tauri commands directly must supply no more than 40 custom symbols and must not use alphanumeric, whitespace, or control characters for the custom-symbol class.

Future preference schema changes must preserve safe defaults and must never turn local preference storage into a generated-secret history.

## Release notes draft — v2.7.4

KeySmith v2.7.4 is the active release candidate for the offline-first desktop password and passphrase generator. It combines OS-backed cryptographic randomness, EFF Diceware passphrases, zxcvbn strength estimates, policy presets, batch generation, guarded plaintext export, conditional clipboard auto-clear, first-run onboarding, complete privacy/accessibility/settings surfaces, cross-platform Tauri packaging configuration, security documentation, and automated quality/security workflows.

The v2.7.4 hardening pass adds backend enforcement for custom-symbol policy boundaries, deduplicates custom symbols, preserves ambiguity exclusion for custom input, adds best-effort zeroizing ownership around clipboard command buffers, restricts IPC clipboard timers to documented values, adds desktop adapter regression tests/Clippy enforcement, prevents release tags from disagreeing with frontend/Rust/Tauri/UI version metadata, removes a redundant legacy Rust workflow, and aligns contributor/privacy/GitHub/release documentation with the maintained release gate.

No account, telemetry, cloud sync, or password-history service is included.

Do not publish these notes as a final stable-release claim until the complete CI, CodeQL, packaging, signing/notarization, smoke-test, screenshot, and artifact-verification gates are satisfied.

## Meaningful commits in the v2.7.4 continuation

Version/release metadata:

- `33092530` — `chore: set frontend version to 2.7.4`
- `cfedd374` — `chore: set Rust workspace version to 2.7.4`
- `63562710` — `chore: set Tauri bundle version to 2.7.4`
- `f5607938` — `chore: update in-app version labels to 2.7.4`
- `ddef2f7b` — `docs: prepare v2.7.4 changelog`
- `a20364b0` — `docs: define v2.7 security support policy`

Version/release integrity:

- `ec7f3634` — `build: add release version consistency check`
- `0faadf1a` — `build: expose version consistency npm task`
- `935e1b3b` — `ci: enforce release version consistency`
- `4733527a` — `build: validate release tag against manifest version`
- `4431809f` — `ci: block release tags with mismatched versions`

Custom-symbol hardening:

- `fb1e6681` — `fix: add custom symbol validation error`
- `052233f5` — `fix: validate and deduplicate custom symbols`
- `2882efec` — `test: cover custom symbol policy hardening`
- `6c91ee16` — `fix: clarify custom symbol validation error`
- `488fe6a0` — `test: keep built-in presets valid under policy hardening`

Clipboard/desktop hardening:

- `fc5c5e4a` — `fix: harden clipboard secret lifetime and duration validation`
- `cd40e016` — `test: cover clipboard clear duration policy`
- `43d9d91f` — `ci: run desktop adapter unit tests`
- `51fd0472` — `ci: enforce desktop adapter clippy warnings`

CI consolidation:

- `c46f8e8c` — `ci: remove redundant legacy Rust workflow`

Documentation alignment:

- `95ddeb5c` — `docs: document v2.7.4 security hardening`
- `6d0f6017` — `docs: expand v2.7.4 testing strategy`
- `1407aef5` — `docs: define reproducible v2.7.4 release gate`
- `390eb2d7` — `docs: align roadmap with v2.7.4 release candidate`
- `2eb3d84c` — `docs: refresh README for v2.7.4`
- `8b4e8152` — `docs: document v2.7.4 development and versioning rules`
- `5b167df4` — `docs: record v2.7.4 hardening fixes`
- `a2fac9dc` — `docs: include desktop clippy in test matrix`
- `f0e5733c` — `docs: add desktop clippy development gate`
- `81a86748` — `docs: add desktop clippy to release gate`
- `5acf81ee` — `docs: record complete v2.7.4 handoff`
- `aae1fdc6` — `docs: align contributing guide with v2.7.4 gates`
- `441202c4` — `docs: strengthen pull request verification checklist`
- `b33902d4` — `docs: align GitHub operations with v2.7.4`
- `b7b30386` — `docs: modernize release template for v2.7.4`
- `b0679f9c` — `docs: clarify v2.7.4 privacy boundaries`

## Commit identity

Continue project-maintainer commits using `Sanskar <sanskarin@outlook.in>` / commit email `sanskarin@outlook.in` where the connected GitHub identity permits explicit attribution.
