# Development

## Toolchain and dependency baseline

The v2.7.4 release-candidate workspace pins Rust `1.97.1` in `rust-toolchain.toml`. Use the committed `package-lock.json` and `Cargo.lock` rather than resolving fresh dependency graphs during routine development or verification.

```bash
npm ci
cargo metadata --locked --format-version 1 > /dev/null
```

If a dependency is intentionally changed, regenerate the appropriate lockfile in a reviewed change and verify the resulting diff before merging.

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
cargo clippy -p keysmith-core --all-targets --all-features --locked -- -D warnings
cargo test -p keysmith-core --all-features --locked
cargo check -p keysmith --all-targets --locked
cargo clippy -p keysmith --all-targets --locked -- -D warnings
cargo test -p keysmith --lib --locked
```

## Rules

- Keep security-sensitive generation and policy logic in `keysmith-core`.
- Treat the TypeScript/webview-to-Tauri IPC boundary as untrusted input; UI constraints must be mirrored by Rust validation when they protect correctness, memory usage, secret handling, or policy meaning.
- Do not log or intentionally persist generated secrets.
- Use best-effort zeroization for owned secret buffers where practical, including error paths.
- Add typed validation at trust boundaries.
- Prefer pure functions and explicit state.
- Keep UI strings externalizable.
- Add a regression test for security, clipboard, export, release-integrity, dependency-policy, or validation defects.
- Keep new dependency licenses inside the allowlist in `deny.toml`; do not suppress a license failure without documenting why the dependency is compatible with the project license.
- Update an ADR when changing foundational architecture/security decisions.
- Update `what_changed.md` with exact paths, verification evidence, limitations, and the next unfinished tasks before handing work off.

## Adding a generator option

1. Add the typed field in `crates/keysmith-core/src/policy.rs`.
2. Validate and implement it in the Rust core rather than relying only on HTML controls.
3. Add unit/property coverage for valid, invalid, boundary, and ambiguity-sensitive behavior.
4. Expose it through the existing narrow Tauri command types.
5. Add an accessible UI control and actionable validation message.
6. Update security/privacy/threat-model documentation if the data flow or trust boundary changes.

## Changing dependencies

1. Prefer maintained dependencies with explicit SPDX-compatible licensing and minimal transitive surface.
2. Update the relevant manifest.
3. Regenerate the lockfile and review all newly introduced or removed packages.
4. Run `cargo deny check` for Rust changes and the complete CI matrix for release-candidate changes.
5. Update `NOTICE` and focused documentation when attribution or licensing changes.

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
