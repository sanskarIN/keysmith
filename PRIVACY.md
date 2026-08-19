# Privacy

KeySmith is designed to generate credentials without a server.

## Data processed

Generated passwords and passphrases exist in application memory long enough to display or copy them. KeySmith does not intentionally persist generated secrets, create a password history, send telemetry, or require an account.

Non-secret preferences such as theme and clipboard-clear duration may be stored locally in the webview's local storage.

## Clipboard

Copying is explicit. If auto-clear is enabled, KeySmith waits for the configured duration, reads the current clipboard, and clears it only if it still matches the copied secret. Clipboard contents may still be observed by the operating system or other applications; KeySmith cannot control external clipboard managers.

## Batch exports

Batch export writes plaintext through the local webview download flow. Exported files are outside KeySmith's memory-only secret policy. Users should store them only in trusted encrypted locations and remove temporary copies.

## Network behavior

The production application does not require network access for generation. Repository links, email links, and the optional funding link open only after user action.

## Contact

Privacy questions: `supportramsandesh@gmail.com`.
