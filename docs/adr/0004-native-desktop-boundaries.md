# ADR 0004 — Keep native desktop actions narrow and Rust-owned

- Status: Accepted
- Date: 2026-08-19

## Context

KeySmith is offline-first but still needs a few operating-system integrations: cryptographic randomness, clipboard copy/clear, plaintext batch export, and user-initiated external links. These operations cross the webview/native trust boundary and can create unnecessary attack surface if the frontend receives broad Tauri core, filesystem, shell, or URL-opening authority.

The original release candidate still exposed Tauri's global JavaScript bridge, granted `core:default`, used independent clipboard timer threads, relied on a webview blob download for batch export, and allowed normal external anchors to carry navigation behavior. Those approaches were functional but broader or less deterministic than needed for a security-focused credential generator.

## Decision

KeySmith keeps native actions narrow, explicit, and reviewable.

- The frontend imports the bundled `@tauri-apps/api/core` module; `withGlobalTauri` is disabled.
- Only `main-capability` is explicitly enabled.
- `core:default` is not granted.
- Production builds enable `removeUnusedCommands`.
- Custom permissions are separated into generation, clipboard, and export capabilities.
- Clipboard payload size and clear duration are validated in Rust.
- Clipboard auto-clear uses one replaceable/cancellable worker rather than one sleeping thread per copy.
- Batch export is a dedicated Rust command. The frontend receives no generic filesystem-write API.
- Export content is bounded and shape-validated before the native save dialog is opened, and command-owned plaintext is zeroized where practical.
- External About/contact URLs pass a frontend exact allowlist and a matching Tauri opener scope.
- Native-operation results are checked against the current UI revision before they update mode-specific state.

## Consequences

### Positive

- A compromised or buggy webview has fewer native operations available.
- Export cannot silently write to an arbitrary frontend-chosen path.
- Recopying the same secret cannot leave an older clipboard timer that overrides the newer policy.
- External navigation is restricted to documented destinations.
- Capability and data-flow changes remain easy to identify during security review.
- Cross-platform CI and CodeQL can analyze/lint the desktop adapter rather than only the core generator.

### Trade-offs

- Native export and external opening require small official Tauri plugin dependencies.
- Clipboard scheduling code is more involved than spawning an independent timer for each copy.
- Batch export remains plaintext by product design; the native save dialog improves control of the destination but does not encrypt the resulting file.
- JavaScript still necessarily holds generated results while they are displayed or prepared for explicit clipboard/export actions.

## Alternatives considered

### Grant broad Tauri defaults

Rejected because KeySmith needs only a small command surface and broad defaults make future privilege review harder.

### Expose a generic filesystem plugin to the frontend

Rejected for the initial release. A dedicated export command can enforce the exact product operation without granting general file-writing authority.

### Keep browser-style blob downloads

Rejected for the desktop release path because a native save dialog gives explicit, platform-appropriate destination selection and keeps the write operation under the Rust adapter.

### Spawn one auto-clear thread per clipboard copy

Rejected because older timers can conflict with newer user intent when the same value is copied again, and repeated calls create unnecessary worker threads.

### Allow arbitrary external URLs

Rejected because the product exposes a fixed set of project, funding, support, and business destinations; a wider opener scope is unnecessary.
