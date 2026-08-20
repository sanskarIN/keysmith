# KeySmith — Canonical Development Handoff

Last updated: 2026-08-20
Current version line: `2.7.4` release candidate
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Active hardening branch: `fix/v2.7.4-ci`
Active verification pull request: `#15` — `fix: restore v2.7.4 release-candidate CI`
Required commit email for repository automation: `sanskarin@outlook.in`

This is the canonical continuation ledger for KeySmith. Future work should read this file, the active pull request, the latest branch commits, and the exact GitHub Actions state before making changes.

## Current release status

KeySmith `2.7.4` is still a **release candidate**, not a stable release. Do not create the final `v2.7.4` tag until the complete automated and manual release gate is satisfied.

The original release preparation was merged through PR #13, but its final verification exposed real CI failures. PR #15 is the corrective hardening branch created from that evidence. The repair branch has since addressed dependency resolution, Rust formatter drift, Clippy lint-priority failures, dependency-license policy, dependency locking, toolchain drift, and outdated CI action runtimes.

The trusted Cargo lock refresh completed in commit `714310c831191786502454efb18291ff0df8cb54`. That commit:

- regenerated `Cargo.lock`,
- removed `eff-wordlist`,
- added `englishid 0.3.1`,
- removed older transitive `rand 0.8` entries no longer required by the old word-list crate,
- removed the temporary `.github/workflows/bootstrap-cargo-lock.yml` workflow after it completed its one-time purpose.

The pull-request-triggered CI and CodeQL runs created directly from that automation-authored lockfile commit completed with GitHub's `action_required` conclusion and exposed zero jobs. That is an authorization/approval state, **not evidence that tests failed and not evidence that tests passed**. A later normal maintainer-authored branch commit must provide the actual final quality matrix.

The exact final PR head must be re-read immediately before merge. Never merge based on the historical SHAs recorded in this handoff.

## Latest v2.7.4 CI/reproducibility hardening

### Rust dependency resolution repair

The original core manifest referenced `eff_wordlist` as though the crates.io package used the same underscore spelling. CI proved that assumption wrong because the published package name was `eff-wordlist`.

A temporary mapping corrected package resolution, but dependency-policy review then exposed a more important licensing concern: retaining `eff-wordlist` would create an avoidable licensing boundary problem for the Apache-2.0 application. The release gate was not weakened to allow the dependency.

The final solution is:

- remove `eff-wordlist`,
- add `englishid = "0.3.1"`,
- use `englishid::WORD_LIST`,
- keep KeySmith's own OS-CSPRNG/rejection-sampling selection model rather than using another crate's random-selection API.

`englishid 0.3.1` declares `MIT OR Apache-2.0`. Its public word list contains 8,192 entries and is documented upstream as based on the EFF list with additional words to reach a power-of-two table size.

### Passphrase entropy model

Because the replacement table contains exactly 8,192 entries:

`log2(8192) = 13`

Each independently and uniformly sampled word therefore contributes exactly 13 bits of selection-space entropy. The optional two-digit suffix contributes `log2(100)` additional bits.

A regression test now locks this model so a future word-list change cannot silently alter the reported entropy without test review.

### Rust formatter and Clippy hardening

Real CI logs showed formatter drift under Rust 1.97.1. The branch applies the exact formatter output expected by that toolchain across the affected Rust sources/tests.

The workspace Clippy configuration was also corrected so explicit lint overrides remain deterministic when CI promotes warnings to errors with `-D warnings`.

