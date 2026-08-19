# Roadmap

## 0.1 — Secure MVP / release candidate

- [x] OS CSPRNG password generation with unbiased bounded selection
- [x] policy controls and presets
- [x] Rust-enforced password/passphrase/custom-symbol validation
- [x] EFF word-list passphrases
- [x] zxcvbn strength estimates for single credentials
- [x] efficient strength-free batch path up to 500 passwords
- [x] native warning-bearing plaintext batch export through a bounded Rust command
- [x] clipboard conditional auto-clear with replace/cancel scheduling
- [x] explicit clipboard duration validation at the Rust IPC boundary
- [x] responsive desktop UI and theme support
- [x] onboarding, Settings, and About surfaces
- [x] scoped operating-system opener for documented project/contact destinations
- [x] stale asynchronous result protection across mode changes
- [x] baseline security/privacy documentation and threat model
- [x] Rust validation/property/security regression tests
- [x] frontend unit and real-markup integration tests
- [x] static Tauri permission/configuration drift tests
- [x] static external-link scope drift tests
- [x] release-version consistency tests
- [x] static accessibility and design-token contrast regression tests
- [x] English-first internationalization-ready presentation architecture
- [x] module-only Tauri frontend API with global bridge disabled
- [x] explicit least-privilege Tauri capabilities without `core:default`
- [x] unused-command stripping in Tauri production configuration
- [x] repository secret scanning, dependency policy, CI, full-workspace CodeQL, and release automation
- [x] cross-platform Tauri check and Clippy gates on Linux, Windows, and macOS
- [x] tag/version preflight gate before release artifact builds
- [ ] Commit `package-lock.json` and `Cargo.lock` from a trusted clean dependency resolution
- [ ] Verify the exact lockfile-bearing release-candidate commit with clean CI and CodeQL
- [ ] Complete packaged-application smoke testing on Windows, macOS, and Linux
- [ ] Capture real release screenshots from verified packaged builds
- [ ] Enable default-branch protection using proven successful check names
- [ ] Finalize changelog/release evidence and merge the release-candidate PR
- [ ] Create `v0.1.0`, inspect draft platform artifacts, and publish only after every blocker is cleared

## 0.2 — Post-release hardening

- Add deeper packaged-app UI automation if a stable cross-platform Tauri harness is adopted.
- Add fuzz targets if new parsers, import formats, or other edge-heavy untrusted inputs are introduced.
- Consider optional encrypted local preset backup only if a strong user need is demonstrated; never introduce generated-secret history.
- Add signed/notarized release artifacts and provenance/attestations where platform credentials and tooling permit.
- Add additional reviewed UI locales while keeping passphrase word-list changes subject to a separate entropy/source review.
- Evaluate structured Rust error codes for fully localized validation failures without coupling locale logic to the core.

## 1.0 — Stable

- Stable settings schema and compatibility policy.
- Completed external security review checklist.
- Reproducible release documentation for all primary platforms.
- Documented long-term release/signing and support policy.
- Proven upgrade/migration policy for non-secret settings if the schema evolves.

No cloud sync, telemetry, forced sign-in, password history, or intrusive funding UI is planned.
