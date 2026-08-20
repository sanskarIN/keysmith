# Roadmap

## 2.7.4 — Current release candidate

### Completed in the candidate

- [x] OS CSPRNG password generation with unbiased selection and secure shuffle.
- [x] Password policy controls, presets, EFF word-list passphrases, and zxcvbn strength estimates.
- [x] Batch generation with export warnings and explicit clipboard handling.
- [x] Responsive desktop UI, onboarding, settings, light/dark/system themes, and accessibility foundations.
- [x] Backend custom-symbol validation, length limits, ambiguity filtering, and deduplication.
- [x] Clipboard clear-duration allowlist and zeroizing wrappers for owned clipboard-command secret buffers.
- [x] Frontend/Rust/Tauri/UI version metadata synchronized to `2.7.4`.
- [x] Deterministic version-consistency gate in normal CI and tag-to-manifest verification in release CI.
- [x] Rust-core and desktop-adapter regression coverage for the v2.7.4 hardening changes.
- [x] Security, privacy, threat-model, testing, release, architecture, accessibility, and contributor documentation baseline.
- [x] Trusted npm and Cargo lockfiles generated from repository automation and committed for reproducible dependency resolution.
- [x] CI and release workflows consume committed lockfiles with `npm ci` and Cargo locked-resolution checks.

### Required before the final v2.7.4 tag

- [ ] Observe a fully green pull-request CI matrix on the exact candidate commit.
- [ ] Observe green JavaScript/TypeScript and Rust CodeQL analysis on the exact candidate commit.
- [ ] Build native Tauri bundles on Windows, macOS, and Linux.
- [ ] Smoke-test generation, custom-symbol validation, passphrases, batch export, clipboard behavior, onboarding, settings, themes, accessibility, and external/support links in packaged apps.
- [ ] Capture real release screenshots from verified builds.
- [ ] Enable `main` branch protection using proven required-check names.
- [ ] Merge the candidate, verify the merge commit, and only then create the `v2.7.4` tag.
- [ ] Verify draft release artifacts, signing/notarization where configured, and installation behavior before publication.

## After 2.7.4 — Hardening backlog

- Expand UI automation for dialogs, keyboard navigation, mode switching, and error states.
- Add accessibility regression automation where browser tooling can provide reliable coverage.
- Add fuzz/property targets for policy validation and serialization boundaries where they provide meaningful security value.
- Add SBOM/provenance or build attestations where platform and GitHub tooling permit a maintainable workflow.
- Evaluate encrypted import/export only for non-secret user presets if a real user need is demonstrated; do not evolve KeySmith into a password-history vault by accident.

## Long-term principles

- Keep credential generation local by default.
- Keep telemetry, forced sign-in, cloud sync, and password history out of scope unless the project's privacy model is intentionally redesigned and reviewed.
- Prefer small auditable IPC surfaces and security-focused regression tests over feature count.
- Preserve accessible keyboard-first operation across supported desktop platforms.