The maintained Rust commands now use locked dependency resolution where applicable:

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features --locked -- -D warnings
cargo test -p keysmith-core --all-features --locked
cargo check -p keysmith --all-targets --locked
cargo clippy -p keysmith --all-targets --locked -- -D warnings
cargo test -p keysmith --lib --locked
cargo metadata --locked --format-version 1 > /dev/null
```

### Pinned Rust toolchain

The candidate no longer follows floating Rust `stable` for verification. `rust-toolchain.toml` pins Rust `1.97.1` so local formatting/lint behavior, GitHub CI, CodeQL autobuild behavior, and release builds do not silently drift to a newly released compiler during the v2.7.4 gate.

A future intentional Rust upgrade should be handled as a reviewed change with formatter/Clippy/test evidence, not as an incidental result of rerunning CI.

### Reproducible npm and Cargo resolution

The repository now commits both:

- `package-lock.json`,
- `Cargo.lock`.

Frontend clean installs use:

```bash
npm ci
```

Rust CI/release commands use `--locked`, and release builds additionally run:

```bash
cargo metadata --locked --format-version 1 > /dev/null
```

A stale lockfile is now a release error rather than an opportunity for CI to resolve a different dependency graph.

### GitHub Actions runtime maintenance

Checkout and Node setup actions were moved to their current v7 lines so maintained workflows no longer depend on the older Node-20-backed action runtime that produced deprecation warnings during release-candidate verification.

The release workflow uses Node.js 22 for the project itself and Rust 1.97.1 for the Rust workspace.

## Earlier v2.7.4 hardening retained

### Version synchronization and release integrity

The version is synchronized across:

- `package.json`,
- root `Cargo.toml` `[workspace.package]`,
- `src-tauri/tauri.conf.json`,
- visible semantic-version labels in `index.html`.

`scripts/check-version.mjs` verifies those values agree. It also accepts `KEYSMITH_EXPECTED_VERSION`; a release tag such as `v2.7.4` is normalized and compared with repository metadata before release packaging.

A mismatched tag/manifest combination must fail the release workflow.

### Custom-symbol trust-boundary hardening

The webview UI is not treated as a security boundary. Direct Tauri IPC can bypass HTML control constraints, so Rust validates custom-symbol policy independently.

The backend now:

- limits custom-symbol input to 40 characters,
- rejects alphanumeric characters in the custom-symbol set,
- rejects whitespace,
- rejects control characters,
- applies ambiguous-character exclusion consistently,
- deduplicates repeated custom symbols before random selection,
- ignores stale custom-symbol text when the symbol class is disabled,
- returns a typed user-safe validation error for invalid custom-symbol policy.

Regression coverage verifies invalid categories, overlong input, ambiguity filtering/deduplication, stale disabled input, and continued validity of every built-in preset.

### Clipboard secret-lifetime hardening

The Tauri clipboard command now wraps owned secret strings with `zeroize::Zeroizing<String>` early enough that success and normal error-return paths receive best-effort zeroization on drop.

The delayed conditional-clear comparison value also uses a zeroizing wrapper while retained by the timer.

This is intentionally documented as **best effort**, not as a claim that JavaScript strings, the operating-system clipboard, the webview process, allocator copies, or every memory representation can be synchronously erased.

### Clipboard duration policy

Direct IPC no longer accepts arbitrary clear durations. The Rust adapter allows only:

- `0`,
- `15`,
- `30`,
- `60`,
- `120`

seconds.

The existing conditional-clear safety rule remains: KeySmith clears the clipboard only when it still equals the secret KeySmith copied. A newer clipboard value must not be erased.

Desktop adapter unit tests cover accepted and rejected durations.

### Legacy workflow consolidation

The redundant `.github/workflows/rust.yml` workflow was removed. It duplicated Rust coverage and lacked the Linux Tauri/WebKit system-dependency setup required for meaningful workspace verification.

The authoritative verification path is `.github/workflows/ci.yml` plus `.github/workflows/codeql.yml`.

Expected CI responsibilities are:

- `Frontend quality`,
- `Rust core quality`,
- `Rust dependency policy`,
- `Tauri check (ubuntu-22.04)`,
- `Tauri check (windows-latest)`,
- `Tauri check (macos-latest)`.

Expected CodeQL language analyses are:

- `analyze (javascript-typescript)`,
- `analyze (rust)`.

Do not configure the deleted legacy `Rust` workflow as a branch-protection requirement.

## Product implementation currently present

### Architecture

- Rust 2024 workspace.
- Security-sensitive generation/policy logic in framework-independent `crates/keysmith-core`.
- Tauri 2 desktop adapter in `src-tauri`.
- Vanilla TypeScript + Vite frontend.
- Narrow typed IPC surface between the webview and Rust.
- Apache-2.0 project license.
- Windows, macOS, and Linux desktop packaging configuration.

### Password generation

The Rust core provides:

- operating-system cryptographic randomness via `getrandom`,
- rejection sampling for unbiased bounded random indexes,
- secure Fisher-Yates-style shuffling backed by the same unbiased sampler,
- password lengths from 4 through 128 characters,
- lowercase/uppercase/digit/symbol classes,
- custom symbols with backend validation,
- ambiguous-character exclusion,
- at least one character from every enabled class,
- batch generation from 1 through 500 passwords,
- Balanced, Maximum, Legacy-compatible, and Alphanumeric presets.

Generated credentials are not intentionally persisted by application code.

### Passphrase generation

The core provides:

- 3–12 random words,
- an 8,192-entry EFF-derived `englishid` table,
- KeySmith-controlled OS-CSPRNG uniform index selection,
- configurable separator with validation,
- optional capitalization,
- optional two-digit suffix,
- selection-space entropy estimation.

Repeated words remain allowed; removing previously selected words would change the sampling model and is unnecessary for secure independently sampled passphrases.

### Strength estimation

KeySmith uses `zxcvbn` rather than a home-grown strength label algorithm. Strength reporting remains an estimate and must not be represented as a guarantee that a credential cannot be guessed or compromised.

### Clipboard and export behavior

- Clipboard copy is explicit.
- Clipboard input is capped at 4096 characters at the Rust boundary.
- Auto-clear duration is allowlisted in Rust.
- Auto-clear is conditional on the clipboard still containing the expected secret.
- Clear-now is explicit.
- Batch export is plaintext by design and displays a warning.
- Exported plaintext files are outside the application's memory-only generated-secret model once written by the user.

### UI/UX

The current desktop interface includes:

- Password, Passphrase, and Batch modes,
- live strength presentation,
- policy presets,
- safe defaults,
- light/dark/system themes,
- first-run onboarding,
- Settings covering appearance, privacy/data, accessibility, updates, and onboarding help,
- About information with version/license/support links,
- responsive layout,
- keyboard tab navigation,
- skip link,
- visible focus styling,
- semantic labels/fieldsets,
- aria-live status communication,
- reduced-motion handling,
- responsive touch targets,
- non-color-only status text,
- editable SVG brand asset plus native PNG/ICO/ICNS icons.

Real release screenshots have intentionally not been represented as complete until captured from verified packaged v2.7.4 builds.

## Privacy and security baseline

Current intended boundaries:

- no account system,
- no telemetry/analytics,
- no password history,
- no intentional generated-secret logging,
- no required network access for generation,
- restrictive Tauri CSP,
- least-privilege Tauri capabilities,
- typed backend validation at IPC trust boundaries,
- documented threat model and residual risks,
- dependency advisory/license/source policy through `deny.toml`,
- CodeQL automation,
- dependency update automation,
- no repository signing secrets.

`PRIVACY.md`, `SECURITY.md`, and `THREAT_MODEL.md` must be updated whenever a change alters these boundaries.

## Automated tests currently expected

### Rust core security tests

`crates/keysmith-core/tests/security.rs` covers at least:

- every enabled password class is represented,
- ambiguous-character exclusion,
- invalid custom-symbol categories,
- overlong custom-symbol input,
- custom-symbol deduplication/ambiguity behavior,
- stale custom-symbol input while symbols are disabled,
- built-in preset validity,
- batch-size bounds,
- passphrase requested word count,
- passphrase entropy behavior for the 8,192-entry table.

### Rust property tests

`crates/keysmith-core/tests/properties.rs` covers generation invariants including output length across supported lengths and restricted-class output behavior.

### Desktop adapter tests

The `src-tauri` library test module covers the supported clipboard-duration allowlist without needing a live OS clipboard.

Actual clipboard integration still requires platform smoke testing because the behavior depends on the operating-system clipboard service.

### Frontend tests

Vitest covers non-secret preference helpers such as theme/onboarding/clipboard preference persistence and safe fallback behavior.

## Canonical clean-check commands

### Frontend

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run version:check
npm test
npm run build
```

