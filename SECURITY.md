# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| `2.7.x` | Yes — current release line |
| `< 2.7` | No — upgrade to the current release line |

Security fixes target the latest supported `2.7.x` release and the current `main` branch. Security-sensitive fixes may be released outside the normal feature cadence when necessary.

## Reporting a vulnerability

Do not open a public issue for vulnerabilities that could expose generated secrets, weaken randomness, bypass Tauri permissions, or leak clipboard contents. Email `supportramsandesh@gmail.com` with:

- affected version/commit,
- reproduction steps,
- impact,
- suggested mitigation if known.

Do not include real passwords, tokens, or personal data. Use fictional test values only.

## Security principles

- OS CSPRNG only; no custom cryptography.
- No secret logging, telemetry, or password history.
- Restrictive CSP and narrow IPC commands.
- Clipboard clearing is conditional so KeySmith does not erase unrelated clipboard data.
- Batch export is explicit plaintext with warnings.
- Dependencies are reviewed by Dependabot, CodeQL, and Cargo policy checks in CI where available.

See `THREAT_MODEL.md` for assets, trust boundaries, abuse cases, mitigations, and residual risk.
