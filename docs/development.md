# Development

## Commands

```bash
npm run dev          # frontend only
npm run tauri dev    # full desktop app
npm run typecheck
npm run lint
npm run format:check
npm run version:check
npm test
npm run build

cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
cargo clippy -p keysmith --all-targets -- -D warnings
cargo test -p keysmith --lib
```

## Rules

- Keep security-sensitive generation and policy logic in `keysmith-core`.
- Treat the TypeScript/webview-to-Tauri IPC boundary as untrusted input; UI constraints must be mirrored by Rust validation when they protect correctness, memory usage, secret handling, or policy meaning.
- Do not log or intentionally persist generated secrets.
- Use best-effort zeroization for owned secret buffers where practical, including error paths.
- Add typed validation at trust boundaries.
- Prefer pure functions and explicit state.
- Keep UI strings externalizable.
- Add a regression test for security, clipboard, export, release-integrity, or validation defects.
- Update an ADR when changing foundational architecture/security decisions.
- Update `what_changed.md` with exact paths, verification evidence, limitations, and the next unfinished tasks before handing work off.

## Adding a generator option

1. Add the typed field in `crates/keysmith-core/src/policy.rs`.
2. Validate and implement it in the Rust core rather than relying only on HTML controls.
3. Add unit/property coverage for valid, invalid, boundary, and ambiguity-sensitive behavior.
4. Expose it through the existing narrow Tauri command types.
5. Add an accessible UI control and actionable validation message.
6. Update security/privacy/threat-model documentation if the data flow or trust boundary changes.

## Changing the application version

A release version is intentionally duplicated only in the files required by the relevant ecosystems and visible UI. Update all of these together:

- `package.json`
- `Cargo.toml` under `[workspace.package]`
- `src-tauri/tauri.conf.json`
- visible semantic-version labels in `index.html`
- `CHANGELOG.md`
- release/handoff documentation as applicable

Then run:

```bash
npm run version:check
```

For a release candidate that will become `vX.Y.Z`, also validate the prospective tag by setting `KEYSMITH_EXPECTED_VERSION=vX.Y.Z` before running `npm run version:check`. The release workflow performs the same tag-to-manifest check automatically.
