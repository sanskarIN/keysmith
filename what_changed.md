# KeySmith — Development Handoff

Last updated: 2026-08-19
Current version: `0.1.0`
Current milestone: Phase 4 / release-candidate verification
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Active verification branch: `docs/full-repository-reference`
Active pull request: `#11` — `docs: complete repository reference and release-candidate audit`
Required commit email: `sanskarin@outlook.in`

This file is the canonical continuation ledger for future KeySmith work. Read it before changing the repository. Do not claim a verification result that was not observed on the relevant commit.

## Current checkpoint

The repository implementation remains a Rust 2024 + Tauri 2 + Vanilla TypeScript/Vite offline credential generator. This continuation performed a repository-wide source/documentation audit, corrected one CI design defect, expanded automated regression coverage, created complete technical/user/maintainer documentation, and opened PR #11 specifically to exercise PR-triggered CI and CodeQL before `0.1.0` is treated as stable.

The documentation completeness requirement is now machine-enforced: `scripts/check-doc-inventory.mjs` obtains every tracked file from `git ls-files` and fails when the path is missing from `docs/repository-reference.md`. The main CI frontend job runs this through `npm run docs:check`.

## Implemented product scope

### Architecture

- Framework-independent `crates/keysmith-core` Rust security/domain crate.
- Tauri 2 desktop adapter with a narrow command surface.
- Vanilla TypeScript/Vite presentation layer.
- Windows, macOS, and Linux native bundle configuration.
- No runtime application server, database, account service, telemetry pipeline, or required credential-generation network service.

### Password generation

- OS cryptographic randomness through `getrandom`.
- Rejection sampling for unbiased bounded selection.
- Fisher–Yates-style secure shuffle using the same bounded sampler.
- Length 4–128.
- Lowercase/uppercase/digit/symbol classes.
- Optional custom symbol source.
- Ambiguous-character exclusion.
- At least one result character from every enabled class.
- Batch generation 1–500.
- Balanced, Maximum, Legacy compatible, and Alphanumeric presets.

### Passphrases and strength

- EFF large Diceware list packaged through `eff_wordlist`.
- 3–12 independent word selections.
- Separator validation (0–3 characters, no control characters).
- Optional first-letter capitalization.
- Optional independently selected `00`–`99` suffix.
- Selection-space entropy estimate.
- zxcvbn strength/guess estimates.

### Clipboard/export

- Explicit native clipboard copy through Rust/arboard.
- Clipboard delay choices: Never, 15 s, 30 s, 60 s, 120 s.
- Delayed clear occurs only when clipboard still exactly equals the originally copied value.
- Direct Rust command defensively caps delayed clear at 300 seconds.
- Copy command rejects values longer than 4096 characters.
- Mutable Rust secret buffers are zeroized where practical.
- Explicit clear-now action.
- Batch `.txt` export is intentionally plaintext and contains an explicit warning header.

### UI/privacy/accessibility

- Password, Passphrase, and Batch modes.
- Responsive desktop UI with light/dark/system themes.
- First-run onboarding.
- Settings for appearance/privacy/accessibility/update/onboarding information.
- About dialog with version, Apache-2.0, project/support links, and `Made by the Sanskar` credit.
- Skip link, semantic fieldsets/labels, keyboard-operable tabs with Left/Right Arrow behavior, visible focus, live status/output, reduced-motion handling, scalable/responsive controls, and non-color-only status meaning.
- No account, telemetry, cloud synchronization, password history, or intentional generated-secret persistence.
- Only non-secret local preference keys:
  - `keysmith.clipboardClearSeconds`
  - `keysmith.theme`
  - `keysmith.onboardingComplete`

## Audit findings and fixes in PR #11

### CI defect corrected

The pre-existing standalone `.github/workflows/rust.yml` ran `cargo build --verbose` and `cargo test --verbose` for the entire workspace on `ubuntu-latest` but did not install the native WebKitGTK/AppIndicator dependencies required by the Tauri crate. The primary `ci.yml` desktop job did install those libraries.

The standalone workflow is now intentionally scoped to `keysmith-core` and runs:

