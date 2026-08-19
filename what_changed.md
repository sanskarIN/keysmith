# KeySmith — Development Handoff

Last updated: 2026-08-19
Current product version: `0.1.0`
Release state: release candidate / **not stable**
Milestone: Phase 4 — hardening, complete documentation, exact-head verification, reproducible dependency lockfiles, packaged release gate
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Authoritative verification branch: `verify/0.1.0-rc`
Authoritative pull request: **#1 — `ci: verify KeySmith 0.1.0 release candidate`**
Superseded documentation PR: **#11 — closed without merge after reconciliation**
Maintainer commit email: `sanskarin@outlook.in`

This file is the canonical continuation ledger. Read it before making additional KeySmith changes. Do not call `0.1.0` stable and do not create/publish the stable tag until the exact candidate commit has green automated evidence, trusted tool-generated lockfiles are committed and reverified, and actual packaged applications are verified on Windows, macOS, and Linux.

## Authoritative release line

PR #1 is the only release-candidate line.

A later branch, `docs/full-repository-reference` / PR #11, was initially created from the older `main` implementation to perform a deep documentation/audit pass. That audit discovered that PR #1 was still open and already contained a substantially more advanced hardening/release implementation that had never reached `main`.

All useful PR #11 work has now been reconciled onto PR #1, including:

- complete documentation portal;
- deep user/core/native/frontend/maintainer references;
- canonical file-by-file repository inventory;
- CI-enforced no-skipped-file documentation check;
- README/changelog/handoff integration;
- deeper setup/development/testing/release/troubleshooting/GitHub operational documentation;
- the package-name audit finding (`eff-wordlist`), which was already corrected on PR #1.

PR #11 is closed without merge. Do **not** reopen/merge it as a separate release path because it is based on an older product implementation.

## Current architecture

### Rust security core — `crates/keysmith-core`

Framework-independent Rust 2024 crate responsible for:

- `PasswordOptions` and `PassphraseOptions`;
- strict Serde camelCase shapes with unknown-field rejection;
- password/passphrase policy validation;
- OS cryptographic randomness through `getrandom`;
- rejection-sampled unbiased bounded selection;
- secure Fisher–Yates-style shuffle;
- custom-symbol validation/deduplication/filtering;
- password and batch generation;
- EFF large Diceware passphrases;
- passphrase selection-space entropy estimation;
- Rust-owned presets;
- zxcvbn strength/guess estimates;
- typed policy/random-source errors;
- best-effort zeroization of mutable intermediate password buffers.

The core has no Tauri, DOM, filesystem, clipboard, opener, database, account, analytics, telemetry, cloud-sync, or runtime application-network responsibility.

### Native desktop boundary — `src-tauri`

The Tauri layer owns only the required OS/native authority:

- generation/preset IPC adapters;
- explicit clipboard copy/manual clear;
- one replaceable/cancellable clipboard auto-clear worker;
- bounded native plaintext batch save through the OS save dialog;
- exact external-opener permission scope;
- explicit custom capabilities/permissions;
- restrictive production/development CSP configuration;
- application window/build/bundle/icon configuration.

Registered commands:

1. `generate_password_command`
2. `generate_batch_command`
3. `generate_passphrase_command`
4. `get_presets_command`
5. `copy_secret_command`
6. `clear_clipboard_command`
7. `export_batch_command`

The main webview does **not** receive:

- `core:default`;
- a global `window.__TAURI__` bridge;
- arbitrary filesystem-write authority;
- arbitrary URL opening;
- shell/process execution;
- generic network-generation authority.

`withGlobalTauri` is false and `removeUnusedCommands` is enabled.

### TypeScript/Vite presentation — `src` + `index.html`

The frontend owns:

