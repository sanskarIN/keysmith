# Development

## Commands

```bash
npm run dev          # frontend only
npm run tauri dev    # full desktop app
npm audit --audit-level=high
npm run secret:check
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build

cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
cargo clippy -p keysmith --all-targets -- -D warnings
```

Cargo dependency policy also runs through cargo-deny in CI. The desktop `cargo check` and Clippy commands are executed on Linux, Windows, and macOS in the repository workflow.

## Rules

- Keep password/passphrase policy, randomness, and validation logic in `keysmith-core`.
- Keep native OS integrations narrow and reviewable in `src-tauri`; do not move security-sensitive decisions into HTML constraints.
- Do not log or persist generated secrets.
- Add typed validation at every IPC trust boundary.
- Prefer pure functions and explicit state.
- Preserve the module-only Tauri frontend API; do not restore `window.__TAURI__` without a new security review/ADR.
- Do not add `core:default`, broad shell/fs/url permissions, or implicit capabilities merely for convenience.
- Keep external destinations synchronized across About markup, `src/external-links.ts`, and the Tauri opener scope; tests enforce this.
- Keep batch export behind the dedicated bounded Rust command. Do not expose a generic frontend filesystem write API unless a separately reviewed product requirement justifies it.
- Clipboard policy changes must preserve one replaceable/cancellable pending clear schedule and conditional value matching.
- Async UI operations that can outlive a mode change must verify current state before mutating mode-specific output.
- Put user-facing frontend copy in the locale catalog; follow `docs/i18n.md` for static attributes, runtime formatters, and fallbacks.
- Use structured diagnostic data only when needed and apply the policy in `docs/logging.md`.
- Update an ADR when changing foundational architecture/security decisions.

## Adding a generator option

1. Add the typed field in `crates/keysmith-core/src/policy.rs`.
2. Validate and implement it in the core.
3. Add unit/property coverage, including malformed IPC-equivalent values.
4. Expose it through the existing narrow command types.
5. Add an accessible control and localized validation/status copy in the UI.
6. Consider batch-path cost separately; do not add expensive per-item metadata that the Batch UI does not consume.
7. Update security/privacy/threat-model documentation if the data flow changes.

## Adding a native command

1. Explain why existing commands cannot safely satisfy the product operation.
2. Put the OS-specific adapter in `src-tauri`, keeping reusable domain rules outside Tauri where practical.
3. Bound and validate every frontend-controlled input in Rust.
4. Return user-safe errors without secret values or sensitive local paths.
5. Add the command to `generate_handler!`.
6. Create or extend the smallest custom permission needed for that command.
7. Add that permission to the explicitly enabled `main-capability` only if the current UI needs it.
8. Add tests for validation/permission/configuration drift.
9. Update `THREAT_MODEL.md`, `docs/architecture.md`, and an ADR when the trust boundary materially changes.
10. Verify the desktop crate with cross-platform `cargo check` and Clippy.

## Adding an external link

1. Add only an intentional fixed destination to the About/help markup.
2. Add the exact same URL to `src/external-links.ts`.
3. Add the exact same URL to `opener:allow-open-url` in `src-tauri/capabilities/default.json`.
4. Update localization if the visible label changes.
5. Keep `src/external-links.integration.test.ts` green; it detects drift between markup and native scope.

Do not replace the exact scope with a wildcard domain or generic URL opener unless a reviewed feature requires it.

## Changing batch export

- Preserve the deterministic warning-bearing text shape in `src/export.ts`.
- Keep the Rust export input bounded and shape-validated before the native save dialog opens.
- Do not weaken the plaintext warning.
- Do not add silent/default-path writes.
- Keep the command-owned export buffer zeroized where practical.
- Add Rust validation tests plus frontend IPC/integration tests for behavior changes.

## Adding user-facing copy

1. Add the English string to `src/i18n/en.ts`.
2. Use a `data-i18n*` attribute for static markup or the catalog/formatter from TypeScript for runtime text.
3. Add or update localization tests when a new helper or fallback path is introduced.
4. Keep stable backend identifiers separate from translated display text.
5. Review text expansion and accessible names before shipping another locale.

## Version changes

A release-version change must update the npm package, Cargo workspace, Tauri configuration, and visible UI metadata together. `src/version-consistency.test.ts` intentionally fails when these surfaces diverge. Update `CHANGELOG.md` and release documentation in the same release-preparation work.
