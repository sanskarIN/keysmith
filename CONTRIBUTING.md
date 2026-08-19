# Contributing to KeySmith

Thank you for improving KeySmith. Security and privacy are product requirements, not optional extras.

## Workflow

1. Open or reference an issue for substantial changes.
2. Create a focused branch from `main`.
3. Keep commits atomic and use Conventional Commits where practical.
4. Never add generated passwords, real credentials, tokens, private endpoints, or user data to fixtures or logs.
5. Add or update tests for behavior changes.
6. Run formatting, linting, type checking, security checks, Rust tests, frontend tests, and builds relevant to the change.
7. Update documentation and `CHANGELOG.md` when behavior changes.

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
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo check -p keysmith --all-targets
```

Run cargo-deny and CodeQL through the repository automation before merging release-sensitive dependency or security changes.

## Security changes

Changes to randomness, IPC, clipboard behavior, CSP, export behavior, dependency policy, structured diagnostics, or secret handling require tests and an update to `THREAT_MODEL.md` when the trust model changes. Do not implement custom cryptographic primitives.

## Commit identity

Project-maintainer commits should use `sanskarin@outlook.in` when made from a local Git client configured by the maintainer. GitHub API-created commits may use the authenticated GitHub identity because the connector does not expose author-email override fields.