- semantic responsive UI;
- Password / Passphrase / Batch state;
- typed module-based Tauri calls;
- revision-based stale async result protection;
- output/strength/entropy/status rendering;
- deterministic batch-export **text construction only**;
- exact frontend external-destination allowlist;
- non-secret preferences;
- themes, onboarding, Settings, About;
- accessibility interactions;
- English-first localization;
- bounded/redacted structured diagnostic helper.

Generated credentials remain transient in frontend state and are not intentionally persisted.

## Password generation

Supported policy:

- length 4–128;
- lowercase;
- uppercase;
- digits;
- symbols;
- optional custom symbol source;
- ambiguous-character exclusion;
- at least one character from every enabled usable class;
- secure final shuffle;
- batch size 1–500;
- Balanced, Maximum, Legacy compatible, and Alphanumeric presets.

### Hardened custom-symbol policy

Rust is authoritative:

- maximum 40 characters;
- every custom symbol must be ASCII punctuation;
- duplicate candidates are removed before selection so repeated symbols do not gain extra probability weight;
- ambiguity filtering still applies when enabled;
- empty custom-symbol input uses the built-in symbol source;
- invalid custom-symbol text does not block generation when Symbols is disabled;
- an enabled symbol set made unusable by filtering fails safely;
- frontend preserves non-empty custom-symbol input exactly rather than trimming it into a different policy.

## Passphrases and strength

- Cargo package: `eff-wordlist`;
- Rust crate identifier: `eff_wordlist`;
- EFF large Diceware list packaged with the application dependency;
- 3–12 independently selected words;
- separator 0–3 characters with no control characters;
- optional deterministic capitalization;
- optional independent two-digit suffix from `00` through `99`;
- selection-space entropy estimate;
- zxcvbn strength/guess estimates for single password/passphrase views;
- localized strength labels derived from numeric score with readable fallback behavior.

Batch IPC deliberately returns only generated secret values; it does not perform up to 500 unused zxcvbn calculations because Batch does not display per-item strength.

## Clipboard model

Native clipboard rules:

- explicit user action only;
- maximum payload: 65,536 characters;
- bound covers the documented 500 × 128-character maximum batch plus newline separators;
- accepted auto-clear values are exactly `0`, `15`, `30`, `60`, `120` seconds;
- unsupported direct IPC values are rejected;
- one process-wide worker maintains at most one pending clear schedule;
- a newer copy replaces the older schedule;
- copying with Never cancels a pending schedule;
- manual clear cancels a pending schedule;
- at deadline, KeySmith clears only when the clipboard still exactly matches the expected copied value;
- application-owned expected/current native buffers use `Zeroizing` where practical.

Clipboard managers, accessibility tools, remote-desktop tools, malware, or other OS processes may retain/observe values outside KeySmith's control.

## Native batch save

Browser Blob/download export is **not** the current release-candidate architecture.

Current flow:

1. frontend constructs deterministic plaintext with KeySmith header, ISO timestamp, localized warning, generated values, and trailing newline;
2. frontend calls `export_batch_command` without a destination path;
3. Rust independently validates required header/shape, control characters, trailing newline, and 70,000-character upper bound;
4. Rust opens the native OS save dialog with `.txt` filter/default name;
5. cancellation returns a normal false result and writes nothing;
6. selected destination must resolve to a local path;
7. Rust writes the validated plaintext bytes;
8. application-owned export content is zeroized where practical.

The frontend has no generic filesystem-write capability. Export is intentionally plaintext and visibly warned.

## External destination model

About/support/funding links open only after explicit user activation and must pass **both** frontend and native exact allowlists.

Allowed destinations:

- `https://github.com/sanskarIN`
- `https://buymeacoffee.com/sanskarIN`
- `mailto:supportramsandesh@gmail.com`
- `mailto:sanskarin@outlook.in`
- `mailto:sanskarin.business@gmail.com`

`index.html`, `src/external-links.ts`, and `src-tauri/capabilities/default.json` are kept synchronized by tests.

Do not replace exact scope with generic `https:` / `mailto:` permission without a separately reviewed product/security requirement.

