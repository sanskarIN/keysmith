# Contributing to KeySmith

Thank you for improving KeySmith. Security and privacy are product requirements, not optional extras.

## Workflow

1. Open or reference an issue for substantial changes.
2. Create a focused branch from `main`.
3. Keep commits atomic and use Conventional Commits where practical.
4. Never add generated passwords, real credentials, tokens, private endpoints, private filesystem paths, or user data to fixtures or logs.
5. Add or update regression tests for behavior changes.
6. Run formatting, linting, type checking, security checks, Rust tests, frontend tests, and builds relevant to the change.
7. Update documentation and `CHANGELOG.md` when behavior changes.
8. Do not merge a known failing required check.

## Local quality gate

```bash
npm install
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

Run cargo-deny and CodeQL through repository automation before merging release-sensitive dependency or security changes. CI runs the desktop check/Clippy pair on Linux, Windows, and macOS.

## Security-sensitive changes

Changes to randomness, password/passphrase policy, IPC, Tauri capabilities, clipboard behavior, CSP, batch export, external links, dependency policy, structured diagnostics, asynchronous state handling, or secret handling require targeted regression coverage and a `THREAT_MODEL.md` update when the trust model changes.

Do not implement custom cryptographic primitives.

Preserve these release-candidate boundaries unless a reviewed ADR changes them:

- no global `window.__TAURI__` bridge,
- no `core:default` capability,
- only explicitly enabled capabilities,
- no generic frontend filesystem-write permission,
- exact allowlisting for external About/contact links,
- one replaceable/cancellable clipboard auto-clear schedule,
- Rust validation for every security-sensitive IPC input,
- deterministic plaintext-export warning and bounded native export command.

## Tests and fixtures

Use obviously fictional deterministic strings for secret-shaped fixtures. Do not copy a real password, token, API key, email credential, or production secret into a test merely because it is convenient.

When a defect is security- or privacy-relevant, add a test that would have failed before the fix. Static configuration tests are appropriate for capability/CSP/version drift; native packaged verification remains required for behavior that jsdom or unit tests cannot reproduce truthfully.

## Documentation

Update the smallest relevant set of docs, then check for cross-document drift:

- architecture/trust-boundary change → `docs/architecture.md` and usually an ADR,
- security-impacting change → `THREAT_MODEL.md` and possibly `SECURITY.md`,
- privacy/data-flow change → `PRIVACY.md`,
- user-visible behavior → `README.md`/`CHANGELOG.md`,
- release procedure/gate → `docs/release.md`, `docs/testing.md`, and `docs/verification.md`.

`what_changed.md` is the maintainer continuation/release-candidate ledger and should remain accurate during release work.

## Commit identity

Project-maintainer commits should use `sanskarin@outlook.in` when made from a local Git client configured by the maintainer. GitHub API-created commits may use the authenticated GitHub identity because the connector does not expose author-email override fields.
