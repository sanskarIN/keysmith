# Passphrase Word List

KeySmith passphrases use the EFF large Diceware word list through the Rust `eff_wordlist` crate. The list contains 7,776 entries, matching the six-dice selection space commonly used by the EFF list.

## Why this source

- The source is documented and recognizable rather than an opaque project-specific list.
- Selection is performed locally with KeySmith's operating-system CSPRNG sampling helper.
- The list is packaged with the application dependency, so generation requires no network request.

## Selection model

For each requested word, KeySmith samples one index uniformly from the packaged list using rejection sampling. Repeated words are allowed because removing previous choices would change the sampling model and is not needed for secure random passphrases.

The UI's entropy figure is a selection-space estimate: `words × log2(list size)`, plus `log2(100)` when the optional two-digit suffix is selected. It is not a guarantee about the strength of user-modified phrases.

Third-party attribution remains governed by the dependency's own distribution and licensing terms; see `NOTICE` and the dependency metadata.
