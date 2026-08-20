# KeySmith — Canonical Development Handoff

Last updated: 2026-08-20
Current version line: `2.7.4` release candidate
Repository: `sanskarIN/keysmith`
Primary branch: `main`
Active hardening branch: `fix/v2.7.4-ci`
Active verification pull request: `#15` — `fix: restore v2.7.4 release-candidate CI`
Required commit email for repository automation: `sanskarin@outlook.in`

This is the canonical continuation ledger for KeySmith. Future work should read this file, the active pull request, the latest branch commits, and the exact GitHub Actions state before changing the repository.

## Current release status

KeySmith `2.7.4` is still a **release candidate**, not a stable release. Do not create the final `v2.7.4` tag until the complete automated and manual release gate is satisfied.

The original v2.7.4 preparation was merged through PR #13, but its final verification exposed real CI failures. PR #15 is the corrective hardening branch created from that evidence. It now contains the dependency-resolution, formatter, Clippy, licensing, lockfile, toolchain, workflow-runtime, clipboard-boundary, and documentation fixes discovered during the release-candidate audit.

The trusted Cargo lock refresh completed in commit `714310c831191786502454efb18291ff0df8cb54`. That commit regenerated `Cargo.lock`, removed `eff-wordlist`, added `englishid 0.3.1`, removed obsolete transitive dependencies from the previous word-list crate, and removed its own temporary bootstrap workflow after the one-time lock refresh completed.

The automation-authored lockfile commit produced GitHub's `action_required` workflow conclusion with zero jobs. That state was correctly treated as unresolved authorization/approval evidence rather than a test failure or success. Subsequent maintainer-authored commits have produced the expected CI and CodeQL job matrices.

The branch later accumulated many queued pull-request runs while the hardening audit was still producing granular commits. CI and CodeQL now define concurrency groups with `cancel-in-progress: true` so future superseded pull-request runs do not continue consuming runner capacity. CodeQL concurrency is separated by GitHub event type so a scheduled scan cannot accidentally cancel a `main` push scan merely because both use the same ref.

**The exact newest PR head must always be re-read immediately before merge. Never merge or tag based only on historical SHAs recorded in this file.**

## Release-candidate hardening completed

### 1. Rust dependency resolution and licensing repair

The original core manifest referenced `eff_wordlist` as though the crates.io package used the same underscore spelling. CI proved the published package name was `eff-wordlist`.

A temporary package mapping fixed dependency resolution, but the dependency-policy review then exposed a more important licensing concern. The release gate was not weakened by broadly allowlisting the dependency.

The final implementation instead:

- removes `eff-wordlist`,
- adds `englishid = "0.3.1"`,
- samples `englishid::WORD_LIST`,
- preserves KeySmith's own operating-system CSPRNG and rejection-sampling implementation,
- documents the upstream license/source boundary in `NOTICE` and `docs/wordlists.md`.

`englishid 0.3.1` declares `MIT OR Apache-2.0`. Its public table contains 8,192 entries and is documented upstream as EFF-derived with additional words to reach a power-of-two table size.

### 2. Passphrase entropy and word-table integrity

The new table contains 8,192 entries:

`log2(8192) = 13`

Each independently and uniformly sampled word therefore contributes exactly 13 bits of selection-space entropy. The optional two-digit suffix contributes `log2(100)` additional bits.

Regression coverage now verifies:

- requested passphrase word count,
- the table contains exactly 8,192 entries,
- all 8,192 entries are unique,
- three words without a numeric suffix report exactly 39 bits of selection-space entropy.

The uniqueness test is important because a table could retain a raw length of 8,192 while duplicate words silently reduce the effective output space.

The in-product Passphrase hint was also corrected. It now describes the actual 8,192-entry EFF-derived table rather than the removed dependency's 7,776-entry “EFF large Diceware” wording.

### 3. Rust formatter and Clippy stabilization

Real release-candidate CI logs showed formatter drift under Rust 1.97.1. The affected Rust source and test files were updated to the exact formatter output expected by that toolchain.

Workspace Clippy priorities were corrected so explicit `allow`/`deny` overrides behave deterministically when CI promotes warnings to errors with `-D warnings`.

The maintained Rust verification commands are:

```bash
cargo metadata --locked --format-version 1 > /dev/null
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features --locked -- -D warnings
cargo test -p keysmith-core --all-features --locked
cargo check -p keysmith --all-targets --locked
cargo clippy -p keysmith --all-targets --locked -- -D warnings
cargo test -p keysmith --lib --locked
```

