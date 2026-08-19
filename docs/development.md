# Development

## Commands

```bash
npm run dev          # frontend only
npm run tauri dev    # full desktop app
npm run secret:check
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build

cargo fmt --all -- --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo check -p keysmith --all-targets
```

## Rules

- Keep security-sensitive logic in `keysmith-core`.
- Do not log or persist generated secrets.
- Add typed validation at trust boundaries; do not rely on HTML input limits for IPC safety.
- Prefer pure functions and explicit state.
- Put user-facing frontend copy in the locale catalog; follow `docs/i18n.md` for static attributes, runtime formatters, and fallbacks.
- Use structured diagnostic data only when needed and apply the policy in `docs/logging.md`.
- Update an ADR when changing foundational architecture/security decisions.

## Adding a generator option

1. Add the typed field in `policy.rs`.
2. Validate and implement it in the core.
3. Add unit/property coverage, including malformed IPC-equivalent values.
4. Expose it through the existing command types.
5. Add an accessible control and localized validation/status copy in the UI.
6. Update security/privacy docs if the data flow changes.

## Adding user-facing copy

1. Add the English string to `src/i18n/en.ts`.
2. Use a `data-i18n*` attribute for static markup or the catalog/formatter from TypeScript for runtime text.
3. Add or update localization tests when a new helper or fallback path is introduced.
4. Keep stable backend identifiers separate from translated display text.
5. Review text expansion and accessible names before shipping another locale.
