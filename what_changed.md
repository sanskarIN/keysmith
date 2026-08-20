# KeySmith — Development Handoff

Last updated: 2026-08-20
Current version: `2.7.4`
Current milestone: full native cross-platform verification
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Current work branch: `feat/full-cross-platform`
Previous v2.7.4 PR: `#13` — merged to `main` at `726e5c08776d38a47c4c649cb4d6d553ca1f09fd`
Required maintainer commit email: `sanskarin@outlook.in`

This is the canonical continuation ledger. Read this file, the current branch/PR head, and current GitHub Actions results before making further changes.

## Current status

The earlier desktop-focused v2.7.4 release-candidate work was merged through PR #13. The current continuation extends the same `2.7.4` codebase from Windows/macOS/Linux to the complete native Tauri 2 target set:

- Windows,
- macOS,
- Linux,
- Android,
- iOS / iPadOS.

The source/configuration work is implemented on `feat/full-cross-platform`. **Do not call v2.7.4 fully cross-platform verified until the exact final branch/PR head passes the expanded Windows, macOS, Linux, Android, iOS, CodeQL, package, signing, and manual smoke-test gates.**

A browser/PWA deployment is not treated as another Tauri native target and would require a separate security/filesystem/clipboard architecture review.

## Cross-platform implementation completed

### 1. Removed the desktop-only clipboard dependency

Changed:

- `src-tauri/Cargo.toml`
  - removed direct `arboard = "3"` application dependency,
  - added `tauri-plugin-clipboard-manager = "2"`,
  - added `tauri-plugin-dialog = "2"`,
  - added `tauri-plugin-fs = "2"`.

Why:

The direct clipboard implementation was the primary native-code obstacle to Android/iOS. KeySmith only requires plaintext clipboard text, which is supported by the official Tauri clipboard plugin across Windows, macOS, Linux, Android, and iOS.

### 2. Shared native plugin initialization

Changed:

- `src-tauri/src/lib.rs`
  - initializes the clipboard-manager plugin,
  - initializes the dialog plugin,
  - initializes the filesystem plugin,
  - retains the same narrow KeySmith invoke-handler surface.

The existing `#[cfg_attr(mobile, tauri::mobile_entry_point)]` remains the shared entry point for generated Android/iOS hosts.

### 3. Cross-platform clipboard commands

Changed:

- `src-tauri/src/commands.rs`

Behavior now:

- clipboard commands receive `tauri::AppHandle`,
- `ClipboardExt` supplies the native platform clipboard implementation,
- secret input remains wrapped in `Zeroizing<String>`,
- clipboard input remains capped at 4096 characters,
- accepted clear durations remain exactly `0`, `15`, `30`, `60`, and `120` seconds,
- delayed auto-clear reads the clipboard and clears only if it still equals the copied value,
- delayed comparison runs away from the initiating command path,
- Clear clipboard now uses the same plugin path on desktop and mobile,
- existing unit tests for accepted/rejected durations remain.

No platform-specific password-generation logic was introduced; all platforms still use `keysmith-core`.

### 4. Native cross-platform batch export

Changed:

- `src/api.ts`
- `src/main.ts`
- `src-tauri/capabilities/default.json`
- `package.json`

The old browser-only Blob/object-URL/download-anchor flow was removed.

New export flow:

1. user explicitly selects Export,
2. native save dialog returns a user-selected path/URI,
3. KeySmith writes the plaintext warning + generated batch through the Tauri filesystem plugin,
4. KeySmith reads the destination back,
5. success is reported only if the readback exactly equals the intended export text.

This exact readback check is intentional. A current Android/document-provider edge case can return from a write path without preserving the intended file contents. KeySmith therefore refuses to display a false-success message when the selected destination does not preserve the requested text.

Current least-privilege plugin permissions:

- `dialog:allow-save`,
- `fs:allow-write-text-file`,
- `fs:allow-read-text-file`.

Broad filesystem directory permissions are not granted merely for export convenience.

### 5. Android platform configuration

Added:

- `src-tauri/tauri.android.conf.json`

Current policy:

- product window label/title remains `main` / `KeySmith`,
- desktop width/height/minimum-window constraints are not copied into the mobile override,
- Android `minSdkVersion` is `24`.

Package scripts added:

- `android:init`
- `android:dev`
- `android:build:apk`
- `android:build:aab`

The generated Android Studio project under `src-tauri/gen/android` remains ignored and reproducible rather than committed as canonical source.