### 4. Pinned Rust toolchain

The candidate no longer follows floating Rust `stable` during verification. `rust-toolchain.toml` pins Rust `1.97.1` so local formatting/lint behavior, CI, CodeQL Rust builds, and release builds do not silently change when a new stable compiler appears.

A future Rust upgrade must be an intentional reviewed change with formatter, Clippy, unit/property-test, desktop-check, dependency-policy, and CodeQL evidence.

### 5. Reproducible npm and Cargo dependency resolution

The repository now commits both ecosystem lockfiles:

- `package-lock.json`,
- `Cargo.lock`.

Frontend clean installs use:

```bash
npm ci
```

Rust CI/release commands use `--locked`, and release builds explicitly run:

```bash
cargo metadata --locked --format-version 1 > /dev/null
```

A stale lockfile is therefore a release error rather than an opportunity for CI to resolve a different dependency graph opportunistically.

### 6. GitHub Actions runtime maintenance

Maintained workflows were modernized against current upstream action documentation:

- `actions/checkout@v7`,
- `actions/setup-node@v7`,
- `github/codeql-action/*@v4`,
- `tauri-apps/tauri-action@v1`,
- `EmbarkStudios/cargo-deny-action@v2` retained after confirming it remains the maintained major used by its upstream documentation.

The tag-triggered Linux release job also installs `xdg-utils` alongside the Tauri/WebKit packaging prerequisites.

### 7. Pull-request workflow concurrency

`.github/workflows/ci.yml` now cancels superseded runs for the same pull request/ref.

`.github/workflows/codeql.yml` also cancels superseded runs, but includes `github.event_name` in the concurrency key so scheduled and push analyses on the same ref remain independent.

This prevents the large stale-run backlog observed while PR #15 was receiving many granular hardening commits.

### 8. Version synchronization and release integrity

The version is intentionally synchronized across:

- `package.json`,
- root `Cargo.toml` `[workspace.package]`,
- `src-tauri/tauri.conf.json`,
- semantic-version labels visible in `index.html`.

`scripts/check-version.mjs` verifies these values agree. It also accepts `KEYSMITH_EXPECTED_VERSION`; a tag such as `v2.7.4` is normalized and compared with repository metadata before release packaging.

A mismatched tag/manifest combination must fail the release workflow.

### 9. Custom-symbol trust-boundary hardening

The webview is not treated as a security boundary. Direct Tauri IPC can bypass HTML control attributes, so the Rust core independently validates custom-symbol policy.

The backend now:

- limits custom-symbol input to 40 characters,
- rejects alphanumeric custom symbols,
- rejects whitespace,
- rejects control characters,
- applies ambiguity exclusion consistently,
- deduplicates repeated custom symbols before selection,
- ignores stale custom-symbol text when the symbol class is disabled,
- returns a typed, user-safe error for invalid custom-symbol policy.

Regression coverage verifies invalid character categories, overlong input, ambiguity filtering/deduplication, stale disabled input, and continued validity of every built-in preset.

### 10. Clipboard secret lifetime and timer policy

The Tauri clipboard command wraps owned secret strings with `zeroize::Zeroizing<String>` early enough that success and normal error-return paths receive best-effort zeroization on drop.

The delayed value retained for conditional auto-clear is also wrapped while the timer is active.

This remains **best effort**. KeySmith does not claim it can erase JavaScript strings, operating-system clipboard history, allocator copies, webview memory, or every external representation of a secret on demand.

Direct IPC accepts only these clipboard auto-clear values:

- `0`,
- `15`,
- `30`,
- `60`,
- `120`

seconds.

The conditional-clear safety rule remains: KeySmith clears the clipboard only if it still contains the value KeySmith copied. A newer clipboard value must not be erased accidentally.

### 11. Maximum valid batch copy fixed

The UI supports:

- up to `500` generated passwords in a batch,
- up to `128` characters per generated password,
- `Copy all`, which joins the generated passwords with newline separators.

The earlier Rust clipboard boundary rejected values above `4096` characters. That meant a fully valid large batch could be generated successfully but then fail when the user selected `Copy all`.

The authoritative generator limits are now exported by `keysmith-core`:

- `MAX_PASSWORD_LENGTH = 128`,
- `MAX_BATCH_SIZE = 500`.

The desktop adapter derives its maximum clipboard payload directly from those core limits:

