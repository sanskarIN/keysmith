# Testing Strategy

## Rust core

Run:

```bash
cargo test -p keysmith-core --all-features
```

Coverage includes required character-class guarantees, ambiguous-character exclusion, batch limits, passphrase word count, invalid policy handling, and property tests across password lengths and restricted character sets.

## Desktop adapter

Run:

```bash
cargo test -p keysmith --lib
```

Desktop-adapter regression tests cover command-boundary rules that are not part of the framework-independent core, including the supported clipboard auto-clear durations and the clipboard payload ceiling required to copy the largest valid batch.

The CI Linux Tauri job runs these library tests after `cargo check -p keysmith --all-targets`. Windows and macOS run the Tauri compile check so platform-specific native integration remains part of the release gate.

## Frontend tests

Run:

```bash
npm test
```

Vitest/jsdom covers non-secret preference helpers, including the privacy-oriented clipboard default, valid setting persistence, invalid stored-value fallback, rejection of invalid setting writes, theme persistence, and onboarding completion state.

## Static checks

Run all applicable checks before a pull request:

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
npm run typecheck
npm run lint
npm run format:check
npm run build
```

`npm run format:check` is a deterministic repository text-hygiene gate: tracked text must use LF line endings, end with a newline, and contain no trailing whitespace.

## Manual UI and packaged-app checks

Automated tests do not replace desktop interaction testing. Release candidates must manually cover:

- keyboard navigation and visible focus,
- reduced motion and scalable text,
- tab/mode switching,
- password generation at boundary lengths,
- passphrase generation at boundary word counts,
- Batch mode using the visible password policy,
- normal and maximum supported batch generation,
- single-secret and full-batch copy,
- each supported conditional clipboard clear duration,
- explicit clear-now,
- plaintext export warnings and output,
- onboarding/settings/theme persistence,
- About/support/repository/funding links.

The complete packaged-app checklist and evidence requirements are in [`verification.md`](verification.md).

## Security regression rule

Every defect involving randomness, secret leakage, clipboard behavior, permission scope, export, input validation, or persistence must gain a regression test at the closest stable layer before the fix is considered complete.

## Clean-build release gate

Release candidates must pass the complete CI and CodeQL matrix on one commit, including Tauri checks on Windows, macOS, and Linux. A release is not called stable solely because source-level tests pass; the packaged applications must also complete the manual smoke-test checklist in `verification.md`.
