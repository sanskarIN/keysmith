# Troubleshooting

Use this guide to isolate KeySmith failures by layer before changing security-sensitive source/configuration.

## Fast isolation sequence

```bash
node --version
npm --version
rustc --version
cargo --version
npm install
npm run typecheck
cargo test -p keysmith-core --all-features
cargo check -p keysmith --all-targets
npm run tauri dev
```

Interpretation:

- frontend checks fail → investigate Node/dependency/TypeScript/markup/tooling first;
- core Rust fails → investigate policy/randomness/dependency/core source;
- core passes but Tauri fails → investigate native prerequisites or desktop adapter;
- desktop compiles but an OS action fails → investigate webview/clipboard/dialog/opener/filesystem integration;
- CI-only failure → inspect the exact hosted job/step rather than changing unrelated source.

## Desktop bridge unavailable

If the UI says the KeySmith desktop bridge is unavailable, the frontend is probably running in a plain browser/Vite session. Use:

```bash
npm run tauri dev
```

The production app intentionally imports the bundled Tauri module API with the global `window.__TAURI__` bridge disabled. Do not add a browser-side random generator as a workaround.

## Port 1420 already in use

Stop the process using the port. KeySmith uses a fixed Vite port with `strictPort` so Tauri never silently connects to a different development server.

If the port is changed intentionally, update the Tauri development URL and development CSP WebSocket source together.

## Development CSP or HMR problems

KeySmith separates production `csp` from `devCsp`. Development allows the local Vite HMR WebSocket and development-only styling behavior; production remains tighter.

If HMR fails, verify the configured development URL/port. Never weaken production CSP to solve a development-only problem.

## Clipboard unavailable

Some Linux desktop sessions, remote sessions, sandboxes, or local policies may deny clipboard access. Credential generation still works; use normal operating-system text selection/copy only if your environment safely permits it.

Clipboard failure should remain isolated to the explicit native action. Do not add a network or hidden alternate clipboard path.

## Clipboard auto-clear does not behave as expected

Verify:

1. the configured value is exactly Never, 15 seconds, 30 seconds, 1 minute, or 2 minutes;
2. the copy command succeeded;
3. no newer KeySmith copy replaced the pending schedule;
4. Never/manual clear did not cancel it;
5. the clipboard still contains exactly the originally copied value at deadline.

KeySmith intentionally preserves newer unrelated clipboard contents. Clipboard-history software may retain earlier values even after current clipboard clearing; that is outside KeySmith's guaranteed control.

## Maximum batch will not copy

The native clipboard command accepts up to 65,536 characters, chosen to cover the documented maximum batch of 500 passwords × 128 characters plus newline separators.

If a normal maximum-size KeySmith batch is rejected, treat that as a regression: capture the options/count and platform, **not the generated batch values**, and inspect the native payload-bound tests/command.

## Batch export dialog does not appear

Batch export requires the Tauri desktop runtime and OS native save dialog. A browser-only Vite session cannot exercise the real path.

Confirm:

1. KeySmith is running through `npm run tauri dev` or a packaged build;
2. a non-empty batch is current and Export is enabled;
3. the desktop session can display native dialogs.

The frontend has no generic filesystem-write permission. Rust opens the dialog and writes only after the user chooses a local destination.

## Batch export was cancelled

Cancellation is a normal result, not an error. The current batch remains available to save again or copy while Batch mode remains current.

## Batch export write failed

The chosen directory may be read-only, unavailable, disconnected, or restricted. Choose a local writable destination.

KeySmith deliberately does not include the selected private path in its user-facing error. Do not change errors/logs to expose it.

## Export content is rejected before the dialog

The native command requires:

- `# KeySmith batch export\n` prefix;
- trailing newline;
- no control characters except newline;
- total content within the native 70,000-character bound.

If the normal frontend exporter creates rejected content, inspect `src/export.ts` and `src-tauri/src/export.rs` together and add regression coverage. Do not weaken native validation just to accept malformed frontend output.

## About or contact link does not open

Only the documented GitHub, Buy Me a Coffee, support, and business destinations are allowed. A destination must match both frontend and native allowlists and is handed to the OS only after an explicit user action.

If an approved link fails:

- verify the system has a default browser/mail handler;
- verify local policy allows launching it;
- check `src/external-links.ts`, `index.html`, and `src-tauri/capabilities/default.json` for exact synchronization;
- run external-link integration/configuration tests.

Do not broaden the native opener to arbitrary `https:` or `mailto:` URLs as a workaround.

## Password policy/custom-symbol error

Rust is authoritative for policy input. Custom symbols:

- are limited to 40 characters;
- must be ASCII punctuation;
- are deduplicated before selection;
- still undergo ambiguity filtering when enabled.

