## Summary

Describe the problem and the focused change.

## Verification

- [ ] Relevant Rust tests pass
- [ ] Frontend typecheck, lint, text hygiene, tests, and build pass where applicable
- [ ] Repository secret scan and dependency/security checks pass where applicable
- [ ] Tauri desktop check/Clippy pass for native changes
- [ ] Real packaged UI/native behavior was tested when unit/jsdom coverage cannot represent it
- [ ] No generated secrets, credentials, tokens, private keys, private filesystem paths, or personal data are included
- [ ] Regression coverage was added for defects/behavior changes
- [ ] Documentation/changelog updated when behavior changed
- [ ] Security/privacy impact reviewed

## Native boundary review

For Tauri/native changes, confirm the smallest applicable items:

- [ ] No unnecessary `core:default`, global Tauri bridge, shell, filesystem, dialog, or opener authority was added
- [ ] Frontend-controlled inputs are bounded and validated in Rust
- [ ] New commands use the narrowest custom permission/capability
- [ ] External destinations remain exact-scoped
- [ ] Clipboard/export changes preserve secret-data minimization and documented warnings
- [ ] Async results cannot restore stale mode-specific UI state

Write `Not applicable` below when the change has no native-boundary impact.

## Security and privacy notes

Describe changes to randomness, IPC, Tauri capabilities/CSP, clipboard, persistence, export, external links, dependencies, logging, or network behavior. Write `None` only after reviewing those areas.

## Release notes

State whether this change requires `CHANGELOG.md`, release verification, screenshots, migration notes, or a new ADR.
