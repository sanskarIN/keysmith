# Logging and Redaction

KeySmith does not create a password-history log, analytics stream, telemetry feed, or production event log containing generated credentials.

## Policy

- Never pass generated passwords, passphrases, batch contents, clipboard contents, exported plaintext, private filesystem paths, authentication headers, tokens, email credentials, or other sensitive user content to a logger.
- Prefer stable event codes, counts, bounded durations, component names, and boolean state when diagnostic metadata is genuinely needed.
- The TypeScript `redactForLog` helper is defense in depth for structured diagnostic objects. It replaces values whose field names indicate passwords, passphrases, secrets, tokens, authorization data, cookies, emails, credentials, API keys, sessions, or private keys and bounds recursion depth.
- Redaction is not permission to log secret-bearing objects. Secret values under an unexpected field name could still be sensitive, so the primary defense remains data minimization.
- Rust generation, clipboard, export, and native-link paths do not log secret values.
- User-facing native-export errors intentionally avoid echoing the selected local filesystem path.
- External-link failures should identify the operation generically; exact approved destinations are already fixed product metadata and do not require diagnostic logging.

## Test and benchmark data

Use clearly fictional deterministic strings in tests, profiler labels, benchmark fixtures, screenshots, and examples. Never copy an actual password or exported credential set into a regression test.

Do not log a generated value simply to prove randomness. Security tests should verify properties/invariants instead.

## Production posture

The current application does not emit persistent production logs. If future troubleshooting needs structured operational logging, it must:

- remain local by default,
- use an explicit allowlist of non-sensitive event fields,
- pass structured data through redaction,
- never include generated-secret/export/clipboard contents,
- have a defined retention/deletion policy,
- update `PRIVACY.md`, `THREAT_MODEL.md`, and release notes before shipping.

Remote telemetry/analytics is not implied by the existence of the redaction helper and would require a separate explicit product/privacy/security decision.
