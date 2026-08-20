# Passphrase Word List

KeySmith passphrases use the public `englishid::WORD_LIST` table from `englishid` 0.3.1. The table contains 8,192 entries and is based on the Electronic Frontier Foundation (EFF) passphrase word list with additional entries supplied by the EnglishId project.

## Why this source

- `englishid` publishes its source under the MIT OR Apache-2.0 licenses, which is compatible with KeySmith's Apache-2.0 distribution model.
- The source is documented and auditable rather than an opaque project-specific list.
- Selection is performed locally with KeySmith's operating-system CSPRNG sampling helper.
- The table is compiled into the application dependency, so passphrase generation requires no network request.
- 8,192 entries provide exactly 13 bits of selection entropy per uniformly sampled word (`log2(8192) = 13`).

KeySmith previously used the `eff-wordlist` crate. It was removed during the v2.7.4 release-candidate audit because its crates.io metadata did not declare a license and its distributed license created an avoidable compatibility risk for this Apache-2.0 project. The replacement keeps the user-facing offline passphrase workflow while making dependency licensing explicit.

## Selection model

For each requested word, KeySmith samples one index uniformly from the packaged table using rejection sampling. Repeated words are allowed because removing previous choices would change the independent sampling model and is not needed for secure random passphrases.

The UI's entropy figure is a selection-space estimate: `words × 13`, plus `log2(100)` when the optional two-digit suffix is selected. It is not a guarantee about the strength of phrases that users later modify.

## Attribution and licensing

- EnglishId: MIT OR Apache-2.0; see the crate's distributed license files and project metadata.
- The EnglishId documentation states that its word table is based on the EFF word list.
- EFF remains the source and steward of the original passphrase-list work referenced by EnglishId.

See `NOTICE`, `Cargo.lock`, and `deny.toml` for the repository's dependency and license-policy records.