## UI, accessibility, and async safety

Implemented baseline includes:

- semantic Password/Passphrase/Batch tabs/panels;
- roving tab focus and Left/Right Arrow navigation;
- skip link;
- labels, fieldsets, legends, dialog names;
- visible `:focus-visible` treatment;
- live generated-output/status regions;
- status meaning not dependent on color alone;
- scalable/responsive controls;
- reduced-motion support;
- light/dark/system themes;
- onboarding with revisit path;
- Settings/About dialogs;
- native save dialog rather than custom file-picker UI;
- WCAG-AA-targeted primary-button contrast with automated regression coverage.

`generationRevision` prevents late password/passphrase/batch results from overwriting newer mode/state. Native export and copy completion/status paths also guard against stale completion updates.

Packaged keyboard/screen-reader/scaling/native-dialog verification remains a release gate; jsdom/static tests do not replace it.

## Localization

English is the only shipped locale for 0.1.0, but the frontend is localization-ready:

- `src/i18n/en.ts` — canonical English catalog/runtime formatters;
- `src/i18n/index.ts` — static `data-i18n*` application;
- `src/i18n/presets.ts` — localized preset copy separate from Rust security options;
- `src/i18n/strength.ts` — numeric-score-based localized strength labels;
- catalog/markup/preset/strength/integration tests;
- `docs/i18n.md` and ADR 0003 document locale expansion.

Security policies, IPC command names, storage keys, permission names, preset IDs, and other machine contracts are not translation data.

## Privacy and diagnostic logging

No account, telemetry, analytics, password history, cloud sync, or generation-time application network service is included.

Only intentional frontend persistence:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Generated passwords/passphrases/batches, clipboard values, export destinations, strength/entropy values, and sensitive diagnostics are not intentionally persisted.

`src/logging.ts` provides bounded structured-data redaction covering password/passphrase/secret/token/authorization/cookie/email/credential/API-key/session/private-key/path-style field names and truncating deep nesting. This helper is **not** permission to pass a generated secret under an innocuous key.

## Automated test inventory

### Rust core

- `crates/keysmith-core/tests/security.rs`
- `crates/keysmith-core/tests/properties.rs`
- `crates/keysmith-core/tests/serialization.rs`
- `crates/keysmith-core/tests/validation.rs`
- module unit tests in generation/random/native modules.

Coverage includes required classes, ambiguity filtering, password ranges/sets, batch limits, passphrase validation, custom-symbol ASCII-punctuation/size/dedup/filter behavior, strict serialized shapes, and zero-bound random handling.

### Native/Tauri

Unit tests protect:

- clipboard payload bounds;
- accepted/rejected delays;
- schedule replacement;
- cancellation;
- export content header/shape/control/bound validation.

Hosted CI performs Tauri check + Clippy with warnings denied on Linux, Windows, and macOS.

### Frontend/integration/static security

- `src/storage.test.ts`
- `src/api.test.ts`
- `src/app.integration.test.ts`
- `src/accessibility.test.ts`
- `src/contrast.test.ts`
- `src/export.test.ts`
- `src/external-links.test.ts`
- `src/external-links.integration.test.ts`
- `src/logging.test.ts`
- `src/policy-input.test.ts`
- `src/tauri-security-config.test.ts`
- `src/version-consistency.test.ts`
- `src/i18n/index.test.ts`
- `src/i18n/markup.test.ts`
- `src/i18n/presets.test.ts`
- `src/i18n/strength.test.ts`

Coverage includes real markup, command mapping, stale async results, native export/cancellation, external-link drift, accessibility relationships, primary-button contrast, native security configuration, version consistency, preference boundaries, localization, logging redaction, and custom-symbol input handling.

## Complete documentation set

### Root/public

- `README.md`
- `CHANGELOG.md`
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

### Documentation portal/deep references

