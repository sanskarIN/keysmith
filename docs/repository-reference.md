# KeySmith Repository Reference

This is the canonical file-by-file inventory for KeySmith. Every Git-tracked project file on the release-candidate branch is named here. `scripts/check-doc-inventory.mjs` compares `git ls-files` against this document; CI fails when a tracked path is missing.

Directories are represented by the files they contain. When a file is added, removed, renamed, or substantially repurposed, update this inventory in the same pull request.

## Root configuration and metadata

- `.editorconfig` — shared editor charset/indentation/whitespace/newline conventions.
- `.env.example` — safe environment-file convention without credentials; real environment files remain uncommitted.
- `.gitattributes` — Git text/line-ending normalization behavior.
- `.gitignore` — generated dependency/build/editor/environment exclusions.
- `Cargo.toml` — Rust workspace metadata, members, Rust 2024 edition, maintainer/license/repository metadata, and strict lint policy.
- `deny.toml` — cargo-deny advisory/license/source/version policy.
- `eslint.config.js` — type-aware ESLint configuration for frontend/scripts/Vite source.
- `index.html` — semantic application shell, localization attributes, generator/settings/onboarding/about UI, warnings, and external-destination metadata.
- `package.json` — frontend/native API dependencies, dev tooling, version, and npm quality/security/docs/Tauri scripts.
- `rustfmt.toml` — Rust formatting configuration.
- `tsconfig.json` — strict no-emit TypeScript compiler configuration.
- `vite.config.ts` — Vite/Tauri development and production build configuration.

## Root public documentation and policy

- `README.md` — public project overview, security/privacy/features/setup/development/release/documentation links and support metadata.
- `CHANGELOG.md` — user-visible release history and 0.1.0 candidate changes.
- `ROADMAP.md` — forward-looking product/engineering milestones.
- `CONTRIBUTING.md` — contribution workflow and required quality/security practices.
- `CODE_OF_CONDUCT.md` — repository community conduct expectations.
- `SECURITY.md` — vulnerability reporting/security policy.
- `PRIVACY.md` — runtime privacy and non-secret preference commitments.
- `THREAT_MODEL.md` — protected assets, trust boundaries, mitigations, residual risk, native side effects, and external-link model.
- `SUPPORT.md` — safe support/help channels.
- `LICENSE` — Apache License 2.0 project license text.
- `NOTICE` — project attribution/notice information.
- `what_changed.md` — canonical active implementation/verification/handoff ledger.

## GitHub configuration

- `.github/FUNDING.yml` — repository funding metadata.
- `.github/dependabot.yml` — Cargo/npm/GitHub Actions dependency update configuration.
- `.github/pull_request_template.md` — PR quality/security/testing/documentation checklist.
- `.github/RELEASE_TEMPLATE.md` — release evidence/notes template.
- `.github/ISSUE_TEMPLATE/bug_report.yml` — structured safe bug-report form.
- `.github/ISSUE_TEMPLATE/feature_request.yml` — structured feature request form.
- `.github/ISSUE_TEMPLATE/config.yml` — issue routing/contact configuration.
- `.github/workflows/ci.yml` — primary PR/main frontend audit/secret/docs/quality, Rust core policy/tests, lockfile artifacts, and cross-platform Tauri check/Clippy matrix.
- `.github/workflows/codeql.yml` — JavaScript/TypeScript and full-workspace Rust CodeQL analysis.
- `.github/workflows/release.yml` — `v*` release preflight plus draft multi-platform Tauri artifact builds.

## Rust security core

- `crates/keysmith-core/Cargo.toml` — core crate dependencies/dev-dependencies and package metadata; published word-list dependency is `eff-wordlist`.
- `crates/keysmith-core/src/lib.rs` — stable public API re-exports.
- `crates/keysmith-core/src/error.rs` — typed validation/random-source errors including custom-symbol validation.
- `crates/keysmith-core/src/generator.rs` — password/batch validation and generation, ASCII custom-symbol policy, source deduplication, ambiguity filtering, class guarantee, secure shuffle, intermediate zeroization.
- `crates/keysmith-core/src/passphrase.rs` — EFF large Diceware selection, separator/word validation, suffix/capitalization, entropy estimate.
- `crates/keysmith-core/src/policy.rs` — camelCase/unknown-field-denying password/passphrase option structures and defaults.
- `crates/keysmith-core/src/presets.rs` — Rust-owned Balanced/Maximum/Legacy/Alphanumeric policy definitions.
- `crates/keysmith-core/src/random.rs` — OS CSPRNG rejection-sampled bounded selection and secure shuffle, including zero-bound guard.
- `crates/keysmith-core/src/strength.rs` — zxcvbn adapter and serializable strength result.
- `crates/keysmith-core/tests/security.rs` — explicit credential-generation security invariants.
- `crates/keysmith-core/tests/properties.rs` — property tests for length/classes/custom-symbol/passphrase invariants across generated inputs.
- `crates/keysmith-core/tests/serialization.rs` — Serde camelCase/strict unknown-field boundary tests.
- `crates/keysmith-core/tests/validation.rs` — malformed/invalid password, custom-symbol, passphrase, and policy validation tests.