`(MAX_PASSWORD_LENGTH + 1) × MAX_BATCH_SIZE - 1 = 64,499 characters`

That expression covers 500 maximum-length passwords plus the 499 newline separators inserted by the frontend batch-copy path.

The size boundary remains enforced; it was not removed. Desktop-adapter tests verify:

- exactly 64,499 characters are accepted,
- 64,500 characters are rejected.

This keeps valid product behavior working while retaining a bounded IPC payload policy and preventing the core/desktop limits from silently drifting apart.

### 12. Legacy workflow consolidation

The redundant `.github/workflows/rust.yml` workflow was removed. It duplicated Rust coverage and lacked the Linux Tauri/WebKit system prerequisites required for meaningful workspace verification.

The authoritative pull-request verification path is `.github/workflows/ci.yml` plus `.github/workflows/codeql.yml`.

Expected maintained CI jobs:

- `Frontend quality`,
- `Rust core quality`,
- `Rust dependency policy`,
- `Tauri check (ubuntu-22.04)`,
- `Tauri check (windows-latest)`,
- `Tauri check (macos-latest)`.

Expected CodeQL analyses:

- `analyze (javascript-typescript)`,
- `analyze (rust)`.

Do not configure the deleted legacy `Rust` workflow as a branch-protection requirement.

## Product implementation currently present

### Architecture

- Rust 2024 workspace.
- Security-sensitive generation/policy logic in framework-independent `crates/keysmith-core`.
- Tauri 2 desktop adapter in `src-tauri`.
- Vanilla TypeScript + Vite frontend.
- Narrow typed IPC surface between webview and Rust.
- Apache-2.0 project license.
- Windows, macOS, and Linux desktop packaging configuration.
- Restrictive Tauri CSP and `freezePrototype` enabled.
- Main-window capability restricted to Tauri core defaults plus KeySmith generation and clipboard commands; no shell/filesystem/process capability is intentionally granted.

### Password generation

The Rust core provides:

- operating-system cryptographic randomness through `getrandom`,
- rejection sampling for unbiased bounded indexes,
- Fisher-Yates-style secure shuffle backed by the same unbiased sampler,
- password lengths from 4 through 128 characters,
- lowercase, uppercase, digit, and symbol controls,
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
- verified table uniqueness,
- KeySmith-controlled OS-CSPRNG uniform index selection,
- configurable separator with validation,
- optional capitalization,
- optional two-digit suffix,
- selection-space entropy estimation.

Repeated words remain allowed. Removing previously selected words would change the independent-sampling model and is unnecessary for secure random passphrases.

### Strength estimation

KeySmith uses `zxcvbn` instead of a home-grown password-strength scoring algorithm. Strength output remains an estimate and must not be represented as a guarantee that a credential cannot be guessed or compromised.

### Clipboard and export behavior

- Clipboard copy is explicit.
- Clipboard IPC size is bounded to the exact maximum needed for the largest valid generated batch (`64,499` characters).
- Clipboard duration is allowlisted in Rust.
- Auto-clear is conditional on the clipboard still containing the expected secret.
- Clear-now is explicit.
- Batch export is plaintext by design and displays a prominent warning.
- Exported plaintext files are outside the application's memory-only generated-secret model once written by the user.

### UI/UX

The desktop interface includes:

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
- editable SVG branding plus native PNG/ICO/ICNS application icons.

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
- Dependabot for Cargo, npm, and GitHub Actions,
- no repository signing secrets.

`PRIVACY.md`, `SECURITY.md`, and `THREAT_MODEL.md` must be updated whenever a change alters these boundaries.

## Automated tests currently expected

### Rust core security tests

`crates/keysmith-core/tests/security.rs` covers at least:

- every enabled password class is represented,
- ambiguity exclusion,
- invalid custom-symbol categories,
- overlong custom-symbol input,
- custom-symbol deduplication/ambiguity behavior,
- stale custom-symbol input while symbols are disabled,
- built-in preset validity,
- batch-size bounds,
- passphrase requested word count,
- exact 8,192-entry word-table size,
- word-table uniqueness,
- passphrase entropy behavior.

### Rust property tests

`crates/keysmith-core/tests/properties.rs` covers generation invariants including output length across supported lengths and restricted-class output behavior.

### Desktop adapter tests

The `src-tauri` library test module covers:

