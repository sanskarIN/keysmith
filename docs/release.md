# Release Process

## Release-candidate checklist

1. Create or update a focused release/cross-platform branch and open a pull request against `main` so pull-request CI and CodeQL run on the exact candidate.
2. Ensure the frontend package version in `package.json`, Rust workspace version in `Cargo.toml`, Tauri version in `src-tauri/tauri.conf.json`, and visible UI version labels in `index.html` all match.
3. Run `npm run version:check` and `npm run platform:check`. For a prospective tag, also set `KEYSMITH_EXPECTED_VERSION=vX.Y.Z` before `npm run version:check`.
4. Confirm `CHANGELOG.md`, `ROADMAP.md`, `what_changed.md`, security/privacy docs, release notes, platform support tables, and real screenshots are current.
5. Run the shared quality suite from a clean checkout:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm run version:check`
   - `npm run platform:check`
   - `npm test`
   - `npm run build`
   - `cargo fmt --all -- --check`
   - `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
   - `cargo test -p keysmith-core --all-features`
   - `cargo check -p keysmith --all-targets`
   - `cargo clippy -p keysmith --all-targets -- -D warnings`
   - `cargo test -p keysmith --lib`
   - cargo-deny policy
6. Require the Windows, macOS, Linux, Android, and iOS CI jobs plus both CodeQL language analyses to be green on the same candidate commit.
7. Build native packages on each target platform.
8. Smoke-test the actual packages/applications on representative hardware or simulators/emulators.
9. Capture real screenshots from verified packages and update public documentation.
10. Merge the verified candidate to `main` using repository policy, then confirm required checks are green on the merge commit.
11. Create `vX.Y.Z` only after the manifest version and merge commit are confirmed. The release workflow independently rejects a mismatched tag.
12. Build/sign the intended distribution artifacts using protected release credentials outside source control.
13. Verify artifact names, versions, signatures where applicable, install/launch behavior, and release notes before publication.

## Platform build gates

### Windows

```bash
npm install
npm run version:check
npm run platform:check
npm run tauri build
```

Verify the produced Windows installer/application on a supported Windows system. Signing must use protected credentials and must never be committed.

### macOS

```bash
npm install
npm run version:check
npm run platform:check
npm run tauri build
```

For public distribution, complete the appropriate Apple signing/notarization process using protected credentials.

### Linux

```bash
npm install
npm run version:check
npm run platform:check
npm run tauri build
```

Verify each published Linux package format on a compatible distribution. Do not claim a format or architecture is supported unless an artifact has been built and tested.

### Android

Initialize generated mobile sources and KeySmith icons:

```bash
npm install
npm run android:init
npm run icons:generate
```

For CI/smoke verification, an aarch64 debug APK is sufficient to prove compilation. Before store release, build the intended release artifact, normally an Android App Bundle:

```bash
npm run android:build:aab
```

The Android release must use an NDK version 28 or newer for 16 KB memory-page compatibility. Google Play distribution requires an Android developer account and properly protected signing configuration. Do not commit keystores, key passwords, or signing environment files.

### iOS / iPadOS

iOS release work must run on macOS with Xcode:

```bash
npm install
npm run ios:init
npm run icons:generate
npm run ios:prepare
npm run ios:build
```

`npm run ios:prepare` is required after generated Apple project recreation because it restores `PrivacyInfo.xcprivacy` for the filesystem plugin's approved file-timestamp reason.

CI uses an arm64 simulator debug build to prove compilation without distribution signing. App Store/TestFlight artifacts require Apple Developer enrollment, signing identities/profiles, and the appropriate export method. Keep all Apple credentials outside the repository.

## Cross-platform smoke-test matrix

Perform the following on every platform where the behavior exists:

- password generation with default settings,
- every built-in preset,
- custom-symbol validation and ambiguity exclusion,
- passphrase generation,
- batch generation,
- Copy and Copy all,
- clipboard clear-now,
- each supported auto-clear duration,
- conditional auto-clear preserving a newer clipboard value,
- batch export cancellation,
- batch export success with exact readback verification,
- batch export failure on an unsupported/unreliable destination without a false-success message,
- onboarding,
- Settings and theme switching,
- keyboard navigation on desktop,
- touch-target usability and safe areas on phones/tablets,
- reduced-motion behavior,
- About/support/funding links.

## Mobile-specific release review

Before describing Android/iOS as release-verified:

- verify generated KeySmith icons rather than default Tauri icons,
- verify Android SDK 24 behavior or document a higher actual minimum,
- verify at least one modern Android device/emulator and one iOS simulator/device,
- verify file-save destinations used in testing preserve batch text exactly,
- verify the iOS privacy manifest is present in the generated Apple project,
- verify no desktop minimum window dimensions leak into mobile platform configuration,
- verify the UI around notches/home indicators with safe-area insets.

## v2.7.4 gate

For v2.7.4, the final tag must be exactly `v2.7.4`, repository version metadata must resolve to `2.7.4`, and the five native target gates above must be satisfied before the release is described as fully cross-platform verified.

A configured target, a successful source merge, or a green desktop build does not by itself prove mobile release readiness.

## Secret-handling rule

Never commit signing keys, Android keystores, Apple certificates/private keys, provisioning secrets, App Store Connect credentials, tokens, notarization credentials, recovery codes, generated credentials, or real secrets used during smoke testing.
