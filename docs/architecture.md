# Architecture

KeySmith is an offline-first desktop monolith with intentionally narrow boundaries between security-sensitive generation logic, desktop privileges, and presentation code. There is no application server, account service, database, analytics pipeline, or required generation-time network dependency.

For module-level details, also read [`core-api.md`](core-api.md), [`desktop-bridge.md`](desktop-bridge.md), [`frontend.md`](frontend.md), and the architecture decisions under [`adr/`](adr/).

## Architectural goals

The architecture is designed around five constraints:

1. **Secure randomness is centralized.** Credential selection happens in Rust through an OS-backed cryptographic source rather than JavaScript randomness.
2. **Validation crosses the trust boundary.** HTML controls improve UX, but Rust remains authoritative for password/passphrase/batch constraints.
3. **Desktop privileges are minimal.** The webview can invoke only explicitly registered and permitted Tauri commands.
4. **Generated secrets are ephemeral by design.** KeySmith has no password-history or vault subsystem, and local storage is limited to non-secret preferences.
5. **Side effects are explicit.** Clipboard writes and plaintext batch exports happen only after a user action and are documented as security-sensitive operations.

## Layer 1 — Core domain: `crates/keysmith-core`

The framework-independent Rust crate owns:

- `PasswordOptions` and `PassphraseOptions` policy structures;
- password validation and generation;
- batch-size enforcement and repeated independent generation;
- EFF large Diceware word selection;
- passphrase selection-space entropy estimation;
- unbiased bounded random selection and secure shuffling;
- policy presets;
- zxcvbn strength estimation;
- typed core errors.

The core has no dependency on Tauri, browser APIs, the filesystem, network access, or the system clipboard. This makes the credential-generation behavior independently testable and prevents presentation concerns from becoming part of the random-generation boundary.

### Randomness path

```text
getrandom::u64()
    ↓
rejection-sampled uniform_index(upper_bound)
    ↓
character / word selection
    ↓
secure shuffle where required
```

`uniform_index` rejects values from the incomplete tail of the 64-bit source range before taking a remainder. This avoids modulo bias for bounds that do not evenly divide 2^64.

There is no fallback PRNG. If the operating-system random provider fails, generation returns `RandomSourceUnavailable`.

## Layer 2 — Desktop adapter: `src-tauri`

The Tauri crate is the only layer with desktop privilege. It has two responsibilities:

1. adapt the core API into a small typed IPC surface;
2. perform explicit clipboard operations.

The registered command surface is limited to:

- password generation;
- passphrase generation;
- batch generation;
- preset lookup;
- clipboard copy;
- clipboard clear.

The custom Tauri permissions split generation from clipboard access, and the main capability grants those permissions only to the `main` window.

### Clipboard boundary

Copying moves a generated value through several memory domains:

```text
frontend state
    ↓ typed IPC
Rust command buffer
    ↓ arboard
OS clipboard
```

KeySmith zeroizes mutable Rust buffers where practical, but this does not imply guaranteed erasure of copies in the webview, serializer, allocator, operating-system clipboard, clipboard history, or other processes.

Delayed auto-clear holds an expected-value buffer temporarily, then clears the clipboard only when its current value still exactly matches the copied value. This prevents KeySmith from deleting unrelated clipboard content copied later by the user.

## Layer 3 — Presentation: `index.html` + `src`

The frontend uses Vanilla TypeScript and Vite. It owns:

- semantic application markup and dialogs;
- generator-mode switching;
- control state and user interaction;
- Rust command invocation through `src/api.ts`;
- rendering of returned secrets and strength information;
- plaintext batch-export formatting;
- theme behavior;
- onboarding and settings;
- non-secret preference persistence;
- accessibility interaction behavior.

The frontend does **not** generate passwords itself. If the Tauri bridge is unavailable, `src/api.ts` rejects instead of substituting browser-side randomness.

## Type and command contract

Rust policy/result structures serialize with camelCase names, mirrored manually in `src/types.ts`.

```text
TypeScript PasswordOptions
    ↓ Tauri serialization
Rust PasswordOptions
    ↓ validation/generation
SecretResult / PassphraseResult
    ↓ Tauri serialization
TypeScript result interfaces
```

Because 0.1.0 does not generate bindings automatically, a serialized type change must update both Rust and TypeScript plus relevant docs/tests in one change.

Command names are centralized in `src/api.ts`, registered in `src-tauri/src/lib.rs`, implemented in `src-tauri/src/commands.rs`, and allowed in `src-tauri/permissions/keysmith.toml`. A command rename/addition must keep all four surfaces synchronized.

## Persistent data model

The application has no credential database. The only intentional persistent frontend state is:

