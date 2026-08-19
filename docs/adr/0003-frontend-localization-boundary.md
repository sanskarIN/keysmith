# ADR 0003 — Keep localization in the presentation boundary

- Status: Accepted
- Date: 2026-08-19

## Context

KeySmith must be internationalization-ready while keeping security-sensitive password generation deterministic, reviewable, and independent of UI language. Rust currently returns preset metadata, strength labels, and typed validation errors that are useful fallbacks, while the frontend owns all visible interaction copy.

Translating domain identifiers or generation rules inside the Rust core would couple security logic to presentation concerns and make future locale work riskier. Conversely, scattering English strings through event handlers would make additional locales difficult and inconsistent.

## Decision

KeySmith keeps localization in the TypeScript presentation boundary.

- Stable backend values such as preset IDs and zxcvbn score numbers remain locale-independent.
- `src/i18n/en.ts` is the canonical shipped English catalog.
- Static markup uses localization data attributes while retaining readable English fallback text.
- Runtime copy uses catalog entries or small typed formatters.
- Preset and strength display helpers map stable backend values to localized frontend copy and preserve backend fallbacks for unknown future values.
- Security validation, randomness, entropy calculations, and generated secrets are never translated.
- Locale preference, when introduced, must remain non-secret local configuration.

## Consequences

### Positive

- The Rust core stays small and security-focused.
- Frontend copy can be reviewed and translated without changing password-generation behavior.
- Unknown backend values degrade gracefully instead of breaking the UI.
- Accessibility labels and visible copy share the same catalog discipline.

### Trade-offs

- Backend error strings remain English until a structured error-code protocol is introduced.
- Each additional locale must maintain the complete catalog key set and receive UI expansion/accessibility review.
- The EFF Diceware word list is not automatically localized; a different passphrase language would require a separately reviewed source and entropy model.

## Alternatives considered

### Localize inside Rust

Rejected because it couples domain/security code to UI locale selection and expands the trusted core surface.

### Keep hard-coded English strings until a second language ships

Rejected because the master architecture requires internationalization readiness and retrofitting scattered UI strings later would create avoidable inconsistency.
