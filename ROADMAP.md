# Roadmap

## 2.0.12 — Verified desktop release candidate

- [x] OS CSPRNG password generation
- [x] policy controls and presets
- [x] EFF word-list passphrases
- [x] zxcvbn strength estimates
- [x] batch generation and export warnings
- [x] clipboard conditional auto-clear
- [x] responsive desktop UI and theme support
- [x] security/privacy/threat-model documentation
- [x] reproducible npm and Cargo lockfiles
- [x] locked CI and release dependency resolution
- [x] Linux Tauri compile and desktop-adapter regression tests on the verification branch
- [x] JavaScript/TypeScript CodeQL on the verification branch
- [ ] Complete the final-head Windows, macOS, frontend, Rust-core, dependency-policy, and Rust CodeQL checks after the 2.0.12 version update
- [ ] Build and smoke-test packaged Windows, macOS, and Linux artifacts
- [ ] Complete manual keyboard/accessibility review on packaged builds
- [ ] Capture real release screenshots from the verified packaged build
- [ ] Enable `main` branch protection using proven required-check names
- [ ] Tag and publish `v2.0.12` only after all required gates are complete

## Post-2.0.12 hardening

- Expanded UI automation and accessibility regression tests.
- Fuzz targets for policy parsing/serialization if additional import formats are introduced.
- Optional encrypted local preset backup only if a strong user need is demonstrated.
- Signed release artifacts and provenance/attestations where platform tooling permits.
- External security review checklist and release-evidence archival improvements.

No cloud sync, telemetry, forced sign-in, password history, or intrusive funding UI is planned.
