# Development

## Commands

```bash
npm run dev          # frontend only
npm run tauri dev    # full desktop app
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build

cargo fmt --all -- --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
```

## Rules

- Keep security-sensitive logic in `keysmith-core`.
- Do not log or persist generated secrets.
- Add typed validation at trust boundaries.
- Prefer pure functions and explicit state.
- Keep UI strings externalizable.
- Update an ADR when changing foundational architecture/security decisions.

## Adding a generator option

1. Add the typed field in `policy.rs`.
2. Validate and implement it in the core.
3. Add unit/property coverage.
4. Expose it through the existing command types.
5. Add an accessible control and validation message in the UI.
6. Update security/privacy docs if the data flow changes.
