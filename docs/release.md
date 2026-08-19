# Release Process

KeySmith releases are evidence-driven. A tag is not a substitute for a verified candidate.

## 1. Freeze one candidate commit

- Stop feature work for the candidate.
- Confirm `package.json`, Cargo workspace version, `src-tauri/tauri.conf.json`, footer text, Updates text, and About version agree. `src/version-consistency.test.ts` enforces this automatically.
- Confirm `CHANGELOG.md`, `ROADMAP.md`, `README.md`, `what_changed.md`, security/privacy docs, the documentation portal, and release screenshots are current.
- Run `npm run docs:check` and confirm every tracked project path is represented in `docs/repository-reference.md`.
- Confirm generated dependency lockfiles are committed from a trusted clean resolution before stable release.

## 2. Require automated evidence on the same commit

The release-candidate PR must be green for:

- frontend audit, secret scan, typecheck, lint, text hygiene, documentation inventory, tests, and build,
- Rust formatting, core Clippy/tests, and cargo-deny,
- Tauri `cargo check` and Clippy with warnings denied on Linux, Windows, and macOS,
- CodeQL JavaScript/TypeScript,
- CodeQL Rust after a complete workspace build.

Do not use an older green run as evidence after any candidate commit changes.

## 3. Verify packaged applications

Build native bundles from a clean checkout with:

```bash
npm run tauri build
```

Run every item in `docs/verification.md` on Windows, macOS, and Linux. In particular verify native clipboard scheduling, native batch save/cancel behavior, scoped About/contact links, themes, accessibility, no unexpected network activity, and no generated-secret history.

Capture real screenshots only from verified packaged builds.

## 4. Final repository governance

Before tagging:

- enable/confirm `main` branch protection using the actual successful required check names,
- resolve all blocking PR conversations,
- confirm no signing/notarization secrets are stored in the repository,
- confirm `package-lock.json` and `Cargo.lock` are trusted tool-generated files committed on the exact verified candidate,
- set the final `0.1.0` date in `CHANGELOG.md`,
- update `what_changed.md` with the exact final evidence,
- merge the release-candidate PR only when every required gate is satisfied.

## 5. Create the release tag

Create an annotated `vX.Y.Z` tag only after the merged release commit is verified. The tag must exactly match the package version, for example `v0.1.0` for package version `0.1.0`.

The release workflow has a `Verify release tag` job that rejects a mismatched tag and reruns the release preflight before any platform bundle job starts.

The preflight reruns:

- npm dependency resolution and high-severity audit,
- repository secret scan,
- TypeScript typecheck/lint/text hygiene/documentation inventory/tests/build,
- Rust formatting,
- strict core Clippy,
- Rust core tests,
- Cargo dependency resolution and cargo-deny.

Workflow-level GitHub token permission is `contents: read`. Only the platform `build` job receives `contents: write`, because it alone needs to create/update the draft release. Keep this split when modifying release automation.

## 6. Build and inspect draft artifacts

The tag-triggered workflow builds draft Tauri artifacts for Linux, Windows, and macOS after the tag preflight succeeds.

- Verify the expected platform artifacts exist and launch correctly.
- Keep the release draft until artifact inspection is complete.
- Apply signing/notarization using protected CI secrets or secure local/platform tooling when available.
- Never commit signing keys, certificates with private material, tokens, or notarization credentials.

Unsigned artifacts must not be represented as signed.

## 7. Publish

Publish release notes that accurately describe user-visible changes plus security/privacy-impacting changes. Do not claim reproducibility, signing, notarization, platform verification, or security review that has not actually been completed.

## Rollback / release defect rule

If a release-blocking defect is found at any stage, fix it in a normal reviewed commit, add regression coverage when behavior changed, update the release ledger, and restart the same-head evidence chain. Do not patch generated release artifacts by hand to avoid source review.
