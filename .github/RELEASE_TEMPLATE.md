# KeySmith vX.Y.Z

## Highlights

- Summarize user-visible improvements without overstating verification or platform support.

## Security and privacy

- State changes to randomness, generation policy, secret handling, clipboard scheduling, Tauri capabilities, external links, persistence, exports, dependencies, or network behavior.
- State whether any new native permission/capability was added or widened.
- If no security/privacy-relevant behavior changed, explicitly say so.

## Automated verification

Release commit: `<full SHA>`

- [ ] Tag/version consistency is green and the tag equals `vX.Y.Z`.
- [ ] npm audit and repository secret scan passed.
- [ ] TypeScript typecheck/lint/text hygiene/tests/build passed.
- [ ] Rust formatting, core Clippy/tests, and cargo-deny passed.
- [ ] Tauri cargo check and Clippy passed on Linux.
- [ ] Tauri cargo check and Clippy passed on Windows.
- [ ] Tauri cargo check and Clippy passed on macOS.
- [ ] CodeQL JavaScript/TypeScript passed.
- [ ] CodeQL Rust passed after complete workspace build.
- [ ] Verified `package-lock.json` and `Cargo.lock` are committed.
- [ ] All required checks above refer to the same release commit.

## Packaged verification

- [ ] Windows packaged build passed `docs/verification.md`.
- [ ] macOS packaged build passed `docs/verification.md`.
- [ ] Linux packaged build passed `docs/verification.md`.
- [ ] Native batch save and cancel flows were verified.
- [ ] Saved batch text contains the KeySmith header/warning and expected generated values.
- [ ] Clipboard replacement/cancel/conditional-clear behavior was verified.
- [ ] GitHub/funding/support/business links open only the documented destinations through the OS handler.
- [ ] Keyboard, focus, screen-reader labels, 200% scaling, and reduced motion were reviewed.
- [ ] No generated-secret history, telemetry, or unexpected automatic network request was observed.
- [ ] Real release screenshots were captured from verified packaged builds.

## Artifact and release verification

- [ ] `CHANGELOG.md`, `ROADMAP.md`, README, release docs, and `what_changed.md` are current.
- [ ] Branch protection/review requirements were satisfied.
- [ ] Tag-triggered `Verify release tag` preflight passed.
- [ ] Expected draft artifacts were produced for every primary platform.
- [ ] Artifact signing/notarization state is described accurately.
- [ ] No credentials, private signing material, tokens, or private user data are present in source or release artifacts.

## Upgrade notes

No secret database migrations exist in the 0.1 series because KeySmith deliberately does not persist generated credentials. Document any non-secret preference compatibility change here if one is introduced.

## Known limitations

- Batch exports are plaintext by design after the user explicitly chooses a destination.
- Clipboard managers/other processes may observe copied values before KeySmith clears them.
- List any release-specific platform/signing limitations here rather than omitting them.

## Support

Support: `supportramsandesh@gmail.com`

Made by the Sanskar.
