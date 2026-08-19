# ADR 0002: OS CSPRNG and no secret persistence

- Status: Accepted
- Date: 2026-08-19

## Context

Password generators fail catastrophically if randomness is predictable or secrets are retained unexpectedly.

## Decision

Use `getrandom` to obtain operating-system cryptographic randomness and use rejection sampling for bounded selection. Do not persist generated secrets or create password history. Store only non-secret UI preferences.

## Consequences

The product remains useful offline and has a small privacy footprint. Users who need history/storage should use a dedicated password manager rather than turning KeySmith into a secret database.
