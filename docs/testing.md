# Testing Strategy

## Rust core

`cargo test -p keysmith-core --all-features` covers required-character-class guarantees, ambiguity exclusion, custom-symbol validation and deduplication, batch limits, passphrase word count, and property tests across password lengths and restricted character sets.

The custom-symbol regression coverage verifies that:

- alphanumeric values cannot masquerade as the symbol class,
- inputs longer than 40 characters are rejected by the backend,
- duplicates do not create duplicate entries in the symbol set,
- explicit ambiguity exclusion also applies to custom symbols,
- stale custom-symbol text is ignored when the symbol class is disabled.

## Desktop adapter

`cargo test -p keysmith --lib` covers pure desktop-adapter policy helpers that do not require a live clipboard. The current suite verifies that only the documented clipboard auto-clear durations (`0`, `15`, `30`, `60`, and `120` seconds) are accepted by IPC-side validation.

Clipboard integration itself still requires manual platform smoke testing because it depends on the operating-system clipboard service.

## Frontend

`npm test` runs Vitest coverage for non-secret preference helpers, including clipboard duration persistence, safe fallback behavior, theme persistence, and onboarding state.

## Static and release-consistency checks

- `cargo fmt --all -- --check`
- `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
- `cargo check -p keysmith --all-targets`
- `cargo clippy -p keysmith --all-targets -- -D warnings`
- `cargo test -p keysmith --lib`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run version:check`
- `npm test`
- `npm run build`

`npm run version:check` verifies that `package.json`, the Rust workspace version in `Cargo.toml`, `src-tauri/tauri.conf.json`, and every semantic version displayed in `index.html` agree. The release workflow additionally supplies the Git tag through `KEYSMITH_EXPECTED_VERSION`, preventing a `vX.Y.Z` tag from publishing artifacts for a different manifest version.

## UI and manual release checks

Manual release checks cover keyboard navigation, reduced motion, focus order, mode switching, generation, invalid-policy feedback, copy, conditional clipboard clear, clear-now behavior, batch warnings/export, onboarding, settings, themes, and About links.

## Security regression rule

Every defect involving randomness, secret leakage, clipboard behavior, permission scope, export, release integrity, or input validation must gain a regression test before the fix is considered complete.

## Clean-build release gate

Release candidates must pass CI on Windows, macOS, and Linux from a clean checkout. A version bump alone is not evidence of a verified or stable release.
