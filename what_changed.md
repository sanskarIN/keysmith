# KeySmith — Development Handoff

Last updated: 2026-08-19
Current product version: `0.1.0`
Current release state: `0.1.0` release candidate / not stable
Current milestone: Phase 4 — hardening, complete documentation, same-commit verification, packaged release gate
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Authoritative verification branch: `verify/0.1.0-rc`
Authoritative pull request: `#1` — `ci: verify KeySmith 0.1.0 release candidate`
Superseded documentation-only verification PR: `#11`
Required maintainer commit email: `sanskarin@outlook.in`

This is the canonical continuation ledger. Read it before changing the repository. Do not mark `0.1.0` stable and do not create the stable tag until the exact candidate commit passes all automated checks, trusted lockfiles are committed, and packaged applications are manually verified on Windows, macOS, and Linux.

## Why PR #1 is authoritative

A later documentation/audit branch (`docs/full-repository-reference`, PR #11) was initially created from `main` and added deep documentation, regression coverage, and a tracked-file documentation checker. During that audit, the repository was found to still have the older open PR #1 (`verify/0.1.0-rc`) containing a much larger and materially more advanced hardening set that had never reached `main`.

PR #1 already includes:

- stricter Rust custom-symbol validation and serialization boundaries;
- single-worker clipboard scheduling/cancellation;
- bounded native batch save instead of browser Blob export;
- exact frontend/native opener allowlists;
- no global Tauri bridge and no `core:default` capability;
- production CSP tightening and unused-command stripping;
- localization architecture;
- safe diagnostic redaction;
- real-markup integration/accessibility/configuration/version/contrast tests;
- cross-platform Tauri check + Clippy;
- npm audit, secret scan, cargo-deny, CodeQL, lockfile artifacts, and release-tag verification;
- expanded architecture/security/privacy/threat/release/verification documentation.

Therefore PR #11 is not the release line. Its useful documentation/completeness work has been reconciled onto PR #1. Future work must continue on `verify/0.1.0-rc` unless a later handoff explicitly replaces it.

## Current architecture

### Rust security core — `crates/keysmith-core`

Framework-independent Rust 2024 crate responsible for:

- password/passphrase policy structures;
- strict camelCase Serde shapes with unknown-field denial;
- OS-backed cryptographic randomness through `getrandom`;
- rejection-sampled unbiased bounded selection;
- Fisher–Yates-style secure shuffle;
- password/custom-symbol validation;
- batch generation;
- EFF large Diceware passphrases;
- selection-space entropy estimation;
- Rust-owned presets;
- zxcvbn strength estimates;
- typed policy/random-source errors;
- best-effort zeroization of intermediate password vectors.

It has no Tauri, DOM, filesystem, clipboard, opener, database, analytics, account, or runtime network responsibility.

### Native desktop boundary — `src-tauri`

Owns only explicit desktop/native authority:

- seven registered Tauri commands;
- generation/preset IPC adapters;
- clipboard write/manual clear/conditional auto-clear;
- one process-wide replaceable/cancellable clipboard timer worker;
- bounded native plaintext batch save using the OS save dialog;
- exact five-destination external opener permission scope;
- least-privilege capability/permission mapping;
- restrictive production/dev CSP;
- `withGlobalTauri: false`;
- `removeUnusedCommands: true`;
- native packaging/icons/window configuration.

The main webview does not receive `core:default`, arbitrary filesystem authority, generic URL opening, shell/process execution, or a global Tauri object.

### TypeScript/Vite presentation — `src` + `index.html`

Owns:

- semantic responsive UI;
- Password/Passphrase/Batch state;
- typed module-based Tauri calls;
- revision-based stale async result protection;
- output/strength/entropy/status presentation;
- batch export text construction only (not path writing);
- exact frontend external-destination allowlist;
- non-secret preferences;
- themes/onboarding/settings/about;
- accessibility interaction behavior;
- English-first localization;
- bounded/redacted structured diagnostic helper.

Generated secrets remain transient in frontend state and are not intentionally persisted.

## Password generation

- length 4–128;
- lowercase, uppercase, digits, symbols;
- optional custom symbol source;
- ambiguity exclusion;
- at least one character from every enabled usable class;
- secure final shuffle;
- batch count 1–500;
- Balanced, Maximum, Legacy compatible, and Alphanumeric presets.

### Hardened custom-symbol policy

Rust, not HTML, is authoritative:

- maximum 40 characters;
- every custom symbol must be ASCII punctuation;
- repeated candidates are deduplicated before selection so duplicates do not increase probability weight;
- ambiguity filtering still applies;
- empty custom-symbol string uses built-in symbols;
- invalid custom-symbol text is irrelevant when Symbols is disabled;
- an enabled symbol pool emptied by filtering fails safely;
- frontend preserves non-empty input exactly instead of trimming it into a different policy.

## Passphrases and strength

- EFF large Diceware list through Cargo package `eff-wordlist` / Rust crate `eff_wordlist`;
- 3–12 independently selected words;
- separator 0–3 non-control characters;
- optional deterministic capitalization;
- optional independent two-digit suffix `00`–`99`;
- selection-space entropy estimate;
- zxcvbn strength score/guess estimates for single password/passphrase views;
- localized strength labels derived from numeric score with backend fallback behavior.

Batch IPC is deliberately secret-only and does not perform up to 500 unused zxcvbn evaluations.

## Clipboard model

- explicit user action only;
- max native payload: 65,536 characters, enough for maximum supported batch plus separators;
- supported delays exactly: 0, 15, 30, 60, 120 seconds;
- unsupported direct IPC delay rejected;
- one process-wide worker rather than one thread per copy;
- newer schedule replaces older schedule;
- copying with Never cancels pending schedule;
- manual clear cancels pending schedule;
- scheduled clear only occurs if current clipboard still exactly matches the expected copied value;
- expected/current application-owned native strings use `Zeroizing` where practical.

OS clipboard managers/processes may still observe/retain data outside KeySmith's control.

## Batch native save

Browser Blob/download export has been removed from the release candidate.

Current flow:

1. frontend builds deterministic plaintext content with header, ISO timestamp, localized warning, values, trailing newline;
2. frontend invokes dedicated `export_batch_command` without a path;
3. Rust requires `# KeySmith batch export\n` prefix, trailing newline, max 70,000 chars, and no control characters except newline;
4. Rust opens the native OS save dialog with `.txt` filter/default filename;
5. cancellation returns `false` and writes nothing;
6. selected destination must be a local path;
7. validated bytes are written and buffer is zeroized where practical.

The frontend has no generic filesystem-write permission. Export remains plaintext by design and is visibly warned.

## External destination model

About/support/funding destinations open only after explicit user activation and must pass both frontend and native exact allowlists:

- `https://github.com/sanskarIN`
- `https://buymeacoffee.com/sanskarIN`
- `mailto:supportramsandesh@gmail.com`
- `mailto:sanskarin@outlook.in`
- `mailto:sanskarin.business@gmail.com`

Tests keep `index.html`, `src/external-links.ts`, and `src-tauri/capabilities/default.json` synchronized. Do not replace exact scope with wildcard `https:`/`mailto:` permissions.

## UI / accessibility / async safety

- semantic Password/Passphrase/Batch tab/panel relationships;
- roving tab focus and Left/Right Arrow navigation;
- skip link;
- explicit labels/fieldsets/dialog names;
- visible focus;
- live output/status;
- non-color-only status meaning;
- responsive/scalable controls;
- reduced-motion support;
- light/dark/system themes;
- first-run onboarding and revisit path;
- Settings/About dialogs;
- WCAG-AA-targeted primary-button contrast tokens with automated regression coverage.

`generationRevision` prevents a password/passphrase/batch command result from rendering after the user has moved to newer state/mode. Native export and copy status also guard against stale completion updates.

## Localization

English is the only shipped locale for `0.1.0`, but the architecture is localization-ready:

- `src/i18n/en.ts` — canonical English catalog/runtime formatters;
- `src/i18n/index.ts` — static `data-i18n*` application;
- `src/i18n/presets.ts` — localized preset copy separate from Rust security options;
- `src/i18n/strength.ts` — localized strength labels based on numeric score;
- unknown/future values keep readable fallbacks;
- catalog, markup, preset, strength, and integration tests protect the boundary;
- `docs/i18n.md` and ADR 0003 document locale expansion.

Security policy, storage keys, command names, native permissions, preset IDs, and other machine contracts are not translation data.

## Logging/privacy

No account, telemetry, analytics, password history, cloud sync, or generation-time application network dependency is included.

`src/logging.ts` provides bounded structured-data redaction for diagnostic use, covering sensitive password/passphrase/secret/token/authorization/cookie/email/credential/API-key/session/private-key/path-style field names and truncating deep nesting. This is not permission to log generated secrets under harmless-looking keys.

Only intentional frontend persistence:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Generated values, clipboard contents, export destinations, strength/entropy values, and diagnostics containing sensitive content are not intentionally persisted.

## Test inventory

### Rust core

- `crates/keysmith-core/tests/security.rs`
- `crates/keysmith-core/tests/properties.rs`
- `crates/keysmith-core/tests/serialization.rs`
- `crates/keysmith-core/tests/validation.rs`
- module unit tests in generation/random/native code.

Coverage includes required classes, ambiguity filtering, lengths/sets, batch limits, passphrase validation, custom-symbol ASCII punctuation/size/dedup/filter behavior, unknown fields, and zero-bound random handling.

### Native/Tauri

Unit tests protect clipboard payload/delay/replacement/cancellation behavior and native export content validation. Cross-platform CI performs Tauri `cargo check` and Clippy on Linux/Windows/macOS.

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

These cover real markup, command mapping, stale async results, native export flow/cancellation, external-link drift, accessibility relationships, contrast, security config, version consistency, preference boundaries, localization, logging redaction, and custom-symbol input handling.

Static/jsdom coverage does not replace packaged desktop verification.

## Complete documentation set

### Root

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

### Documentation portal and deep references

- `docs/README.md` — complete portal and synchronization rules.
- `docs/user-guide.md` — complete product/safe-use guide.
- `docs/architecture.md` — trust/data/native architecture.
- `docs/core-api.md` — hardened Rust core API/algorithm reference.
- `docs/desktop-bridge.md` — Tauri/native privilege/clipboard/export/opener/CSP reference.
- `docs/frontend.md` — frontend state/API/staleness/export/link/storage/localization/logging/test reference.
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/verification.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/github.md`
- `docs/i18n.md`
- `docs/logging.md`
- `docs/wordlists.md`
- `docs/maintainer-guide.md`
- `docs/repository-reference.md`
- ADR 0001–0004.

### No-skipped-file enforcement

`scripts/check-doc-inventory.mjs` obtains all paths from `git ls-files` and fails when a tracked path is missing from `docs/repository-reference.md`.

`package.json` exposes:

```bash
npm run docs:check
```

`.github/workflows/ci.yml` runs the documentation inventory check in Frontend quality after text hygiene and before tests/build. This turns the "document every file" requirement into a continuing CI invariant rather than a one-time manual claim.

## GitHub automation

### `.github/workflows/ci.yml`

Uses concurrency cancellation for superseded PR/ref runs.

Frontend quality:

- `npm install`
- high-severity npm audit
- repository secret scan
- TypeScript typecheck
- ESLint including scripts
- repository text hygiene
- tracked-file documentation inventory
- Vitest
- Vite production build
- one-day `package-lock.json` artifact

Rust core quality:

- Rust formatting
- strict core Clippy
- core tests
- Cargo lockfile generation
- cargo-deny
- one-day `Cargo.lock` artifact

Desktop matrix (after frontend/core):

- Ubuntu 22.04 native dependencies + Tauri check + Tauri Clippy
- Windows Tauri check + Tauri Clippy
- macOS Tauri check + Tauri Clippy

### `.github/workflows/codeql.yml`

- JavaScript/TypeScript CodeQL
- Rust CodeQL after a complete Rust workspace build with Linux Tauri dependencies
- concurrency cancellation for superseded runs

### `.github/workflows/release.yml`

`v*` tags only. A `Verify release tag` job checks tag/package version matching plus frontend audit/secret/quality/build and Rust core quality before platform draft artifacts are built.

No signing/notarization credential is stored in source control and unsigned artifacts must not be described as signed.

## Consolidation work completed in this continuation

The documentation/audit work originally started on PR #11 has now been reconciled onto PR #1 with granular commits:

1. added `docs/README.md` complete documentation portal;
2. added `docs/user-guide.md` matching hardened native/save/clipboard/opener behavior;
3. added `docs/core-api.md` for strict Rust policy/randomness/serialization/memory/test contracts;
4. added `docs/desktop-bridge.md` for seven commands, one clipboard worker, native save, exact opener, capabilities/CSP/global bridge;
5. added `docs/frontend.md` for revision-based async safety, typed module API, native export handoff, external links, storage, localization, logging, tests;
6. added `docs/maintainer-guide.md` for change classification, CI/release/dependency/version/docs/security gates;
7. added `scripts/check-doc-inventory.mjs`;
8. added `npm run docs:check` without removing audit/secret/lint/test/build scripts;
9. added `docs/repository-reference.md` covering every tracked root/GitHub/core/native/frontend/localization/test/doc/script/binary icon file;
10. wired `npm run docs:check` into the existing concurrency-controlled primary CI;
11. expanded README with documentation portal, file inventory, core/native/frontend links, docs check, and package/crate naming clarity;
12. updated CHANGELOG for complete documentation and CI-enforced no-skipped-file coverage;
13. reconciled this handoff so PR #1 is the single authoritative release candidate.

Separately, the PR #11 audit found that `main`'s old core manifest used the nonexistent dependency key `eff_wordlist`; the advanced PR #1 branch already uses the correct published Cargo package name `eff-wordlist`, so that defect is not present in the authoritative candidate.

## Verification state

Automated runs are triggered by every candidate commit and concurrency cancels superseded runs. Only the latest exact PR #1 head may be considered release evidence.

The newest documentation/handoff commits require fresh CI and CodeQL. Do not rely on older green results after this reconciliation.

### Required automated evidence on one exact commit

1. `npm audit --audit-level=high`
2. `npm run secret:check`
3. `npm run typecheck`
4. `npm run lint`
5. `npm run format:check`
6. `npm run docs:check`
7. `npm test`
8. `npm run build`
9. `cargo fmt --all -- --check`
10. `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
11. `cargo test -p keysmith-core --all-features`
12. cargo-deny
13. Linux Tauri check + Clippy
14. Windows Tauri check + Clippy
15. macOS Tauri check + Clippy
16. CodeQL JavaScript/TypeScript
17. CodeQL Rust full-workspace analysis

### Packaged-application evidence still required

On Windows, macOS, and Linux:

- install/launch/relaunch;
- first-run onboarding/revisit;
- Password/Passphrase generation and presets;
- minimum/maximum policy boundaries;
- maximum-size Batch responsiveness;
- native save success/cancel/content/warning;
- clipboard copy, replacement schedule, Never cancellation, manual clear, exact-value conditional clear;
- exact About external destinations;
- light/dark/system theme persistence;
- keyboard-only full flow/focus;
- screen-reader representative review;
- 200% scaling/text expansion/minimum window;
- reduced motion;
- no secret history/persistence;
- no unexpected telemetry/automatic application network request;
- real screenshots using disposable values;
- signing/notarization status accurately recorded.

Use `docs/verification.md`; source/jsdom inspection is not a substitute.

## Lockfiles / reproducibility

`package-lock.json` and `Cargo.lock` are not yet committed to the candidate. CI intentionally generates both from actual dependency resolution and uploads one-day artifacts.

Before stable release:

1. retrieve trusted CI-generated lockfile artifacts (or generate from an equally trusted clean environment);
2. inspect the resolved graphs;
3. commit the tool-generated lockfiles—never hand-author them;
4. add both tracked paths to `docs/repository-reference.md`;
5. update install commands toward reproducible resolution where appropriate;
6. run all automated checks again on the exact lockfile commit.

## Known limitations / intentional non-goals

- KeySmith is a generator, not a password manager; no vault/history.
- No account/cloud sync/telemetry/analytics.
- Runtime credential generation is offline by design.
- Batch export is plaintext and warned.
- Clipboard privacy depends partly on the OS/other software.
- Zeroization is best-effort for application-owned buffers, not OS/webview/allocator-wide erasure.
- No silent background updater.
- English is the only shipped UI locale in 0.1.0.
- EFF passphrase words remain English; another language requires separately reviewed word list/entropy model.
- Lockfiles are not yet committed.
- Packaged native smoke/accessibility tests are not yet recorded complete.
- Real release screenshots are not yet committed.
- Signing/notarization is not configured/claimed.
- `main` branch protection is still deferred until successful current check names are proven.
- Release-build performance timing claims remain unmade until measured.

## Next exact tasks

1. Inspect CI and CodeQL for the exact head created by this reconciliation.
2. For every failed job, inspect the exact failed step/log and fix the root cause on `verify/0.1.0-rc`; add regression coverage for behavior defects.
3. Repeat until frontend, Rust core, cargo-deny, Linux/Windows/macOS Tauri check+Clippy, and both CodeQL languages are green on one head.
4. Confirm `npm run docs:check` reports complete coverage of every tracked file.
5. Retrieve/inspect CI-generated `package-lock.json` and `Cargo.lock`, commit them, update the repository reference, then rerun the full exact-commit matrix.
6. Close/supersede PR #11 after confirming all useful changes exist on PR #1; do not merge the older documentation branch into `main` separately.
7. Run/package Windows, macOS, Linux and execute every item in `docs/verification.md`.
8. Record measured release-build performance without invented values.
9. Capture real release screenshots with disposable credentials and no personal desktop data.
10. Enable `main` branch protection using proven successful check names.
11. Finalize CHANGELOG release date/notes only after the candidate is ready.
12. Merge PR #1, verify `main` push checks, tag the exact verified commit `v0.1.0`, inspect draft release artifacts, and publish only after final artifact verification.

## Migration / persistent preference notes

No credential database exists and no secret-data migration is needed.

Current non-secret preference schema:

- `keysmith.clipboardClearSeconds` — allowed `0`, `15`, `30`, `60`, `120`; malformed/unsupported values fall back to 30.
- `keysmith.theme` — `system`, `light`, `dark`; invalid/missing falls back safely.
- `keysmith.onboardingComplete` — completed first-run introduction flag.

Future preference changes must preserve safe fallback and must never become generated-secret history.

## Release notes draft — 0.1.0

KeySmith 0.1.0 is an offline-first desktop password/passphrase generator built with Rust/Tauri/TypeScript. It uses OS cryptographic randomness, unbiased bounded selection, secure shuffle, strict Rust policy validation, deduplicated ASCII-punctuation custom symbols, EFF large Diceware passphrases, zxcvbn strength estimates, presets, optimized secret-only batch generation, a bounded native plaintext save flow, a replaceable conditional clipboard clear worker, exact native/frontend external-link allowlists, no global Tauri bridge, restrictive capabilities/CSP, English-first localization, accessible responsive UI, safe diagnostic redaction, comprehensive automated security/integration/configuration/accessibility tests, dependency/security automation, and CI-enforced complete file-by-file documentation.

It does not include an account, telemetry, cloud sync, remote generation service, credential vault/history, generic filesystem permission, or arbitrary external URL permission.

Stable release remains blocked on exact-head green automation, committed verified lockfiles, packaged cross-platform verification, real screenshots, governance, and final artifact/signing-status review.
