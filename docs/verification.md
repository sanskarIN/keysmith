# Release Candidate Verification

Use this checklist on the exact commit proposed for release. Record failures and their fixing commits in `what_changed.md` rather than deleting evidence of a failed check.

## Automated quality gate

- [ ] Frontend typecheck
- [ ] Frontend lint
- [ ] Repository text-hygiene check
- [ ] Frontend unit tests
- [ ] Frontend production build
- [ ] Rust formatting
- [ ] Rust core Clippy with warnings denied
- [ ] Rust core tests and property tests
- [ ] Tauri cargo check on Linux
- [ ] Tauri cargo check on Windows
- [ ] Tauri cargo check on macOS
- [ ] Cargo dependency/advisory/license policy
- [ ] CodeQL JavaScript/TypeScript analysis
- [ ] CodeQL Rust analysis

## Packaged application smoke test

On every supported primary platform:

- [ ] Fresh launch succeeds.
- [ ] First-run onboarding opens once and can be revisited from Settings.
- [ ] Default password generation works.
- [ ] Every enabled character class is represented.
- [ ] Passphrase generation works with the packaged EFF list.
- [ ] Strength output updates after generation.
- [ ] Presets apply correctly.
- [ ] Batch generation enforces limits and displays the export warning.
- [ ] Clipboard copy works.
- [ ] Conditional clipboard auto-clear does not erase a newer unrelated clipboard value.
- [ ] Manual clear works.
- [ ] Light, dark, and system themes work.
- [ ] Settings and About content/links are correct.
- [ ] Keyboard-only navigation and visible focus are usable.
- [ ] 200% text/display scaling remains usable.
- [ ] Reduced-motion preference is respected.
- [ ] No password history, telemetry, or unexpected network request is observed.

## Release evidence

- [ ] Real screenshots captured from the verified build.
- [ ] `CHANGELOG.md` release date finalized.
- [ ] `what_changed.md` updated with exact commands/results and release commit.
- [ ] Branch protection enabled using proven CI check names.
- [ ] Signed/notarized artifacts configured where release credentials are available.
- [ ] `v0.1.0` tag created only after all blocking checks pass.