### 6. iOS / iPadOS platform configuration

Added:

- `src-tauri/tauri.ios.conf.json`

Current policy:

- product window label/title remains `main` / `KeySmith`,
- desktop sizing constraints are not copied into the mobile override,
- iOS minimum system version is `14.0`.

Package scripts added:

- `ios:init`
- `ios:dev`
- `ios:build`
- `ios:prepare`

The generated Xcode project under `src-tauri/gen/apple` remains ignored and reproducible.

### 7. iOS privacy manifest preparation

Added:

- `scripts/prepare-ios-privacy.mjs`

The filesystem plugin's Apple file-timestamp API usage requires a privacy manifest approved-reason declaration. The script writes `src-tauri/gen/apple/PrivacyInfo.xcprivacy` with:

- category `NSPrivacyAccessedAPICategoryFileTimestamp`,
- reason `C617.1`.

Run `npm run ios:prepare` after every `ios:init`/regeneration and before iOS build/release verification.

### 8. Shared platform icon generation

Added package script:

- `icons:generate` → `tauri icon src/assets/logo.svg`

`src/assets/logo.svg` remains the editable branding source. The icon command is run after generated Android/iOS project initialization so Android mipmaps and the iOS AppIcon set use KeySmith branding instead of generated defaults.

### 9. Mobile development-server support

Changed:

- `vite.config.ts`

The dev server now reads `TAURI_DEV_HOST`. When Tauri exposes a host for a connected physical mobile device, Vite:

- binds to that host,
- configures WebSocket HMR for the host,
- keeps the existing port discipline.

Production credential generation remains offline and does not depend on this development-network path.

### 10. Mobile responsive/safe-area UI

Added:

- `src/mobile.css`

Changed:

- `index.html`

Mobile adaptations include:

- `viewport-fit=cover`,
- safe-area inset handling for top/left/right/bottom,
- `100dvh` behavior,
- baseline 44px controls,
- 48px coarse-pointer targets,
- touch-friendly checkboxes/ranges,
- scrollable dialogs constrained to the usable viewport,
- narrow-screen button grids,
- compact header controls,
- accessible visually hidden brand text at very narrow widths,
- preserved desktop keyboard/focus design from `src/styles.css`.

About now lists:

`Windows · macOS · Linux · Android · iOS`

The application description now explicitly covers desktop and mobile.

### 11. Deterministic five-platform source guard

Added:

- `scripts/check-platforms.mjs`
- package script `platform:check`

The guard fails if release-critical platform invariants drift, including:

- Android/iOS/icon/preparation scripts missing,
- clipboard/dialog/filesystem Rust plugins missing,
- direct `arboard` application dependency restored,
- plugin initialization missing,
- Android SDK minimum changed unexpectedly,
- iOS minimum version changed unexpectedly,
- export save/write/readback permissions missing,
- mobile viewport/safe-area CSS missing,
- coarse-pointer touch rules missing,
- five-platform About listing incomplete.

### 12. Expanded GitHub Actions matrix

Changed:

- `.github/workflows/ci.yml`

Shared/frontend job now runs:

- typecheck,
- lint,
- text-format hygiene,
- version consistency,
- platform consistency,
- Vitest,
- frontend build.

Rust core job remains:

- Rust formatting,
- Rust core Clippy,
- Rust core tests.

Desktop matrix now explicitly identifies itself as desktop and covers:

- Ubuntu/Linux,
- Windows,
- macOS,

with native adapter check, Clippy, and library tests.

New Android job:

- Ubuntu hosted runner,
- Node.js 22,
- Java 17,
- all four Rust Android targets installed,
- modern hosted-runner NDK selected through `ANDROID_NDK_LATEST_HOME`,
- non-interactive Android project initialization,
- KeySmith icon generation,
- aarch64 debug APK compilation.

New iOS job:

- macOS hosted runner,
- Node.js 22,
- iOS device/simulator Rust targets,
- non-interactive iOS project initialization,
- KeySmith icon generation,
- iOS privacy-manifest preparation,
- arm64 simulator debug compilation.

Cargo dependency policy remains a separate CI job. CodeQL remains separate for JavaScript/TypeScript and Rust.

A green mobile compile job proves the project/toolchain path compiles; it does not replace physical-device/store-signing smoke testing.

## Documentation updated for the five-platform model

Updated:

