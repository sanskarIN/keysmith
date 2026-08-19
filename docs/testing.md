# Testing Strategy

KeySmith testing is layered so security-sensitive invariants can be verified independently from the desktop UI while platform-specific behavior is still exercised before release. No single check is sufficient to declare a release candidate stable.

## Test principles

1. Test credential-generation invariants in the framework-independent Rust core.
2. Treat HTML constraints as UX, not validation coverage.
3. Add regression tests for every behavior/security defect when practical.
4. Keep generated test values ephemeral; never copy real credentials into snapshots, logs, docs, or issues.
5. Use hosted Windows, macOS, and Linux checks for desktop compatibility.
6. Reserve manual testing for behavior that genuinely depends on a native webview/clipboard/accessibility environment.
7. Do not claim a check passed unless its result was observed for the release-candidate commit.

## Rust core automated tests

### Security behavior tests

`crates/keysmith-core/tests/security.rs` verifies behavioral guarantees that are easy to understand as explicit cases. Current coverage includes:

- a default generated password contains at least one lowercase, uppercase, digit, and symbol;
- ambiguity exclusion removes the configured ambiguous character set across repeated generation;
- batch generation rejects counts outside 1–500;
- default passphrases contain the requested number of words.

This file is the preferred home for new deterministic regression cases involving validation, policy enforcement, passphrase behavior, or known security bugs.

### Property tests

`crates/keysmith-core/tests/properties.rs` uses `proptest` to exercise broader input spaces. Current properties verify:

- generated password character count exactly matches every supported requested length from 4 through 128;
- digits-only policies produce only ASCII digits across generated lengths.

Property tests are especially valuable when an invariant should hold for a large range of policies rather than a single example.