- `cargo fmt --all -- --check`
- `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
- `cargo build -p keysmith-core --all-features`
- `cargo test -p keysmith-core --all-features`

Cross-platform Tauri compilation remains the responsibility of the primary CI matrix on Ubuntu 22.04, Windows, and macOS.

### Validation regression coverage expanded

`crates/keysmith-core/tests/security.rs` now directly covers:

- default generated password contains every enabled class;
- ambiguity exclusion removes known ambiguous characters;
- a policy with no enabled character sets is rejected;
- a custom symbol set that becomes empty after ambiguity filtering is rejected;
- batch counts 0 and 501 are rejected with `InvalidBatchSize`;
- requested passphrase word count behavior;
- passphrase word counts 2 and 13 are rejected;
- separators longer than three characters are rejected;
- control-character separators are rejected.

`crates/keysmith-core/tests/properties.rs` continues to cover exact generated length across 4–128 and digits-only output invariants.

`src/storage.test.ts` continues to cover the non-secret local preference model.

### Documentation completeness gate added

New `scripts/check-doc-inventory.mjs`:

1. runs `git ls-files -z`;
2. sorts all tracked paths;
3. reads `docs/repository-reference.md`;
4. fails and prints missing paths when any tracked file is undocumented.

`package.json` exposes this as `npm run docs:check`, and `.github/workflows/ci.yml` runs it in Frontend quality.

## Complete documentation set

### Root/public policy docs

- `README.md` — expanded public landing page and complete docs navigator.
- `CHANGELOG.md` — records documentation/test/CI hardening for the release candidate.
- `ROADMAP.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `PRIVACY.md`
- `THREAT_MODEL.md`
- `SUPPORT.md`
- `LICENSE`
- `NOTICE`
- `what_changed.md`

### Documentation portal and deep references

- `docs/README.md` — documentation portal and synchronization rules.
- `docs/user-guide.md` — complete product/user behavior and safe-use guide.
- `docs/architecture.md` — expanded architecture, trust boundaries, data/persistence/network/failure flows.
- `docs/core-api.md` — Rust core options, API, algorithms, random model, entropy, presets, errors, tests, dependencies.
- `docs/desktop-bridge.md` — Tauri commands, IPC results, clipboard lifecycle, permissions/capabilities, CSP, bundle/window model.
- `docs/frontend.md` — startup/state/DOM/type/API/storage/export/theme/tab/dialog/accessibility/frontend testing reference.
- `docs/setup.md` — expanded common/Windows/macOS/Linux development setup and isolation workflow.
- `docs/development.md` — expanded secure day-to-day development/change procedures.
- `docs/testing.md` — expanded automated/static/desktop/dependency/CodeQL/manual smoke/accessibility/release evidence strategy.
- `docs/release.md` — expanded synchronized versioning, lockfiles, native packaging, signing/notarization, screenshots, tagging, publication, rollback, secret handling.
- `docs/troubleshooting.md` — expanded layer-by-layer troubleshooting playbook.
- `docs/accessibility.md` — expanded keyboard/semantics/focus/live region/contrast/scaling/motion/manual checklist.
- `docs/performance.md` — expanded performance budgets, measurement isolation, benchmarking/regression guidance without weakening security.
- `docs/github.md` — expanded branch protection/check-name/PR/merge/security/Actions/dependency/release governance.
- `docs/wordlists.md` — EFF large Diceware provenance and selection model.
- `docs/maintainer-guide.md` — maintainer change classification, verification, dependency/version, security/docs, release and handoff procedures.
- `docs/repository-reference.md` — canonical CI-backed file-by-file inventory covering every tracked project file, including hidden configuration, workflows, source, tests, docs, scripts, SVG, PNG, ICO, and ICNS assets.
- `docs/adr/0001-rust-core-tauri-ui.md`
- `docs/adr/0002-os-csprng-and-no-secret-storage.md`

## GitHub automation

### Primary CI — `.github/workflows/ci.yml`

