# Security Policy

## Supported versions

Until the first stable release, security fixes target the latest `main` branch and newest published prerelease. After 1.0, the current major release will receive security fixes according to the published support policy.

## Reporting a vulnerability

Do not open a public issue for vulnerabilities that could expose generated secrets, weaken randomness, bypass Tauri permissions, escape native export/link scopes, or leak/erase clipboard contents unexpectedly.

Email `supportramsandesh@gmail.com` with:

- affected version or commit,
- operating system and packaging format when relevant,
- minimal reproduction steps using fictional values,
- security/privacy impact,
- suggested mitigation if known.

Do not include real passwords, tokens, private keys, exported production credentials, private filesystem paths, or personal data. Use fictional test values only.

## Security principles

- Use the operating-system CSPRNG; do not implement custom cryptographic primitives.
- Use rejection sampling for bounded random selection and deduplicate candidate sets before sampling.
- Validate security-sensitive frontend input in Rust; HTML constraints are usability aids, not security boundaries.
- Do not log, persist, transmit, or create history for generated secrets.
- Keep the production webview local and the CSP restrictive.
- Keep the global Tauri bridge disabled and use the bundled module API.
- Do not grant `core:default`; use narrow explicitly enabled capabilities.
- Strip unused commands from production builds.
- Keep clipboard payload/duration limits in Rust, use one replaceable/cancellable clear schedule, and clear only when the clipboard still equals the copied value.
- Keep batch export explicit plaintext with a warning, bounded Rust validation, native user-selected destination, and no generic frontend filesystem-write permission.
- Keep external navigation limited to documented destinations through matching frontend and native opener scopes.
- Zeroize application-owned clipboard/export buffers where practical; do not claim this erases copies already handed to the operating system.
- Guard asynchronous UI results so stale operations cannot overwrite a newer mode/state.
- Review dependencies with npm audit, cargo-deny, Dependabot, CodeQL, and normal code review.
- Keep desktop adapter code under cross-platform compile and Clippy gates.

## Security regression expectations

A security/privacy defect should gain a regression test before the fix is considered complete. Depending on the defect, use:

- Rust unit/property tests for randomness/policy/input validation,
- Rust adapter tests for clipboard/export state machines and bounds,
- TypeScript unit tests for IPC/storage/allowlist behavior,
- static configuration tests for Tauri capabilities/CSP/version drift,
- real-markup integration tests for UI data flow,
- packaged-app verification for clipboard, native dialog, external handler, webview, and installer behavior.

Do not represent a jsdom/unit test as proof of native operating-system behavior.

## Release security gate

Security-sensitive releases require a green same-commit CI/CodeQL run, verified lockfiles, packaged verification on Windows/macOS/Linux, and accurate release evidence. The tag workflow performs its own tag/version and frontend/core preflight before building draft artifacts.

Signing/notarization credentials must remain outside source control and use protected platform/CI mechanisms.

See `THREAT_MODEL.md` for assets, trust boundaries, abuse cases, mitigations, and residual risk, and `docs/adr/0004-native-desktop-boundaries.md` for the current native-boundary decision.
