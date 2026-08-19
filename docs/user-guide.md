# KeySmith User Guide

KeySmith is an offline-first desktop password and passphrase generator for Windows, macOS, and Linux. Generation is performed locally by the Rust core through the Tauri desktop bridge. The application does not require an account and does not intentionally store generated credentials.

## First launch

On the first launch, KeySmith shows a short onboarding dialog explaining three product guarantees:

1. credential generation uses operating-system cryptographic randomness;
2. generated secrets are not stored in a password history;
3. clipboard clearing is optional and conditional.

Choosing **Start generating** stores only the non-secret boolean preference `keysmith.onboardingComplete=true` in local storage. The introduction can be reopened from **Settings → Help & onboarding**.

## Generator modes

The three tabs at the top of the generator are **Password**, **Passphrase**, and **Batch**. They form a keyboard-accessible tab list. Left and Right Arrow move between modes when a tab has focus.

Switching mode clears the currently displayed generated value from the application UI state and resets the output area. It does not modify the operating-system clipboard.

## Password mode

### Length

Password length can be selected from **4 through 128 characters**. The Rust core enforces the same range, so invalid values are rejected even if the UI is bypassed.

### Character sets

Any combination of the following sets can be enabled:

- lowercase ASCII letters;
- uppercase ASCII letters;
- digits;
- symbols.

At least one set must be enabled. The generated password contains at least one character from every enabled set, provided the requested length is long enough to satisfy that requirement.

### Excluding ambiguous characters

**Exclude ambiguous characters** removes characters that are commonly confused in some fonts, including selected letter/digit lookalikes and punctuation. The filter is applied to every enabled source set, including custom symbols.

### Custom symbols

When Symbols is enabled, the optional **Custom symbols** field replaces the built-in symbol set for that generation request. An empty custom-symbol field uses the built-in set.

If ambiguity exclusion removes every character from a selected custom-symbol set, generation is rejected instead of silently weakening or changing the policy.

### Presets

KeySmith currently exposes four Rust-defined presets:

| Preset | Purpose | Important behavior |
| --- | --- | --- |
| Balanced | General modern accounts | 20 characters, all standard classes, ambiguous characters excluded |
| Maximum | High-value credentials/vaults | 32 characters, all standard classes, ambiguity exclusion disabled |
| Legacy compatible | Older sites with narrower symbol rules | 16 characters and a conservative custom symbol set |
| Alphanumeric | Sites that reject symbols | 24 characters, letters and digits only |

Selecting a preset replaces the visible password controls with the preset values. Manually changing length returns the preset selector to **Custom**.

## Passphrase mode

Passphrases use the packaged EFF large Diceware list supplied by the `eff_wordlist` Rust dependency.

### Word count

Choose **3 through 12 words**. Every word selection is independent and uses the operating-system-backed random sampler.

### Separator

The separator may contain **0 through 3 characters** and may not contain control characters. An empty separator is valid and joins words directly.

### Capitalization

**Capitalize words** uppercases the first ASCII character of each selected word. This is a presentation transformation of the selected words; it is not counted as additional random selection entropy.

### Two-digit suffix

**Append two digits** adds a uniformly selected number from `00` through `99`. The entropy estimate accounts for this as 100 possible suffix values.

### Entropy message

After passphrase generation, the status region reports estimated **selection-space entropy**. This estimate reflects the size of the word list, number of independent word selections, and optional numeric suffix. It is not a guarantee about memorability, resistance to user modification, or the security of a reused passphrase.

## Batch mode

Batch mode generates **1 through 500 passwords** using the same password options as Password mode.

### Copy all

**Copy all** joins the generated passwords with newline separators and sends the resulting text to the explicit clipboard command. Clipboard auto-clear applies to the combined text exactly as it does to a single password.

### Export `.txt`

**Export .txt** creates a plaintext file in the frontend with:

- a KeySmith export header;
- an ISO timestamp;
- a warning that the file contains usable credentials;
- one generated password per line.

The export is intentionally plaintext. KeySmith does not claim that the exported file is encrypted. Store it only where plaintext credentials are appropriate, preferably inside a trusted encrypted workflow, and delete temporary copies when finished.

## Strength information

Password and passphrase strength labels are produced by the Rust core using `zxcvbn`. The UI displays its score on a 0–4 scale and a human-readable label.

Strength scoring is an estimate, not a proof of safety. Account-specific restrictions, password reuse, phishing, endpoint compromise, and exposure after copying/export are outside the strength meter's scope.

## Clipboard behavior

Clipboard use is explicit. KeySmith does not automatically copy every generated value.

Available clear delays are:

- Never;
- 15 seconds;
- 30 seconds (default);
- 1 minute;
- 2 minutes.

When a delay is enabled, the desktop command remembers the copied value in a temporary in-process buffer, waits for the requested delay, then clears the clipboard **only if the clipboard still exactly matches that value**. If you copied something else meanwhile, KeySmith leaves the newer clipboard contents untouched.

The Rust command caps delayed clearing at 300 seconds and rejects clipboard inputs longer than 4096 characters. Secret buffers handled by the command are zeroized where practical after use.

**Clear clipboard now** writes an empty string to the system clipboard immediately. Clipboard managers, accessibility tools, remote-desktop software, malware, or other operating-system processes may still have observed or retained prior clipboard contents.

## Settings

### Appearance

Choose **System**, **Light**, or **Dark**. The top-bar theme button cycles System → Light → Dark → System.

When **System** is selected, KeySmith listens for operating-system color-scheme changes and updates the page theme without changing the stored preference.

### Privacy & data

The settings page reiterates the data model: no account, telemetry, cloud sync, or password history. Only the following non-secret preferences are intentionally stored by the frontend:

- `keysmith.clipboardClearSeconds`
- `keysmith.theme`
- `keysmith.onboardingComplete`

### Accessibility

The UI includes semantic labels/fieldsets, visible focus styling, a skip link, keyboard-operable tabs, status announcements, reduced-motion support, scalable layout, and non-color-only status text. See [`accessibility.md`](accessibility.md) for the maintained accessibility checklist.

### Updates

KeySmith performs no silent background update check. Versioned releases are produced through the repository release workflow.

## About and project links

The About dialog contains the application version, Apache-2.0 license identifier, the visible credit **Made by the Sanskar**, project/support contacts, GitHub, and Buy Me a Coffee.

## What KeySmith does not do

KeySmith is intentionally a generator rather than a password manager. It does not provide:

- a credential vault;
- password history;
- account login;
- cloud synchronization;
- telemetry/analytics;
- background network-based generation;
- encrypted batch-file storage;
- a guarantee that the operating-system clipboard is private.

## Safe-use checklist

1. Prefer a unique generated password for every account.
2. Use the longest policy the target service accepts.
3. Keep ambiguity exclusion enabled when readability matters, but do not treat it as a security requirement.
4. Copy only when needed and use clipboard auto-clear where practical.
5. Treat batch exports as sensitive plaintext.
6. Store long-term credentials in a reputable password manager rather than in KeySmith export files or notes.
7. Do not post real generated credentials in bug reports or support requests.

## Troubleshooting

For desktop bridge errors, missing Tauri prerequisites, clipboard failures, Linux packages, build problems, or release issues, see [`troubleshooting.md`](troubleshooting.md). For installation and source-development prerequisites, see [`setup.md`](setup.md).
