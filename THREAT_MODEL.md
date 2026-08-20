# KeySmith Threat Model

## Scope

This model covers local password/passphrase generation, Tauri IPC, clipboard use, local preference storage, and batch export. It does not claim to secure a compromised operating system.

## Assets

- Generated passwords and passphrases.
- Randomness quality and policy correctness.
- User trust that generation is local and unlogged.
- Integrity of shipped binaries and update/release process.

## Trust boundaries

1. TypeScript webview ↔ Tauri IPC.
2. Rust process ↔ operating-system CSPRNG.
3. Rust process ↔ system clipboard.
4. Webview ↔ user-selected export destination.
5. Source/build pipeline ↔ published artifacts.

## Threats and mitigations

| Threat | Mitigation | Residual risk |
| --- | --- | --- |
| Predictable passwords | OS CSPRNG plus rejection sampling; required-class inclusion; security tests | Compromised OS RNG is out of scope |
| Modulo bias | Rejection sampling over the full `u64` range | Negligible when implementation is correct |
| Weak policy configuration | Validation, presets, zxcvbn feedback | Users can intentionally choose weak settings |
| Malformed custom-symbol policy | Backend caps custom symbols at 40, rejects alphanumeric/whitespace/control input, removes ambiguous characters when requested, and deduplicates symbols | Unicode display confusables outside the explicit ambiguity set can still look similar |
| Secret leakage in logs | No password logging or analytics; review policy | External debuggers/process inspection are out of scope |
| Clipboard exposure | Explicit copy, supported-duration allowlist, size policy derived from the largest valid batch, optional conditional auto-clear, and zeroizing wrappers for owned command buffers | Other apps/clipboard managers may read clipboard before clear; OS clipboard APIs necessarily receive a copy |
| Clipboard data destruction | Clear only when clipboard still equals copied secret | Race conditions outside app control remain possible |
| XSS/webview compromise | No remote content, restrictive CSP, local assets | Tauri/webview vulnerabilities remain dependency risk |
| Overprivileged IPC | Small command surface and capability permissions | Future commands require review |
| Plaintext batch export | Warning and explicit action | User-selected storage may be insecure |
| Dependency compromise | Dependabot, CodeQL, cargo-deny policy, review | Supply-chain risk cannot be eliminated |
| Release/version mismatch | CI checks frontend, Rust workspace, Tauri, and visible UI version metadata; release tags are compared with repository metadata | A release must still pass the complete CI and packaging gate |

## Abuse cases

- Generating huge batches to exhaust memory: capped at 500.
- Oversized clipboard inputs: the command accepts at most the exact character count needed for the largest valid 500 × 128-character batch plus its newline separators (`64,499` characters), then rejects larger IPC values.
- Undocumented clipboard clear durations: rejected by the desktop adapter instead of creating arbitrary secret-retention timers.
- Oversized or malformed custom-symbol input: capped and validated in the Rust core even when the UI is bypassed through direct IPC.
- Invalid passphrase separator/control characters: rejected by core validation.
- Empty character classes after ambiguity filtering: rejected.
- Mismatched release tags and manifest versions: rejected by the release version-consistency gate.

## Accepted residual risks

KeySmith cannot protect secrets from malware, screen capture, process-memory inspection, accessibility-service abuse, OS-level clipboard history, compromised dependencies, or a compromised build/signing environment. These risks are documented rather than hidden.
