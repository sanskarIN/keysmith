# KeySmith Repository Reference

This is the canonical file-by-file inventory for KeySmith. Every Git-tracked project file is listed here so repository review, maintenance, onboarding, security auditing, and documentation-completeness checks are deterministic.

The automated `scripts/check-doc-inventory.mjs` check uses `git ls-files` and verifies that every tracked path appears in this document. CI runs it through `npm run docs:check`. When a tracked file is added, removed, renamed, or repurposed, update this reference in the same pull request.

Directories themselves are not Git-tracked files; their responsibilities are represented by the files they contain.

## Root configuration and project metadata

- `.editorconfig` — cross-editor charset, indentation, whitespace, and newline conventions.
- `.env.example` — safe environment-file example containing no credential; real local environment files remain ignored.
- `.gitattributes` — Git text/line-ending normalization rules used with repository hygiene tooling.
- `.gitignore` — excludes dependencies, build outputs, local environment files, editor artifacts, and other non-source state.
- `Cargo.toml` — Rust workspace manifest for `keysmith-core` and `src-tauri`; centralizes version, Rust 2024 edition, Apache-2.0 metadata, maintainer identity, and strict Rust/Clippy lint policy.
- `package.json` — frontend/tooling manifest and npm command surface, including development, typecheck, lint, text hygiene, documentation-inventory validation, tests, builds, and Tauri CLI access.
- `tsconfig.json` — strict no-emit TypeScript configuration with `noUncheckedIndexedAccess` and bundler-style resolution.
- `vite.config.ts` — Vite/Tauri frontend development and build configuration; fixes port 1420 and limits environment-variable prefixes.
- `eslint.config.js` — type-aware ESLint configuration for frontend TypeScript/Vite code, including the no-floating-promises rule.
- `rustfmt.toml` — repository Rust formatting configuration.
- `deny.toml` — cargo-deny advisory/license/source/version policy.
- `index.html` — complete semantic desktop UI shell: generator modes, controls, status/output, onboarding, Settings, About, privacy text, contact links, and visible version/credit.

## Root documentation, policy, and governance

- `README.md` — public project landing page, quick start, features, architecture, security/privacy summary, complete documentation map, development/release commands, and support information.
- `CHANGELOG.md` — durable user-visible change history and release-candidate entries.
- `ROADMAP.md` — forward-looking engineering/product milestones; roadmap entries are intentions rather than implemented guarantees.
- `CONTRIBUTING.md` — contributor workflow and quality/security expectations.
- `CODE_OF_CONDUCT.md` — community conduct expectations.
- `SECURITY.md` — vulnerability reporting policy and responsible disclosure guidance.
- `PRIVACY.md` — runtime privacy commitments and non-secret preference model.
- `THREAT_MODEL.md` — assets, attackers, trust boundaries, mitigations, and residual security risks.
- `SUPPORT.md` — project support channels and safe-help guidance.
- `LICENSE` — Apache License 2.0 text governing KeySmith source/distribution.
- `NOTICE` — project notice/attribution information accompanying Apache-2.0 distribution.
- `what_changed.md` — canonical continuation, verification, limitation, migration, release-note, and exact-next-task ledger.

## GitHub configuration and automation

- `.github/FUNDING.yml` — repository funding link configuration.
- `.github/dependabot.yml` — automated Cargo, npm, and GitHub Actions dependency-update configuration.
- `.github/pull_request_template.md` — pull-request quality/security/documentation checklist.
- `.github/RELEASE_TEMPLATE.md` — consistent release-notes and verification template for maintainers.
- `.github/ISSUE_TEMPLATE/bug_report.yml` — structured public bug-report form with safe reproduction fields.
- `.github/ISSUE_TEMPLATE/feature_request.yml` — structured feature-proposal form.
- `.github/ISSUE_TEMPLATE/config.yml` — issue-template routing/contact links for support and sensitive reporting paths.
- `.github/workflows/ci.yml` — primary PR/main quality workflow: frontend checks including documentation inventory, Rust core quality, three-platform Tauri checks, and cargo-deny policy.
- `.github/workflows/codeql.yml` — JavaScript/TypeScript and Rust CodeQL analysis on PRs/main and a weekly schedule.
- `.github/workflows/release.yml` — `v*` tag-triggered draft release builds for Linux, Windows, and universal macOS.
- `.github/workflows/rust.yml` — focused `keysmith-core` format/Clippy/build/test workflow; deliberately avoids a redundant full Linux Tauri build without native desktop packages.

## Rust core: `crates/keysmith-core`

