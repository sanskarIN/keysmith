# Release verification

This page defines the evidence required before KeySmith is called stable or a release tag is published.

## Automated quality gates

Run the following commands from a clean checkout with current stable Rust and Node.js 22. The tracked lockfiles are authoritative; verification must not silently resolve a different dependency graph.

```bash
npm ci
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
cargo metadata --locked --format-version 1 --no-deps > /dev/null
cargo deny check
```

The GitHub Actions CI workflow is the authoritative clean-environment check for these gates and runs the Tauri crate check on Ubuntu, Windows, and macOS. The Linux desktop job additionally runs the desktop-adapter library regression tests.

## Reproducibility gates

- `package-lock.json` is tracked and `npm ci` succeeds without modifying it.
- `Cargo.lock` is tracked and all Cargo quality/release commands use `--locked` where supported.
- Dependency-manifest changes must update the relevant lockfile in the same pull request.
- Release automation uses the same npm and Cargo lockfiles that passed pull-request CI.

## Security gates

- CodeQL succeeds for JavaScript/TypeScript and Rust.
- `cargo deny` reports no unreviewed advisories, disallowed licenses, or unapproved sources.
- No generated credential is written to application storage, logs, analytics, crash reporting, or network services.
- Clipboard auto-clear only erases a value when the clipboard still contains the value KeySmith copied.
- Plaintext export remains explicit and visibly warned.
- Tauri capabilities remain least-privilege and the CSP remains restrictive.

## Packaged application smoke test

Perform this checklist on release builds for Windows, macOS, and Linux:

1. Launch the packaged app from a fresh user profile.
2. Complete and reopen onboarding.
3. Generate passwords at minimum and maximum supported lengths.
4. Verify every enabled character class is represented when feasible and disabled classes are absent.
5. Verify ambiguous-character exclusion and each preset.
6. Generate passphrases across supported word counts and separators.
7. Exercise batch generation at normal and boundary sizes, including the visible shared password policy.
8. Copy the maximum supported batch and confirm it succeeds.
9. Export a batch and confirm the plaintext warning/header.
10. Copy a secret, exercise each supported auto-clear duration, and exercise clear-now.
11. Change theme and privacy preferences, relaunch, and confirm only non-secret preferences persist.
12. Navigate the whole UI with the keyboard, check visible focus, labels, status announcements, and reduced-motion behavior.
13. Verify About, support, repository, license, and funding links.

## Release evidence

Record the release-candidate commit SHA, CI run, CodeQL result, packaged-app smoke-test result, and screenshots in `what_changed.md` before tagging the release. Do not claim a check passed without direct evidence from that commit.
