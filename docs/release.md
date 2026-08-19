# Release Process

KeySmith releases are evidence-driven. A version number in source is not enough to call a build stable.

## 1. Prepare the release candidate

1. Work from a dedicated release/verification branch and pull request.
2. Ensure the dependency manifests and tracked lockfiles represent the intended release dependency graph.
3. Confirm `CHANGELOG.md`, `ROADMAP.md`, `what_changed.md`, all version fields, and user-facing documentation are current.
4. Confirm `docs/repository-reference.md` still matches the tracked codebase after structural changes.
5. Review security/privacy-impacting diffs, Tauri permissions/capabilities, CSP, clipboard handling, export behavior, and persistence changes.

## 2. Pass the automated gates

The same release-candidate commit must pass:

- frontend typecheck, lint, text-hygiene check, Vitest, and production build,
- Rust formatting, strict core Clippy, and core tests,
- Tauri compile checks on Windows, macOS, and Linux,
- desktop-adapter library regression tests,
- `cargo-deny` dependency policy,
- CodeQL for JavaScript/TypeScript and Rust.

Use [`verification.md`](verification.md) as the authoritative command/evidence checklist. Do not record a check as passed until the corresponding run for the release-candidate commit is actually green.

## 3. Build and smoke-test native applications

Build native bundles with:

```bash
npm run tauri build
```

Then run the packaged-app checklist in `verification.md` on Windows, macOS, and Linux. Source-level browser previews are not substitutes for testing the installed/bundled desktop application.

Capture real screenshots from the verified release candidate only after the UI being shown has passed the relevant checks.

## 4. Finalize release metadata

1. Record the final release-candidate commit SHA and verification evidence in `what_changed.md`.
2. Set the release date in `CHANGELOG.md`.
3. Ensure the version agrees across Rust workspace metadata, Tauri configuration, package metadata, UI/footer/About text, changelog, and release notes.
4. Confirm support, repository, funding, license, privacy, and security links.
5. Re-run or re-check required status checks after the last release metadata commit.

## 5. Tag and build release artifacts

1. Merge the verified pull request into `main` only when the required automated checks are green.
2. Create an annotated `vX.Y.Z` tag from the verified release commit.
3. Let `.github/workflows/release.yml` create platform artifacts and a draft GitHub Release.
4. Inspect the produced files before publication.

## 6. Signing and publication

Apply platform signing/notarization outside the repository using protected CI secrets or local secure signing tools. Never commit signing keys, private certificates, tokens, recovery codes, or notarization credentials.

Publish release notes that call out security/privacy-impacting changes, important limitations, and whether distributed artifacts are signed/notarized.

## Rollback / failed release

If any required check, packaged smoke test, signing step, or artifact inspection fails:

- do not publish the release as stable,
- fix the root cause on a new commit,
- add a regression test when behavior was defective,
- rerun the full affected release gate,
- update `what_changed.md` with the failure and resolution.

Never move an already-published immutable release tag to hide a bad build. Publish a corrected patch version when a released artifact requires replacement.