### Rust

```bash
cargo metadata --locked --format-version 1 > /dev/null
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features --locked -- -D warnings
cargo test -p keysmith-core --all-features --locked
cargo check -p keysmith --all-targets --locked
cargo clippy -p keysmith --all-targets --locked -- -D warnings
cargo test -p keysmith --lib --locked
```

### Release tag integrity

For `v2.7.4`, set:

```text
KEYSMITH_EXPECTED_VERSION=v2.7.4
```

and run:

```bash
npm run version:check
```

Use the shell-appropriate syntax for environment variables on Windows PowerShell/cmd, POSIX shells, or CI.

## Files that define the release/security contract

Before significant changes, review as applicable:

- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
- `SECURITY.md`
- `PRIVACY.md`
- `THREAT_MODEL.md`
- `CONTRIBUTING.md`
- `NOTICE`
- `deny.toml`
- `docs/architecture.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/github.md`
- `docs/wordlists.md`
- `docs/adr/`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/release.yml`

## Release-candidate work still required

Do these in order unless new evidence changes priorities:

1. Let the latest normal maintainer-authored PR head run the complete CI and CodeQL matrix.
2. Inspect every failing job's actual logs; fix root causes rather than weakening gates.
3. Require one exact final head SHA with all six maintained CI jobs and both CodeQL analyses successful.
4. Review open PR comments/review threads and resolve any real blocker.
5. Confirm branch-protection required-check names from the successful GitHub-rendered checks.
6. Build native Windows, macOS, and Linux packages from the verified candidate.
7. Smoke-test packaged apps on each platform, especially OS clipboard behavior and WebView/Tauri integration.
8. Perform keyboard/accessibility/reduced-motion manual review against packaged builds.
9. Capture genuine screenshots from verified builds.
10. Update documentation with those screenshots and any discovered platform caveats.
11. Merge the verified PR to `main` only after the exact PR head is green.
12. Verify the resulting `main` commit again.
13. Create `v2.7.4` only after the merge commit and version metadata are confirmed.
14. Inspect draft release artifacts, signatures/notarization, checksums where applicable, install/launch/uninstall behavior, and release notes before publishing.

## Non-goals and boundaries

Do not expand scope casually while the release candidate is being stabilized. In particular:

- do not add cloud sync or password-history persistence without a separate architecture/security decision,
- do not add telemetry merely for convenience,
- do not weaken CSP/capability boundaries to work around UI issues,
- do not broaden dependency-license allowlists without reviewing the actual dependency license,
- do not bypass lockfile enforcement to make CI pass,
- do not claim a release is stable because a branch is mergeable,
- do not publish placeholder screenshots as real packaged-app evidence,
- do not commit signing material, tokens, generated credentials, or smoke-test secrets.

## Commit strategy

Continue using small, meaningful commits whenever practical. Examples:

- `fix:` for concrete defects,
- `test:` for focused regression coverage,
- `ci:` for verification/workflow changes,
- `build:` for dependency/toolchain/lockfile work,
- `docs:` for documentation-only changes,
- `security:` when a change is specifically security-policy hardening.

Do not manufacture meaningless commits solely to increase commit count; each commit should remain reviewable and explainable.

## Immediate continuation checkpoint

At this handoff, the one-time Cargo lockfile bootstrap has completed and removed itself. The old `eff-wordlist` dependency is no longer present in the regenerated lockfile, and `englishid 0.3.1` is locked instead. Release documentation has been updated to require reproducible npm/Cargo resolution and to treat `action_required`/missing jobs as unresolved rather than green.

The next authoritative evidence is the CI/CodeQL result on the newest maintainer-authored PR #15 head created after these documentation updates. If that head is green, proceed to review/packaging gates; if not, inspect the failing job logs and continue fixing the branch.

**Do not tag `v2.7.4` yet.**