- `crates/keysmith-core/Cargo.toml` — framework-independent core crate metadata/dependencies: `getrandom`, `eff_wordlist`, `zxcvbn`, Serde, thiserror, and test-only proptest.
- `crates/keysmith-core/src/lib.rs` — public API surface re-exporting supported options, generators, presets, strength estimates, entropy helper, and typed errors.
- `crates/keysmith-core/src/error.rs` — centralized `KeySmithError` validation/random-source errors; error messages do not include generated secrets.
- `crates/keysmith-core/src/random.rs` — private OS-CSPRNG bounded selection using rejection sampling plus secure Fisher–Yates-style shuffle.
- `crates/keysmith-core/src/policy.rs` — Serde camelCase `PasswordOptions`/`PassphraseOptions` structures and safe defaults.
- `crates/keysmith-core/src/generator.rs` — password and batch validation/generation, character pools, custom-symbol behavior, ambiguity filtering, required-class guarantee, random filling, and final shuffle.
- `crates/keysmith-core/src/passphrase.rs` — EFF large Diceware selection, word/separator validation, capitalization/two-digit suffix, and selection-space entropy calculation.
- `crates/keysmith-core/src/presets.rs` — Rust-owned Balanced, Maximum, Legacy compatible, and Alphanumeric policy definitions serialized to the UI.
- `crates/keysmith-core/src/strength.rs` — zxcvbn adapter returning score, guess estimates, logarithmic estimate, and human-readable strength label.
- `crates/keysmith-core/tests/security.rs` — explicit security/validation regressions: required classes, ambiguity exclusion, empty policy, ambiguity-filtered custom symbols, batch bounds, passphrase word count/bounds, and separator validation.
- `crates/keysmith-core/tests/properties.rs` — proptest coverage for exact requested length and digits-only generation invariants across ranges.

## Tauri desktop adapter: `src-tauri`

- `src-tauri/Cargo.toml` — desktop crate manifest using Tauri, `keysmith-core`, arboard, zeroize, Serde, and tauri-build.
- `src-tauri/build.rs` — minimal Tauri build-script entry point calling `tauri_build::build()`.
- `src-tauri/src/main.rs` — native executable entry point; suppresses the extra release-console window on Windows and calls the library runner.
- `src-tauri/src/lib.rs` — Tauri builder/bootstrap and explicit registration of the six allowed application commands.
- `src-tauri/src/commands.rs` — generation/preset IPC adapters plus privileged clipboard copy, conditional delayed clear, clear-now, size guard, and best-effort Rust-buffer zeroization.
- `src-tauri/tauri.conf.json` — product/version/identifier, Vite integration, window geometry, CSP, `freezePrototype`, bundle metadata, targets, and icon configuration.
- `src-tauri/capabilities/default.json` — least-privilege capability assigning default core plus KeySmith generation/clipboard permissions to the `main` window.
- `src-tauri/permissions/keysmith.toml` — explicit custom command allowlists split into generation/preset and clipboard privileges.
- `src-tauri/icons/32x32.png` — small PNG native application icon.
- `src-tauri/icons/128x128.png` — standard 128×128 PNG native application icon.
- `src-tauri/icons/128x128@2x.png` — high-density PNG native application icon.
- `src-tauri/icons/icon.ico` — Windows icon container used by native packaging/application metadata.
- `src-tauri/icons/icon.icns` — macOS icon container used by native packaging/application metadata.

The native icon files are binary branding/package assets only; they contain no executable logic or secret data.

## TypeScript frontend: `src`

- `src/main.ts` — application controller for DOM bindings, transient state, generation, rendering, clipboard actions, batch export, presets, tabs, theme, dialogs, onboarding, and startup.
- `src/api.ts` — single typed gateway to Tauri `invoke`; maps the six frontend methods to Rust command names and rejects when the desktop bridge is unavailable.
- `src/types.ts` — TypeScript mirror of Rust IPC inputs/results plus generator-mode/theme unions.
- `src/storage.ts` — only intentional local-storage layer; persists clipboard delay, theme, and onboarding completion with defensive safe fallbacks, never generated credentials.
- `src/storage.test.ts` — Vitest/jsdom tests for preference defaults, validation/fallback, theme persistence, and onboarding state.
- `src/styles.css` — complete design tokens, light/dark themes, layout, controls, output states, dialogs, responsive/focus/reduced-motion styling.
- `src/tauri.d.ts` — type declaration for the global Tauri bridge exposed by desktop configuration.
- `src/i18n/en.ts` — initial English status-message localization seed.
- `src/assets/logo.svg` — editable vector KeySmith logo used by the frontend/README; native package icons live separately in `src-tauri/icons`.

