# Development

KeySmith development is organized by trust boundary. Put each change in the narrowest responsible layer and preserve the security/privacy model while adding behavior.

## Repository layers

- `crates/keysmith-core` — security-sensitive policies, validation, random selection, passphrases, presets, strength estimates, typed errors.
- `src-tauri` — narrow native IPC, clipboard worker, native batch save, exact opener capability, desktop configuration/plugins.
- `src` + `index.html` — presentation, transient state, localization, non-secret preferences, export text construction, exact frontend link allowlist, accessibility behavior.
- `scripts` — deterministic repository quality/security/documentation tooling.
- `docs` — product, architecture, API, security, development, test, verification, release, and operations documentation.
- `.github` — CI, CodeQL, dependency automation, issue/PR governance, and release packaging.

Do not move secure generation/validation or privileged operating-system decisions into HTML/TypeScript merely because that is easier to prototype.

## Commands

```bash
npm run dev          # frontend only
npm run tauri dev    # full desktop app
npm audit --audit-level=high
npm run secret:check
npm run typecheck
npm run lint
npm run format:check
npm run docs:check
npm test
npm run build

cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
cargo clippy -p keysmith --all-targets -- -D warnings
```

Cargo dependency policy runs through cargo-deny in CI. Desktop `cargo check` and Clippy run on Linux, Windows, and macOS. CodeQL analyzes JavaScript/TypeScript and a complete Rust workspace build.

## Core rules

- Keep password/passphrase policy, randomness, and validation in `keysmith-core`.
- Reuse the OS-backed CSPRNG and rejection-sampled bounded selector; do not add `Math.random`, timestamps/counters, a non-cryptographic PRNG, modulo-biased mapping, or a weak fallback.
- Preserve strict Serde camelCase shapes and unknown-field rejection at IPC boundaries.
- Keep custom-symbol validation Rust-owned: max 40 characters, ASCII punctuation, deduplicated before selection, ambiguity filtering applied when requested.
- Keep `unsafe` forbidden and warnings treated seriously.
- Keep errors structural and free of generated values.
- Add unit/security/property/serialization/validation regression coverage for changed invariants.

See [`core-api.md`](core-api.md).

## Native/Tauri rules

- Keep operating-system integrations narrow and reviewable in `src-tauri`.
- Bound/validate every frontend-controlled input in Rust.
- Preserve module-only Tauri frontend API; do not restore `window.__TAURI__` without a new security review/ADR.
- Do not add `core:default`, broad shell/fs/url permissions, arbitrary user-controlled opener targets, or implicit capabilities for convenience.
- Keep only explicitly required commands registered and permitted.
- Keep production CSP restrictive and separate development-only allowances into `devCsp`.
- Preserve the dedicated Rust native-save command; do not expose a generic frontend filesystem write API.
- Clipboard policy changes must preserve one replaceable/cancellable pending clear schedule and exact-value conditional clearing unless a separately reviewed architecture replaces it.
- Minimize application-owned sensitive buffers and keep zeroization where practical.

See [`desktop-bridge.md`](desktop-bridge.md) and ADR 0004.

## Frontend rules

- Call native operations only through `src/api.ts`/approved plugin wrappers.
- Keep generated secrets/batches transient; do not add local/session/IndexedDB/cookie/history persistence.
- Keep only the documented non-secret preference keys in `src/storage.ts` unless a reviewed non-secret setting is added.
- Async operations that can outlive a mode/state change must verify the current generation revision before mutating mode-specific UI.
- Keep external destinations synchronized across `index.html`, `src/external-links.ts`, and native opener capability; tests enforce this.
- Put user-facing frontend copy in the localization boundary; do not translate command names, policy identifiers, storage keys, or native permission names.
- Preserve semantic markup, labels/grouping, keyboard tab behavior, visible focus, live status/output, reduced motion, scaling, and non-color-only meaning.
- Apply the structured diagnostics policy in [`logging.md`](logging.md); a redaction helper is not permission to pass real secrets under arbitrary keys.

See [`frontend.md`](frontend.md), [`accessibility.md`](accessibility.md), and [`i18n.md`](i18n.md).

## Adding a generator option

1. Add the typed field in `crates/keysmith-core/src/policy.rs`.
2. Choose a safe default and strict Serde behavior.
3. Validate and implement it in the core.
4. Add unit/property/security coverage, including malformed IPC-equivalent values.
5. Update `src/types.ts` for serialized shape changes.
6. Expose/use it through the existing narrow command types.
7. Add an accessible control and localized validation/status copy in the UI.
8. Consider batch-path cost separately; do not add expensive per-item metadata that Batch does not consume.
9. Update [`core-api.md`](core-api.md), [`frontend.md`](frontend.md), [`user-guide.md`](user-guide.md), and security/privacy/threat documentation if the model changes.
10. Keep `docs/repository-reference.md` synchronized when any tracked file is added/removed/renamed.

