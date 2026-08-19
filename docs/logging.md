# Logging and Redaction

KeySmith does not create a password-history log, analytics stream, telemetry feed, or production event log containing generated credentials.

## Policy

- Never pass generated passwords, passphrases, clipboard contents, authentication headers, tokens, email addresses, or other sensitive user content to a logger.
- Prefer stable event codes, counts, durations, component names, and boolean state when diagnostic metadata is genuinely needed.
- The TypeScript `redactForLog` helper is defense in depth for structured diagnostic objects. It replaces values whose field names indicate passwords, passphrases, secrets, tokens, authorization data, cookies, or email addresses and bounds recursion depth.
- Redaction is not permission to log secret-bearing objects. Secret values under an unexpected field name could still be sensitive, so the primary defense remains data minimization.
- Rust generation and clipboard commands do not log secret values.

## Production posture

The current application does not emit persistent production logs. If future troubleshooting needs structured operational logging, it must remain local by default, use an explicit allow-list of non-sensitive event fields, pass through redaction, and update `PRIVACY.md` and `THREAT_MODEL.md` before release.
