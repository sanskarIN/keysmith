# Development

This guide covers day-to-day KeySmith source development. Read [`setup.md`](setup.md) first for platform prerequisites, [`architecture.md`](architecture.md) for trust boundaries, and [`maintainer-guide.md`](maintainer-guide.md) for repository/release operations.

## Repository layers

Work should stay in the narrowest responsible layer:

- `crates/keysmith-core` — policy validation, randomness, password/passphrase generation, presets, strength estimation, typed core errors;
- `src-tauri` — desktop IPC, capability/permission registration, clipboard behavior, bundle configuration;
- `src` + `index.html` — presentation, transient UI state, non-secret preferences, explicit plaintext export;
- `scripts` — deterministic repository tooling;
- `docs` — product, technical, security, testing, and operations references;
- `.github` — issue/PR governance, CI, CodeQL, dependency automation, release packaging.

Do not move security-sensitive generation behavior into the frontend merely because it is easier to prototype there.

## Initial checkout

```bash
git clone https://github.com/sanskarIN/keysmith.git
cd keysmith
npm install
npm run tauri dev
```

Tauri development requires the platform prerequisites documented in [`setup.md`](setup.md). On Linux, missing WebKitGTK/AppIndicator development packages are a common cause of desktop build failures.

## Frontend-only development

```bash
npm run dev
```

This starts Vite on port 1420. The rendered page can be inspected, but secure generation commands will reject because the Tauri bridge is unavailable. Do not add a browser-side random-generation fallback to make frontend-only preview appear functional.

Use frontend-only mode for layout/style work that does not require command execution.

## Full desktop development

```bash
npm run tauri dev
```

This starts Vite through Tauri, builds the Rust desktop adapter, and launches the native webview. Use it for generation, clipboard, dialogs, external-link behavior, platform appearance, and integration testing.

## Quality commands

### TypeScript/frontend

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

What they cover:

- `typecheck` — strict TypeScript compilation without emission;
- `lint` — ESLint with type-aware rules, including no floating promises;
- `format:check` — deterministic repository text hygiene through `scripts/check-format.mjs`;
- `test` — Vitest/jsdom tests;
- `build` — typecheck plus production Vite bundle.