## Adding a native command

1. Explain why existing commands cannot safely satisfy the operation.
2. Keep reusable domain rules outside Tauri where practical.
3. Bound and validate every frontend-controlled input in Rust.
4. Return safe errors without secret values or sensitive local paths.
5. Register it in `generate_handler!`.
6. Create/extend the smallest custom permission.
7. Add that permission only to the explicitly enabled capability/window that needs it.
8. Update the typed frontend API wrapper/types.
9. Add native validation plus configuration/integration tests.
10. Update `THREAT_MODEL.md`, `PRIVACY.md`, [`desktop-bridge.md`](desktop-bridge.md), and an ADR if the trust boundary materially changes.
11. Verify cross-platform Tauri check + Clippy through the PR matrix.

## Adding an external link

1. Add only an intentional fixed destination to About/help markup.
2. Add exactly the same URL to `src/external-links.ts`.
3. Add exactly the same URL to `opener:allow-open-url` in `src-tauri/capabilities/default.json`.
4. Update localization/public contact docs if visible copy changes.
5. Keep `src/external-links.integration.test.ts` green.

Do not replace exact scope with wildcard domains or a generic URL opener unless a reviewed product feature requires it.

## Changing batch export

- Preserve deterministic warning-bearing text construction in `src/export.ts`.
- Keep Rust input bounded and shape-validated **before** the native save dialog opens.
- Do not weaken the plaintext warning.
- Do not add silent/default-path writes or expose selected private paths in errors/logs.
- Keep the command-owned export buffer zeroized where practical.
- Add Rust validation tests plus frontend API/integration tests.
- Update [`user-guide.md`](user-guide.md), [`desktop-bridge.md`](desktop-bridge.md), threat/privacy docs, and packaged verification cases.

## Changing clipboard behavior

- Verify single and maximum-batch payload sizes against the Rust bound.
- Keep supported delay values synchronized between storage/UI/Rust.
- Preserve newer-schedule replacement, Never cancellation, manual-clear cancellation, and exact-value conditional clearing.
- Never log clipboard contents.
- Add native unit/integration/manual regression cases for timing/scheduling changes.

## Adding user-facing copy or a locale

1. Add canonical English copy to `src/i18n/en.ts`.
2. Use `data-i18n*` for static markup or catalog/formatters from TypeScript for runtime text.
3. Update localization tests for keys/helpers/fallback behavior.
4. Keep stable backend identifiers separate from display text.
5. Review text expansion, accessible names, warnings, and dialogs.
6. Follow [`i18n.md`](i18n.md) and ADR 0003 before shipping another locale.

## Adding persistent settings

A setting must be demonstrably non-secret. Use a namespaced `keysmith.*` key, a strict accepted-value set, safe fallback, storage tests, and privacy/user/frontend documentation. Generated credentials, clipboard content, export destinations, strength/entropy, and usage history are not settings.

## Documentation changes

Documentation is part of the implementation rather than a later cleanup phase.

Before a substantial PR is complete:

1. update the topic-specific guide;
2. update `docs/README.md` navigation if needed;
3. run `npm run docs:check`;
4. add every new tracked path to `docs/repository-reference.md`;
5. update root security/privacy/changelog docs when guarantees or user-visible behavior change;
6. update `what_changed.md` for the active release-candidate handoff.

Do not document planned behavior as if it already exists.

## Dependency changes

- Prefer narrow, maintained dependencies/plugins/actions.
- Review upstream security/release notes and lockfile diffs.
- Keep npm high-severity audit and cargo-deny policy green.
- Do not weaken `deny.toml` or repository scans merely to accept an update.
- Pay extra attention to CSPRNG, word list, zxcvbn, Tauri, clipboard/dialog/opener, Serde, zeroize, and privileged release Actions.

Dependabot proposes changes; it does not establish trust automatically.

## Version changes

A release-version change must update npm package metadata, Cargo workspace, Tauri configuration, visible UI metadata, changelog, and handoff together. `src/version-consistency.test.ts` intentionally fails when known surfaces diverge.

## Debugging

Do not print generated credentials, clipboard values, export contents/paths, tokens, or private keys. Prefer non-secret structural facts such as mode, option ranges, count, error variant, platform, or revision number.

When a CI/security defect is fixed, inspect the exact failing log, fix the responsible source/configuration, add regression coverage when behavior changed, and verify the **new exact head**. Do not rely on an older green SHA.