If Symbols is disabled, invalid custom-symbol text should not block generation. If Symbols is enabled and filtering leaves no usable source, generation safely rejects the policy.

## Passphrase error

Passphrase rules are enforced in Rust:

- 3–12 words;
- separator 0–3 characters;
- no control characters in separator.

Do not expand UI limits without updating core validation, tests, entropy/user documentation, and security review.

## Presets do not load

Presets come from the Rust core. Check:

- app is running through Tauri;
- command registration includes `get_presets_command`;
- `keysmith-generation` permission includes it;
- `main-capability` includes the generation permission;
- `src/api.ts` command name matches;
- frontend localization maps known IDs only for display and does not replace the Rust policy source.

Do not duplicate security policy definitions in TypeScript to hide a command/configuration failure.

## Theme or onboarding preference does not persist

KeySmith only stores non-secret preferences. Storage reads/writes fail safely when unavailable.

Accepted clipboard values: `0`, `15`, `30`, `60`, `120`; malformed values fall back to 30. Theme accepts `system`, `light`, `dark`. Onboarding completion stores only its boolean-like completion flag.

If storage is blocked by the webview/environment, generation should remain functional even though settings may not survive restart.

## `npm install` or audit problems

Verify Node/npm versions first. If local installation state is corrupt, remove only local `node_modules` and reinstall.

Do not commit `node_modules`. Once trusted lockfiles are committed, do not delete/regenerate them casually; inspect dependency changes and advisories before merging.

A high-severity npm audit failure is release-blocking until investigated/fixed or a clearly justified repository policy decision is documented.

## Secret scan fails

`npm run secret:check` searches recognized repository text files for high-confidence token/private-key patterns. Inspect the reported path and remove/rotate any real credential.

Do not weaken a pattern simply to make a real secret disappear from CI. Test/examples should use obviously fictional non-matching data.

## Documentation inventory fails

Run:

```bash
npm run docs:check
```

The checker prints tracked paths missing from `docs/repository-reference.md`. Add a truthful description for each new tracked project file. Do not make the checker ignore normal source/config/docs merely to turn CI green.

If a file should not be version-controlled at all (for example a local artifact/secret), remove it from Git instead of documenting it as intentional source.

## Text hygiene fails

```bash
npm run format:check
```

Fix reported CR/CRLF line endings, missing final newline, or trailing whitespace. Rust source formatting is separately checked by `cargo fmt`.

## ESLint/typecheck fails

Run the exact failing command locally when possible:

```bash
npm run typecheck
npm run lint
```

Common causes include Rust/TypeScript IPC shape drift, missing DOM IDs/types, async promise handling, or script globals/tooling drift. Do not disable type/lint rules globally without understanding the failure.

## Native build dependency errors

Re-check current Tauri prerequisites, then Rust/Node versions. Repository CI installs Linux WebKitGTK/AppIndicator/librsvg/patchelf dependencies for Tauri and Rust CodeQL.

If `keysmith-core` passes but `cargo check -p keysmith --all-targets` fails, investigate native dependencies before changing generation code.

## cargo-deny fails

Determine whether the result is:

- advisory/yanked dependency;
- license policy;
- unknown registry/Git source;
- wildcard dependency;
- duplicate-version warning/policy.

Do not broaden `deny.toml` without understanding the affected dependency/source/license/security implication.

## CodeQL fails

Distinguish analysis/build failure from a real code-scanning finding. Rust CodeQL builds the complete workspace with Linux desktop dependencies. Unit tests being green does not invalidate a CodeQL finding.

Resolve the actual issue or document a legitimate false positive through the appropriate security workflow.

## Release tag is rejected

For package version `0.1.0`, the tag must be exactly `v0.1.0`.

Before any artifact build, `Verify release tag` reruns:

- npm audit;
- secret scan;
- typecheck/lint/text hygiene/documentation inventory/tests/build;
- Rust formatting/core Clippy/core tests;
- Cargo dependency resolution and cargo-deny.

The workflow is read-only during verification; only the platform artifact job receives `contents: write` for the draft release.

If preflight fails, fix source/configuration and create a new correct release candidate/tag process. Do not weaken the preflight to publish a known-bad artifact.

## A CI job fails after a small change

Every candidate commit needs its own evidence. Read the exact failing job/step/log and fix the responsible source/configuration. Add regression coverage for behavioral/security defects.

Do not cite a green older SHA after the head changes, and do not interpret Git-level "mergeable" as release-ready.

## Filing a safe bug report

Include:

- KeySmith version/commit;
- OS/architecture;
- development vs packaged build;
- non-secret reproduction settings/steps;
- expected vs actual behavior;
- sanitized error output.

Never include a credential you use, generated batch contents, clipboard text, private export paths, environment secrets, tokens, or signing/private-key material. Follow `SECURITY.md` for vulnerabilities that should not be disclosed publicly.
