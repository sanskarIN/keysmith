# Privacy

KeySmith is designed to generate credentials without a server.

## Data processed

Generated passwords and passphrases exist in application memory long enough to display, copy, or explicitly export them. KeySmith does not intentionally persist generated secrets, create a password history, send telemetry, or require an account.

Non-secret preferences such as theme, onboarding completion, and clipboard-clear duration may be stored locally in the webview's local storage.

## Clipboard

Copying is explicit. If auto-clear is enabled, KeySmith keeps only one pending clear schedule. A newer copy replaces the previous schedule, while choosing `Never` or manually clearing the clipboard cancels it. At timeout KeySmith clears the clipboard only if it still matches the copied secret. Clipboard contents may still be observed by the operating system or other applications; KeySmith cannot control external clipboard managers.

## Batch exports

Batch export is an explicit plaintext operation. KeySmith prepares a warning-bearing text export, sends it through a bounded custom Tauri command, and the Rust desktop adapter opens the native save dialog. The frontend has no general filesystem-write permission. The application writes only after the user chooses a destination, and the command-owned plaintext buffer is zeroized after use where practical.

Exported files are outside KeySmith's memory-only secret policy. Store them only in trusted encrypted locations and remove temporary copies when they are no longer needed.

## External links

Repository, funding, support, and business-contact links open only after user action. KeySmith routes these through the operating system using an exact frontend allowlist plus a matching Tauri opener capability scope. Arbitrary external URLs are not part of the allowed UI flow.

## Network behavior

Credential generation, passphrase selection, strength estimation, clipboard handling, and export do not require an application server or telemetry endpoint. User-initiated external links may cause the operating system, browser, or mail client to access the selected destination.

## Contact

Privacy questions: `supportramsandesh@gmail.com`.
