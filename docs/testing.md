# Testing Strategy

## Rust core

`cargo test --workspace --all-features` covers class guarantees, ambiguity exclusion, batch limits, passphrase word count, and property tests across password lengths and restricted character sets.

## Static checks

- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets --all-features -- -D warnings`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`

## UI

Vitest covers non-secret preference helpers and future pure UI utilities. Manual release checks cover keyboard navigation, reduced motion, focus order, mode switching, generation, copy, conditional clipboard clear, batch warnings, and About links.

## Security regression rule

Every defect involving randomness, secret leakage, clipboard behavior, permission scope, export, or input validation must gain a regression test before the fix is considered complete.

## Clean-build release gate

Release candidates must pass CI on Windows, macOS, and Linux from a clean checkout.