## Tauri native boundary

- `src-tauri/Cargo.toml` — native crate manifest with Tauri, core, clipboard, dialog, opener, Serde, and zeroize dependencies.
- `src-tauri/build.rs` — Tauri build integration entry point.
- `src-tauri/src/main.rs` — native executable entry point.
- `src-tauri/src/lib.rs` — Tauri builder, dialog/opener plugins, and seven explicit command registrations.
- `src-tauri/src/commands.rs` — generation adapters plus bounded clipboard write, exact delay allowlist, one replaceable/cancellable auto-clear worker, conditional clear, and tests.
- `src-tauri/src/export.rs` — bounded native plaintext batch content validation, native save dialog, local-path write, zeroized buffer, and tests.
- `src-tauri/tauri.conf.json` — version/product/identifier/build/window, no-global-bridge, production/dev CSP, prototype freeze, unused-command stripping, bundle/icons.
- `src-tauri/capabilities/default.json` — main-window least-privilege generation/clipboard/export permissions plus exact five-destination opener allowlist.
- `src-tauri/permissions/keysmith.toml` — custom generation, clipboard, and export command allowlists.
- `src-tauri/icons/32x32.png` — small native PNG application icon.
- `src-tauri/icons/128x128.png` — 128×128 native PNG application icon.
- `src-tauri/icons/128x128@2x.png` — high-density native PNG application icon.
- `src-tauri/icons/icon.icns` — macOS native icon container.
- `src-tauri/icons/icon.ico` — Windows native icon container.

## TypeScript frontend and tests

- `src/main.ts` — application controller, transient state, revision-based async staleness protection, generation/render/copy/export/theme/tab/dialog/link/onboarding startup flows.
- `src/api.ts` — typed `@tauri-apps/api/core` command wrapper with `isTauri()` guard and no browser generation fallback.
- `src/types.ts` — Rust IPC input/result mirrors and application mode/theme unions.
- `src/storage.ts` — defensive persistence of only clipboard delay, theme, and onboarding completion.
- `src/storage.test.ts` — storage defaults/allowlists/fallback/non-secret behavior tests.
- `src/export.ts` — pure deterministic batch-export text constructor.
- `src/export.test.ts` — export header/timestamp/warning/value/trailing-newline tests.
- `src/external-links.ts` — exact approved destination set and native opener wrapper.
- `src/external-links.test.ts` — external allowlist unit tests.
- `src/external-links.integration.test.ts` — frontend/markup/native capability allowlist drift tests.
- `src/policy-input.ts` — exact empty-to-null custom-symbol normalization without trimming.
- `src/policy-input.test.ts` — custom-symbol preservation/normalization tests.
- `src/logging.ts` — bounded recursive sensitive-key redaction helper for structured diagnostics.
- `src/logging.test.ts` — sensitive-key/depth/non-serializable redaction regression tests.
- `src/api.test.ts` — Tauri command-name/argument/bridge behavior tests.
- `src/app.integration.test.ts` — real-markup application flows including generation, stale async results, clipboard, native export/cancellation, mode transitions, and external behavior.
- `src/accessibility.test.ts` — static real-markup accessibility structure/naming/regression checks.
- `src/contrast.test.ts` — rendered/design-token contrast regression checks for important control states.
- `src/tauri-security-config.test.ts` — static native config tests for no global bridge, capability scope, unused commands, permissions, and security drift.
- `src/version-consistency.test.ts` — known product-version synchronization tests across metadata/UI surfaces.
- `src/styles.css` — complete design tokens, light/dark themes, layout, output/warning/dialog/focus/responsive/reduced-motion styling.
- `src/assets/logo.svg` — editable vector KeySmith application mark.

## Localization implementation

