# Release verification

This page defines the evidence required before KeySmith is called stable or a release tag is published.

## Automated quality gates

Run the following commands from a clean checkout with current stable Rust and Node.js 22:

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
cargo generate-lockfile
cargo deny check
```

The GitHub Actions CI workflow is the authoritative clean-environment check for these gates and runs the Tauri crate check on Ubuntu, Windows, and macOS.

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
7. Exercise batch generation at normal and boundary sizes.
8. Export a batch and confirm the plaintext warning/header.
9. Copy a secret, exercise each auto-clear duration, and exercise clear-now.
10. Change theme and privacy preferences, relaunch, and confirm only non-secret preferences persist.
11. Navigate the whole UI with the keyboard, check visible focus, labels, status announcements, and reduced-motion behavior.
12. Verify About, support, repository, license, and funding links.

## Release evidence

Record the release-candidate commit SHA, CI run, CodeQL result, packaged-app smoke-test result, and screenshots in `what_changed.md` before tagging the release. Do not claim a check passed without direct evidence from that commit.
