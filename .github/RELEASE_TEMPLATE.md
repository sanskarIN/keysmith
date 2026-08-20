# KeySmith vX.Y.Z

## Highlights

- Summarize the user-visible improvements.
- Call out compatibility, platform, or behavior changes users should understand before upgrading.

## Security and privacy

- State changes to randomness, policy validation, secret handling, clipboard behavior, IPC/permissions, persistence, exports, mobile development networking, release integrity, or network behavior.
- If none changed, explicitly say so.
- Never include real generated credentials, tokens, private endpoints, signing material, or personal data in release notes or screenshots.

## Automated verification

- [ ] `npm run version:check` passes for repository metadata.
- [ ] `npm run platform:check` passes for the five-platform configuration.
- [ ] The release tag exactly matches the manifest version (`KEYSMITH_EXPECTED_VERSION=vX.Y.Z`).
- [ ] Frontend quality checks pass.
- [ ] Rust core format/Clippy/tests pass.
- [ ] Windows desktop Tauri check/Clippy/tests pass.
- [ ] macOS desktop Tauri check/Clippy/tests pass.
- [ ] Linux desktop Tauri check/Clippy/tests pass.
- [ ] Android project initialization, KeySmith icon generation, and aarch64 debug APK build pass.
- [ ] iOS project initialization, KeySmith icon generation, privacy-manifest preparation, and arm64 simulator build pass.
- [ ] Rust dependency policy passes.
- [ ] JavaScript/TypeScript CodeQL passes.
- [ ] Rust CodeQL passes.
- [ ] All required checks are green on the exact release-candidate/merge commit used for the tag.

## Desktop package verification

- [ ] Windows release bundle/installer was built and smoke-tested.
- [ ] macOS release bundle was built and smoke-tested.
- [ ] Linux intended package formats were built and smoke-tested.
- [ ] Desktop package/application versions are correct.
- [ ] Signing/notarization status is documented accurately for each desktop platform.

## Android package verification

- [ ] Release Android App Bundle/APK was built with the intended modern NDK/toolchain.
- [ ] Android application version and package identifier are correct.
- [ ] Generated Android launcher icons use KeySmith branding rather than defaults.
- [ ] App was smoke-tested on at least one representative Android device or emulator.
- [ ] Password/passphrase generation, clipboard behavior, batch export/readback, settings, themes, and safe-area/touch layout were tested.
- [ ] Store/signing state is documented accurately.
- [ ] No Android keystore or signing passwords are present in source/artifacts beyond intended public certificate metadata.

## iOS / iPadOS package verification

- [ ] `PrivacyInfo.xcprivacy` is present in the generated Apple project with the required filesystem reason.
- [ ] iOS application version/bundle identifier are correct.
- [ ] Generated AppIcon assets use KeySmith branding rather than defaults.
- [ ] Simulator build was smoke-tested.
- [ ] Device/TestFlight/App Store build was verified when publishing to Apple distribution channels.
- [ ] Password/passphrase generation, clipboard behavior, batch export/readback, settings, themes, and safe-area/touch layout were tested.
- [ ] Signing/provisioning state is documented accurately.
- [ ] No Apple private signing material or store credentials are present in source.

## Shared functional verification

- [ ] Password generation and every built-in preset were smoke-tested.
- [ ] Custom-symbol validation and ambiguity exclusion were smoke-tested.
- [ ] Passphrase generation was smoke-tested.
- [ ] Batch generation/export warning was smoke-tested.
- [ ] Export cancellation does not report success.
- [ ] Export success requires exact readback of the requested text.
- [ ] Clipboard copy, each supported auto-clear duration, conditional clear, and clear-now were smoke-tested.
- [ ] Onboarding, settings, themes, keyboard navigation where applicable, touch targets where applicable, reduced motion, and About/support/funding links were smoke-tested.
- [ ] Real release screenshots come only from verified packaged builds.
- [ ] Artifact names, installation behavior, and checksums/signatures where available were verified.
- [ ] No credentials or signing secrets are present in source or published artifacts.

## Documentation

- [ ] `CHANGELOG.md` is current.
- [ ] `ROADMAP.md` reflects the post-release state.
- [ ] `what_changed.md` contains the final verification/artifact handoff.
- [ ] `SECURITY.md` supported-version table is correct.
- [ ] README platform status, version/release status, setup commands, and screenshots are correct.
- [ ] `docs/setup.md`, `docs/testing.md`, and `docs/release.md` match the actual mobile/desktop toolchain.

## Upgrade notes

KeySmith does not maintain a generated-credential database, so normal releases do not migrate stored passwords or passphrases. Document any non-secret local-preference schema change here, including safe fallback behavior.

For v2.7.4, the existing non-secret preference keys remain `keysmith.clipboardClearSeconds`, `keysmith.theme`, and `keysmith.onboardingComplete`.

## Known limitations

- List unresolved platform, signing, store, document-provider, packaging, or behavior limitations honestly.
- Do not describe queued, skipped, unavailable, unobserved, or compile-only verification as device-tested release support.

## Support

Support: `supportramsandesh@gmail.com`

Made by the Sanskar.
