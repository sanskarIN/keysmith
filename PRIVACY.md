# Privacy

KeySmith is designed to generate credentials locally without an application server on Windows, macOS, Linux, Android, and iOS/iPadOS.

## Data processed

Generated passwords and passphrases exist in application memory long enough to display, score, copy, or explicitly export them. KeySmith does not intentionally persist generated secrets, create a password history, send telemetry, or require an account.

The TypeScript UI, Rust process, operating-system webview/runtime, clipboard service, and explicitly selected file provider may each hold temporary copies while a requested operation is active. KeySmith uses best-effort zeroization for Rust-owned clipboard command buffers where practical, but it does not claim that JavaScript strings, operating-system clipboard implementations, document providers, or all process-memory copies can be erased on demand.

## Non-secret local preferences

The webview may store only non-secret preferences needed for normal operation. The current keys are:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Invalid stored clipboard-clear values fall back to the safe 30-second default in the frontend. The v2.7.4 native IPC boundary independently accepts only the documented values `0`, `15`, `30`, `60`, and `120` seconds on every supported native target.

These preference keys must not be repurposed into a generated-secret history or credential database.

## Clipboard

Copying is explicit. KeySmith uses Tauri's cross-platform clipboard plugin for plaintext text, which is the only clipboard data type required by the product.

If auto-clear is enabled, KeySmith waits for the configured duration, reads the current clipboard, and clears it only if it still matches the copied secret. Clipboard contents may still be observed by the operating system, clipboard history, accessibility services, malware, or other applications; KeySmith cannot control external clipboard managers or a compromised operating system.

Mobile operating systems may apply their own clipboard visibility, notification, or background-execution policies. KeySmith does not attempt to bypass those platform protections.

The clear-now action is explicit and clears the current clipboard value regardless of its source, so users should invoke it intentionally.

## Batch exports

Batch export is explicit plaintext. KeySmith opens the native save UI and receives a scoped filesystem path/URI selected by the user. It writes the requested text and then reads the destination back. A success message is shown only if the readback exactly matches the intended export.

This verification prevents KeySmith from silently claiming that a mobile document provider saved credentials when the provider did not preserve the requested content.

Exported files are outside KeySmith's memory-only secret policy and remain under the destination/provider's control until the user or operating system removes them. Users should store exports only in trusted encrypted locations and remove temporary copies when no longer required.

KeySmith intentionally does not retain an internal list of previously exported credentials or recently used export paths.

## Mobile generated projects

Android Studio and Xcode projects under `src-tauri/gen/` are generated build inputs and are not used as a secret store. They are ignored by Git and regenerated from committed source/configuration.

The iOS preparation step writes Apple's required filesystem privacy manifest into the generated Apple project. It contains API-reason metadata only and no user data.

## Network behavior

Production credential generation does not require network access. Repository links, email links, and the optional funding link open only after user action.

During Android/iOS development, Tauri may expose the local Vite development server to a connected device. That development-only connection is not part of production generation and should be used only on a trusted development network.

Release acquisition, app-store activity, repository browsing, email, and funding pages are external activities governed by the selected platform/service rather than KeySmith's offline generation path.

## Logs and analytics

Application code must not log generated credentials or add analytics/telemetry that transmits generation data under the current privacy model. Debugging, CI, screenshots, and support examples must use fictional values only.

## Platform signing data

Android keystores, Apple signing identities/private keys, provisioning secrets, App Store Connect credentials, and other release secrets are not application data and must never be committed to the repository.

## Contact

Privacy questions: `supportramsandesh@gmail.com`.
