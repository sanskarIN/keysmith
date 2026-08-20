# Release Process

## Release-candidate checklist

1. Create or update a dedicated release branch and open a pull request against `main` so pull-request CI and CodeQL run on the exact candidate.
2. Ensure the frontend package version in `package.json`, Rust workspace version in `Cargo.toml`, Tauri bundle version in `src-tauri/tauri.conf.json`, and visible UI version labels in `index.html` all match.
3. Run `npm run version:check`. For a prospective tag, also run `KEYSMITH_EXPECTED_VERSION=vX.Y.Z npm run version:check` on shells that support inline environment variables, or set the same environment variable by the platform-appropriate method before running the command.
4. Confirm `CHANGELOG.md`, `ROADMAP.md`, `what_changed.md`, security policy, release notes, and real screenshots are current.
5. Run the full quality suite from a clean checkout:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm run version:check`
   - `npm test`
   - `npm run build`
   - `cargo fmt --all -- --check`
   - `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
   - `cargo test -p keysmith-core --all-features`
   - `cargo check -p keysmith --all-targets`
   - `cargo test -p keysmith --lib`
   - cargo-deny policy
6. Require the Windows, macOS, and Linux desktop checks and CodeQL analyses to be green on the same release-candidate commit.
7. Build native bundles with `npm run tauri build` on the supported release platforms.
8. Smoke-test the actual built applications, including generation, passphrases, custom-symbol rejection, batch export warnings, clipboard copy/conditional auto-clear, clear-now, onboarding, settings, themes, keyboard navigation, reduced motion, and About/support links.
9. Capture real screenshots from the verified candidate and update repository documentation where applicable.
10. Merge the verified candidate to `main` using repository policy, then confirm the required `main` checks are green on the merge commit.
11. Create the `vX.Y.Z` release tag only after the manifest version and merge commit are confirmed. The release workflow independently rejects tags that do not match repository version metadata.
12. Let the release workflow build draft platform artifacts.
13. Apply platform signing/notarization outside the repository using protected CI secrets or local secure signing tools.
14. Verify artifact names, versions, checksums/signatures where available, and installation behavior before publishing the draft release.
15. Publish release notes describing security/privacy-impacting changes and any known limitations.

## v2.7.4 gate

For v2.7.4 specifically, the final tag must be exactly `v2.7.4`, and the version-consistency check must resolve the repository metadata to `2.7.4`. Do not use the existence of the version number, branch, pull request, or draft artifacts as evidence that the release is stable; the complete automated and manual gate above must pass first.

## Secret-handling rule

Never commit signing keys, certificates with private material, tokens, notarization credentials, recovery codes, generated credentials, or real secrets used during smoke testing.