| Key | Purpose | Secret? |
| --- | --- | --- |
| `keysmith.clipboardClearSeconds` | clipboard clear-delay preference | No |
| `keysmith.theme` | system/light/dark preference | No |
| `keysmith.onboardingComplete` | first-run introduction completion flag | No |

`src/storage.ts` wraps local-storage reads/writes in `try/catch`, so inability to persist preferences does not prevent credential generation.

Generated passwords, passphrases, batch values, strength results, and clipboard values must not be added to this storage model.

## Primary data flows

### Single password

```text
HTML controls
→ passwordOptions() in TypeScript
→ generate_password_command
→ Rust validation
→ OS CSPRNG selections + shuffle
→ zxcvbn estimate
→ IPC result
→ transient UI output
```

### Passphrase

```text
HTML controls
→ passphraseOptions()
→ generate_passphrase_command
→ options-based entropy estimate
→ EFF-list OS-random word selections
→ optional deterministic capitalization / random 00–99 suffix
→ zxcvbn estimate
→ transient UI output + entropy status
```

### Batch

```text
Password controls + count
→ generate_batch_command
→ Rust count/policy validation
→ N independent passwords
→ per-item strength estimates
→ transient frontend batch array
→ explicit Copy all OR explicit plaintext Blob export
```

Batch export never travels through a Rust filesystem command. The frontend creates a temporary Blob URL only after the user chooses Export.

### Clipboard copy

```text
Displayed single/batch value
→ explicit Copy action
→ copy_secret_command
→ size guard
→ OS clipboard write
→ optional delayed exact-value check
→ conditional clear
```

## Network model

Generation has no application-level network path. The production CSP permits the Tauri IPC/asset protocols required by the desktop runtime, not a general remote API service.

Project links in the About dialog may open external destinations when the user explicitly activates them. Build/dependency tooling also requires network access during development/release, but this is separate from runtime credential generation.

If a future feature requires runtime networking, it is a foundational architecture/security change and requires a new ADR, threat-model/privacy review, capability/CSP review, user-visible disclosure, and opt-in design.

## Content Security Policy and webview hardening

`src-tauri/tauri.conf.json` defines a restrictive CSP and enables `freezePrototype`. Scripts are limited to local application content; Tauri IPC and local asset protocols are explicitly named.

CSP expansion must be treated as a privilege expansion. Avoid wildcard remote sources, arbitrary connect destinations, or script sources unless there is a documented security justification.

## Error handling

The core uses the typed `KeySmithError` enum. Core errors describe invalid policy or environment failure without embedding generated values.

The Tauri adapter converts core errors to user-safe strings at the IPC boundary. The frontend catches rejected commands and writes the message to a live status region.

No error path should log, serialize into diagnostics, or persist the generated secret beyond what is required to return the successful result.

## Failure containment

- **OS random failure:** generation fails closed; there is no weak fallback.
- **Invalid policy:** Rust rejects it even if malformed input bypasses HTML constraints.
- **Clipboard unavailable:** generation still works; only the clipboard action fails.
- **Local storage unavailable:** settings fall back safely; generation still works.
- **Tauri bridge unavailable:** the frontend rejects generation rather than using JavaScript randomness.
- **Preset retrieval failure:** the UI reports an error; manual options remain conceptually separate from the core preset lookup.

## Build and repository architecture

```text
keysmith/
├── crates/keysmith-core/     # security-sensitive framework-independent Rust
├── src-tauri/                # privileged desktop adapter + native bundle config
├── src/ + index.html         # unprivileged presentation layer
├── scripts/                  # repository hygiene tooling
├── docs/                     # maintained product/technical/operations docs
└── .github/                  # CI, security analysis, release, dependency automation
```

Root Cargo workspace metadata keeps the Rust core and desktop adapter on one version. `package.json`, `src-tauri/tauri.conf.json`, and visible UI version strings must be synchronized manually for releases.

## Architectural non-goals for 0.1.0

KeySmith intentionally does not include:

- a password manager/vault;
- secret history;
- cloud synchronization;
- user accounts;
- telemetry/analytics;
- remote credential generation;
- silent background update checks;
- encrypted batch storage managed by the application.

Adding any of those would materially alter the trust/data model and requires an architecture decision rather than an incremental UI-only change.

## Architecture-change checklist

Before merging a foundational change:

1. Identify the layer that owns the behavior.
2. Keep validation in Rust for security-relevant inputs.
3. Avoid adding Tauri privilege if a pure/core/frontend solution is sufficient.
4. Update command permissions/capabilities for any new privileged command.
5. Review CSP and runtime network assumptions.
6. Review secret lifetime and persistence implications.
7. Add automated tests at the narrowest responsible layer.
8. Update `THREAT_MODEL.md`, `PRIVACY.md`, and `SECURITY.md` when applicable.
9. Add or update an ADR for durable architectural decisions.
10. Update the topic reference and [`repository-reference.md`](repository-reference.md).
