# KeySmith vX.Y.Z

## Highlights

- Summarize the user-visible improvements.
- Call out compatibility or behavior changes that users should understand before upgrading.

## Security and privacy

- State changes to randomness, policy validation, secret handling, clipboard behavior, IPC/permissions, persistence, exports, release integrity, or network behavior.
- If none changed, explicitly say so.
- Never include real generated credentials, tokens, private endpoints, signing material, or personal data in release notes or screenshots.

## Automated verification

- [ ] `npm run version:check` passes for repository metadata.
- [ ] The release tag exactly matches the manifest version (`KEYSMITH_EXPECTED_VERSION=vX.Y.Z`).
- [ ] Frontend quality checks pass.
- [ ] Rust core format/Clippy/tests pass.
- [ ] Tauri check, desktop Clippy, and desktop library tests pass on Windows, macOS, and Linux.
- [ ] Rust dependency policy passes.
- [ ] JavaScript/TypeScript CodeQL passes.
- [ ] Rust CodeQL passes.
- [ ] All required checks are green on the exact release-candidate/merge commit used for the tag.

## Package and manual verification

- [ ] Native release bundles were built for supported platforms.
- [ ] Generated package/application version is correct.
- [ ] Password generation and built-in presets were smoke-tested.
- [ ] Custom-symbol validation and ambiguity exclusion were smoke-tested.
- [ ] Passphrase and batch generation/export warnings were smoke-tested.
- [ ] Clipboard copy, each supported auto-clear duration, conditional clear, and clear-now were smoke-tested.
- [ ] Onboarding, settings, themes, keyboard navigation, reduced motion, and About/support/funding links were smoke-tested.
- [ ] Real release screenshots come from verified packaged builds.
- [ ] Signing/notarization status is documented accurately.
- [ ] Artifact names, installation behavior, and checksums/signatures where available were verified.
- [ ] No credentials or signing secrets are present in source or published artifacts.

## Documentation

- [ ] `CHANGELOG.md` is current.
- [ ] `ROADMAP.md` reflects the post-release state.
- [ ] `what_changed.md` contains the final verification/artifact handoff.
- [ ] `SECURITY.md` supported-version table is correct.
- [ ] README version/release status and screenshots are correct.

## Upgrade notes

KeySmith does not maintain a generated-credential database, so normal releases do not migrate stored passwords or passphrases. Document any non-secret local-preference schema change here, including safe fallback behavior.

For v2.7.4, the existing non-secret preference keys remain `keysmith.clipboardClearSeconds`, `keysmith.theme`, and `keysmith.onboardingComplete`.

## Known limitations

- List unresolved platform, signing, packaging, or behavior limitations honestly.
- Do not describe queued, skipped, unavailable, or unobserved verification as passed.

## Support

Support: `supportramsandesh@gmail.com`

Made by the Sanskar.