- `README.md`
  - five native targets,
  - Android/iOS quick start/build commands,
  - mobile-safe clipboard/export implementation,
  - cross-platform CI distinction,
  - truthful configured-vs-verified wording.
- `docs/setup.md`
  - Windows/macOS/Linux setup,
  - Android Studio/SDK/NDK/Rust target setup,
  - Android init/dev/APK/AAB commands,
  - iOS Xcode/Rust target setup,
  - iOS init/dev/build/privacy preparation,
  - generated-project policy,
  - mobile dev-network guidance,
  - signing-secret rules.
- `docs/development.md`
  - shared + mobile commands,
  - five-platform dependency/plugin rules,
  - generated-project policy,
  - native capability review flow,
  - full cross-platform completion rule.
- `docs/testing.md`
  - five-platform automated matrix,
  - Android/iOS CI expectations,
  - mobile UI checks,
  - platform clipboard checks,
  - native export/readback checks.
- `docs/release.md`
  - five-platform release gate,
  - per-platform build paths,
  - Android signing/AAB requirements,
  - iOS privacy/signing/distribution requirements,
  - mobile safe-area/icon/export smoke checklist.
- `docs/architecture.md`
  - one shared Rust core + shared responsive UI,
  - native plugin boundaries,
  - generated mobile projects,
  - export/readback data flow,
  - mobile development host,
  - iOS privacy manifest,
  - five-platform verification boundary.
- `PRIVACY.md`
  - Android/iOS clipboard and document-provider boundaries,
  - temporary runtime copies,
  - scoped export/readback,
  - generated mobile projects,
  - development-only network behavior,
  - release-signing data exclusions.
- `THREAT_MODEL.md`
  - mobile webview, dev host, clipboard, document-provider, generated-project, Android NDK, iOS privacy, safe-area, and signing threats/residual risks.
- `CHANGELOG.md`
  - records all cross-platform v2.7.4 work and the remaining verification boundary.
- `ROADMAP.md`
  - makes v2.7.4 a five-platform candidate and tracks exact desktop/mobile pre-release blockers.
- `CONTRIBUTING.md`
  - requires contributors to preserve the five-platform architecture and run `platform:check`.
- `.github/RELEASE_TEMPLATE.md`
  - adds Windows/macOS/Linux/Android/iOS automated/package/manual release checklists.
- `what_changed.md`
  - this handoff.

## Existing security/product behavior preserved

The cross-platform work did not replace the security core or weaken existing policy behavior. KeySmith still provides:

- OS-backed CSPRNG through `getrandom`,
- rejection sampling for unbiased bounded selection,
- secure shuffle,
- length 4–128 password generation,
- required enabled character classes,
- custom-symbol validation/deduplication,
- ambiguity exclusion,
- 1–500 batch generation,
- EFF large Diceware passphrases (3–12 words),
- zxcvbn strength estimates,
- no accounts,
- no telemetry/analytics,
- no generated-secret history,
- no cloud synchronization,
- explicit plaintext export warnings,
- explicit clipboard use,
- conditional clipboard auto-clear,
- restrictive Tauri CSP,
- least-privilege capabilities,
- non-secret preference-only local storage.

Current non-secret preference keys remain:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

## Important platform limitations / release truthfulness

- Windows/macOS/Linux/Android/iOS are now first-class native source/configuration targets.
- Android/iOS must not be described as release-verified until the expanded PR CI and mobile smoke tests pass on the exact candidate.
- iOS release/device/App Store builds require macOS/Xcode and protected Apple signing/provisioning credentials.
- Android store distribution requires protected Android signing credentials and the appropriate Play distribution process.
- Android release tooling should use a current NDK suitable for modern native-library page-size requirements; setup/release docs require NDK 28+.
- Mobile OS clipboard behavior can evolve; KeySmith does not attempt to bypass platform privacy protections.
- Mobile document providers can have provider-specific behavior. Exact write/readback verification prevents false success but cannot guarantee a provider will never corrupt/delete a file later.
- Generated Android Studio/Xcode projects are ignored and recreated from committed source/configuration.
- JavaScript strings, OS clipboard services, document providers, and general process memory cannot be guaranteed to be zeroized; Rust-owned buffers use best-effort zeroization where practical.
- Browser/PWA support is a separate architecture and is not being mislabeled as a native Tauri target.

## Cross-platform commits in this continuation

Native/mobile integration:

