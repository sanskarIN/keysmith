# Rust Core API Reference

`crates/keysmith-core` contains all credential-generation and strength-estimation logic that does not depend on Tauri or browser APIs. Keeping this crate framework-independent allows its security invariants to be tested without a desktop shell.

## Public API surface

`crates/keysmith-core/src/lib.rs` re-exports the supported public API:

```rust
pub use error::KeySmithError;
pub use generator::{generate_batch, generate_password};
pub use passphrase::{estimated_passphrase_entropy_bits, generate_passphrase};
pub use policy::{PassphraseOptions, PasswordOptions};
pub use presets::{presets, PasswordPreset};
pub use strength::{estimate_strength, StrengthEstimate};
```

Internal modules such as `random` remain crate-private so callers cannot accidentally depend on implementation details of the random sampler.

## `PasswordOptions`

Defined in `src/policy.rs` and serialized with camelCase field names for compatibility with the TypeScript/Tauri boundary.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `length` | `usize` | `20` | Requested password length; valid range is 4–128 |
| `lowercase` | `bool` | `true` | Include lowercase ASCII letters |
| `uppercase` | `bool` | `true` | Include uppercase ASCII letters |
| `digits` | `bool` | `true` | Include ASCII digits |
| `symbols` | `bool` | `true` | Include symbols |
| `exclude_ambiguous` | `bool` | `true` | Remove known ambiguous characters from enabled sets |
| `custom_symbols` | `Option<String>` | `None` | Replace the built-in symbol source when non-empty |

The Rust layer is authoritative. UI range controls are convenience constraints, not the security boundary.

## Password generation contract

### `generate_password(&PasswordOptions) -> Result<String, KeySmithError>`

The algorithm in `src/generator.rs` performs these steps:

1. Validate length as 4–128 characters.
2. Select the enabled lowercase, uppercase, digit, and symbol sources.
3. If a non-empty custom symbol string exists, use it instead of the built-in symbol set.
4. Remove configured ambiguous characters when requested.
5. Reject an empty overall policy or any enabled set that became empty after filtering.
6. Reject a requested length smaller than the number of enabled required sets.
7. Select one random character from every enabled set.
8. Fill remaining positions from the flattened enabled pool.
9. Securely shuffle the complete vector so required-set characters are not tied to predictable positions.
10. Return the resulting string.

### Security invariants

- Every random index is selected through `random::uniform_index`.
- Selection uses rejection sampling, avoiding modulo bias for non-power-of-two bounds.
- The random source is `getrandom::u64()`, which delegates to the operating system's secure randomness facilities.
- Every enabled character class appears at least once.
- No fallback PRNG exists. Failure of the OS random source returns `RandomSourceUnavailable`.
- `unsafe` Rust is forbidden by workspace lint policy.

### Built-in character sources

The built-in sources are ASCII-oriented for predictable website compatibility:

- lowercase: `a-z`
- uppercase: `A-Z`
- digits: `0-9`
- symbols: `!@#$%^&*()-_=+[]{};:,.?/`

The ambiguity filter currently removes characters from the set represented by `Il1O0o|` plus backtick, apostrophe, and double quote.

## Batch generation

### `generate_batch(&PasswordOptions, count) -> Result<Vec<String>, KeySmithError>`

- valid batch size: 1–500;
- each item is generated independently by `generate_password`;
- a failure aborts collection and returns the error;
- the core does not write files or touch the clipboard.

The TypeScript frontend owns plaintext export formatting, and the desktop adapter owns clipboard access.

## Passphrase generation

### `PassphraseOptions`

| Field | Type | Default | Contract |
| --- | --- | --- | --- |
| `words` | `usize` | `5` | 3–12 independent selections |
| `separator` | `String` | `"-"` | 0–3 characters; no control characters |
| `capitalize` | `bool` | `false` | Uppercase the first ASCII character of each selected word |
| `include_number` | `bool` | `false` | Append one uniform value from 00–99 |

### `generate_passphrase(&PassphraseOptions)`

The function uses `eff_wordlist::large::LIST`. Each word index is selected independently with the same unbiased `uniform_index` helper used for passwords.

When `capitalize` is enabled, capitalization is deterministic after word selection. When `include_number` is enabled, a separate uniform selection from 100 values is appended with two-digit zero padding.

### `estimated_passphrase_entropy_bits(&PassphraseOptions)`

The estimate is:

```text
words × log2(word_list_size) + optional log2(100)
```

This value models selection-space entropy only. It deliberately does not add entropy for capitalization or separators because those settings are deterministic once configured.

The estimate does not validate the options and should normally be called only for an options object that will also be passed to `generate_passphrase`. The Tauri adapter computes it immediately before generation using the same options.

## Randomness module

`src/random.rs` is intentionally private.

### `uniform_index(upper_bound)`

The function maps a uniform 64-bit OS-random value to `[0, upper_bound)` using rejection sampling:

1. compute the 2^64 source range in `u128`;
2. find the largest prefix divisible by `upper_bound`;
3. reject sampled values outside that prefix;
4. return `value % upper_bound` only for accepted samples.

Callers are responsible for passing a positive bound. Current call sites only pass non-empty character/word pools or the constant bound 100.

### `secure_shuffle(values)`

Uses a reverse Fisher–Yates shuffle. For each index `i`, a uniform random index in `[0, i]` is selected and swapped.

## Strength estimation

### `estimate_strength(password: &str) -> StrengthEstimate`

`src/strength.rs` delegates to `zxcvbn` and returns:

| Field | Meaning |
| --- | --- |
| `score` | zxcvbn score represented as 0–4 |
| `guesses` | estimated guesses as an integer |
| `guesses_log10` | base-10 logarithm of the guess estimate |
| `label` | KeySmith presentation label from Very weak through Very strong |

The score is advisory UI information. It is not used to allow or reject generation.

## Presets

`src/presets.rs` returns owned `PasswordPreset` values. Presets serialize to the UI but are not deserialized from it; this prevents the frontend from pretending that a static preset definition is trusted input.

Current preset identifiers are stable UI-facing strings:

- `balanced`
- `maximum`
- `legacy`
- `alphanumeric`

If a preset identifier or meaning changes, update `src/types.ts`, UI expectations, tests, the user guide, and release notes as appropriate.

## Error model

`KeySmithError` is the centralized validation/randomness error type:

| Variant | Trigger |
| --- | --- |
| `InvalidLength` | password length outside 4–128 |
| `EmptyCharacterSet` | no sets selected, or an enabled set has no usable characters |
| `LengthBelowRequiredSets` | password too short to include each enabled set |
| `InvalidBatchSize` | count outside 1–500 |
| `InvalidWordCount` | passphrase words outside 3–12 |
| `InvalidSeparator` | separator longer than 3 characters or contains a control character |
| `RandomSourceUnavailable` | operating-system random provider failure |

The desktop adapter converts these errors to display-safe strings. No generated secret is embedded in error messages.

## Tests

`tests/security.rs` covers key security behaviors, while `tests/properties.rs` uses `proptest` to exercise length and digits-only invariants across many generated inputs.

Security-sensitive modifications should add or strengthen tests before changing public behavior. At minimum, run:

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
```

## Dependency responsibilities

- `getrandom` — operating-system randomness.
- `eff_wordlist` — packaged EFF large Diceware list.
- `zxcvbn` — strength estimation.
- `serde` — Tauri-compatible data serialization.
- `thiserror` — typed errors.
- `proptest` — test-only property generation.

Dependency-policy rules are maintained in root `deny.toml`, Dependabot configuration, CI, and the release process.
