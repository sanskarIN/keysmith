# Roadmap

## 0.1 — Secure MVP

- [x] OS CSPRNG password generation
- [x] policy controls and presets
- [x] EFF word-list passphrases
- [x] zxcvbn strength estimates
- [x] batch generation and export warnings
- [x] clipboard conditional auto-clear
- [x] responsive desktop UI and theme support
- [x] baseline security/privacy documentation
- [ ] Verify clean builds on Windows, macOS, and Linux CI
- [ ] Capture real release screenshots

## 0.2 — Hardening

- Expanded UI automation and accessibility regression tests.
- Fuzz targets for policy parsing/serialization if additional import formats are introduced.
- Optional encrypted local preset backup if a strong user need is demonstrated.
- Signed release artifacts and provenance/attestations where platform tooling permits.

## 1.0 — Stable

- Stable settings schema and compatibility policy.
- Completed external security review checklist.
- Reproducible release documentation for all primary platforms.

No cloud sync, telemetry, forced sign-in, or intrusive funding UI is planned.