## Repository scripts

- `scripts/check-format.mjs` — recursively validates LF-only line endings, final newlines, and absence of trailing whitespace for recognized repository text files.
- `scripts/check-doc-inventory.mjs` — obtains every tracked path from `git ls-files` and fails when a path is not named in this canonical reference; used by `npm run docs:check` and CI.

## Maintained documentation: `docs`

- `docs/README.md` — documentation portal, navigation map, synchronization rules, and security-sensitive documentation-review list.
- `docs/user-guide.md` — end-user behavior/safe-use guide for onboarding, password/passphrase/batch modes, strength, clipboard, export, settings, themes, privacy, and scope.
- `docs/architecture.md` — layered architecture, trust boundaries, persistence/network/failure models, data flows, and architecture-change checklist.
- `docs/core-api.md` — detailed Rust core API, validation, random-selection, passphrase entropy, strength, presets, errors, tests, and dependency responsibilities.
- `docs/desktop-bridge.md` — Tauri command surface, result contracts, clipboard lifecycle, capability/permission model, CSP, bundle/window configuration, and privilege review checklist.
- `docs/frontend.md` — startup/state/DOM/type/API/storage/export/theme/tab/dialog/accessibility/style/test architecture for the presentation layer.
- `docs/setup.md` — common plus Windows/macOS/Linux source-development prerequisites, install/run/build checks, environment-secret rules, and setup isolation sequence.
- `docs/development.md` — day-to-day layer ownership, development modes, quality commands, secure change procedures, dependency/documentation rules, and debugging guidance.
- `docs/testing.md` — Rust/frontend/static/desktop/dependency/CodeQL checks plus packaged smoke, clipboard, accessibility, and release-evidence requirements.
- `docs/release.md` — synchronized versioning, clean candidate gates, lockfiles, native packaging, signing/notarization, smoke tests, screenshots, tagging, publication, rollback, and secret-handling process.
- `docs/troubleshooting.md` — layer-by-layer diagnosis for frontend/Rust/Tauri/native dependencies, clipboard, policies, presets, storage, export, CI/CodeQL/cargo-deny, packaging, and safe bug reports.
- `docs/accessibility.md` — implemented keyboard/semantic/live-region/focus/responsive/reduced-motion baseline plus detailed manual release checklist and reporting rules.
- `docs/performance.md` — security-preserving budgets, measurement separation, batch/clipboard/export/startup performance, benchmarking guidance, and regression triage.
- `docs/github.md` — branch protection, PR/merge policy, expected checks, issues/discussions/labels/milestones, Dependabot/CodeQL/settings, Actions permissions, releases, and emergency governance.
- `docs/wordlists.md` — EFF large Diceware source, local independent selection model, repeated-word behavior, entropy formula, and third-party attribution context.
- `docs/maintainer-guide.md` — change classification, commit conventions, verification ladder, workflow ownership, dependency/version/documentation/security gates, PR/release and handoff discipline.
- `docs/repository-reference.md` — this file and CI-backed canonical completeness inventory.
- `docs/adr/0001-rust-core-tauri-ui.md` — decision record establishing a framework-independent Rust security core behind a Tauri/TypeScript UI.
- `docs/adr/0002-os-csprng-and-no-secret-storage.md` — decision record establishing OS cryptographic randomness and no intentional generated-secret history/storage.

## Files intentionally not committed at this checkpoint

The following are generated/local state rather than project source and are intentionally absent from this tracked-file inventory:

- `node_modules/`;
- `dist/`;
- Rust/Tauri `target/` directories;
- local `.env` files;
- editor/OS temporary files;
- local release artifacts.

At this release-candidate checkpoint, `package-lock.json` and `Cargo.lock` are also not committed. `what_changed.md` tracks trusted clean dependency resolution/lockfile generation as a pre-stable-release task. Do not hand-author dependency lockfiles.

## Completeness maintenance procedure

For every pull request that changes the tracked-file set:

1. run `npm run docs:check`;
2. add/remove/rename the corresponding entry here;
3. update the deeper topic document when behavior/security/operations changed;
4. update `docs/README.md` when navigable documentation changes;
5. update `what_changed.md` when the active release-candidate checkpoint changes;
6. keep CI/tooling coverage synchronized with new scripts/configuration.

A repository documentation review is complete only when `npm run docs:check` passes and the descriptions above still match the actual responsibilities of their files.