- Frontend quality:
  - `npm install`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run format:check`
  - `npm run docs:check`
  - `npm test`
  - `npm run build`
- Rust core quality:
  - `cargo fmt --all -- --check`
  - strict core Clippy
  - core tests
- Tauri check matrix:
  - Ubuntu 22.04 (with native Tauri packages)
  - Windows latest
  - macOS latest
- Rust dependency policy through cargo-deny.

### Focused Rust workflow — `.github/workflows/rust.yml`

- Core format, strict Clippy, build, and tests only.

### CodeQL — `.github/workflows/codeql.yml`

- JavaScript/TypeScript analysis.
- Rust analysis with required Linux Tauri system dependencies.

### Release — `.github/workflows/release.yml`

- `v*` tag trigger.
- Draft Linux, Windows, and universal macOS Tauri artifacts.
- Does not claim artifacts are signed unless protected signing configuration is separately supplied.

### Other GitHub automation

- Dependabot for Cargo/npm/GitHub Actions.
- Structured bug and feature forms.
- PR template.
- Release template.
- Funding configuration.

## PR #11 verification state

PR #11 was opened from `docs/full-repository-reference` against `main` at base commit `374dea7e382fac515ad539405e86dd15c5c2422b`.

An earlier PR head `af83c53401b8c81a1135f415cedb7b285440cfb4` successfully caused all three expected workflow suites to appear:

- `CI`
- `Rust core`
- `CodeQL`

Observed while those runs were active:

- CodeQL JavaScript/TypeScript checkout/init/autobuild completed successfully and analysis had started.
- CodeQL Rust checkout completed and Linux native dependency installation had started.
- Primary CI exposed all expected jobs: Frontend quality, Rust core quality, Tauri checks for Ubuntu/Windows/macOS, and Rust dependency policy.
- Ubuntu Tauri job checkout/Node/Rust/cache setup succeeded and native dependency installation had started.

Those observations are **not** a final pass claim because later documentation-inventory commits changed the PR head. The current/final PR head after this ledger commit must receive a fresh authoritative run. Inspect that run before merging or tagging.

## Verification required before `0.1.0` stable

Do not call `0.1.0` stable until the same release-candidate commit has observed successful results for:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run format:check`
4. `npm run docs:check`
5. `npm test`
6. `npm run build`
7. `cargo fmt --all -- --check`
8. strict `keysmith-core` Clippy
9. `cargo test -p keysmith-core --all-features`
10. focused core build workflow
11. Tauri `cargo check` on Ubuntu/Linux
12. Tauri `cargo check` on Windows
13. Tauri `cargo check` on macOS
14. cargo-deny dependency policy
15. CodeQL JavaScript/TypeScript
16. CodeQL Rust
17. `npm run tauri build` release artifacts on supported platforms
18. packaged-app smoke tests
19. clipboard conditional-clear manual checks
20. keyboard/accessibility manual review
21. real screenshots captured from the verified release candidate

The connected environment cannot replace native packaged-app manual testing with source inspection. Do not mark those manual gates complete until actually performed.

## Lockfiles / reproducibility

`package-lock.json` and `Cargo.lock` are still intentionally absent from the repository at this checkpoint. Earlier local construction did not have a trusted package-registry/network path for authoritative generation.

Before a stable application release:

- generate lockfiles using the real npm/Cargo tools in a trusted clean dependency-resolution environment;
- inspect the resolved graphs;
- commit suitable application lockfiles;
- update CI/release install commands for reproducible resolution where appropriate;
- add the new tracked lockfiles to `docs/repository-reference.md`;
- rerun the full candidate matrix.

Never hand-author dependency lockfiles.

## Known limitations / intentional non-goals

- KeySmith is a generator, not a password manager; there is no credential vault/history.
- No cloud synchronization, account system, telemetry, or analytics.
- Runtime credential generation is offline by design.
- Batch exports are plaintext and intentionally warned.
- OS clipboard managers/other processes can observe or retain clipboard data outside KeySmith's control.
- No silent background update checker.
- Release signing/notarization is not configured/claimed by the current source workflow.
- Real release screenshots remain deferred until a verified packaged build exists.
- Branch protection is not yet enabled; `docs/github.md` requires configuring it from observed check names after the first fully green verification PR.

