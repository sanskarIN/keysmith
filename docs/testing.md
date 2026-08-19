# Testing Strategy

## Rust core

`cargo test -p keysmith-core --all-features` covers required character-class guarantees, ambiguity exclusion, batch limits, passphrase word counts, invalid length/word/separator policies, custom-symbol handling, candidate deduplication, and property tests across password lengths and restricted character sets.

## Rust desktop adapter

Desktop-adapter tests cover behavior that can be verified without a real system clipboard or interactive native dialog:

- clipboard payload bounds,
- accepted clipboard auto-clear durations,
- rejection of unsupported auto-clear durations,
- replacement of an older pending clipboard schedule by a newer schedule,
- cancellation of a pending clipboard schedule,
- bounded batch-export content shape,
- required KeySmith export header,
- rejection of control characters and oversized export payloads.

Actual native clipboard, dialog, filesystem, URL-handler, and installer behavior remains part of packaged-application verification.

## Frontend and IPC

Vitest covers:

- non-secret preference persistence, write normalization, strict stored-value parsing, and safe defaults,
- first-run onboarding state,
- typed Tauri command names and payloads,
- module-based Tauri invocation and fail-closed behavior outside the desktop runtime,
- lightweight secret-only batch IPC results,
- deterministic batch-export formatting,
- native batch-export IPC mapping,
- structured diagnostic redaction and recursion limits,
- localization application and fallback behavior,
- localized preset and strength metadata,
- exact external-link frontend allowlisting,
- synchronization between About link destinations and the Tauri opener scope,
- release-version consistency across npm, Cargo, Tauri configuration, and visible UI metadata,
- static Tauri security configuration: global bridge disabled, explicit `main-capability`, unused-command stripping, no `core:default`, and required narrow custom permissions,
- static accessibility structure in the real `index.html`, including unique IDs, explicit label targets, tab/panel relationships, button accessible names, and dialog labelling,
- primary-button design-token contrast in both themes against the WCAG AA 4.5:1 normal-text threshold,
- stale generation responses after a mode switch,
- a jsdom integration journey that loads the real `index.html`, mocks the bundled Tauri module, verifies localized preset metadata, generates/copies a password, generates a passphrase and entropy status, generates a strength-free batch, copies the batch, sends warning-bearing plaintext through the native export command, verifies the saved status, exercises a scoped About link, and verifies keyboard mode switching.

All deterministic secret strings in tests are explicitly fictional test data.

## Static and security checks

Frontend/repository gate:

- `npm audit --audit-level=high`
- `npm run secret:check`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run docs:check`
- `npm test`
- `npm run build`

`npm run docs:check` compares every path returned by `git ls-files` with `docs/repository-reference.md`; an undocumented tracked project file fails CI. This makes documentation completeness a testable repository invariant rather than a manual release note.

Rust gate:

- `cargo fmt --all -- --check`
- `cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings`
- `cargo test -p keysmith-core --all-features`
- cargo-deny advisory/license/source policy

Desktop matrix on Linux, Windows, and macOS:

- `cargo check -p keysmith --all-targets`
- `cargo clippy -p keysmith --all-targets -- -D warnings`

CodeQL:

- JavaScript/TypeScript analysis,
- Rust analysis after building the complete workspace with all targets/features on the Linux analysis runner.

Repository maintenance scripts under `scripts/` are included in ESLint. Text hygiene and secret scanning include `.env.example` and lockfiles when present.

## Lockfile verification model

During release-candidate development, primary CI may generate short-lived lockfile artifacts from real package-manager resolution so maintainers can inspect and commit trusted `package-lock.json` and `Cargo.lock` files.

Once those files are committed, they become release inputs. The final candidate must be reverified with them tracked and documented. Stable release-tag verification does **not** generate new lockfiles.

The release-tag preflight requires:

- both `package-lock.json` and `Cargo.lock` to exist in the tagged commit;
- `npm ci` to install exactly from the npm lockfile;
- Rust core Clippy/tests to run with Cargo `--locked`;
- `cargo metadata --locked` to prove the Cargo manifests and lockfile agree;
- cargo-deny to evaluate the committed Rust dependency graph.

A missing, inconsistent, or unexpectedly changing lockfile is release-blocking.

## Release-workflow verification

A tag does not proceed directly to installers. The tag workflow first runs the `Verify release tag` preflight, which requires:

- both committed dependency lockfiles;
- the tag name to equal `v${package.json.version}`;
- locked npm installation plus frontend dependency audit and repository secret scan;
- TypeScript typecheck/lint/text hygiene/documentation inventory/tests/build;
- Rust formatting;
- core Clippy with warnings denied and `--locked`;
- Rust core tests with `--locked`;
- locked Cargo metadata verification;
- cargo-deny dependency policy.

Workflow-level permissions are read-only. Only the artifact-building job receives `contents: write`, because that job alone needs to create/update the draft GitHub release.

Platform release builds use `npm ci` and depend on the complete preflight.

## Manual application verification

The release-candidate checklist in `docs/verification.md` covers keyboard navigation, reduced motion, focus order, mode switching, generation, passphrases, presets, batch export, clipboard scheduling, themes, onboarding, Settings, About links, text scaling, and unexpected network behavior.

Real packaged-app checks remain manual because native clipboards, save dialogs, filesystem destinations, browser/mail handlers, native webviews, installers, assistive technologies, and operating-system integration cannot be truthfully validated by jsdom/static tests.

## Performance regression rule

Do not add expensive per-item work to the maximum batch path unless the Batch UI consumes the result. Single-password/passphrase strength scoring remains intentional; batch items stay strength-free unless product requirements change. Record measured release-build regressions according to `docs/performance.md` rather than inventing timing claims.

## Security regression rule

Every defect involving randomness, secret leakage, clipboard behavior, permission scope, export, external navigation, dependency policy, asynchronous stale state, or input validation must gain regression coverage before the fix is considered complete.

## Clean-build release gate

Release candidates must pass CI and CodeQL on one exact commit, including desktop checks on Windows, macOS, and Linux. After trusted lockfiles are committed, that lockfile commit must pass again. A release tag must not be created while required automated, documentation-inventory, lockfile, packaged-application, screenshot, or release-governance evidence remains unresolved.