- `docs/README.md` — complete documentation portal and synchronization rules.
- `docs/user-guide.md` — complete user behavior/safe-use guide.
- `docs/architecture.md` — trust/data/native architecture.
- `docs/core-api.md` — hardened Rust core API/algorithm/validation/randomness/error/test reference.
- `docs/desktop-bridge.md` — commands, clipboard worker, native save, opener, capabilities, CSP, global-bridge reference.
- `docs/frontend.md` — state, typed API, stale-result, export, external-link, storage, localization, logging, accessibility/test architecture.
- `docs/setup.md` — complete Windows/macOS/Linux development setup and first-check isolation.
- `docs/development.md` — secure change procedures across core/native/frontend/localization/storage/docs/dependencies.
- `docs/testing.md` — frontend/Rust/native/security/CodeQL/release preflight/manual test matrix.
- `docs/verification.md` — packaged release-candidate verification checklist.
- `docs/release.md` — exact-head, lockfile, tag, permission, artifact, signing/publication process.
- `docs/troubleshooting.md` — layer-by-layer frontend/core/native/export/clipboard/opener/CI/release diagnosis.
- `docs/accessibility.md` — implemented accessibility baseline, automated coverage, packaged verification.
- `docs/performance.md` — performance budgets/measurement without weakening security.
- `docs/github.md` — branch protection, CI/security gates, Actions permissions, issues/dependencies/releases.
- `docs/i18n.md` — localization ownership/boundary.
- `docs/logging.md` — diagnostic redaction/no-secret policy.
- `docs/wordlists.md` — EFF word-list package/crate/source/entropy model.
- `docs/maintainer-guide.md` — maintainer change classification, CI/release/dependency/version/docs/security gates.
- `docs/repository-reference.md` — canonical file-by-file inventory.
- ADR 0001–0004.

## No-skipped-file documentation invariant

New tooling:

- `scripts/check-doc-inventory.mjs`
- npm command: `npm run docs:check`

The checker:

1. runs `git ls-files -z`;
2. reads `docs/repository-reference.md`;
3. checks that every tracked path is explicitly named;
4. prints any missing tracked files and exits nonzero.

Primary CI runs this after text hygiene and before tests/build. Release tag preflight also runs it.

Therefore adding a new tracked project file without documenting it is now intended to fail automated verification.

## GitHub automation

### `.github/workflows/ci.yml`

Uses `concurrency` with `cancel-in-progress: true` so superseded PR/ref runs do not remain authoritative.

Frontend quality:

