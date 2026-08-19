# Release Process

KeySmith releases are cross-platform desktop releases. A stable tag is the end of the verification process, not the start of it. Do not tag a release candidate until the exact commit has passed the required automated and manual gates documented in [`testing.md`](testing.md).

## Release principles

- Build from a reviewed commit with an auditable history.
- Keep all user-visible version fields synchronized.
- Resolve dependencies from a trusted clean environment.
- Treat Linux, Windows, and macOS as separate native verification targets.
- Never claim signing/notarization that has not actually occurred.
- Never commit private signing keys, tokens, certificates containing private material, passwords, or notarization credentials.
- Publish security/privacy-impacting behavior explicitly in release notes.
- Do not publish placeholder screenshots as real release captures.

## Version model

The repository currently uses a single product version across the Rust workspace, frontend package metadata, Tauri bundle configuration, and visible UI text.

Before a version change is committed, search/update at least:

- root `Cargo.toml` → `[workspace.package].version`;
- `package.json` → `version`;
- `src-tauri/tauri.conf.json` → `version`;
- `index.html` footer;
- Settings version text in `index.html`;
- About version text in `index.html`;
- `CHANGELOG.md`;
- `what_changed.md` current version and release-notes draft.

Do not update only the UI string or only the package metadata.

## Pre-release branch/PR

Use a release-candidate branch and pull request targeting `main` so PR-triggered CI and CodeQL can verify the exact candidate before merge.

The PR should contain:

- implementation fixes/features intended for the release;
- regression tests;
- complete documentation updates;
- changelog updates under the appropriate unreleased/release section;
- no generated local build directories;
- no credentials or signing material.

The full repository file inventory in [`repository-reference.md`](repository-reference.md) should match the resulting tree.

## Automated release-candidate gates

The same candidate commit must produce successful results for:

### Frontend

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

### Rust core

```bash
cargo fmt --all -- --check
cargo clippy -p keysmith-core --all-targets --all-features -- -D warnings
cargo test -p keysmith-core --all-features
```

### Desktop adapter

```bash
cargo check -p keysmith --all-targets
```

The main CI workflow runs the Tauri check on Ubuntu 22.04, Windows, and macOS.

### Dependency policy

The cargo-deny job must complete successfully against the resolved Rust dependency graph and `deny.toml` policy.

### Static security analysis

Both CodeQL language jobs must complete successfully:

- JavaScript/TypeScript;
- Rust.

A CodeQL success is one security signal, not a claim that the application is vulnerability-free.

## Lockfiles

At the current 0.1.0 checkpoint, `package-lock.json` and `Cargo.lock` are not yet committed because earlier construction could not obtain a trusted registry-backed resolution in the local execution environment.

Before stable release, resolve the dependency graph in a clean trusted environment and decide/record the project lockfile policy. For an application repository, reproducible dependency resolution is strongly preferred.

Do not hand-author lockfiles. Commit only tool-generated lockfiles whose dependency resolution has been reviewed and whose CI/builds succeed.

If lockfiles are added, update:

- [`repository-reference.md`](repository-reference.md);
- setup/development instructions if install commands change (for example `npm ci`);
- CI/release workflows to use the reproducible install path where appropriate;
- `what_changed.md`.

## Native build preparation

For a local platform build:

```bash
npm install
npm run tauri build
```

Platform prerequisites from [`setup.md`](setup.md) must already be installed.

The tag-triggered `.github/workflows/release.yml` builds:

- Linux on Ubuntu 22.04;
- Windows on `windows-latest`;
- universal macOS artifacts using Apple Silicon + Intel Rust targets.

The workflow creates a **draft** GitHub release so artifacts can be reviewed before publication.

## Signing and notarization

The repository release workflow currently states that generated artifacts are unsigned unless signing is separately configured.

### Rules

- Private keys/tokens must live only in protected secret storage or secure local signing systems.
- Do not paste signing material into issues, workflow YAML, `.env.example`, documentation, or release notes.
- Signing configuration must be reviewed independently from ordinary build logic.
- A successful compilation is not evidence of a valid signature.
- macOS notarization and platform trust prompts must be tested on the resulting artifact if signing/notarization is enabled.

If signing is not configured for a release, release notes must say so accurately rather than implying platform verification/signing.

## Native smoke testing

Test the actual packaged application/artifact, not only `npm run tauri dev`.

Required functional areas:

