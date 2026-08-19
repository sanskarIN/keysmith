# Testing Strategy

## Rust core

`cargo test -p keysmith-core --all-features` covers required character-class guarantees, ambiguity exclusion, batch limits, passphrase word counts, invalid length/word/separator policies, custom symbol handling, and property tests across password lengths and restricted character sets.

Rust desktop-adapter unit tests also cover clipboard payload limits without requiring access to a real system clipboard.

## Frontend and IPC

Vitest covers:

- non-secret preference persistence, write normalization, and safe defaults,
- first-run onboarding state,
- typed Tauri command names and payloads,
- fail-closed behavior when the desktop bridge is unavailable,
- deterministic batch-export formatting,
- structured diagnostic redaction and recursion limits,
- localization application and fallback behavior,
- localized preset and strength metadata,
- a jsdom integration journey that loads the real `index.html`, mocks the narrow Tauri bridge, generates a password, copies it with the configured auto-clear value, and exercises keyboard tab switching.

The integration test intentionally uses fictional deterministic test output; it does not generate or commit a real credential.

## Static and security checks

- `cargo fmt --all -- --check`
- `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
- `cargo test -p keysmith-core --all-features`
- `cargo check -p keysmith --all-targets`
- `npm audit --audit-level=high`
- `npm run secret:check`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm test`
- `npm run build`
- cargo-deny advisory/license/source policy
- CodeQL for Rust and JavaScript/TypeScript

## Manual application verification

The release-candidate checklist in `docs/verification.md` covers keyboard navigation, reduced motion, focus order, mode switching, generation, passphrases, presets, batch export warnings, copy, conditional clipboard clear, themes, onboarding, Settings, About links, text scaling, and unexpected network behavior.

Real packaged-app checks remain manual because clipboard behavior, native webviews, platform dialogs, installers, and operating-system integration cannot be truthfully validated by the jsdom frontend integration test.

## Security regression rule

Every defect involving randomness, secret leakage, clipboard behavior, permission scope, export, dependency policy, or input validation must gain a regression test before the fix is considered complete.

## Clean-build release gate

Release candidates must pass CI on Windows, macOS, and Linux from a clean checkout. A release tag must not be created while any required automated or packaged-application verification remains unresolved.