- `9f0b6311` — `feat: use cross-platform Tauri clipboard plugin`
- `bd6046d4` — `feat: initialize clipboard plugin on desktop and mobile`
- `dd9d0d2b` — `feat: make clipboard commands mobile compatible`
- `e55353a4` — `feat: add mobile-safe export plugins`
- `0aac4660` — `feat: initialize cross-platform export plugins`
- `0fde6bfa` — `feat: allow cross-platform save export permissions`
- `7063df19` — `feat: add Android iOS and export scripts`
- `b713cdab` — `feat: add native cross-platform text export API`
- `e6f413f2` — `feat: make batch export native on all platforms`
- `a2ce8e24` — `fix: verify cross-platform batch export contents`
- `0fc3ce29` — `security: allow export verification readback`

Platform configuration/UI/build tooling:

- `1ae9e2a7` — `feat: support Tauri mobile dev hosts`
- `799f7be3` — `feat: add Android platform configuration`
- `286d3792` — `feat: add iOS platform configuration`
- `71e3d3a0` — `feat: make UI metadata mobile aware`
- `3c39f52e` — `feat: add mobile safe-area and touch layout`
- `6c806707` — `feat: load mobile layout adaptations`
- `f643d313` — `build: generate required iOS privacy manifest`
- `07aa740b` — `test: add cross-platform configuration guard`
- `cbafccca` — `build: expose mobile verification and iOS preparation`
- `fbb8a84e` — `ci: add Android and iOS build verification`
- `398de3ea` — `build: add all-platform icon generation`
- `43b9d976` — `ci: verify generated mobile branding assets`
- `976333ad` — `test: strengthen cross-platform configuration guard`

Documentation:

- `ce9a9540` — `docs: document five-platform native support`
- `890fc579` — `docs: add Android and iOS setup guide`
- `989d27b4` — `docs: extend release gate to Android and iOS`
- `c35c113b` — `docs: document five-platform test matrix`
- `d2a46bea` — `docs: describe shared desktop and mobile architecture`
- `a5f3cc30` — `docs: extend privacy model to mobile platforms`
- `dee6eff7` — `docs: extend threat model across mobile boundaries`
- `b2fbc944` — `docs: record full cross-platform v2.7.4 work`
- `76bdc0ac` — `docs: align roadmap with five-platform release`
- `ae6282f3` — `docs: add mobile development workflow`
- `4fc4330b` — `docs: make contribution gate cross-platform`
- `05622466` — `docs: expand release checklist to mobile`

## Verification state at this handoff commit

Source/configuration invariants were implemented based on current official Tauri platform/plugin/CLI requirements and current Android/iOS release requirements. The current branch has **not yet been declared green** because this handoff is being written before opening the final verification PR.

The next action must be to open a PR from `feat/full-cross-platform` into `main`, inspect CI + CodeQL on the exact head, and fix any real failures. Do not infer success from configuration alone.

## Next exact tasks

1. Open the cross-platform PR against `main`.
2. Confirm the exact PR head SHA.
3. Inspect all CI/CodeQL workflow runs for that exact SHA.
4. Fix any frontend/platform-check/Rust/desktop/Android/iOS/dependency/CodeQL failures at their root cause.
5. Repeat until the exact candidate SHA is green for:
   - Frontend quality,
   - Rust core quality,
   - Windows desktop,
   - macOS desktop,
   - Linux desktop,
   - Android mobile build,
   - iOS simulator build,
   - Rust dependency policy,
   - JavaScript/TypeScript CodeQL,
   - Rust CodeQL.
6. Generate/commit trusted lockfiles if the clean build process produces suitable lockfiles and repository policy chooses to track them.
7. Run packaged-app smoke tests on Windows/macOS/Linux.
8. Run Android emulator/device smoke tests, including clipboard conditional clear and native export/readback.
9. Run iOS simulator/device smoke tests, including privacy manifest, clipboard behavior, export/readback, safe areas, and touch layout.
10. Capture real screenshots from verified builds.
11. Configure branch protection using the proven final required-check names.
12. Update this ledger with final CI/device/package evidence before final release publication.
13. Keep Android/Apple signing secrets outside the repository and use protected release channels.

## Commit identity

Project-maintainer commits should continue using `Sanskar <sanskarin@outlook.in>` / `sanskarin@outlook.in` where the tool/client permits explicit author configuration. GitHub API-created commits may use the authenticated GitHub identity because the connector does not expose author-email override fields.
