# Release Candidate Verification

Use this checklist on the exact commit proposed for release. Record failures and fixing commits in `what_changed.md`. A superseded green run is not evidence for a newer candidate.

## Automated quality gate

- [ ] Frontend dependency resolution succeeds.
- [ ] `npm audit --audit-level=high` succeeds.
- [ ] Repository secret scan succeeds.
- [ ] Frontend typecheck succeeds.
- [ ] Frontend lint, including `scripts/`, succeeds.
- [ ] Repository text-hygiene check succeeds.
- [ ] Frontend/unit/integration/static security tests succeed.
- [ ] Frontend production build succeeds.
- [ ] Rust formatting succeeds.
- [ ] Rust core Clippy succeeds with warnings denied.
- [ ] Rust core tests and property tests succeed.
- [ ] Cargo dependency/advisory/license/source policy succeeds.
- [ ] Tauri cargo check succeeds on Linux.
- [ ] Tauri Clippy succeeds with warnings denied on Linux.
- [ ] Tauri cargo check succeeds on Windows.
- [ ] Tauri Clippy succeeds with warnings denied on Windows.
- [ ] Tauri cargo check succeeds on macOS.
- [ ] Tauri Clippy succeeds with warnings denied on macOS.
- [ ] CodeQL JavaScript/TypeScript analysis succeeds.
- [ ] CodeQL Rust analysis succeeds after complete workspace build.
- [ ] Verified `package-lock.json` and `Cargo.lock` are committed before stable release.
- [ ] Final automated gate is green on the exact commit used for packaged verification.

## Packaged application smoke test

Run on Windows, macOS, and Linux.

### Launch and onboarding

- [ ] Fresh launch succeeds.
- [ ] First-run onboarding opens once.
- [ ] Completing onboarding prevents an unintended second first-run dialog.
- [ ] Onboarding can be revisited from Settings.

### Password generation

- [ ] Default password generation works.
- [ ] Output length matches the selected length.
- [ ] Every enabled character class is represented.
- [ ] Disabling a character class prevents that class from being required.
- [ ] Ambiguous-character exclusion behaves as expected.
- [ ] Custom punctuation-only symbols work.
- [ ] Invalid/empty policy combinations surface a safe error without leaking a generated value.
- [ ] Switching modes while a generation request is completing does not let the old result overwrite the new mode.

### Passphrases

- [ ] Passphrase generation works with the packaged EFF list.
- [ ] Word-count controls work from 3 through 12.
- [ ] Separator, capitalization, and two-digit suffix controls work.
- [ ] Selection-entropy status is shown.
- [ ] Strength output updates after generation.

### Presets

- [ ] Balanced preset applies correctly.
- [ ] Maximum preset applies correctly.
- [ ] Legacy-compatible preset applies correctly.
- [ ] Alphanumeric preset applies correctly.
- [ ] Returning to custom controls behaves correctly.

### Batch generation and native export

- [ ] Batch generation enforces the 1–500 limit.
- [ ] Batch output is displayed without per-item strength metadata.
- [ ] Plaintext export warning is visible before export.
- [ ] Export opens the operating system's native save dialog.
- [ ] Cancelling the save dialog reports cancellation and leaves the generated batch available.
- [ ] Saving creates a `.txt` file at the user-selected destination.
- [ ] Saved text starts with `# KeySmith batch export`.
- [ ] Saved text contains a creation timestamp and `# WARNING:` line.
- [ ] Saved text contains the generated batch values in order.
- [ ] The frontend does not present any generic filesystem browser or arbitrary-path write feature.
- [ ] Switching modes while a save dialog/result is pending does not restore stale Batch status/actions into the new mode.

### Clipboard

- [ ] Copying a single generated value works.
- [ ] Copying all batch values works.
- [ ] `Never`, 15 seconds, 30 seconds, 1 minute, and 2 minutes behave as configured.
- [ ] Conditional auto-clear does not erase a newer unrelated clipboard value.
- [ ] Recopying the same secret with a longer auto-clear delay replaces the older schedule.
- [ ] Recopying the same secret with `Never` cancels the older pending schedule.
- [ ] Manual clear cancels pending auto-clear and clears the current clipboard.
- [ ] Clipboard failure states are safe and do not include secret text.

### Appearance and accessibility

- [ ] Light theme works.
- [ ] Dark theme works.
- [ ] System theme follows the operating-system preference.
- [ ] Keyboard-only navigation is complete and logical.
- [ ] Generator tabs work with Left/Right arrow keys and visible focus.
- [ ] Dialog focus behavior is usable.
- [ ] Screen-reader labels for generator controls, output, dialogs, and buttons are meaningful.
- [ ] 200% text/display scaling remains usable without lost controls or secret output.
- [ ] Reduced-motion preference is respected.
- [ ] Status meaning is understandable without relying only on color.

### Settings, About, and external links

- [ ] Settings content matches the implemented privacy/data behavior.
- [ ] About version, license, credit, support, and business metadata are correct.
- [ ] GitHub opens the expected project/profile destination using the operating system handler.
- [ ] Buy Me a Coffee opens the expected destination using the operating system handler.
- [ ] Support and both business mail links open the expected mail handler destinations.
- [ ] No unlisted arbitrary URL can be opened from the About link surface.

### Privacy and network behavior

- [ ] Generated secrets disappear from product state when the relevant output is reset/mode is changed; no history surface appears.
- [ ] No generated password/passphrase is persisted to local storage.
- [ ] Only theme, clipboard-clear duration, and onboarding completion are stored as non-secret preferences.
- [ ] No telemetry or analytics request is observed.
- [ ] No unexpected automatic network request is observed during generation, clipboard use, settings, or export.
- [ ] Network access occurs only after an explicit external-link action where the operating system/browser/mail client handles the destination.

## Release evidence

- [ ] Real screenshots captured from verified packaged builds.
- [ ] Screenshot sources/platform/version are recorded.
- [ ] `CHANGELOG.md` release date finalized.
- [ ] `what_changed.md` updated with exact final candidate SHA and evidence.
- [ ] Required branch protection is enabled using proven successful check names.
- [ ] All blocking review conversations are resolved.
- [ ] Signing/notarization state is described accurately; unsigned artifacts are not called signed.
- [ ] Release tag exactly matches the package version.
- [ ] Tag-triggered `Verify release tag` preflight succeeds.
- [ ] Draft release contains the expected platform artifacts.
- [ ] `v0.1.0` is published only after every blocking item above is complete.