- every supported clipboard duration,
- rejection of undocumented durations,
- acceptance of the exact largest valid batch-copy payload,
- rejection one character above the maximum batch-copy payload.

Actual operating-system clipboard integration still requires platform smoke testing because it depends on the OS clipboard service.

### Frontend tests

Vitest covers non-secret preference helpers including theme, onboarding, clipboard-clear persistence, and safe fallback behavior.

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

For the eventual v2.7.4 tag, set the shell-appropriate equivalent of:

```text
KEYSMITH_EXPECTED_VERSION=v2.7.4
```

then run:

```bash
npm run version:check
```

The tag must not be created until all other pre-tag release gates are satisfied.

## Files that define the release/security contract

Review these as applicable before significant changes:

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
- `Cargo.toml`
- `Cargo.lock`
- `rust-toolchain.toml`
- `package.json`
- `package-lock.json`
- `index.html`
- `src/main.ts`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/permissions/keysmith.toml`
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

1. Freeze the branch after this handoff update and read the exact newest PR #15 head SHA.
2. Require the complete CI and CodeQL matrix to run on that exact head.
3. Inspect every failure's real job log and fix root causes rather than weakening gates.
4. Require all six maintained CI jobs and both CodeQL analyses to succeed on one exact final head SHA.
5. Re-check PR reviews and review threads for unresolved blockers.
6. Confirm branch-protection required-check names from the successful names GitHub actually renders.
7. Build native Windows, macOS, and Linux packages from the verified candidate.
8. Smoke-test the packaged applications, including generation, custom-symbol failures, maximum-size batch copy, conditional clipboard clear, clear-now, batch export warnings, onboarding, settings, themes, and support links.
9. Perform keyboard, focus, reduced-motion, and accessibility review against packaged builds.
10. Capture genuine screenshots from the verified packages.
11. Update documentation with the real screenshots and any discovered platform caveats.
12. Merge PR #15 to `main` only after the exact final PR head is green.
13. Verify the resulting `main` merge commit and required checks.
14. Create `v2.7.4` only after merge verification and all pre-tag package/manual gates are complete.
15. Inspect the draft release artifacts, signing/notarization status, checksums/signatures where applicable, install/launch/uninstall behavior, and final release notes before publishing.

## Non-goals and boundaries

Do not expand scope casually while this release candidate is being stabilized. In particular:

- do not add cloud sync or password-history persistence without a separate architecture/security decision,
- do not add telemetry merely for convenience,
- do not weaken CSP/capability boundaries to work around UI defects,
- do not broaden dependency-license allowlists without reviewing the actual dependency license,
- do not bypass lockfile enforcement to make CI pass,
- do not remove the bounded clipboard IPC policy merely to support valid batches; derive it from core limits instead,
- do not claim a release is stable because a branch is mergeable,
- do not treat queued, missing, unexpectedly skipped, cancelled, or `action_required` workflows as successful verification,
- do not publish placeholder screenshots as real packaged-app evidence,
- do not commit signing material, access tokens, generated credentials, or smoke-test secrets.

## Commit strategy

Continue using small, meaningful commits whenever practical:

- `fix:` for concrete defects,
- `test:` for focused regression coverage,
- `ci:` for verification/workflow changes,
- `build:` for dependency/toolchain/lockfile work,
- `refactor:` for behavior-preserving policy centralization,
- `docs:` for documentation-only changes,
- `security:` for focused security-policy hardening.

Do not manufacture meaningless commits solely to increase the commit count. Each commit should remain independently understandable and reviewable.

## Immediate continuation checkpoint

At this handoff:

- the one-time Cargo lockfile bootstrap has completed and removed itself,
- `eff-wordlist` is gone from the current locked dependency graph,
- `englishid 0.3.1` is locked instead,
- the passphrase table size and uniqueness are regression-tested,
- Rust 1.97.1 is pinned,
- npm and Cargo lockfiles are committed and enforced,
- CodeQL uses v4,
- the release action uses Tauri Action v1,
- stale PR workflow runs are prevented from recurring through concurrency cancellation,
- the valid maximum-size Batch `Copy all` path now fits the bounded Rust clipboard policy,
- threat-model/testing/changelog/UI documentation has been aligned with these changes.

The next authoritative evidence is the CI/CodeQL result on the exact PR #15 head created by this handoff commit. If that head is green, proceed to package/review gates. If a job fails, inspect its real logs and continue from the specific root cause.

**Do not tag `v2.7.4` yet.**
