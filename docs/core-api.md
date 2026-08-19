# Rust Core API Reference

`crates/keysmith-core` contains KeySmith's framework-independent credential-generation and strength-estimation logic. It has no Tauri, DOM, filesystem, clipboard, opener, or runtime network responsibility.

## Public surface

`src/lib.rs` re-exports the supported domain API: typed errors, password/batch/passphrase generation, passphrase entropy estimation, policy structures, presets, and strength estimation/result types. The random helper remains crate-private.

## Input structures

Both option structs use Serde camelCase and `deny_unknown_fields`. Unknown frontend/IPC fields therefore fail deserialization instead of being silently ignored.

### `PasswordOptions`

| Field | Default | Contract |
| --- | --- | --- |
| `length` | `20` | 4–128 characters |
| `lowercase` | `true` | enable lowercase ASCII source |
| `uppercase` | `true` | enable uppercase ASCII source |
| `digits` | `true` | enable digit source |
| `symbols` | `true` | enable symbol source |
| `exclude_ambiguous` | `true` | remove configured lookalikes |
| `custom_symbols` | `None` | optional replacement symbol source |

### `PassphraseOptions`

| Field | Default | Contract |
| --- | --- | --- |
| `words` | `5` | 3–12 independent word selections |
| `separator` | `-` | 0–3 characters, no control characters |
| `capitalize` | `false` | deterministic first-character capitalization |
| `include_number` | `false` | append one independent `00`–`99` choice |

## Password validation and generation

`generate_password` enforces the complete security policy in Rust:

1. length must be 4–128;
2. when Symbols is enabled and `custom_symbols` is present, it must contain at most 40 characters and every character must be ASCII punctuation;
3. a non-empty custom-symbol value replaces the built-in symbol source;
4. each source is filtered for configured ambiguous characters;
5. duplicate characters inside a source are removed so repeated user-entered symbols do not increase their selection probability;
6. at least one enabled source must remain non-empty;
7. requested length must be at least the number of enabled required classes;
8. one random character is chosen from every enabled source;
9. remaining characters are independently selected from the combined pool;
10. the result vector is securely shuffled;
11. the intermediate character vector is zeroized after the final `String` is produced.

Built-in sources are ASCII-oriented for predictable compatibility:

```text
lowercase: abcdefghijklmnopqrstuvwxyz
uppercase: ABCDEFGHIJKLMNOPQRSTUVWXYZ
digits:    0123456789
symbols:   !@#$%^&*()-_=+[]{};:,.?/
```

The ambiguity filter removes the configured characters represented by `Il1O0o|` plus backtick, apostrophe, and double quote.

## Custom-symbol rules

A custom symbol source is intentionally narrower than arbitrary Unicode text:

- maximum 40 characters;
- every character must satisfy Rust `is_ascii_punctuation()`;
- duplicate choices are deduplicated before selection;
- ambiguity filtering still applies when requested;
- an empty custom-symbol string falls back to the built-in symbol set;
- an unusable post-filter source fails with `EmptyCharacterSet`.

This policy prevents whitespace, letters/digits, control characters, unbounded strings, or misleading repeated symbols from changing the intended symbol-selection model.

## Randomness model

`src/random.rs` is crate-private.

### `uniform_index(upper_bound)`

- rejects `upper_bound == 0` safely with `EmptyCharacterSet`;
- obtains a uniform 64-bit value through `getrandom::u64()`;
- computes the largest prefix of the 2^64 source range evenly divisible by the requested bound;
- rejects samples outside that prefix;
- only then uses the remainder to map into `[0, upper_bound)`.

This is rejection sampling and avoids modulo bias. There is no fallback PRNG. OS random-source failure returns `RandomSourceUnavailable`.

### `secure_shuffle`

Uses reverse Fisher–Yates. Every swap index is chosen through the same unbiased bounded sampler.

## Batch generation

`generate_batch(options, count)` accepts 1–500 and repeatedly calls `generate_password`. The core has no filesystem/export behavior.

The hardened desktop API returns batch secret values without per-item zxcvbn metadata because the batch workflow does not display/use per-item strength information.

## Passphrase generation

`generate_passphrase` uses `eff_wordlist::large::LIST`, supplied by the published Cargo package `eff-wordlist`.

- each word is selected independently through `uniform_index`;
- repeats are allowed because selections are independent;
- separator validation happens in Rust;
- capitalization is deterministic formatting after selection;
- the optional two-digit suffix is one independent uniform choice from 100 values.

`estimated_passphrase_entropy_bits` models selection space as:

```text
words × log2(word_list_size) + optional log2(100)
```

It does not add entropy for deterministic capitalization or separator settings.

## Strength estimation

`estimate_strength` delegates to zxcvbn and returns a stable serializable `StrengthEstimate` containing:

- score (0–4);
- estimated guesses;
- log10 guess estimate;
- core label.

The presentation layer may localize the human-readable label from the numeric score. Strength output is advisory and is not used to accept/reject a generated credential.

## Presets

The Rust core is the source of truth for preset IDs/options. The frontend localizes preset names/descriptions separately so translations cannot silently change security policy.

Current stable IDs are:

- `balanced`
- `maximum`
- `legacy`
- `alphanumeric`

## Error model

`KeySmithError` variants are:

| Variant | Meaning |
| --- | --- |
| `InvalidLength` | password length outside 4–128 |
| `EmptyCharacterSet` | no enabled usable source or zero selection bound |
| `LengthBelowRequiredSets` | requested password too short to include every enabled class |
| `InvalidCustomSymbols` | custom symbols exceed 40 chars or contain non-ASCII-punctuation |
| `InvalidBatchSize` | batch count outside 1–500 |
| `InvalidWordCount` | passphrase words outside 3–12 |
| `InvalidSeparator` | separator too long or contains control characters |
| `RandomSourceUnavailable` | OS CSPRNG failed |

Errors are structural/policy messages and do not contain generated values.

## Memory hygiene

The core uses `zeroize` for mutable intermediate password vectors. This is best-effort reduction of secret lifetime, not a proof that no copy exists in allocator history, returned `String`, IPC serialization, frontend memory, clipboard, or saved export.

## Test coverage

The core currently has:

- unit tests in implementation modules for source deduplication, ambiguity filtering, and zero-bound random behavior;
- `tests/security.rs` for security invariants/edge cases;
- `tests/properties.rs` for generated-output properties across ranges;
- `tests/serialization.rs` for strict Serde/camelCase boundary behavior;
- `tests/validation.rs` for malformed/invalid policy inputs.

Security-sensitive changes should add the narrowest regression test before behavior is considered complete.

## Dependencies

- `getrandom` — OS cryptographic randomness;
- Cargo package `eff-wordlist` / Rust crate `eff_wordlist` — packaged EFF large Diceware list;
- `zxcvbn` — strength estimation;
- `serde` — IPC-safe serialization/deserialization;
- `thiserror` — typed errors;
- `zeroize` — best-effort mutable secret/intermediate cleanup;
- `proptest` and `serde_json` — test-only property/serialization coverage.

`deny.toml`, CI, Dependabot, npm audit, CodeQL, and the release process provide separate dependency/security gates.

## Required core checks

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
```

A stable release also requires cargo-deny plus full desktop/platform verification; see [`testing.md`](testing.md) and [`verification.md`](verification.md).
