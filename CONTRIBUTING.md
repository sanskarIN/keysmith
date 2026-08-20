# Contributing to KeySmith

Thank you for improving KeySmith. Security, privacy, accessibility, cross-platform behavior, and release integrity are product requirements, not optional extras.

## Workflow

1. Open or reference an issue for substantial changes.
2. Create a focused branch from `main`.
3. Keep commits atomic and use Conventional Commits where practical.
4. Never add generated passwords, real credentials, tokens, private endpoints, signing material, or user data to fixtures, logs, screenshots, or documentation.
5. Treat the webview/Tauri IPC boundary as untrusted input. UI limits that protect security, policy meaning, memory use, or secret handling must also be validated in Rust.
6. Preserve the shared five-platform architecture. A dependency or API introduced for Windows/macOS/Linux must not silently break Android/iOS, and vice versa.
7. Add or update regression tests for behavior changes, especially randomness, validation, IPC, clipboard, export, permissions, persistence, mobile platform behavior, or release-integrity changes.
8. Run the complete quality gate relevant to the change.
9. Update documentation, `CHANGELOG.md`, and `what_changed.md` when behavior, platform support, release state, trust boundaries, or verification requirements change.

## Local quality gate

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm run version:check
npm run platform:check
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

## Platform-sensitive changes

When changing native integration, explicitly review all five targets:

- Windows,
- macOS,
- Linux,
- Android,
- iOS/iPadOS.

For plugin/native changes:

- prefer an official/current Tauri plugin that supports the required target set,
- keep capabilities least-privilege,
- update `scripts/check-platforms.mjs` for release-critical invariants,
- run or rely on the dedicated Android/iOS CI builds,
- document any behavior that still requires physical-device testing.

Generated Android Studio/Xcode files under `src-tauri/gen/` are not canonical source and should not be committed merely to make a mobile build appear complete.

## Release/version changes

When changing the application version, keep these surfaces synchronized:

- `package.json`
- `[workspace.package].version` in `Cargo.toml`
- `src-tauri/tauri.conf.json`
- visible version labels in `index.html`
- `CHANGELOG.md`
- release/handoff documentation where applicable

Run both:

```bash
npm run version:check
npm run platform:check
```

before opening the pull request. Release tags are checked against the same version metadata by the release workflow.

## Security changes

Changes to randomness, policy validation, IPC, permissions, clipboard behavior, CSP, export behavior, persistence, mobile development networking, release integrity, or secret handling require regression tests and an update to `THREAT_MODEL.md` when the trust model changes. Do not implement custom cryptographic primitives.

Best-effort zeroization should be used for owned Rust secret buffers where practical, but documentation and reviews must not claim that JavaScript strings, operating-system clipboard implementations, document providers, or general process memory can be completely erased on demand.

Batch export must continue to verify exact readback before reporting success. Do not remove that check without replacing it with an equally strong cross-platform integrity guarantee.

## Mobile contributions

Android changes should preserve SDK 24 as the documented minimum unless an intentional compatibility decision changes it. Release tooling should use a current NDK suitable for modern Android native-library requirements.

iOS changes must preserve the generated-project privacy-manifest preparation while the filesystem plugin requires the file-timestamp approved reason. If `src-tauri/gen/apple` is regenerated, `npm run ios:prepare` must be run before build/release verification.

Mobile UI changes must account for safe areas, touch targets, scrollable dialogs, and narrow phone layouts. Desktop keyboard/focus behavior must not regress while improving touch behavior.

## Pull requests

A pull request should remain focused and explain:

- what changed and why,
- security/privacy/accessibility/platform impact,
- exact automated checks run,
- Android/iOS build status when native integration is affected,
- manual checks performed where operating-system integration is involved,
- any verification that remains outstanding.

Do not describe a release candidate as fully cross-platform simply because all five targets are listed in configuration. The claim requires the complete release gate in `docs/release.md`.

## Commit identity

Project-maintainer commits should use `sanskarin@outlook.in` when made from a local Git client configured by the maintainer. GitHub API-created commits may use the authenticated GitHub identity because the connector does not expose author-email override fields.
