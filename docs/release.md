# Release Process

KeySmith releases are evidence-driven. A version number, mergeable pull request, successful build on one platform, or draft artifact is not enough to declare a release stable.

## Reproducible toolchain baseline

The v2.7.4 release candidate uses:

- Rust `1.97.1`, pinned by `rust-toolchain.toml`,
- Node.js 22 in GitHub Actions,
- committed `package-lock.json`,
- committed `Cargo.lock`,
- `npm ci` for clean npm installs,
- Cargo `--locked` and `cargo metadata --locked` for Rust dependency resolution.

If either lockfile is stale, repair it in a dedicated reviewed commit. Do not bypass `--locked` in CI or release automation merely to make a build pass.

## Release-candidate checklist

1. Create or update a dedicated release/hardening branch and open a pull request against `main` so pull-request CI and CodeQL run on the exact candidate.
2. Ensure the frontend package version in `package.json`, Rust workspace version in `Cargo.toml`, Tauri bundle version in `src-tauri/tauri.conf.json`, and visible UI version labels in `index.html` all match.
3. From a clean checkout, install frontend dependencies with `npm ci`.
4. Run `npm run version:check`. For a prospective tag, also run `KEYSMITH_EXPECTED_VERSION=vX.Y.Z npm run version:check` on shells that support inline environment variables, or set the same environment variable using the platform-appropriate method before invoking the command.
5. Confirm `CHANGELOG.md`, `ROADMAP.md`, `what_changed.md`, security/privacy documentation, release notes, and real screenshots are current and truthful.
6. Run the complete frontend quality suite:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run format:check`
   - `npm run version:check`
   - `npm test`
   - `npm run build`
7. Verify the Rust dependency graph is locked before expensive compilation:
   - `cargo metadata --locked --format-version 1 > /dev/null`
8. Run the Rust core quality suite:
   - `cargo fmt --all -- --check`
   - `cargo clippy -p keysmith-core --all-targets --all-features --locked -- -D warnings`
   - `cargo test -p keysmith-core --all-features --locked`
9. Run the desktop-adapter quality suite on every supported CI platform:
   - `cargo check -p keysmith --all-targets --locked`
   - `cargo clippy -p keysmith --all-targets --locked -- -D warnings`
   - `cargo test -p keysmith --lib --locked`
10. Run the Rust dependency-policy gate with the repository `deny.toml`. License, advisory, ban, and source failures must be investigated at the dependency/root-cause level rather than suppressed simply to obtain green CI.
11. Require the maintained Windows, macOS, and Linux CI jobs and both CodeQL language analyses to be green on the **same final release-candidate commit**.
12. Treat queued, skipped unexpectedly, `action_required`, or missing jobs as unresolved verification states. They are not equivalent to successful tests.
13. Build native bundles with `npm run tauri build` on the supported release platforms using the committed lockfiles.
14. Smoke-test the actual packaged applications, including:
    - password generation,
    - passphrase generation,
    - custom-symbol rejection and boundary behavior,
    - batch generation and plaintext-export warnings,
    - clipboard copy,
    - conditional clipboard auto-clear,
    - clear-now behavior,
    - onboarding,
    - Settings and About surfaces,
    - light/dark/system themes,
    - keyboard navigation and focus visibility,
    - reduced-motion behavior,
    - support/business/GitHub links.
15. Capture real screenshots from the verified packaged candidate and update repository documentation where applicable. Do not represent source mockups or placeholders as release screenshots.
16. Merge the verified candidate to `main` using repository policy, then confirm the required `main` checks are green on the resulting merge commit.
17. Create the `vX.Y.Z` release tag only after the manifest version and verified `main` commit are confirmed. The release workflow independently rejects tags that do not match repository version metadata.
18. Let the tag-triggered release workflow build draft platform artifacts.
19. Apply platform signing/notarization using protected CI secrets or secure local signing systems. Signing credentials must never be committed to the repository.
20. Verify artifact names, embedded versions, checksums/signatures where available, installation behavior, launch behavior, and uninstall behavior before publishing the draft release.
21. Publish release notes describing security/privacy-impacting changes, dependency/license changes, platform limitations, and known residual risks.

## Maintained automated checks

The v2.7.4 candidate currently expects these maintained CI responsibilities:

- `Frontend quality`
- `Rust core quality`
- `Rust dependency policy`
- `Tauri check (ubuntu-22.04)`
- `Tauri check (windows-latest)`
- `Tauri check (macos-latest)`
- CodeQL `analyze (javascript-typescript)`
- CodeQL `analyze (rust)`

GitHub may render required-check names with workflow prefixes. Configure branch protection from the exact successful names GitHub displays rather than guessing strings from this document.

## Dependency and license rule

KeySmith is Apache-2.0 licensed. New runtime/build dependencies must have an understood and compatible licensing boundary. A dependency-policy failure must not be resolved by broadening the allowlist without first checking:

1. the crate/package manifest license expression,
2. the actual upstream license files,
3. whether the dependency is direct or transitive,
4. whether a more suitable dependency can remove the incompatibility,
5. whether NOTICE/attribution documentation needs to change.

For the v2.7.4 candidate, the earlier `eff-wordlist` dependency was removed after license-policy review. Passphrase generation now uses `englishid` 0.3.1's 8,192-entry EFF-derived table, distributed under `MIT OR Apache-2.0`.

## v2.7.4 gate

For v2.7.4 specifically:

- the final stable tag must be exactly `v2.7.4`,
- repository version metadata must resolve to `2.7.4`,
- the final PR head must have a real successful CI/CodeQL result rather than an authorization-only workflow conclusion,
- native package builds and packaged-app smoke tests remain required even after automated PR checks are green,
- the release must not be tagged solely because the branch or pull request is mergeable.

## Secret-handling rule

Never commit signing keys, certificates containing private material, access tokens, notarization credentials, recovery codes, generated credentials, or real secrets used during smoke testing.
