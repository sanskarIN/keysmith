# KeySmith User Guide

KeySmith is an offline-first desktop password and passphrase generator for Windows, macOS, and Linux. Generation happens locally in the Rust core. The application does not provide accounts, telemetry, a password vault, cloud sync, or intentional generated-secret history.

## First launch

A first-run onboarding dialog explains the product's security model. Completing onboarding stores only the non-secret `keysmith.onboardingComplete` preference. The introduction can be reopened from Settings.

## Generator modes

KeySmith has three keyboard-accessible modes:

- **Password** — generate one password and view a strength estimate.
- **Passphrase** — generate an EFF large Diceware phrase and view strength plus selection-space entropy.
- **Batch** — generate multiple independent passwords and optionally copy or save them as warned plaintext.

Left/Right Arrow switches the generator tabs when a mode tab is focused. Changing mode invalidates any in-flight generation/save result and resets the previous visible secret/batch so stale async results cannot overwrite the newly selected mode.

## Password mode

### Length

Supported length is 4–128 characters. Rust validates the range even if UI constraints are bypassed.

### Character sets

Enable any combination of lowercase letters, uppercase letters, digits, and symbols. At least one set must remain usable. For every enabled class, generation includes at least one character from that class when the requested length is sufficient.

### Ambiguous characters

**Exclude ambiguous characters** removes configured lookalikes from every enabled source. If custom symbols become empty after filtering, generation fails safely instead of silently substituting another policy.

### Custom symbols

When Symbols is enabled, a non-empty Custom symbols value replaces the built-in symbol source. An exactly empty field uses the built-in symbols. The frontend deliberately does not trim this value before sending it to Rust, so a user's explicitly entered symbol characters are not silently rewritten.

### Presets

The secure core owns four preset definitions:

- **Balanced** — general modern account use.
- **Maximum** — longer all-class password for higher-value credentials.
- **Legacy compatible** — narrower policy for older services.
- **Alphanumeric** — letters/digits for services that reject symbols.

Preset names/descriptions are localized in the presentation layer, while their actual security-policy options come from Rust.

## Passphrase mode

Passphrases use the packaged EFF large Diceware list through the Cargo package `eff-wordlist` (Rust crate identifier `eff_wordlist`). No runtime word-list request is made.

Options:

- 3–12 independently selected words;
- separator of 0–3 non-control characters;
- optional capitalization of each selected word;
- optional independently selected two-digit suffix from `00` through `99`.

The displayed entropy number is selection-space entropy based on word-list size, word count, and the optional 100-value suffix. Deterministic capitalization and separator settings are not counted as extra randomness.

## Strength estimates

Single-password and passphrase results include a zxcvbn-based score from 0–4 plus a localized human-readable label. Strength scoring is advisory. It does not prove that an account, endpoint, clipboard, export file, or reused credential is safe.

Batch results intentionally omit per-item strength metadata from the IPC result because the batch workflow needs only the generated values.

## Batch mode

Batch generation accepts 1–500 passwords using the same password policy controls.

### Copy all

Copy all joins the current batch with newline separators and sends it to the same native clipboard command used for a single value. The native command's maximum size is large enough for the maximum supported 500 × 128-character batch plus separators.

### Native plaintext export

**Export** constructs text with:

- `# KeySmith batch export` header;
- ISO creation timestamp;
- `# WARNING:` line using localized warning text;
- generated values in order;
- trailing newline.

The content is then sent to a dedicated Rust `export_batch_command`. Rust validates the header/shape, control characters, trailing newline, and maximum size before opening the operating system's native save dialog. The user chooses the destination; cancelling returns to KeySmith without writing a file.

The export is plaintext by design. KeySmith does not claim that the saved file is encrypted. Treat it as usable credential material and store/delete it accordingly.

KeySmith exposes no generic filesystem browser or arbitrary-path write command to the frontend.

## Clipboard behavior

