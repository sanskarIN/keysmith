# Troubleshooting

Use this guide to isolate KeySmith failures by layer before changing application code. The repository has a framework-independent Rust core, a Tauri desktop adapter, and a TypeScript/Vite presentation layer; a failure in one layer does not necessarily indicate a problem in the others.

## Fast isolation sequence

Run checks in this order:

```bash
node --version
npm --version
rustc --version
cargo --version

npm install
npm run typecheck
cargo check -p keysmith-core
cargo check -p keysmith --all-targets
npm run tauri dev
```

Interpretation:

- frontend checks fail → investigate Node/dependencies/TypeScript first;
- core Rust fails → investigate Rust/dependency/core source;
- core passes but desktop fails → investigate Tauri/native platform prerequisites;
- desktop compiles but runtime action fails → investigate webview/Tauri/clipboard/UI integration.

## Desktop bridge unavailable

### Symptom

The UI reports:

```text
KeySmith desktop bridge is unavailable. Run the app through Tauri.
```

### Cause

`src/api.ts` intentionally refuses to generate credentials when `window.__TAURI__.core.invoke` is unavailable. A normal browser/Vite session does not have the privileged desktop bridge.

### Resolution

Run:

```bash
npm run tauri dev
```

Do **not** fix this by adding `Math.random()` or any browser-side password fallback. Refusing insecure/non-authoritative generation is intended behavior.

## Port 1420 already in use

Vite is configured with `strictPort: true` on port 1420 so Tauri cannot accidentally connect to a different frontend server.

Find/stop the existing process using the port, then run the app again.

Common causes:

- a previous `npm run dev` terminal is still running;
- another KeySmith development process is open;
- an unrelated local service uses port 1420.

Do not casually change the Vite port without also updating `src-tauri/tauri.conf.json`.

## `npm install` fails

Check:

```bash
node --version
npm --version
```

Then, if the existing install is corrupt:

```bash
rm -rf node_modules
npm install
```

On Windows PowerShell, remove `node_modules` with an appropriate PowerShell/File Explorer command instead of the Unix `rm` command.

At the current 0.1.0 checkpoint there is no committed `package-lock.json`, so dependency resolution can vary until the release-candidate lockfile task is completed. Review resolved dependency changes before treating an install result as release-authoritative.

Never solve dependency installation failures by committing `node_modules`.

## TypeScript typecheck fails

Run:

```bash
npm run typecheck
```

Common causes include:

- Rust/TypeScript IPC shape drift;
- a required DOM element ID/type changed;
- incorrect indexed access under `noUncheckedIndexedAccess`;
- wrong nullable handling;
- Vite configuration typing changes.

When a Rust Serde structure changes, compare it with `src/types.ts` and `src/api.ts`.

## ESLint fails

Run:

```bash
npm run lint
```

The repository uses type-aware ESLint and explicitly rejects floating promises. If an async event callback intentionally starts a promise, handle/mark it consistently with existing patterns such as `void generate()` while ensuring the called function internally handles failures.

Do not disable a rule globally merely to clear one actionable warning.

## Text-hygiene check fails

Run:

```bash
npm run format:check
```

`scripts/check-format.mjs` reports:

- CR/CRLF line endings;
- missing final newline;
- trailing whitespace.

Fix the reported file. `.editorconfig` and `.gitattributes` should help prevent recurrence.

This check is repository text hygiene; Rust formatting is separately enforced by `cargo fmt`.

## Rust formatting fails

Run:

```bash
cargo fmt --all
cargo fmt --all -- --check
```

Review formatting changes before committing them, especially when a tooling version changed.

## Rust Clippy fails

For core-only work:

```bash
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
```

Workspace lints forbid unsafe Rust and deny `unwrap`/`expect`. Prefer explicit error propagation or test-safe failure handling rather than weakening repository lints.

## `cargo check -p keysmith-core` works but Tauri check fails

This usually points to desktop native dependencies rather than generation-core logic.

Run:

```bash
cargo check -p keysmith --all-targets
```

Then inspect the first native dependency/compiler/linker error.

### Linux

The Ubuntu 22.04 CI installs:

```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf
```

Other distributions require equivalent packages under different names.

### Windows

Check that Microsoft C++ build tools/Windows SDK/WebView2 support are installed and that Rust uses a supported MSVC target.

### macOS

Check Xcode Command Line Tools:

```bash
xcode-select -p
clang --version
```

See [`setup.md`](setup.md) for the full platform preparation guide.

## Clipboard unavailable

### Symptom

Copy/Clear shows a clipboard failure while generation still works.

### Cause

`arboard` could not initialize or access the operating-system clipboard. This can happen in unusual/sandboxed Linux sessions, remote environments, headless sessions, or restricted desktop contexts.

### Resolution

- confirm the app is running in a normal graphical desktop session;
- check platform clipboard services/permissions;
- try **Clear clipboard now** to determine whether all clipboard access fails;
- keep using the displayed value manually if your environment safely permits it.

Do not add a hidden alternate clipboard service/network path. Clipboard failure should remain an explicit, contained side-effect failure.

## Clipboard did not auto-clear

Check:

1. clipboard setting is not **Never**;
2. copied value was written successfully;
3. configured delay has elapsed;
4. clipboard still contains exactly the KeySmith-copied value.

If you copied different content before the timer expired, KeySmith intentionally leaves the newer clipboard content untouched.

OS clipboard managers may retain history even after KeySmith clears the current clipboard. That is outside the application's guaranteed control.

## Clipboard cleared sooner/later than expected

