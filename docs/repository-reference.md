# KeySmith Repository Reference

This document is the canonical file-by-file inventory for the KeySmith repository. It exists to make repository review, maintenance, onboarding, security auditing, and documentation-completeness checks deterministic.

Every committed project file on the `docs/full-repository-reference` documentation checkpoint is listed below, including hidden configuration files, GitHub automation, source code, tests, documentation, application assets, and native binary icon files. Directories are described through their contained files rather than as separate artifacts.

When a new file is added to the repository, add it here in the same pull request.

## Root configuration and metadata

### `.editorconfig`
Defines cross-editor whitespace, indentation, charset, and newline conventions. It helps contributors produce files compatible with the repository's deterministic text-hygiene checks.

### `.env.example`
Documents the environment-file convention without containing credentials. KeySmith does not require secret environment variables for normal generation. Real `.env` files must remain uncommitted.

### `.gitattributes`
Defines repository-level Git attribute behavior, including text normalization expectations. It works with `.editorconfig` and the text-hygiene script to reduce platform-specific line-ending drift.

### `.gitignore`
Excludes generated build output, dependencies, local environment files, editor artifacts, and other non-source files. It is part of the secret-prevention boundary because local `.env`-style data must not be committed accidentally.

### `Cargo.toml`
Rust workspace manifest. It declares `crates/keysmith-core` and `src-tauri` as workspace members, centralizes version/license/author/repository metadata, selects Rust 2024, forbids unsafe Rust through workspace lint policy, and denies `unwrap`/`expect` use through Clippy policy.

### `package.json`
Frontend/tooling manifest. It defines the application version, Vite/TypeScript/Vitest/ESLint/Prettier/Tauri CLI development dependencies, and npm scripts for development, type checking, linting, text hygiene, tests, builds, and Tauri commands.

### `tsconfig.json`
Strict TypeScript compiler configuration. It enables strict typing, `noUncheckedIndexedAccess`, bundler-style module resolution, DOM libraries, isolated modules, and no-emission type checking.

### `vite.config.ts`
Vite configuration for the Tauri frontend. It fixes development port 1420, ignores Tauri source changes in the frontend watcher, permits only expected environment-variable prefixes, and selects production webview targets/minification/source-map behavior from Tauri environment data.

### `eslint.config.js`
Typed ESLint flat configuration for the TypeScript frontend and Vite config. It uses type-aware recommended rules and explicitly errors on floating promises.

### `rustfmt.toml`
Repository Rust formatting configuration consumed by `cargo fmt`.

### `deny.toml`
`cargo-deny` policy covering advisories, allowed open-source licenses, duplicate-version warnings, wildcard dependency rejection, and untrusted registry/Git-source rejection.

### `index.html`
The complete semantic application shell. It contains the top bar, generator tabs, Password/Passphrase/Batch controls, live output/status regions, privacy controls, onboarding, Settings, About dialog, project/contact links, visible product version, and accessibility semantics used by `src/main.ts`.

## Root project documentation and governance

### `README.md`
Primary public project landing page. It introduces KeySmith, security/privacy highlights, supported platforms, technology stack, setup commands, development checks, build/release guidance, architecture links, contribution rules, licensing, and contact/support links.

### `CHANGELOG.md`
Human-readable release history following the project's release/versioning workflow. User-visible changes should be recorded here before a stable tag is created.

### `ROADMAP.md`
Forward-looking product/engineering milestones. Roadmap items are intentions rather than implemented guarantees; current behavior is documented elsewhere.

### `CONTRIBUTING.md`
Contributor workflow and quality/security expectations for code and documentation changes.

### `CODE_OF_CONDUCT.md`
Community participation and conduct expectations for repository interactions.

### `SECURITY.md`
Security reporting policy and guidance for responsible vulnerability disclosure. Security-sensitive reports should follow this document rather than public issue templates where disclosure would be harmful.

### `PRIVACY.md`
Product privacy commitments, including no account, telemetry, password history, or intentional secret persistence and the limited non-secret preference model.

### `THREAT_MODEL.md`
Security model covering protected assets, trust boundaries, attacker capabilities, mitigations, and residual risks such as clipboard exposure and plaintext exports.

### `SUPPORT.md`
Support channels and guidance for obtaining help without exposing credentials or other sensitive data.

### `LICENSE`
Apache License 2.0 text governing the KeySmith project itself. Third-party dependencies retain their own licenses.