- `src/i18n/en.ts` — English static/runtime strings plus formatting helpers.
- `src/i18n/index.ts` — typed catalog contract and DOM translation application for text/title/ARIA-label/placeholder attributes.
- `src/i18n/index.test.ts` — translation application tests.
- `src/i18n/markup.test.ts` — static markup translation-key completeness/consistency tests.
- `src/i18n/presets.ts` — localized preset name/description mapping separated from Rust policy options.
- `src/i18n/presets.test.ts` — preset localization tests.
- `src/i18n/strength.ts` — numeric-score-based localized strength-label mapping with fallback.
- `src/i18n/strength.test.ts` — strength localization/fallback tests.

## Repository scripts

- `scripts/check-format.mjs` — LF/final-newline/trailing-whitespace repository text hygiene checker.
- `scripts/check-secrets.mjs` — deterministic tracked-source secret-pattern scan used by CI/release preflight.
- `scripts/check-doc-inventory.mjs` — `git ls-files` documentation completeness gate ensuring every tracked path appears in this file.

## Maintained documentation

- `docs/README.md` — complete documentation portal and synchronization/security-review rules.
- `docs/user-guide.md` — comprehensive user behavior, privacy, clipboard, native export, opener, localization, accessibility, and safe-use guide.
- `docs/architecture.md` — current system architecture, trust/data/native boundary flows.
- `docs/core-api.md` — hardened Rust core API/algorithm/validation/randomness/test reference.
- `docs/desktop-bridge.md` — native commands, clipboard worker, save dialog/export, opener/capability/CSP/global-bridge reference.
- `docs/frontend.md` — frontend state/API/staleness/export/link/storage/localization/logging/accessibility/test architecture.
- `docs/setup.md` — Windows/macOS/Linux development prerequisites and first-run setup.
- `docs/development.md` — secure development workflow and layer ownership.
- `docs/testing.md` — automated/static/security/native/manual test strategy.
- `docs/verification.md` — exact-commit automated and packaged desktop release-candidate checklist.
- `docs/release.md` — version/lockfile/tag/signing/artifact/publication process.
- `docs/troubleshooting.md` — frontend/Rust/Tauri/native/CI/build diagnosis.
- `docs/accessibility.md` — accessibility behavior, automated checks, and manual packaged verification.
- `docs/performance.md` — security-preserving performance budgets/measurement guidance.
- `docs/github.md` — GitHub branch/PR/Actions/security/dependency/release governance.
- `docs/i18n.md` — English-first localization boundary, translation ownership, and tests.
- `docs/logging.md` — diagnostic redaction/no-secret logging guidance.
- `docs/wordlists.md` — EFF large Diceware source/package/crate naming and entropy model.
- `docs/maintainer-guide.md` — maintainer change classification, quality/security/docs/release/handoff discipline.
- `docs/repository-reference.md` — this CI-enforced canonical tracked-file inventory.

## Architecture decision records

- `docs/adr/0001-rust-core-tauri-ui.md` — Rust security core separated from Tauri/TypeScript UI.
- `docs/adr/0002-os-csprng-and-no-secret-storage.md` — OS CSPRNG plus no intentional generated-secret history.
- `docs/adr/0003-frontend-localization-boundary.md` — presentation-owned localization without translating security policy/native identifiers.
- `docs/adr/0004-native-desktop-boundaries.md` — dedicated native clipboard/save/opener authority and least-privilege desktop design.

## Intentionally untracked/generated state

The following are not source files and should not appear in the tracked inventory unless repository policy intentionally changes:

- `node_modules/`;
- frontend `dist/`;
- Rust/Tauri `target/`;
- local `.env` files;
- editor/OS temporary files;
- local packaged artifacts.

At this release-candidate stage, `package-lock.json` and `Cargo.lock` are still not committed. CI generates lockfile artifacts from actual dependency resolution for inspection, and stable-release verification requires trusted tool-generated lockfiles to be committed before `v0.1.0` publication. When they are added, this inventory must be updated.

## Completeness procedure

For every tracked-file change:

1. run `npm run docs:check`;
2. add/remove/rename the corresponding path here;
3. update the deeper topic guide for behavior/security/operations changes;
4. update `docs/README.md` when a navigable documentation artifact changes;
5. update `what_changed.md` when the active candidate/handoff changes;
6. keep CI/tests/security checks synchronized.

A documentation audit is complete only when the automated inventory check passes and these descriptions still match actual file responsibilities.