- application install/launch/close/relaunch;
- first-run onboarding and persistence;
- password generation across representative/min/max policies;
- passphrase generation and entropy status;
- all presets;
- batch generation and plaintext export warning/file content;
- single and batch clipboard copy;
- conditional clipboard auto-clear without overwriting newer clipboard content;
- clear-now actions;
- System/Light/Dark themes and persistence;
- Settings and About dialogs;
- project/mail links;
- keyboard navigation/focus/skip link/dialog behavior;
- reduced-motion/scaling/responsive behavior.

Detailed manual cases are in [`testing.md`](testing.md).

## Screenshot policy

README/release screenshots must be captured from a verified release-candidate build. Do not fabricate placeholder screenshots, mock installed-product screenshots, or label design prototypes as release captures.

Before adding screenshot files:

- confirm they contain no generated real-world credential that might be reused;
- use disposable synthetic output;
- check personal desktop information is not exposed in the capture;
- add screenshot assets to [`repository-reference.md`](repository-reference.md);
- update README image references.

## Changelog preparation

Before tagging:

1. move/finalize the candidate entries under the intended version;
2. set the actual release date only when release timing is finalized;
3. describe user-visible security/privacy changes clearly;
4. distinguish fixes, features, documentation, and breaking/migration notes;
5. do not claim verification/signing outcomes that were not observed.

`what_changed.md` may contain a working release-notes draft, but `CHANGELOG.md` is the durable public release history.

## Tagging

Only after the candidate is verified and merged to the intended release commit:

```bash
git tag -a vX.Y.Z -m "KeySmith vX.Y.Z"
git push origin vX.Y.Z
```

The `v*` tag triggers `.github/workflows/release.yml`.

Before pushing the tag, confirm:

- the commit SHA is the exact verified candidate;
- version fields match `X.Y.Z`;
- changelog is finalized;
- `what_changed.md` records the verified checkpoint;
- no later unverified commit has been added to `main`.

## Draft release workflow

The release workflow uses `tauri-apps/tauri-action` and supplies:

- tag name from `github.ref_name`;
- release name `KeySmith <tag>`;
- a short body directing users to `CHANGELOG.md`;
- draft status `true`;
- prerelease status when the tag contains `-`;
- the platform-specific build arguments.

The draft should be inspected before publication for:

- expected platform artifacts;
- expected architecture/installer types;
- file sizes that appear reasonable;
- signing/notarization status;
- release-note accuracy;
- successful smoke-test evidence.

## Publication checklist

Before changing the draft to published:

- [ ] Candidate commit/PR checks are green.
- [ ] `main` push checks are green for the merged release commit.
- [ ] Frontend/Rust/Tauri/dependency/CodeQL gates are verified.
- [ ] Native artifacts built for all supported platforms.
- [ ] Packaged-app smoke tests completed.
- [ ] Accessibility manual review completed.
- [ ] Signing/notarization status accurately recorded.
- [ ] Changelog version/date finalized.
- [ ] Real release screenshots captured/updated if required.
- [ ] `what_changed.md` updated with final evidence and next milestone.
- [ ] Draft release notes contain no credentials/private data.
- [ ] Downloaded release artifacts match the intended tag/commit.

## Post-release checks

After publication:

1. verify the release page exposes the expected artifacts;
2. download and launch at least a representative published artifact where practical rather than relying only on pre-upload output;
3. confirm README/changelog links and version labels are correct;
4. verify no signing secrets or unintended build files were published;
5. create/advance the next `Unreleased` changelog section and roadmap/handoff milestone as needed;
6. monitor security/dependency automation for newly surfaced issues.

## Rollback / bad release

If a release artifact has a serious defect:

- do not silently replace source history;
- clearly mark/draft/remove the problematic published artifact according to severity and GitHub release capabilities;
- document the affected version;
- fix on a reviewable branch;
- add a regression test where possible;
- verify a new version from a clean candidate;
- publish a new tag/version rather than mutating a released commit.

For a security defect, follow `SECURITY.md` and avoid public disclosure of exploit details before an appropriate fix/release plan.

## Secret handling during release

Never commit or expose:

- code-signing private keys;
- signing passwords;
- Apple API/notarization secrets;
- GitHub personal tokens;
- cloud/KMS credentials;
- certificate private material;
- generated user credentials used during smoke tests.

The standard `GITHUB_TOKEN` supplied by Actions is referenced only through `${{ secrets.GITHUB_TOKEN }}` in workflow execution and must not be printed intentionally.
