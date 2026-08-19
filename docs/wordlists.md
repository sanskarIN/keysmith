# Passphrase Word List

KeySmith passphrases use the EFF large Diceware word list through the published Rust package `eff-wordlist`, whose Rust crate path is `eff_wordlist`. The list contains 7,776 entries, matching the six-dice selection space commonly used by the EFF large list.

## Why this source

- The source is documented and recognizable rather than an opaque project-specific list.
- Selection is performed locally with KeySmith's operating-system CSPRNG sampling helper.
- The list is packaged with the application dependency, so generation requires no runtime network request.
- The package name and Rust import name are intentionally distinguished in documentation: Cargo resolves `eff-wordlist`, while Rust source imports `eff_wordlist` because hyphens are represented as underscores in crate identifiers.

## Selection model

For each requested word, KeySmith samples one index uniformly from the packaged list using rejection sampling. Repeated words are allowed because removing previous choices would change the independent sampling model and is not needed for secure random passphrases.

The implementation reads `eff_wordlist::large::LIST`; no application-maintained mutable word-list file or remote lookup is involved.

## Entropy model

The UI's entropy figure is a selection-space estimate:

```text
words × log2(list size) + optional log2(100)
```

With the 7,776-word list, each independently selected word contributes `log2(7776)` bits of selection-space entropy. The optional two-digit suffix adds one independent choice from 100 values.

Capitalization and separator choices are not added to the entropy figure because they are deterministic formatting settings once configured.

The estimate is not a guarantee about memorability, resistance to user modification, endpoint security, password reuse, or the strength of a phrase after a user changes words manually.

## Offline and privacy properties

The word list is packaged in the Rust dependency and selected locally. Passphrase generation therefore does not need to send a request to EFF, crates.io, GitHub, or any other runtime service.

Development/build machines may access package registries while resolving dependencies; that build-time network activity is separate from production credential generation.

## Maintenance rules

A word-list dependency change is security-sensitive because it can alter:

- selection-space size;
- word contents/compatibility;
- dependency license/source/advisory status;
- entropy calculations;
- reproducibility of generated passphrases.

When changing the dependency or list:

1. verify the published package and source metadata;
2. inspect the list size and intended source;
3. review licensing/advisories through repository dependency policy;
4. update `crates/keysmith-core/src/passphrase.rs` only as required;
5. update entropy tests/expectations if the selection space changes;
6. update `docs/core-api.md`, this document, `THREAT_MODEL.md` when relevant, and release notes;
7. run the full Rust/core and release-candidate verification matrix.

Third-party attribution remains governed by the dependency's own distribution and licensing terms; see root `NOTICE`, dependency metadata, and cargo-deny policy.
