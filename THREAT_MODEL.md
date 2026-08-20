# KeySmith Threat Model

## Scope

This model covers local password/passphrase generation, Tauri IPC, desktop/mobile webviews, clipboard use, local preference storage, native save dialogs, batch export, generated Android/iOS projects, and the five-platform build/release pipeline. It does not claim to secure a compromised operating system or device.

## Assets

- Generated passwords and passphrases.
- Randomness quality and policy correctness.
- User trust that generation is local and unlogged.
- Integrity of clipboard and explicit export behavior.
- Integrity of shipped Windows, macOS, Linux, Android, and iOS artifacts.
- Platform signing credentials kept outside source control.

## Trust boundaries

1. TypeScript webview ↔ Tauri IPC.
2. Rust process ↔ operating-system CSPRNG.
3. Rust/Tauri clipboard plugin ↔ system clipboard service.
4. Webview ↔ native save dialog.
5. Filesystem plugin ↔ user-selected filesystem path or mobile document-provider URI.
6. Shared source/configuration ↔ generated Android Studio/Xcode projects.
7. Development host ↔ physical Android/iOS device during mobile development only.
8. Source/build pipeline ↔ published/signed artifacts and stores.

## Threats and mitigations

| Threat | Mitigation | Residual risk |
| --- | --- | --- |
| Predictable passwords | OS CSPRNG plus rejection sampling; required-class inclusion; security tests | Compromised OS RNG is out of scope |
| Modulo bias | Rejection sampling over the full `u64` range | Negligible when implementation is correct |
| Weak policy configuration | Validation, presets, zxcvbn feedback | Users can intentionally choose weak settings |
| Malformed custom-symbol policy | Backend caps custom symbols at 40, rejects alphanumeric/whitespace/control input, removes ambiguous characters when requested, and deduplicates symbols | Unicode display confusables outside the explicit ambiguity set can still look similar |
| Secret leakage in logs | No password logging or analytics; review policy | External debuggers/process inspection are out of scope |
| Clipboard exposure | Explicit copy, supported-duration allowlist, official cross-platform plaintext clipboard plugin, optional conditional auto-clear, zeroizing wrappers for owned Rust command buffers | Other apps/clipboard managers/platform history may read clipboard before clear; OS APIs necessarily receive a copy |
| Clipboard data destruction | Clear only when clipboard still equals copied secret; explicit clear-now is labeled separately | Race conditions outside app control remain possible |
| Mobile clipboard policy mismatch | Uses the supported Tauri plaintext mobile clipboard path and does not attempt to bypass Android/iOS privacy behavior | OS versions may change clipboard visibility/background behavior |
| XSS/webview compromise | No remote production content, restrictive CSP, local assets | Tauri/webview vulnerabilities remain dependency risk |
| Mobile dev-server exposure | `TAURI_DEV_HOST` used only for development; documentation requires a trusted local network | A hostile development network/device could inspect dev traffic |
| Overprivileged IPC | Small KeySmith command surface; plugin capabilities limited to save + text read/write | Future commands/plugins require review |
| Arbitrary filesystem access | Export starts from an explicit native save dialog and uses its scoped destination instead of broad directory permissions | User may intentionally select an insecure destination |
| Mobile document-provider false success | Export writes then reads the selected file/URI back and requires exact text equality before success | A provider could behave inconsistently after verification or later lose/corrupt data |
| Plaintext batch export | Warning, explicit action, scoped destination, exact readback | Exported credential file is plaintext under user/provider control |
| Generated mobile project drift | Generated `src-tauri/gen/` is ignored; Android/iOS init, icon generation, iOS privacy preparation, and builds are recreated in CI | Upstream generator/toolchain behavior can change |
| Missing iOS privacy declaration | Committed preparation script writes required `PrivacyInfo.xcprivacy`; iOS CI runs it before build | Apple requirements may evolve and require future updates |
| Android binary compatibility regression | CI uses a modern hosted-runner NDK and builds aarch64 Android; setup/release docs require NDK 28+ | Other ABIs and device/vendor differences still need release testing |
| Unsafe mobile UI around notches/touch | `viewport-fit=cover`, safe-area CSS, coarse-pointer targets, scrollable dialogs | Device-specific webview/layout bugs can remain |
| Dependency compromise | Dependabot, CodeQL, cargo-deny policy, review | Supply-chain risk cannot be eliminated |
| Release/version mismatch | CI checks frontend/Rust/Tauri/UI version metadata; release tags are compared with repository metadata | Complete package/signing verification is still required |
| Signing-key disclosure | Signing material prohibited from source and documentation; release process requires protected external credentials | Maintainer endpoint/CI secret compromise remains possible |

## Abuse cases and boundary checks

- Generating huge batches to exhaust memory: capped at 500.
- Oversized clipboard inputs: command rejects values over 4096 characters.
- Undocumented clipboard clear durations: rejected by the native adapter instead of creating arbitrary secret-retention timers.
- Oversized or malformed custom-symbol input: capped and validated in the Rust core even when the UI is bypassed through direct IPC.
- Invalid passphrase separator/control characters: rejected by core validation.
- Empty character classes after ambiguity filtering: rejected.
- Batch export provider returns/persists unexpected content: readback mismatch is an error; success is not shown.
- Mobile platform configuration loses plugin wiring/safe-area settings: `npm run platform:check` fails.
- Android/iOS source stops compiling: dedicated mobile CI job fails.
- Mismatched release tags and manifest versions: rejected by the release version-consistency gate.

## Accepted residual risks

KeySmith cannot protect secrets from malware, screen capture, process-memory inspection, accessibility-service abuse, OS-level clipboard history, hostile document providers, compromised dependencies, compromised developer devices, compromised signing infrastructure, or a compromised operating system.

Cross-platform compilation also does not prove every device/vendor/store combination. Physical-device and signed-release smoke testing remains a required release gate rather than being hidden behind a generic “cross-platform” claim.