### `NOTICE`
Project notice/attribution information accompanying the Apache-2.0 distribution.

### `what_changed.md`
Canonical development handoff and verification ledger. It records the current milestone, completed implementation, tests, verification status, limitations, exact next tasks, migration notes, release draft, and recent commits so future work can continue without reconstructing repository history.

## GitHub repository automation and templates

### `.github/FUNDING.yml`
GitHub Sponsors-area funding configuration pointing users to the project's external Buy Me a Coffee support page.

### `.github/dependabot.yml`
Automated dependency-update configuration for Cargo, npm, and GitHub Actions ecosystems.

### `.github/pull_request_template.md`
Pull-request checklist prompting contributors to cover behavior, tests, documentation, security/privacy impact, and quality gates.

### `.github/RELEASE_TEMPLATE.md`
Maintainer release-notes template used to produce consistent release descriptions and verification information.

### `.github/ISSUE_TEMPLATE/bug_report.yml`
Structured bug-report form. It asks for reproducible information while discouraging unsafe disclosure of generated credentials.

### `.github/ISSUE_TEMPLATE/feature_request.yml`
Structured feature-request form for product and engineering proposals.

### `.github/ISSUE_TEMPLATE/config.yml`
Issue-template routing and contact-link configuration, including paths for support/security topics that should not use a normal public issue.

### `.github/workflows/ci.yml`
Primary quality workflow for pushes to `main` and pull requests. It runs frontend typecheck/lint/text-hygiene/tests/build, Rust core formatting/Clippy/tests, Tauri `cargo check` on Linux/Windows/macOS, and `cargo-deny` dependency policy.

### `.github/workflows/codeql.yml`
CodeQL security analysis for JavaScript/TypeScript and Rust on pushes, pull requests, and a weekly schedule. The Rust job installs Linux Tauri prerequisites before autobuild analysis.

### `.github/workflows/release.yml`
Tag-triggered cross-platform Tauri packaging workflow. It builds draft release artifacts for Linux, Windows, and universal macOS and does not claim signing unless protected signing configuration is supplied separately.

### `.github/workflows/rust.yml`
Focused Rust-core verification workflow. It formats the workspace and builds/lints/tests only `keysmith-core`, avoiding an unnecessary full Linux Tauri build in a job that does not install desktop webview system packages.

## `crates/keysmith-core` — framework-independent security core

### `crates/keysmith-core/Cargo.toml`
Core crate manifest. It declares the security-focused package description and dependencies on `getrandom`, `eff_wordlist`, `zxcvbn`, `serde`, and `thiserror`, plus test-only `proptest`.

### `crates/keysmith-core/src/lib.rs`
Public crate surface. It keeps implementation modules private and re-exports the supported error type, generation functions, options, presets, passphrase entropy estimator, and strength estimator/result type.

### `crates/keysmith-core/src/error.rs`
Central typed `KeySmithError` definitions for invalid password length, unusable character policy, required-set length constraints, batch limits, passphrase word/separator validation, and OS random-source failure. Error messages contain no generated secret.

### `crates/keysmith-core/src/random.rs`
Private cryptographic selection primitives. `uniform_index` uses OS random `u64` values plus rejection sampling to avoid modulo bias, and `secure_shuffle` implements a Fisher–Yates-style shuffle using the same unbiased selector.

### `crates/keysmith-core/src/policy.rs`
Serializable/deserializable `PasswordOptions` and `PassphraseOptions` structures and their privacy/security-oriented defaults. Serde camelCase naming forms the Rust/TypeScript IPC data contract.

### `crates/keysmith-core/src/generator.rs`
Password and batch-generation implementation. It validates length/count, builds enabled character pools, applies custom symbols and ambiguity filtering, ensures every enabled class is represented, fills remaining positions from the combined pool, and securely shuffles output.

### `crates/keysmith-core/src/passphrase.rs`
EFF large Diceware passphrase implementation. It validates word count/separator, selects words independently with the unbiased random helper, applies optional capitalization/two-digit suffix, and computes selection-space entropy.

### `crates/keysmith-core/src/presets.rs`
Static Rust-owned policy presets: Balanced, Maximum, Legacy compatible, and Alphanumeric. Presets are serialized to the frontend but intentionally not deserialized from it.

### `crates/keysmith-core/src/strength.rs`
Adapter around `zxcvbn`. It converts the library estimate into the stable `StrengthEstimate` structure and KeySmith's Very weak → Very strong labels.

