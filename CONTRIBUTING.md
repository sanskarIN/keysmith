# Contributing to KeySmith

Thank you for improving KeySmith. Security, privacy, accessibility, and release integrity are product requirements, not optional extras.

## Workflow

1. Open or reference an issue for substantial changes.
2. Create a focused branch from `main`.
3. Keep commits atomic and use Conventional Commits where practical.
4. Never add generated passwords, real credentials, tokens, private endpoints, signing material, or user data to fixtures, logs, screenshots, or documentation.
5. Treat the webview/Tauri IPC boundary as untrusted input. UI limits that protect security, policy meaning, memory use, or secret handling must also be validated in Rust.
6. Add or update regression tests for behavior changes, especially randomness, validation, IPC, clipboard, export, permission, persistence, or release-integrity changes.
7. Run the complete quality gate relevant to the change.
8. Update documentation, `CHANGELOG.md`, and `what_changed.md` when behavior, release state, trust boundaries, or verification requirements change.

## Local quality gate

```bash
npm install
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

Also run cargo-deny when dependency metadata changes or before a release candidate is considered verified.

## Release/version changes

When changing the application version, keep these surfaces synchronized:

- `package.json`
- `[workspace.package].version` in `Cargo.toml`
- `src-tauri/tauri.conf.json`
- visible version labels in `index.html`
- `CHANGELOG.md`
- release/handoff documentation where applicable

Run `npm run version:check` before opening the pull request. Release tags are checked against the same metadata by the release workflow.

## Security changes

Changes to randomness, policy validation, IPC, permissions, clipboard behavior, CSP, export behavior, persistence, release integrity, or secret handling require regression tests and an update to `THREAT_MODEL.md` when the trust model changes. Do not implement custom cryptographic primitives.

Best-effort zeroization should be used for owned Rust secret buffers where practical, but documentation and reviews must not claim that JavaScript strings, operating-system clipboard implementations, or general process memory can be completely erased on demand.

## Pull requests

A pull request should remain focused and should explain:

- what changed and why,
- security/privacy/accessibility impact,
- exact automated checks run,
- manual checks performed where operating-system integration is involved,
- any verification that remains outstanding.

Do not describe a release candidate as stable merely because its branch is mergeable or its version number has been updated. Stable release claims require the complete release gate in `docs/release.md`.

## Commit identity

Project-maintainer commits should use `sanskarin@outlook.in` when made from a local Git client configured by the maintainer. GitHub API-created commits may use the authenticated GitHub identity because the connector does not expose author-email override fields.