## Next exact tasks

1. Inspect PR #11's latest-head `CI`, `Rust core`, and `CodeQL` runs.
2. For every failure, inspect the failed job steps/logs and fix the root cause on the same branch; add regression coverage for behavioral defects.
3. Repeat until the latest PR head is green across frontend, core, three-platform Tauri, cargo-deny, focused Rust, and both CodeQL languages.
4. Resolve/generate/review/commit `package-lock.json` and `Cargo.lock` from a trusted clean dependency resolution; update the inventory and use reproducible install commands where appropriate.
5. Build packaged Tauri release candidates on Windows, macOS, and Linux.
6. Perform the detailed smoke/clipboard/accessibility cases from `docs/testing.md` on actual packaged apps.
7. Capture real release screenshots using disposable generated values and no personal desktop secrets.
8. Enable `main` branch protection using the proven GitHub check names from the green PR.
9. Finalize the `0.1.0` changelog date/release notes.
10. Tag the exact verified commit as `v0.1.0` and inspect the draft release artifacts before publication.

## Migration notes

There is no credential database and therefore no secret-data migration.

Current non-secret preference schema:

- `keysmith.clipboardClearSeconds` — allowed values `0`, `15`, `30`, `60`, `120`; invalid stored values fall back to `30`.
- `keysmith.theme` — `system`, `light`, or `dark`; invalid/missing values fall back to `system`.
- `keysmith.onboardingComplete` — `true` means first-run onboarding has been completed.

Future preference changes must preserve safe fallbacks and must never turn local preference storage into a generated-secret history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 is an offline-first desktop password/passphrase generator using operating-system cryptographic randomness, unbiased bounded selection, secure shuffling, EFF large Diceware passphrases, zxcvbn strength estimates, policy presets, batch generation, explicit warned plaintext export, conditional clipboard auto-clear, onboarding/settings/themes/accessibility surfaces, least-privilege Tauri permissions/CSP, cross-platform build automation, security/dependency analysis, and comprehensive user/technical/maintainer documentation.

The release candidate also adds direct validation regression coverage and CI-enforced file-by-file documentation completeness.

No account, telemetry, cloud sync, remote generation, or password-history service is included.

## Commits in the current documentation/audit continuation

- `0cdab1fe` — `ci: scope standalone Rust workflow to core crate`
- `c47e1de8` — `docs: add documentation portal`
- `25ad959d` — `docs: add complete user guide`
- `cdb3154d` — `docs: document Rust core API contracts`
- `b049cc35` — `docs: document Tauri desktop bridge`
- `54c3c7c1` — `docs: document frontend architecture and state`
- `eb7e2d31` — `docs: add maintainer operations guide`
- `7ef2d1dd` — `docs: catalog every repository file`
- `5ebd854d` — `docs: deepen architecture and trust boundary guide`
- `0ae877c2` — `docs: expand development workflow`
- `37e6c529` — `docs: expand verification and regression strategy`
- `07c23d56` — `docs: expand cross-platform release process`
- `52948dc3` — `docs: expand platform setup guide`
- `533d4674` — `docs: expand troubleshooting playbook`
- `6fc26f55` — `docs: expand accessibility requirements and checks`
- `a420e11d` — `docs: expand performance budgets and measurement`
- `aa11a29b` — `docs: expand GitHub governance and automation guide`
- `ddf26348` — `test: cover core validation edge cases`
- `be4e2cf1` — `docs: link complete repository documentation`
- `af83c534` — `docs: record documentation and CI hardening`
- `ea72e987` — `build: add repository documentation inventory check`
- `6725e441` — `build: expose documentation completeness check`
- `568a7f8f` — `ci: enforce repository documentation completeness`
- `ae484c21` — `docs: include documentation inventory tooling`

## Commit identity

GitHub commits created through the connected repository identity are attributed to `Sanskar <sanskarin@outlook.in>`. Continue using that email for project-maintainer commits.
