# Privacy

KeySmith is designed to generate credentials without a server.

## Data processed

Generated passwords and passphrases exist in application memory long enough to display, score, copy, or explicitly export them. KeySmith does not intentionally persist generated secrets, create a password history, send telemetry, or require an account.

The TypeScript UI, Rust process, operating-system clipboard service, and operating-system/webview runtime may each hold temporary in-memory copies while a requested operation is active. KeySmith uses best-effort zeroization for Rust-owned clipboard command buffers where practical, but it does not claim that JavaScript strings, OS clipboard implementations, or all process-memory copies can be erased on demand.

## Non-secret local preferences

The webview may store only non-secret preferences needed for normal operation. The current keys are:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Invalid stored clipboard-clear values fall back to the safe 30-second default in the frontend. The v2.7.4 desktop IPC boundary independently accepts only the documented values `0`, `15`, `30`, `60`, and `120` seconds.

These preference keys must not be repurposed into a generated-secret history or credential database.

## Clipboard

Copying is explicit. If auto-clear is enabled, KeySmith waits for the configured duration, reads the current clipboard, and clears it only if it still matches the copied secret. Clipboard contents may still be observed by the operating system, clipboard history, accessibility services, malware, or other applications; KeySmith cannot control external clipboard managers or a compromised operating system.

The clear-now action is also explicit and clears the current clipboard value regardless of its source, so users should invoke it intentionally.

## Batch exports

Batch export writes plaintext through the local webview download flow. Exported files are outside KeySmith's memory-only secret policy and remain on disk until the user or operating system removes them. Users should store them only in trusted encrypted locations and remove temporary copies when no longer required.

KeySmith intentionally does not retain an internal list of previously exported credentials.

## Network behavior

The production application does not require network access for credential generation. Repository links, email links, and the optional funding link open only after user action.

Release acquisition, repository browsing, email, and funding pages are external activities governed by the selected browser/service rather than KeySmith's offline generation path.

## Logs and analytics

Application code must not log generated credentials or add analytics/telemetry that transmits generation data under the current privacy model. Debugging and support examples should use fictional values only.

## Contact

Privacy questions: `supportramsandesh@gmail.com`.