### Rust core

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
```

### Desktop adapter

```bash
cargo check -p keysmith --all-targets
```

Run desktop checks on the operating system you are developing on, then rely on the pull-request matrix to confirm Linux, Windows, and macOS compatibility.

### Broader Rust workspace checks

When local platform dependencies are installed, maintainers may also use:

```bash
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
```

A full workspace build on Linux requires Tauri's native system libraries. The focused `keysmith-core` checks intentionally avoid that dependency.

## Core development rules

- Use the operating-system random provider through the existing private random helper.
- Do not introduce `Math.random`, non-cryptographic Rust PRNGs, timestamps, counters, or deterministic fallback randomness for credential selection.
- Avoid modulo-based bounded selection unless the source range is proven evenly divisible; reuse `uniform_index` instead.
- Keep `unsafe` Rust forbidden.
- Do not use `unwrap`/`expect` in production/test targets covered by workspace Clippy policy without first reconsidering the error path.
- Validate security-sensitive inputs in Rust, even when HTML controls already constrain them.
- Keep error messages free of generated values.
- Add unit/property coverage for changed generation invariants.

See [`core-api.md`](core-api.md) for the maintained API/algorithm contract.

## Desktop adapter rules

- Add a Tauri command only when a privileged/native operation or bridge is necessary.
- Register commands explicitly in `src-tauri/src/lib.rs`.
- Add the smallest custom permission in `src-tauri/permissions/keysmith.toml`.
- Keep capabilities scoped to the intended window.
- Treat CSP expansion as a security change.
- Never introduce arbitrary shell/process/filesystem/network execution through a generic command.
- Keep clipboard actions user-triggered and preserve the conditional-clear behavior.
- Minimize secret-buffer lifetime and zeroize mutable Rust buffers where practical.

See [`desktop-bridge.md`](desktop-bridge.md).

## Frontend rules

- Call desktop commands only through `src/api.ts`.
- Keep `src/types.ts` synchronized with Rust Serde shapes.
- Treat generated password/passphrase/batch values as transient state.
- Keep `src/storage.ts` restricted to non-secret preferences.
- Never store a secret in local storage, session storage, IndexedDB, cookies, logs, analytics, URLs, or application settings.
- Preserve semantic labels, keyboard behavior, focus visibility, status announcements, reduced-motion support, and responsive controls.
- Plaintext export must remain explicit and visibly warned.
- Do not create a JavaScript generation fallback when Tauri is unavailable.

See [`frontend.md`](frontend.md) and [`accessibility.md`](accessibility.md).

## Adding or changing a password option

1. Add/change the typed field in `crates/keysmith-core/src/policy.rs`.
2. Define safe defaults.
3. Validate and implement behavior in the core.
4. Add deterministic/property tests for the invariant.
5. Update `src/types.ts` for the Serde camelCase shape.
6. Confirm Tauri command serialization still matches; add adapter changes only if needed.
7. Add an accessible control in `index.html`.
8. Wire it in `src/main.ts`.
9. Update presets if the option changes preset meaning.
10. Update `docs/core-api.md`, `docs/frontend.md`, `docs/user-guide.md`, and security/privacy docs when the data model changes.
11. Update `docs/repository-reference.md` only if files were added/removed/repurposed.

## Adding or changing a passphrase option

Follow the same cross-layer process as password options, and additionally review:

- whether the option adds actual random selection or only formatting;
- whether `estimated_passphrase_entropy_bits` should change;
- EFF word-list assumptions in `docs/wordlists.md`;
- passphrase validation/error cases.

Do not count deterministic formatting choices as random entropy.

## Adding a Tauri command

1. Decide whether the new privilege is actually required.
2. Implement a narrow function in `src-tauri/src/commands.rs` with validated inputs.
3. Register it in `src-tauri/src/lib.rs`.
4. Add it to the appropriate custom permission or create a new narrowly scoped permission.
5. Confirm `capabilities/default.json` grants only the required permission.
6. Add a typed wrapper to `src/api.ts` rather than invoking directly elsewhere.
7. Add/update TypeScript interfaces.
8. Test both success and failure behavior where practical.
9. Update `docs/desktop-bridge.md`, `THREAT_MODEL.md`, and `PRIVACY.md` if privilege/data behavior changes.
10. Re-run desktop checks on all CI platforms through a PR.

## Adding a persistent preference

Persistent values must be demonstrably non-secret.

1. Define a namespaced `keysmith.*` storage key in `src/storage.ts`.
2. Choose a safe fallback when storage is missing/corrupt/unavailable.
3. Restrict accepted stored values rather than trusting arbitrary strings.
4. Add tests in `src/storage.test.ts`.
5. Document the key in `PRIVACY.md`, `docs/frontend.md`, `docs/user-guide.md`, and `what_changed.md` migration notes when relevant.

Do not add generated values, history, strength results, entropy estimates, clipboard text, or batch content as preferences.

## Updating presets

Preset definitions are Rust-owned output-only data in `crates/keysmith-core/src/presets.rs`.

When changing a preset:

- preserve or intentionally version stable preset IDs;
- verify its options satisfy core validation;
- update `docs/core-api.md` and `docs/user-guide.md`;
- consider whether a user-visible behavior change belongs in `CHANGELOG.md`;
- test any security-sensitive policy assumption rather than relying on UI inspection.

## UI/HTML changes

`src/main.ts` treats several element IDs as required. Renaming/removing an ID from `index.html` without updating the TypeScript binding causes initialization to fail immediately.

For interaction changes:

- preserve semantic HTML before adding ARIA;
- verify keyboard-only operation;
- verify visible focus;
- keep text/status meaning understandable without color;
- test narrow/responsive layouts;
- review native `<dialog>` focus/close behavior;
- verify reduced-motion mode.

## Documentation changes

Documentation is maintained as part of the implementation, not as a later cleanup phase.

Before a substantial PR is complete:

- update the topic-specific guide;
- keep `docs/README.md` navigation current;
- ensure every committed file remains represented in `docs/repository-reference.md`;
- update root security/privacy docs when guarantees change;
- update `what_changed.md` for the active release-candidate checkpoint.

Do not document planned behavior as if it were implemented.

## Dependency changes

For Rust/npm/GitHub Action dependencies:

- prefer narrowly scoped, maintained dependencies;
- inspect license and source implications;
- avoid wildcard versions;
- review advisories and changelogs for security-sensitive libraries;
- run the full relevant quality matrix;
- do not weaken `deny.toml` merely to bypass a new policy finding.

Dependabot automates update proposals, not trust decisions.

## Commit and PR workflow

Prefer small Conventional Commits with one reviewable concern per commit. Examples:

```text
feat: add password policy option
fix: preserve newer clipboard content
test: cover custom symbol filtering
docs: document clipboard lifecycle
ci: scope Rust core verification
```

Before opening a pull request:

1. inspect the diff for accidental secret/test data;
2. run relevant local checks;
3. update documentation and tests;
4. verify no unrelated generated artifacts are included;
5. use the PR to obtain authoritative hosted platform/security checks.

See [`maintainer-guide.md`](maintainer-guide.md) for the release-candidate and handoff workflow.

## Debugging rules

Debugging output must never print generated credentials. If diagnostics are necessary, log structural facts such as mode, option ranges, error variants, counts, or platform information—not actual secrets or clipboard contents.

Do not ask users to paste real generated passwords into issues. Reproduction should use policy settings and synthetic non-secret samples only.
