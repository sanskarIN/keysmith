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
| Weak policy configuration | Core validation, presets, zxcvbn feedback | Users can intentionally choose weak settings |
| Malformed/oversized IPC generation input | Rust core enforces password length, batch count, passphrase word count, separator rules, and custom-symbol limits instead of trusting HTML constraints | A future command could introduce a new validation gap if added without review |
| Secret leakage in logs | No password logging or analytics; structured diagnostic redaction for sensitive field names | External debuggers/process inspection are out of scope |
| Clipboard exposure | Explicit copy, optional conditional auto-clear, bounded clipboard payload | Other apps/clipboard managers may read clipboard before clear |
| Clipboard data destruction | Clear only when clipboard still equals copied secret | Race conditions outside app control remain possible |
| XSS/webview compromise | No remote content, restrictive CSP, local assets | Tauri/webview vulnerabilities remain dependency risk |
| Overprivileged IPC | Small command surface and capability permissions | Future commands require review |
| Plaintext batch export | Warning and explicit action | User-selected storage may be insecure |
| Dependency compromise | Dependabot, CodeQL, cargo-deny policy, review | Supply-chain risk cannot be eliminated |

## Abuse cases

- Generating huge batches to exhaust memory: capped at 500.
- Oversized clipboard inputs: command rejects values over 65,536 characters, which still permits the largest supported 500 × 128-character batch plus separators.
- Oversized, invisible, whitespace, or alphanumeric custom-symbol sets: rejected by the Rust core; custom symbols are capped at 40 visible non-whitespace, non-alphanumeric characters so the symbol class cannot silently become another letter/digit class.
- Invalid custom-symbol text is ignored when symbols are disabled because it cannot influence that generation request.
- Invalid passphrase separator/control characters: rejected by core validation.
- Empty character classes after ambiguity filtering: rejected.
- Unsupported persisted clipboard-clear values: normalized to the privacy-oriented 30-second default.

## Accepted residual risks

KeySmith cannot protect secrets from malware, screen capture, process-memory inspection, accessibility-service abuse, OS-level clipboard history, compromised dependencies, or a compromised build/signing environment. These risks are documented rather than hidden.
