# KeySmith Threat Model

## Scope

This model covers local password/passphrase generation, Tauri IPC, clipboard use, local preference storage, native external-link opening, and plaintext batch export. It does not claim to secure a compromised operating system.

## Assets

- Generated passwords and passphrases.
- Randomness quality and policy correctness.
- User trust that generation is local and unlogged.
- Integrity of shipped binaries and update/release process.

## Trust boundaries

1. TypeScript webview ↔ explicitly allowed Tauri commands/plugins.
2. Rust process ↔ operating-system CSPRNG.
3. Rust process ↔ system clipboard.
4. Rust export adapter ↔ native save dialog and user-selected filesystem destination.
5. Webview ↔ operating-system URL/mail handler through the scoped opener plugin.
6. Source/build pipeline ↔ published artifacts.

## Threats and mitigations

| Threat | Mitigation | Residual risk |
| --- | --- | --- |
| Predictable passwords | OS CSPRNG plus rejection sampling; required-class inclusion; security tests | Compromised OS RNG is out of scope |
| Modulo or custom-symbol weighting bias | Rejection sampling over the full `u64` range; candidate sets are deduplicated before selection | Negligible when implementation is correct |
| Weak policy configuration | Core validation, presets, zxcvbn feedback | Users can intentionally choose weak settings |
| Malformed/oversized IPC generation input | Rust core enforces password length, batch count, passphrase word count, separator rules, and custom-symbol limits instead of trusting HTML constraints | A future command could introduce a validation gap if added without review |
| Secret leakage in logs | No password logging or analytics; structured diagnostic redaction for sensitive field names | External debuggers/process inspection are out of scope |
| Clipboard exposure | Explicit copy, bounded clipboard payload, and optional conditional auto-clear | Other apps/clipboard managers may read clipboard before clear |
| Clipboard data destruction or stale timers | One reschedulable worker replaces/cancels older schedules; timeout clears only when clipboard still equals the expected copied value | Race conditions outside app control remain possible |
| Clipboard timer abuse through IPC | Rust accepts only `0`, `15`, `30`, `60`, or `120` seconds; one worker services all schedules instead of spawning an unbounded thread per copy | A compromised webview can still repeatedly invoke allowed commands and consume some CPU |
| XSS/webview compromise | No remote app content, restrictive CSP, global Tauri object disabled, bundled module API, explicit capability activation, and unused commands stripped from builds | Tauri/webview vulnerabilities remain dependency risk |
| Overprivileged IPC | No `core:default`; generation, clipboard, and export permissions are separate; only `main-capability` is enabled | Future permissions require review |
| Arbitrary external navigation | About/contact links are checked against a frontend allowlist and the opener plugin is scoped to the same exact destinations | A compromised OS URL handler is out of scope |
| Arbitrary filesystem access from export | Frontend has no generic filesystem permission; a dedicated Rust command validates bounded export content and opens the native save dialog itself | The user can intentionally choose an insecure destination |
| Plaintext batch export | Explicit action, in-product warning, warning header, native user-selected destination, bounded content, and command-owned buffer zeroization where practical | The resulting file is plaintext and remains outside KeySmith's memory-only policy |
| Stale asynchronous UI results | Generation/export results are revision-checked before mutating the active mode | Native operations already completed cannot be undone by a later mode switch |
| Dependency compromise | Dependabot, npm audit, cargo-deny, full-workspace CodeQL, cross-platform Clippy, and review | Supply-chain risk cannot be eliminated |

## Abuse cases

- Generating huge batches to exhaust memory: capped at 500.
- Oversized clipboard inputs: rejected above 65,536 characters, while the largest supported `500 × 128` password batch plus separators still fits.
- Unsupported clipboard-clear durations: rejected by Rust at the IPC boundary.
- Recopying the same secret with a different clipboard policy: replaces or cancels the previous pending schedule rather than leaving a stale timer active.
- Oversized, invisible, whitespace, or alphanumeric custom-symbol sets: rejected by Rust; custom symbols are capped at 40 visible non-whitespace, non-alphanumeric characters.
- Repeated custom symbols: deduplicated so duplicates do not increase selection probability.
- Invalid custom-symbol text is ignored when symbols are disabled because it cannot influence that generation request.
- Invalid passphrase separator/control characters: rejected by core validation.
- Empty character classes after ambiguity filtering: rejected.
- Malformed or unsupported persisted clipboard-clear values: normalized to the privacy-oriented 30-second default.
- Oversized/malformed batch export payloads: rejected before a native save dialog is opened; export content must have the KeySmith export header, valid control-character shape, trailing newline, and remain within the explicit size bound.
- Unapproved external URLs: rejected by the frontend helper and absent from the Tauri opener capability scope.

## Accepted residual risks

KeySmith cannot protect secrets from malware, screen capture, process-memory inspection, accessibility-service abuse, OS-level clipboard history, compromised URL handlers, compromised dependencies, insecure destinations deliberately selected for plaintext exports, or a compromised build/signing environment. These risks are documented rather than hidden.
