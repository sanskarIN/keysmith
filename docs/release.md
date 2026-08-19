# Release Process

1. Ensure `main` is green on all supported CI jobs.
2. Confirm `CHANGELOG.md`, `ROADMAP.md`, `what_changed.md`, version fields, and screenshots are current.
3. Run the full quality suite from a clean checkout.
4. Build native bundles with `npm run tauri build`.
5. Run smoke tests on the actual built applications.
6. Create an annotated `vX.Y.Z` tag.
7. Let the release workflow build platform artifacts.
8. Apply platform signing/notarization outside the repository using protected CI secrets or local secure signing tools.
9. Publish release notes describing security/privacy-impacting changes.

Never commit signing keys, certificates with private material, tokens, or notarization credentials.