- `npm install`
- `npm audit --audit-level=high`
- `npm run secret:check`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run docs:check`
- `npm test`
- `npm run build`
- uploads generated `package-lock.json` for one day.

Rust core quality:

- `cargo fmt --all -- --check`
- strict core Clippy
- core tests
- Cargo lockfile generation
- cargo-deny
- uploads generated `Cargo.lock` for one day.

Desktop matrix (after frontend/core):

- Ubuntu 22.04 native prerequisites + Tauri check + Tauri Clippy;
- Windows Tauri check + Tauri Clippy;
- macOS Tauri check + Tauri Clippy.

### `.github/workflows/codeql.yml`

- JavaScript/TypeScript CodeQL;
- Rust CodeQL after a complete Rust workspace build with Linux Tauri native prerequisites;
- concurrency cancellation for superseded runs.

### `.github/workflows/release.yml`

`v*` tags only.

`Verify release tag` runs before platform artifact jobs and verifies:

- tag equals `v${package.json.version}`;
- npm dependency resolution;
- high-severity npm audit;
- repository secret scan;
- TypeScript typecheck/lint/text hygiene/documentation inventory/tests/build;
- Rust formatting;
- strict core Clippy;
- Rust core tests;
- Cargo dependency resolution;
- cargo-deny.

Release permission model:

- workflow/default/preflight: `contents: read`;
- platform `build` job only: `contents: write` for draft GitHub release creation/update.

Do not broaden ordinary verification-job token permissions.

Generated artifacts are not described as signed unless signing/notarization is separately configured and verified with protected secrets/tooling.

## Consolidation work completed in this continuation

PR #1 now includes these additional granular documentation/release-hardening changes from the final audit:

- complete `docs/README.md` portal;
- complete `docs/user-guide.md`;
- hardened `docs/core-api.md`;
- hardened `docs/desktop-bridge.md`;
- hardened `docs/frontend.md`;
- complete `docs/maintainer-guide.md`;
- `scripts/check-doc-inventory.mjs`;
- `npm run docs:check`;
- complete `docs/repository-reference.md` covering all tracked source/config/test/doc/script/native binary-icon paths;
- primary CI documentation-inventory gate;
- expanded README documentation/navigation/security model;
- expanded CHANGELOG documentation/hardening record;
- reconciled PR #1/PR #11 handoff;
- release tag preflight now includes docs completeness and cargo-deny;
- release workflow token permissions narrowed to read-only by default with write granted only to the artifact-build job;
- `docs/testing.md` synchronized with docs/release/dependency gates;
- `docs/release.md` synchronized with exact preflight/permission model;
- deeper cross-platform `docs/setup.md`;
- deeper secure `docs/development.md`;
- deeper `docs/troubleshooting.md` covering native/export/clipboard/opener/docs/audit/CodeQL/release failures;
- deeper `docs/github.md` covering docs completeness, Actions permission separation, branch protection, dependency automation, and emergency governance;
- this final consolidated handoff.

Important audit finding from the superseded branch: older `main` used the nonexistent Cargo dependency key `eff_wordlist`; the authoritative PR #1 branch already correctly uses the published package name `eff-wordlist`.

## Current verification state

Every candidate commit triggers CI and CodeQL. Concurrency cancels superseded runs. **Only the newest exact PR #1 head counts.**

This handoff update is the final planned documentation commit before verification. Freeze the candidate head now unless CI/CodeQL exposes a real defect requiring a fix.

Do not infer success from:

- a configured workflow;
- an older green SHA;
- GitHub's `mergeable` flag;
- source inspection alone.

### Required automated evidence on one exact head

1. npm high-severity audit
2. repository secret scan
3. TypeScript typecheck
4. ESLint
5. repository text hygiene
6. tracked-file documentation inventory
7. frontend/integration/static tests
8. Vite production build
9. Rust formatting
10. strict core Clippy
11. Rust core tests
12. cargo-deny
13. Linux Tauri check + Clippy
14. Windows Tauri check + Clippy
15. macOS Tauri check + Clippy
16. CodeQL JavaScript/TypeScript
17. CodeQL Rust complete-workspace analysis

## Lockfiles / reproducibility

`package-lock.json` and `Cargo.lock` are not yet committed to the release-candidate branch.

Current CI generates both from real dependency resolution and uploads them as one-day artifacts.

Before stable release:

1. retrieve the CI-generated lockfile artifacts (or generate them in an equally trusted clean environment);
2. inspect dependency graphs/diffs;
3. commit only tool-generated lockfiles — never hand-author them;
4. add `package-lock.json` and `Cargo.lock` entries to `docs/repository-reference.md`;
5. update install commands to reproducible locked resolution where appropriate;
6. rerun the complete exact-head CI/CodeQL matrix on the lockfile commit.

## Packaged application verification still required

Use `docs/verification.md` on actual packaged Windows, macOS, and Linux applications.

Verify at minimum:

- install/launch/close/relaunch;
- first-run onboarding/revisit;
- Password/Passphrase generation;
- presets;
- minimum/maximum policies;
- maximum Batch responsiveness;
- native save success/cancel/content/warning;
- clipboard copy/replacement/Never cancellation/manual clear/conditional exact-value clear;
- exact About external destinations;
- System/Light/Dark persistence;
- keyboard-only full flow and focus behavior;
- representative screen-reader behavior;
- 200% scaling/text expansion/minimum window;
- reduced motion;
- no generated-secret history/persistence;
- no unexpected telemetry/automatic application network request;
- real release screenshots using disposable values and no personal desktop data;
- signing/notarization status accurately recorded.

Static/jsdom/source checks cannot truthfully replace these native checks.

## Known limitations / intentional non-goals

- generator, not a password manager/vault;
- no secret history;
- no account/cloud sync/telemetry/analytics;
- runtime credential generation offline by design;
- plaintext batch export with explicit warning;
- clipboard confidentiality partly depends on OS/other software;
- zeroization is best-effort for application-owned buffers, not webview/OS/allocator-wide erasure;
- no silent background updater;
- English is the only shipped UI locale in 0.1.0;
- EFF passphrase words remain English;
- trusted lockfiles not yet committed;
- packaged native smoke/accessibility verification not yet completed/recorded;
- real release screenshots not yet committed;
- signing/notarization not configured/claimed;
- `main` branch protection deferred until successful final check names are proven;
- release-build performance timing claims remain unmade until measured.

## Next exact tasks

1. Freeze the PR #1 head created by this handoff commit.
2. Inspect CI and CodeQL for that **exact** head.
3. For every failure, inspect the precise failed step/log and fix the root cause on `verify/0.1.0-rc`; add regression coverage for behavioral/security defects.
4. Repeat until frontend, Rust core, cargo-deny, Linux/Windows/macOS Tauri check+Clippy, and both CodeQL analyses are green on one head.
5. Confirm `npm run docs:check` reports complete tracked-file coverage.
6. Retrieve/inspect CI-generated `package-lock.json` and `Cargo.lock`; commit them, document them in the repository reference, and rerun all exact-head checks.
7. Run packaged Windows/macOS/Linux builds and every `docs/verification.md` case.
8. Record measured release-build performance without invented values.
9. Capture real screenshots using disposable credentials and no personal desktop secrets.
10. Enable `main` branch protection using proven successful check names.
11. Finalize `CHANGELOG.md` release date/notes only after the candidate is ready.
12. Merge PR #1, verify `main` push checks, tag the exact verified commit `v0.1.0`, inspect the draft platform artifacts, and publish only after final artifact verification.

## Persistent preference / migration notes

No credential database exists, so there is no secret-data migration.

Current non-secret preference schema:

- `keysmith.clipboardClearSeconds` — allowed `0`, `15`, `30`, `60`, `120`; malformed/unsupported values safely fall back to 30.
- `keysmith.theme` — `system`, `light`, `dark`; invalid/missing safely falls back.
- `keysmith.onboardingComplete` — first-run introduction completion flag.

Future preference changes must preserve safe fallback and must never become generated-secret history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 is an offline-first desktop password/passphrase generator built with Rust, Tauri, and TypeScript. It uses OS cryptographic randomness, unbiased bounded selection, secure shuffle, strict Rust policy validation, deduplicated ASCII-punctuation custom symbols, EFF large Diceware passphrases, zxcvbn strength estimates, Rust-owned presets, optimized secret-only batch generation, bounded native plaintext save, one replaceable conditional clipboard-clear worker, exact frontend/native external-destination allowlists, no global Tauri bridge, restrictive capabilities/CSP, English-first localization, accessible responsive UI, safe diagnostic redaction, broad automated integration/security/configuration/accessibility coverage, dependency/security automation, least-privilege release permissions, and CI-enforced complete file-by-file documentation.

It does not include accounts, telemetry, cloud sync, remote generation, credential vault/history, generic filesystem permission, arbitrary external URL permission, or a silent background updater.

Stable release remains blocked on exact-head green automation, committed verified lockfiles, packaged cross-platform verification, real screenshots, branch protection/release governance, and final artifact/signing-status review.
