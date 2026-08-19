# Troubleshooting

## Desktop bridge unavailable

If the UI says the KeySmith desktop bridge is unavailable, the frontend is probably running in a plain browser/Vite session. Use:

```bash
npm run tauri dev
```

The production app intentionally uses the bundled Tauri module API with the global `window.__TAURI__` bridge disabled.

## Clipboard unavailable

Some Linux desktop sessions, remote sessions, sandboxed environments, or platform policies may deny clipboard access. Password/passphrase generation still works; select/copy the displayed output using normal operating-system text controls if available.

If auto-clear does not behave as expected, verify that you tested one of the supported values: `Never`, 15 seconds, 30 seconds, 1 minute, or 2 minutes. A newer KeySmith copy replaces the previous pending clear schedule, and `Never` or manual clear cancels it.

## Batch export dialog does not appear

Batch export requires the full Tauri desktop runtime and an operating-system save dialog. A browser-only Vite session cannot exercise the real native export path.

Confirm that:

1. KeySmith is running through `npm run tauri dev` or as a packaged application.
2. A batch has been generated and the Export button is enabled.
3. The desktop session is allowed to display native dialogs.

The frontend does not have generic filesystem-write permission. The Rust adapter opens the native dialog and writes only after a local destination is selected.

## Batch export was cancelled

Cancelling the native save dialog is not an error. The generated batch remains in the current Batch view so you can choose Export again or copy it explicitly.

## Batch export write failed

The selected directory may be read-only, unavailable, disconnected, or restricted by operating-system policy. Choose a local writable destination. KeySmith deliberately does not include private filesystem paths in its user-facing error message.

## About or contact link does not open

KeySmith allows only the documented GitHub, funding, support, and business destinations. They are handed to the operating system's browser/mail handler after an explicit click.

If an approved link does not open, verify that the operating system has a default browser or mail handler configured and that local policy permits launching it. Arbitrary URLs are intentionally not supported by the About link surface.

## Native build dependency errors

Re-check the current Tauri prerequisites for the operating system, then confirm Rust and Node are supported versions. CI installs the required Linux WebKitGTK/appindicator/rsvg/patchelf packages on its Linux desktop and Rust CodeQL runners.

## Port 1420 already in use

Stop the process using the port. KeySmith intentionally uses `strictPort` so Tauri does not silently connect to a different development server.

## Development CSP or HMR problems

KeySmith separates production `csp` from `devCsp`. Production removes Vite-only inline-style/WebSocket allowances. Development allows the local Vite HMR WebSocket on port 1420.

If development HMR fails, confirm the configured dev URL/port has not been changed independently from the `devCsp` WebSocket source. Do not weaken production CSP as a workaround for a development-only problem.

## Dependency installation problems

Verify Node/npm versions, remove only the local `node_modules` directory if necessary, then run `npm install` again. Do not delete or regenerate release lockfiles casually once they are committed; review dependency and lockfile changes before merging them.

## Release tag is rejected

The tag workflow requires the tag name to equal `v` plus `package.json` version. For package version `0.1.0`, the expected tag is `v0.1.0`. The same workflow also reruns frontend/core preflight checks before platform artifacts are built.

## A CI job fails after a small change

Every release-candidate commit needs its own evidence. Read the failing step/log and fix the source/configuration rather than relying on a green run from an older commit. Security/privacy defects should gain regression coverage before the candidate is considered fixed.