### Core command set

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
```

`cargo fmt` and Clippy are quality gates rather than tests, but they are part of the same merge/release requirement.

## Frontend automated tests

`src/storage.test.ts` uses Vitest with the jsdom environment. It currently verifies:

- the privacy-oriented 30-second default for clipboard auto-clear;
- round-trip persistence of a supported clipboard duration;
- fallback to 30 seconds when stored clipboard duration is unsupported/corrupt;
- round-trip theme persistence;
- onboarding completion persists only its expected non-secret flag in the test scenario.

Run:

```bash
npm test
```

Pure frontend behavior should be extracted into testable functions rather than forcing large DOM integration tests into `src/main.ts` when possible.

## Frontend static/build gates

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

### `npm run typecheck`

Runs strict TypeScript checking with no emitted JavaScript. This catches IPC shape drift, unsafe indexed access, incorrect DOM typing, and other compile-time issues.

### `npm run lint`

Runs type-aware ESLint. The configuration explicitly rejects floating promises so async command failures are not silently abandoned.

### `npm run format:check`

Runs `scripts/check-format.mjs`, which verifies repository text hygiene:

- LF-only line endings;
- final newline;
- no trailing whitespace.

Rust formatting is separately enforced by `cargo fmt`.

### `npm run build`

Runs TypeScript checking and creates the production Vite frontend bundle. A successful frontend build does not prove that the Tauri desktop adapter or native clipboard integration works.

## Desktop compile checks

The desktop crate must compile-check on every supported release platform:

```bash
cargo check -p keysmith --all-targets
```

Hosted CI runs this on:

- Ubuntu 22.04 with Tauri Linux system dependencies;
- Windows latest;
- macOS latest.

Linux jobs install WebKitGTK 4.1 development files, AppIndicator development files, librsvg, and patchelf before checking the Tauri crate.

The focused `.github/workflows/rust.yml` deliberately builds/tests only `keysmith-core`; the main `ci.yml` desktop matrix is the authoritative cross-platform Tauri compile gate.

## Dependency-policy tests

The `Rust dependency policy` CI job generates a dependency lock resolution as needed and runs cargo-deny against `deny.toml`.

The policy checks:

- yanked dependency handling;
- license allowlist confidence;
- wildcard dependency rejection;
- unknown registry rejection;
- unknown Git source rejection;
- duplicate dependency versions as warnings.

Do not make this check pass by blindly broadening the license/source policy. Investigate the dependency first.

## CodeQL security analysis

`.github/workflows/codeql.yml` analyzes:

- JavaScript/TypeScript;
- Rust.

It runs on pushes to `main`, pull requests, and a weekly schedule. Rust analysis installs the same Linux desktop prerequisites needed for the Tauri workspace autobuild.

A clean unit-test suite does not replace CodeQL, and a clean CodeQL result does not replace behavioral testing.

## Manual desktop smoke test

A release candidate must be launched as a desktop application, preferably from the same packaged artifacts intended for release.

### Launch and onboarding

- application starts without a console/error dialog;
- first launch shows onboarding when the non-secret completion flag is absent;
- **Start generating** closes onboarding and records completion;
- onboarding does not reappear after a normal relaunch;
- **Settings → Show introduction** reopens it.

### Password mode

Test at minimum:

- default policy generates successfully;
- minimum length 4;
- maximum length 128;
- each character-set toggle affects output as intended;
- no enabled character sets produces a safe user-visible error;
- custom symbols replace the built-in symbol source when Symbols is enabled;
- ambiguity exclusion removes known ambiguous characters;
- all four presets load and apply expected controls;
- strength label/score update after generation.

### Passphrase mode

Test:

- 3-word minimum;
- 12-word maximum;
- default `-` separator;
- empty separator;
- a valid 3-character separator;
- capitalization option;
- two-digit suffix option;
- invalid options are rejected safely if forced past UI constraints;
- selection-space entropy status is shown after success.

### Batch mode

Test:

- count 1;
- a typical count such as 10;
- count 500 when practical;
- invalid counts are rejected if forced;
- Copy all copies newline-separated values;
- Export creates a `.txt` file with title, timestamp, plaintext warning, and one password per line;
- export warning remains visible before/after the dangerous action;
- switching mode clears the visible/in-memory current batch state.

### Clipboard

Test each setting:

- Never;
- 15 seconds;
- 30 seconds;
- 60 seconds;
- 120 seconds.

For an enabled delay:

1. generate and copy a value;
2. confirm the clipboard initially contains it;
3. wait through the configured delay;
4. confirm it clears when unchanged.

Then repeat but copy unrelated text before the delay expires. Confirm KeySmith does **not** erase the newer clipboard contents.

Also verify **Clear clipboard now** from both the main privacy card and Settings.

Do not paste test credentials into persistent notes or issue descriptions. Synthetic generated values used during smoke testing should be discarded.

### Theme/settings

- System theme resolves correctly;
- Light and Dark selections persist;
- top-bar cycle order is System → Light → Dark → System;
- System mode responds to an OS color-scheme change where the platform supports live updates;
- clipboard duration persists;
- settings remain usable if local storage is unavailable (where testable).

### About/project links

Verify the About dialog displays:

- KeySmith name;
- version;
- Apache-2.0;
- Made by the Sanskar credit;
- GitHub link;
- Buy Me a Coffee link;
- support/business mail links.

External links should activate only after a user action.

## Accessibility manual test

Use keyboard-only navigation for the complete application:

- Tab/Shift+Tab through top actions and controls;
- activate Password/Passphrase/Batch tabs;
- use Left/Right Arrow within the tab list;
- verify focus remains visible;
- activate generator, copy, export, settings, onboarding, and dialog close controls;
- verify no keyboard trap in dialogs;
- verify the skip link reaches the generator;
- verify live status/output changes are announced by at least one target screen reader when possible;
- verify reduced-motion preference;
- zoom/scaling and narrow-window behavior;
- confirm status meaning is not color-only.

See [`accessibility.md`](accessibility.md) for the maintained accessibility checklist.

## Security regression rule

Every defect involving any of the following should gain an automated regression test at the responsible layer before the fix is considered complete, unless the behavior is inherently platform/manual-only and that exception is documented:

- random selection or shuffle bias;
- required character-set guarantees;
- passphrase selection/entropy logic;
- input validation;
- secret persistence/logging;
- clipboard conditional clearing;
- permission/capability scope;
- plaintext export behavior;
- CSP/runtime privilege changes;
- unsafe preference persistence;
- IPC type/command mapping.

## Release packaging verification

`npm run tauri build` must succeed on each release platform or through the tag-triggered release workflow.

Packaging checks must distinguish:

- compile/build success;
- artifact creation;
- installation/launch success;
- functional smoke success;
- signing/notarization status.

Unsigned artifacts must never be described as signed.

## Clean-build release gate

A stable release candidate should be verified from a clean checkout/resolution, not only from a long-lived developer working tree.

Required same-commit evidence includes:

1. frontend typecheck;
2. frontend lint;
3. text hygiene;
4. frontend tests;
5. frontend production build;
6. Rust formatting;
7. strict core Clippy;
8. Rust core tests;
9. Tauri check on Linux;
10. Tauri check on Windows;
11. Tauri check on macOS;
12. cargo-deny policy;
13. CodeQL JavaScript/TypeScript;
14. CodeQL Rust;
15. platform release builds;
16. native smoke tests;
17. manual accessibility review.

Record observed results and remaining limitations in `what_changed.md` before tagging.

## What must not be claimed without evidence

Do not write any of the following merely because the workflow is configured:

- "all tests pass" without an observed run;
- "cross-platform verified" without all target platform checks;
- "signed" without signing evidence;
- "accessible" based only on semantic source review;
- "no vulnerabilities" based only on CodeQL;
- "secure clipboard" as an absolute guarantee—the OS/other processes remain outside KeySmith's control.