### `crates/keysmith-core/tests/security.rs`
Deterministic/security behavior tests for enabled character-class representation, ambiguity exclusion, batch-size enforcement, and requested passphrase word count. Security-relevant edge cases should continue to be added here.

### `crates/keysmith-core/tests/properties.rs`
Property tests using `proptest`, currently checking exact generated lengths across the supported range and digits-only output invariants.

## `src-tauri` — desktop privilege adapter

### `src-tauri/Cargo.toml`
Tauri desktop crate manifest. It depends on `keysmith-core`, Tauri, `arboard` for clipboard integration, `zeroize` for best-effort secret-buffer clearing, Serde, and `tauri-build`.

### `src-tauri/build.rs`
Minimal Tauri build-script entry point. It delegates generated desktop build configuration to `tauri_build::build()`.

### `src-tauri/src/main.rs`
Native executable entry point. It invokes `keysmith_lib::run()` and suppresses the extra Windows console window for non-debug builds.

### `src-tauri/src/lib.rs`
Tauri bootstrap and explicit command registration. The frontend can invoke only the six registered generation/preset/clipboard commands, subject to capability permissions.

### `src-tauri/src/commands.rs`
Privileged command implementation. It adapts core generation/strength results for IPC and owns all clipboard writes, the 4096-character clipboard-input guard, conditional delayed clearing, clear-now behavior, and best-effort zeroization of mutable Rust secret buffers.

### `src-tauri/tauri.conf.json`
Product/version/application identifier, Vite build integration, main-window geometry, restrictive CSP, `freezePrototype`, bundle metadata, platform targets, and native icon configuration.

### `src-tauri/capabilities/default.json`
Least-privilege Tauri capability for the `main` window. It grants only default core behavior plus the two custom KeySmith permission groups.

### `src-tauri/permissions/keysmith.toml`
Custom command allowlists split into generation/preset and clipboard permission groups. New privileged commands must be explicitly reviewed and added here rather than relying only on command registration.

### `src-tauri/icons/32x32.png`
Small PNG native application icon used by supported package/window contexts.

### `src-tauri/icons/128x128.png`
Standard 128×128 PNG application icon.

### `src-tauri/icons/128x128@2x.png`
High-density PNG icon for 2× display contexts.

### `src-tauri/icons/icon.ico`
Windows multi-image icon container used by Windows packaging/application metadata.

### `src-tauri/icons/icon.icns`
Apple icon container used by macOS packaging/application metadata.

The icon files are binary assets. Their role is packaging/branding only; they must not contain executable logic or secret data.

## `src` — TypeScript frontend

### `src/main.ts`
Main application controller. It binds required DOM elements, maintains transient generator state, collects options, invokes the typed API wrapper, renders output/strength/status, handles batch export, clipboard actions, presets, tabs, themes, dialogs, onboarding, and initialization.

### `src/api.ts`
Single typed frontend gateway to `window.__TAURI__.core.invoke`. It maps application methods to the six Rust command names and explicitly errors when the desktop bridge is unavailable.

### `src/types.ts`
Frontend interfaces for Rust IPC inputs/outputs and application-specific mode/theme unions. It must remain synchronized with Serde data shapes.

### `src/storage.ts`
Only intentional local-storage access layer. It persists the clipboard-clear duration, theme preference, and onboarding-complete flag with defensive reads/writes and safe fallbacks. Generated secrets must never be added here.

### `src/storage.test.ts`
Vitest/jsdom tests for local preference defaults, supported/fallback clipboard durations, theme persistence, and the onboarding flag's non-secret storage behavior.

### `src/styles.css`
Complete application stylesheet: design tokens, light/dark themes, layout, cards, controls, buttons, output states, dialogs, responsive behavior, focus treatment, status presentation, and reduced-motion rules.

### `src/tauri.d.ts`
Type declaration for the global Tauri object exposed because `withGlobalTauri` is enabled in desktop configuration.

### `src/i18n/en.ts`
Initial English status-string module. It is a localization seed rather than a complete runtime locale-switching framework.

### `src/assets/logo.svg`
Editable vector KeySmith logo displayed in the UI, favicon, onboarding, About dialog, and README. Native package icons are separate generated/maintained assets under `src-tauri/icons`.

## `scripts`

### `scripts/check-format.mjs`
Deterministic repository text-hygiene checker. It walks recognized text files while ignoring generated/dependency directories and rejects CR/CRLF line endings, missing final newlines, and trailing whitespace.

