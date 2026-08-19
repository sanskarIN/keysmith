# Development

## Dependency setup

For a clean checkout, install the dependency graph recorded by the tracked lockfiles:

```bash
npm ci
cargo metadata --locked --format-version 1 --no-deps > /dev/null
```

Use manifest-changing install/update commands only when intentionally updating dependencies, and commit the corresponding lockfile changes with the manifest change.

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
cargo clippy --locked -p keysmith-core --all-targets --all-features -- -D warnings
cargo test --locked -p keysmith-core --all-features
cargo check --locked -p keysmith --all-targets
cargo test --locked -p keysmith --lib
```

## Rules

- Keep security-sensitive logic in `keysmith-core`.
- Do not log or persist generated secrets.
- Add typed validation at trust boundaries.
- Prefer pure functions and explicit state.
- Keep UI strings externalizable.
- Keep `package-lock.json` and `Cargo.lock` synchronized with dependency manifests.
- Update an ADR when changing foundational architecture/security decisions.
- Add a regression test for security, persistence, clipboard, export, validation, or randomness defects.

## Adding a generator option

1. Add the typed field in `policy.rs`.
2. Validate and implement it in the core.
3. Add unit/property coverage.
4. Expose it through the existing command types.
5. Add an accessible control and validation message in the UI.
6. Update security/privacy docs if the data flow changes.
7. Run the relevant locked quality gates from `docs/verification.md`.
