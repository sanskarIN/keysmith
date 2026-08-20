# Testing Strategy

## Rust core

`cargo test -p keysmith-core --all-features --locked` covers required-character-class guarantees, ambiguity exclusion, custom-symbol validation and deduplication, batch limits, passphrase word count and entropy modeling, and property tests across password lengths and restricted character sets.

The custom-symbol regression coverage verifies that:

- alphanumeric values cannot masquerade as the symbol class,
- inputs longer than 40 characters are rejected by the backend,
- duplicates do not create duplicate entries in the symbol set,
- explicit ambiguity exclusion also applies to custom symbols,
- stale custom-symbol text is ignored when the symbol class is disabled.

The passphrase regression coverage verifies:

- the requested word count,
- the exact 8,192-entry table size,
- uniqueness of all 8,192 entries so duplicate words cannot silently reduce the effective selection space,
- the entropy calculation of 13 bits per uniformly sampled word before optional suffix entropy.

## Desktop adapter

`cargo test -p keysmith --lib --locked` covers pure desktop-adapter policy helpers that do not require a live clipboard. The current suite verifies:

- only the documented clipboard auto-clear durations (`0`, `15`, `30`, `60`, and `120` seconds) are accepted by IPC-side validation,
- the exact largest valid batch copy (`500 × 128` password characters plus `499` newline separators = `64,499` characters) is accepted,
- a clipboard payload one character beyond that batch-derived maximum is rejected.

The clipboard-size boundary is derived from `keysmith-core`'s exported `MAX_PASSWORD_LENGTH` and `MAX_BATCH_SIZE` constants so generator policy and desktop IPC policy cannot silently drift apart.

Clipboard integration itself still requires manual platform smoke testing because it depends on the operating-system clipboard service.

## Frontend

`npm test` runs Vitest coverage for non-secret preference helpers, including clipboard duration persistence, safe fallback behavior, theme persistence, and onboarding state. CI installs frontend dependencies with `npm ci` so the tests use the committed `package-lock.json` graph.

## Static, dependency, and release-consistency checks

- `cargo fmt --all -- --check`
- `cargo clippy -p keysmith-core --all-targets --all-features --locked -- -D warnings`
- `cargo test -p keysmith-core --all-features --locked`
- `cargo check -p keysmith --all-targets --locked`
- `cargo clippy -p keysmith --all-targets --locked -- -D warnings`
- `cargo test -p keysmith --lib --locked`
- `cargo metadata --locked --format-version 1 > /dev/null`
- `cargo deny check`
- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run version:check`
- `npm test`
- `npm run build`

`cargo metadata --locked` rejects manifest changes that were not accompanied by a current Cargo lockfile. `cargo deny check` enforces the repository's advisory, source, duplicate-version warning, wildcard, and license policies.

`npm run version:check` verifies that `package.json`, the Rust workspace version in `Cargo.toml`, `src-tauri/tauri.conf.json`, and every semantic version displayed in `index.html` agree. The release workflow additionally supplies the Git tag through `KEYSMITH_EXPECTED_VERSION`, preventing a `vX.Y.Z` tag from publishing artifacts for a different manifest version.

## UI and manual release checks

Manual release checks cover keyboard navigation, reduced motion, focus order, mode switching, generation, invalid-policy feedback, single-secret copy, maximum-size batch copy, conditional clipboard clear, clear-now behavior, batch warnings/export, onboarding, settings, themes, and About links.

## Security regression rule

Every defect involving randomness, secret leakage, clipboard behavior, permission scope, export, dependency licensing, release integrity, or input validation must gain a regression test or an automated policy check before the fix is considered complete.

## Clean-build release gate

Release candidates must pass CI on Windows, macOS, and Linux from a clean checkout using the committed lockfiles and pinned Rust toolchain. A version bump alone is not evidence of a verified or stable release.