This script is intentionally separate from Rust formatting and TypeScript lint/type checks. CI runs it through `npm run format:check`.

## `docs` — maintained documentation set

### `docs/README.md`
Documentation portal and documentation-maintenance rules. It groups product, architecture, development, security, and operations references and names security-sensitive documents that require coordinated review.

### `docs/user-guide.md`
Complete end-user behavior guide for onboarding, generator modes, policy options, presets, passphrases, entropy, batch export, strength, clipboard behavior, settings, privacy, accessibility, updates, and safe use.

### `docs/architecture.md`
High-level architecture and trust-boundary overview connecting the Rust core, Tauri adapter, frontend, preferences, and explicit export/clipboard side effects.

### `docs/core-api.md`
Detailed Rust core API and algorithm reference, including options, validation, character sources, random selection, passphrase entropy, strength estimation, presets, errors, tests, and dependencies.

### `docs/desktop-bridge.md`
Detailed Tauri adapter reference covering commands, IPC result shapes, clipboard lifecycle, capability/permission model, CSP, window/build/bundle configuration, dependencies, and security-review checks.

### `docs/frontend.md`
Detailed frontend reference covering startup, transient state, DOM contract, Rust/TypeScript types, API mapping, generation/clipboard/export/theme/storage flows, presets, tabs/dialogs, accessibility, styling, localization seed, and tests.

### `docs/setup.md`
Development prerequisites and initial setup information for supported operating systems and Tauri development.

### `docs/development.md`
Contributor development workflow, code-ownership boundaries, quality commands, and security-sensitive change guidance.

### `docs/testing.md`
Automated and manual testing expectations spanning TypeScript, Rust core, desktop platform checks, security properties, and release-candidate verification.

### `docs/release.md`
Version/tag/release process, platform packaging expectations, artifact verification, and signing caveats.

### `docs/troubleshooting.md`
Troubleshooting guidance for setup, frontend, Rust, Tauri, clipboard, Linux dependencies, and release/build failures.

### `docs/accessibility.md`
Accessibility commitments and manual review checklist for keyboard operation, focus, semantics, status announcements, reduced motion, scalable text/layout, and non-color cues.

### `docs/performance.md`
Performance objectives and measurement guidance for generation, UI responsiveness, batch workloads, and release builds.

### `docs/github.md`
GitHub governance guidance, including recommended branch protection, required checks after check names are proven, issue/PR/release automation, and repository security settings.

### `docs/wordlists.md`
Passphrase word-list provenance and selection-model documentation for the EFF large Diceware list supplied by `eff_wordlist`.

### `docs/maintainer-guide.md`
Maintainer operations handbook covering change classification, commit conventions, CI ownership, dependency updates, version synchronization, documentation/security gates, PR verification, release-candidate checks, and handoff discipline.

### `docs/repository-reference.md`
This file. It is the canonical completeness inventory and must remain synchronized whenever repository files are added, removed, renamed, or substantially repurposed.

### `docs/adr/0001-rust-core-tauri-ui.md`
Architecture Decision Record documenting the separation of a framework-independent Rust security core from the Tauri/TypeScript desktop UI.

### `docs/adr/0002-os-csprng-and-no-secret-storage.md`
Architecture Decision Record documenting the choice of operating-system cryptographic randomness and the policy against intentional generated-secret storage/history.

## Files intentionally not committed at this checkpoint

The following common development outputs are not project source files and therefore are not entries in the committed-file inventory:

- `node_modules/`
- `dist/`
- Rust/Tauri `target/` directories
- local `.env` files
- editor/OS temporary files
- local release artifacts

At this checkpoint, `package-lock.json` and `Cargo.lock` are also not committed. The release-candidate ledger in `what_changed.md` tracks lockfile generation/verification as an explicit next-stage task; do not invent or hand-author dependency lockfiles.

## Completeness maintenance procedure

For every pull request that adds, deletes, renames, or repurposes a committed file:

1. compare the pull-request file list with this inventory;
2. add/remove/rename the corresponding entry;
3. update the deeper topic document when behavior/security/operations changed;
4. update `docs/README.md` when a navigable documentation artifact is added or removed;
5. update `what_changed.md` when the change affects the active release-candidate checkpoint;
6. ensure the text-hygiene, frontend, Rust, desktop, security, and release workflows still cover the resulting structure appropriately.

A repository documentation review is not complete until this inventory and the actual Git tree agree.
