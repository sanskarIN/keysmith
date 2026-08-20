# Roadmap

## 2.7.4 — Current five-platform release candidate

### Completed in the candidate

- [x] OS CSPRNG password generation with unbiased selection and secure shuffle.
- [x] Password policy controls, presets, EFF word-list passphrases, and zxcvbn strength estimates.
- [x] Batch generation with export warnings and explicit clipboard handling.
- [x] Responsive shared UI, onboarding, settings, light/dark/system themes, and accessibility foundations.
- [x] Backend custom-symbol validation, length limits, ambiguity filtering, and deduplication.
- [x] Clipboard clear-duration allowlist and zeroizing wrappers for owned clipboard-command secret buffers.
- [x] Frontend/Rust/Tauri/UI version metadata synchronized to `2.7.4`.
- [x] Deterministic version-consistency gate in normal CI and tag-to-manifest verification in release CI.
- [x] Rust-core and native-adapter regression coverage for the v2.7.4 hardening changes.
- [x] Windows, macOS, and Linux desktop Tauri configuration.
- [x] Android Tauri configuration with SDK 24 minimum and APK/AAB development/build commands.
- [x] iOS/iPadOS Tauri configuration with iOS 14 minimum and simulator/device development/build commands.
- [x] Replaced the direct desktop-only clipboard dependency with Tauri's cross-platform clipboard plugin.
- [x] Replaced browser-only batch download behavior with native save-dialog/filesystem export on desktop and mobile.
- [x] Added exact export readback verification so unreliable destinations cannot produce a false-success result.
- [x] Added mobile safe-area, touch-target, compact-navigation, and scrollable-dialog adaptations.
- [x] Added physical-device development host/HMR support through `TAURI_DEV_HOST`.
- [x] Added deterministic Android/iOS icon generation from the shared KeySmith SVG.
- [x] Added deterministic iOS filesystem privacy-manifest preparation.
- [x] Added `npm run platform:check` to protect the five-platform configuration from regression.
- [x] Added Android aarch64 debug-APK and iOS arm64-simulator compile gates to CI.
- [x] Security, privacy, threat-model, setup, testing, release, architecture, accessibility, contributor, and platform documentation aligned with the five-platform design.

### Required before the final v2.7.4 cross-platform claim

- [ ] Observe a fully green pull-request CI matrix on the exact final candidate commit, including Windows, macOS, Linux, Android, and iOS.
- [ ] Observe green JavaScript/TypeScript and Rust CodeQL analysis on the same final candidate commit.
- [ ] Generate and commit trusted dependency lockfiles if clean resolution produces suitable lockfiles.
- [ ] Build intended native distribution artifacts on Windows, macOS, Linux, Android, and iOS.
- [ ] Smoke-test generation, presets, custom-symbol validation, passphrases, batch export/readback, clipboard behavior, onboarding, settings, themes, accessibility, safe areas, and external/support links on representative packaged apps.
- [ ] Verify Android with a modern device/emulator and confirm the release AAB/signing path with protected credentials.
- [ ] Verify iOS/iPadOS on a simulator and device as available; confirm privacy manifest, signing/provisioning, and distribution path with protected credentials.
- [ ] Capture real release screenshots from verified desktop and mobile builds.
- [ ] Enable `main` branch protection using proven required-check names, including maintained mobile checks.
- [ ] Merge the verified cross-platform candidate, verify the merge commit, and only then create/publish the final `v2.7.4` release state.
- [ ] Verify release artifacts, signatures/notarization/store metadata where configured, and installation behavior before publication.

## After 2.7.4 — Hardening backlog

- Expand UI automation for dialogs, keyboard navigation, touch navigation, mode switching, and error states.
- Add accessibility regression automation where browser/native tooling can provide reliable coverage.
- Add device-farm coverage for representative Android API levels and iOS simulator versions when maintainable CI infrastructure is available.
- Add fuzz/property targets for policy validation and serialization boundaries where they provide meaningful security value.
- Add SBOM/provenance/build attestations where platform and GitHub tooling permit a maintainable workflow.
- Evaluate encrypted import/export only for non-secret user presets if a real user need is demonstrated; do not evolve KeySmith into a password-history vault by accident.
- Evaluate a separate Web/PWA architecture only if its security and filesystem/clipboard model can preserve KeySmith's guarantees; do not imply that a native Tauri target automatically creates a browser deployment.

## Long-term principles

- Keep credential generation local by default on every supported platform.
- Keep telemetry, forced sign-in, cloud sync, and password history out of scope unless the privacy model is intentionally redesigned and reviewed.
- Maintain one shared audited Rust generation core instead of duplicating credential logic across Kotlin, Swift, or platform-specific implementations.
- Prefer small auditable IPC/plugin surfaces and security-focused regression tests over feature count.
- Preserve accessible keyboard-first operation on desktop and touch-first usability/safe-area correctness on mobile.
- Distinguish configured targets, CI-verified targets, and signed/device-tested release targets honestly.
