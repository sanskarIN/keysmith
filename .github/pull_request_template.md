## Summary

Describe the problem, the focused change, and why this approach is appropriate.

## Verification

- [ ] `npm run typecheck` passes when frontend/TypeScript code is affected
- [ ] `npm run lint` passes when frontend/TypeScript code is affected
- [ ] `npm run format:check` passes
- [ ] `npm run version:check` passes when release/version surfaces are affected
- [ ] `npm test` passes when frontend behavior/preferences are affected
- [ ] Relevant Rust core tests pass
- [ ] Relevant desktop-adapter `cargo check`, Clippy, and library tests pass
- [ ] UI/OS integration behavior was manually tested where automation cannot cover it
- [ ] A regression test was added for security, validation, clipboard, IPC, export, permission, persistence, or release-integrity defects
- [ ] No generated secrets, credentials, tokens, signing material, private endpoints, or personal data are included
- [ ] Documentation, changelog, threat model, roadmap, or handoff ledger were updated when applicable
- [ ] Security, privacy, accessibility, and release-integrity impact was reviewed

## Security and privacy notes

Describe changes to randomness, policy validation, IPC, permissions, clipboard, persistence, export, network behavior, release metadata, or secret handling. Write `None` only if there is genuinely no impact.

## Remaining verification

List any check that has not yet been run or cannot be run in the current environment. Do not present a release candidate as stable while required verification remains outstanding.
