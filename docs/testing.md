# Testing Strategy

## Rust core

`cargo test -p keysmith-core --all-features` covers required-character-class guarantees, ambiguity exclusion, custom-symbol validation and deduplication, batch limits, passphrase word count, and property tests across password lengths and restricted character sets.

The custom-symbol regression coverage verifies that:

- alphanumeric values cannot masquerade as the symbol class,
- inputs longer than 40 characters are rejected by the backend,
- duplicates do not create duplicate entries in the symbol set,
- explicit ambiguity exclusion also applies to custom symbols,
- stale custom-symbol text is ignored when the symbol class is disabled,
- every built-in preset remains valid after policy hardening.

## Native adapter

`cargo test -p keysmith --lib` covers pure adapter policy helpers that do not require a live operating-system clipboard. The current suite verifies that only the documented clipboard auto-clear durations (`0`, `15`, `30`, `60`, and `120` seconds) are accepted by IPC-side validation.

Clipboard integration still requires platform smoke testing because the real service is provided by Windows, macOS, Linux, Android, or iOS.

## Frontend

`npm test` runs Vitest coverage for non-secret preference helpers, including clipboard duration persistence, safe fallback behavior, theme persistence, and onboarding state.

Batch export uses Tauri's native dialog/filesystem APIs. The export path writes the requested text and then reads the selected destination back. A mismatch is treated as an error; the UI must never report a successful export when exact readback verification fails.

## Static and release-consistency checks

- `cargo fmt --all -- --check`
- `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
- `cargo check -p keysmith --all-targets`
- `cargo clippy -p keysmith --all-targets -- -D warnings`
- `cargo test -p keysmith --lib`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run version:check`
- `npm run platform:check`
- `npm test`
- `npm run build`

`npm run version:check` verifies that `package.json`, the Rust workspace version in `Cargo.toml`, `src-tauri/tauri.conf.json`, and semantic versions displayed in `index.html` agree. The release workflow additionally supplies the Git tag through `KEYSMITH_EXPECTED_VERSION`.

`npm run platform:check` verifies the committed five-platform invariants: Android/iOS scripts and configs, mobile-safe Tauri plugins, least-privilege export permissions, absence of the old desktop-only clipboard dependency, safe-area viewport/UI wiring, and the complete platform listing.

## CI platform matrix

### Desktop

The desktop matrix runs on:

- Ubuntu/Linux,
- Windows,
- macOS.

Each target compiles the Tauri adapter; the matrix also runs adapter Clippy and library tests. Linux installs WebKitGTK/Tauri system dependencies first.

### Android

The Android CI job:

1. installs Node.js 22 and Java 17,
2. installs all four Rust Android targets,
3. selects the latest hosted-runner NDK rather than the older default so the native build is suitable for modern 16 KB memory-page requirements,
4. runs `tauri android init` non-interactively,
5. generates KeySmith mobile icons from `src/assets/logo.svg`,
6. compiles an aarch64 debug APK.

A green Android CI job proves source/project compilation; it does not replace physical-device smoke testing or store signing verification.

### iOS / iPadOS

The iOS CI job runs on macOS and:

1. installs the device/simulator Rust targets,
2. runs `tauri ios init` non-interactively,
3. generates KeySmith mobile icons,
4. writes the required `PrivacyInfo.xcprivacy` via `npm run ios:prepare`,
5. compiles an arm64 simulator debug build.

A green iOS CI job proves simulator-target compilation; it does not replace signed device/App Store verification.

## Mobile UI checks

Manual mobile review must cover:

- portrait phone width,
- narrow phone width around 360–410 CSS pixels,
- tablet width,
- safe areas around notches/status bars/home indicators,
- coarse-pointer 48px touch targets,
- scrollable Settings/About/onboarding dialogs,
- keyboard appearance around text/number fields,
- batch output scrolling,
- theme switching,
- orientation changes where supported.

## Clipboard checks

On each native platform:

1. copy a generated secret,
2. verify immediate clipboard contents,
3. verify each supported clear duration,
4. replace the clipboard with unrelated text before the timer expires and confirm KeySmith does not erase the newer value,
5. test Clear clipboard now explicitly.

Android and iOS clipboard support is intentionally plaintext-only because KeySmith only copies generated text.

## Export checks

On desktop and mobile:

1. cancel the save dialog and verify no success is reported,
2. save to a local destination and confirm exact content/readback,
3. test a representative mobile document-provider destination,
4. verify any provider that fails exact readback produces an error instead of a success message,
5. never use real production credentials during testing.

## Security regression rule

Every defect involving randomness, secret leakage, clipboard behavior, permission scope, export integrity, mobile platform boundaries, release integrity, or input validation must gain automated regression coverage when practical plus a documented manual check when the behavior depends on an operating system service.

## Clean-build release gate

A five-platform release candidate must pass the shared checks plus Windows, macOS, Linux, Android, and iOS CI on the exact candidate commit. A configured target, version bump, or successful desktop build alone is not evidence of full cross-platform verification.