Clipboard access is explicit. KeySmith does not automatically copy every generated result.

Supported auto-clear settings are exactly:

- Never (`0` seconds);
- 15 seconds;
- 30 seconds (default preference);
- 1 minute;
- 2 minutes.

The Rust command rejects unsupported delay values rather than accepting arbitrary frontend-controlled timing.

### Replaceable auto-clear schedule

KeySmith uses one process-wide clipboard-clear worker. When another secret is copied, the newer schedule replaces the older pending schedule. Copying with **Never** cancels a pending schedule. **Clear clipboard now** also cancels the pending schedule.

When a scheduled deadline arrives, KeySmith reads the current clipboard and clears it only if it still exactly matches the copied value. If you copied something else in the meantime, KeySmith preserves the newer clipboard contents.

The current clipboard command accepts up to 65,536 characters so the largest supported batch can be copied while still bounding IPC/native memory use.

Clipboard managers, remote-desktop tools, accessibility tools, malware, or other processes may observe/retain clipboard values outside KeySmith's control.

## Settings and appearance

### Theme

Choose **System**, **Light**, or **Dark**. System follows the operating-system `prefers-color-scheme` setting. The top-bar theme button cycles through the same three preferences.

### Stored preferences

Only these non-secret preferences are intentionally stored by the frontend:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

Generated passwords, passphrases, batches, strength values, entropy values, export destinations, and clipboard contents are not intentionally written to browser storage.

## About and external links

About contains project/version/license/credit/support information. External destinations are opened through Tauri's native opener plugin only after explicit user activation.

Both frontend and native capability configuration use exact allowlists for:

- GitHub profile/project destination;
- Buy Me a Coffee;
- support email;
- two business email destinations.

An arbitrary URL is rejected by the frontend and is not granted by the native capability.

## Localization

The current product is English-first. Static markup uses `data-i18n` attributes, runtime status text comes from the English catalog, and preset/strength labels have dedicated localization adapters. Security policy and command identifiers are not translated.

See [`i18n.md`](i18n.md) for the localization boundary.

## Logging and diagnostics

KeySmith does not use telemetry/analytics. The repository includes a safe diagnostic-data redaction helper for any future/local diagnostic use. Sensitive key names such as password, passphrase, secret, token, credential, authorization, cookies, private keys, paths, and email are redacted, and nested depth is bounded.

Generated values should never be pasted into bug reports. See [`logging.md`](logging.md) and root [`SECURITY.md`](../SECURITY.md).

## Accessibility

The UI includes semantic labels/grouping, a skip link, keyboard-operable tabs, visible focus, live status/output regions, dialog labels, responsive/scalable layout, non-color-only status meaning, and reduced-motion support. The repository also contains static accessibility, contrast, real-markup integration, and keyboard regression tests.

Packaged desktop accessibility still requires manual verification on target platforms; see [`accessibility.md`](accessibility.md) and [`verification.md`](verification.md).

## Offline/privacy model

Credential generation, clipboard handling, settings, and native export do not require an application network service. External network/mail destinations are reached only after explicit About-link actions and are handed to the operating system.

No telemetry or analytics request is intentionally performed.

## Safe-use checklist

1. Generate a unique credential for each account.
2. Prefer the longest policy the target service supports.
3. Store long-term credentials in a reputable password manager rather than KeySmith export files or notes.
4. Copy only when necessary and use auto-clear where practical.
5. Treat exported batches as sensitive plaintext.
6. Do not post real generated credentials, clipboard contents, export paths, tokens, or private keys in issues/screenshots.
7. Verify the target service before entering a credential; generation does not protect against phishing or endpoint compromise.

## Troubleshooting

For setup, Tauri bridge, native save dialog, clipboard, policy, CI, packaging, or platform problems, see [`troubleshooting.md`](troubleshooting.md). For development prerequisites, see [`setup.md`](setup.md).