The UI exposes 0, 15, 30, 60, and 120 seconds. The Rust command caps any direct IPC delay at 300 seconds as a defense-in-depth bound.

If testing a normal UI value produces materially wrong behavior, reproduce in a packaged desktop build and record the platform because timer/clipboard behavior is native-environment dependent.

Do not include the generated clipboard value in a public bug report.

## Generation reports an invalid character-set error

Password generation rejects:

- no enabled character sets;
- an enabled character set that becomes empty after filtering.

A common edge case is enabling only Symbols, providing custom symbols made entirely of characters removed by **Exclude ambiguous characters**, and then attempting generation.

Choose a usable set or modify the custom symbols. The core rejects the request rather than silently substituting a different policy.

## Password length error

The core supports 4–128 characters. If an invalid value reaches Rust through modified/dev tooling, it returns a safe validation error.

Do not expand the UI range without updating core validation, tests, user/core docs, and security review.

## Passphrase word-count error

The core supports 3–12 words. Values outside that range are rejected even if injected around the HTML range input.

## Passphrase separator error

A separator can contain at most three characters and cannot contain control characters. An empty separator is allowed.

If a multi-code-point separator visually appears short but exceeds three Unicode scalar characters, Rust rejects it based on character count.

## Presets fail to load

The frontend requests presets from `get_presets_command` during initialization.

Check:

- app is running through Tauri;
- command remains registered in `src-tauri/src/lib.rs`;
- `keysmith-generation` permission includes `get_presets_command`;
- `main` capability includes `keysmith-generation`;
- frontend command name in `src/api.ts` still matches.

Do not duplicate presets in TypeScript as a workaround; Rust is the preset source of truth.

## Onboarding appears every launch

The completion flag is stored as `keysmith.onboardingComplete=true` through `src/storage.ts`.

Possible causes:

- webview local storage is disabled/unavailable;
- application data is cleared between runs;
- a privacy/sandbox environment prevents writes;
- the storage key changed without migration.

Generation remains functional even when preference persistence fails.

## Theme does not persist

The theme key accepts only `system`, `light`, or `dark`. Invalid stored values fall back to `system`.

If local storage is unavailable, a selection may apply during the session but not survive restart; preference persistence is intentionally non-critical.

## System theme does not follow OS changes

The frontend listens to `matchMedia("(prefers-color-scheme: dark)")` and reapplies only when the stored preference is `system`.

Confirm:

- Settings shows System;
- platform webview supports the media-query change event;
- the issue reproduces in the packaged/native webview, not only a non-Tauri browser preview.

## Batch export is plaintext

This is intended behavior, not an encryption bug. The export includes a warning header and the UI warns before export.

If encrypted export is proposed, treat it as a new security architecture feature rather than silently changing the `.txt` format.

## Batch export button is disabled

The button becomes enabled only after a successful non-empty Batch generation. Switching modes calls `resetOutput()` and intentionally discards the current frontend batch state.

Generate a new batch in Batch mode before exporting.

## Native icon/bundle issue

Tauri bundle configuration references:

- `icons/32x32.png`;
- `icons/128x128.png`;
- `icons/128x128@2x.png`;
- `icons/icon.icns`;
- `icons/icon.ico`.

If packaging reports a missing icon, confirm these files still exist relative to `src-tauri/tauri.conf.json` and were not renamed without updating bundle configuration.

## CodeQL fails

Inspect the language-specific CodeQL job and the actual alert/build log. For Rust, remember the workflow installs Linux Tauri prerequisites before `autobuild`.

Do not suppress a CodeQL result simply because unit tests are green. Determine whether the finding is real, false positive, or build/configuration failure and document the resolution.

## cargo-deny fails

Inspect the category:

- advisory/yanked crate;
- license outside allowlist;
- wildcard dependency;
- unknown registry/Git source;
- duplicate-version warning.

Do not broaden `deny.toml` until the dependency's license/source/security status is understood.

## GitHub Actions full Rust workflow failed on Linux

The repository previously had a generic standalone workflow that built the full Tauri workspace without installing required Linux desktop packages. The focused `.github/workflows/rust.yml` now scopes itself to `keysmith-core`; cross-platform Tauri compilation belongs to the main CI desktop matrix where native dependencies are explicitly installed.

If this failure reappears, first check that the focused workflow has not regressed to an unnecessary full workspace build.

## Release workflow failure

Determine whether the failure occurs in:

1. checkout/toolchain setup;
2. Linux native dependency installation;
3. npm dependency resolution;
4. Tauri compilation;
5. platform target setup (especially universal macOS);
6. release upload/permission stage.

The workflow creates draft releases and uses the Actions `GITHUB_TOKEN`. Do not add a personal token to source as a shortcut.

## Build succeeds but app does not launch

A successful compiler/package step does not replace smoke testing.

Capture:

- operating system/version;
- target architecture;
- installer/package type;
- whether the artifact is signed/notarized;
- non-secret error output;
- commit/tag used.

Do not attach real generated credentials, clipboard contents, private signing material, or personal tokens.

## About/project link problems

If a link is wrong, update `index.html` and the corresponding public documentation/contact references in the same change. External links should remain explicit user actions and should not become background network calls.

## When filing a bug

Include:

- KeySmith version/commit;
- OS and architecture;
- development vs packaged build;
- exact non-secret steps;
- expected vs actual result;
- relevant error text with credentials/tokens removed.

Never include:

- a password/passphrase you use;
- copied batch contents;
- `.env` secrets;
- signing keys;
- authentication tokens.

Use `SECURITY.md` instead of a public issue if the defect creates a security vulnerability whose details should not be disclosed publicly.
