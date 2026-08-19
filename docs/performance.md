# Performance

KeySmith has no runtime server/database path and performs credential generation locally, so normal interactions should feel immediate on supported desktop hardware. Security and correctness always take priority over micro-optimizations.

## Performance principles

- Never replace cryptographic randomness with a faster non-cryptographic source.
- Never remove rejection sampling or required-set guarantees for speed.
- Do not cache/reuse generated secrets.
- Do not persist secret history as a performance optimization.
- Measure generation, strength estimation, IPC, rendering, and export separately before optimizing.
- Prefer reducing unnecessary work/dependencies over introducing complexity without evidence.

## Working budgets

These are engineering targets, not release guarantees for every device:

| Operation | Target on typical supported desktop hardware |
| --- | --- |
| Single password generation + strength estimate | under ~50 ms after startup |
| Single passphrase generation + strength/entropy presentation | under ~50 ms after startup |
| Batch generation of 500 passwords + strength estimates | under ~1 second |
| Tab/theme/settings interactions | no perceptible main-thread blocking |
| Clipboard command dispatch | visually immediate; OS clipboard latency excluded from hard guarantee |
| Normal application startup | responsive enough that onboarding/main UI does not appear hung |

If measurements show a regression, record the platform/build and actual values rather than changing budgets to hide it.

## Where time is spent

### Core random selection

Password generation performs:

- one OS-random bounded selection for each required class;
- additional bounded selections until requested length is reached;
- Fisher–Yates-style random swaps.

Passphrase generation performs one bounded selection per word plus an optional numeric selection.

These operations are intentionally small. Do not batch or reuse random values without a security review.

### Strength estimation

`zxcvbn` can cost substantially more CPU than selecting random password characters. When profiling generation, separate:

1. core secret generation;
2. strength estimation;
3. Tauri serialization/IPC;
4. frontend rendering.

Otherwise a strength-estimation change can be misdiagnosed as a CSPRNG regression.

### Batch mode

Batch generation computes strength independently for every generated password. At the maximum count of 500, strength estimation and serialization can dominate total cost.

If batch performance becomes problematic, preserve these invariants:

- each password is independently generated;
- all requested policies remain enforced;
- no secret is cached/reused;
- no secret is logged for profiling;
- UI remains responsive or explicitly indicates work in progress.

Any future worker/threading optimization must be evaluated for secret lifetime, error handling, platform behavior, and deterministic cleanup.

## Frontend performance

The frontend intentionally uses Vanilla TypeScript rather than a large runtime framework. Keep the dependency graph small unless a new dependency has a measured product benefit that justifies bundle/runtime/security cost.

Avoid:

- repeated full-DOM rebuilding when targeted text/state changes are enough;
- large polling loops;
- background timers unrelated to user-visible behavior;
- retaining previous generated batches after mode changes;
- expensive calculations on every keystroke when they can occur on Generate.

Current generator actions set a busy state while awaiting the Rust command and restore it in `finally`.

## Clipboard timer behavior

Clipboard auto-clear uses one background Rust thread for a copied value when a nonzero delay is selected. The supported UI maximum is two minutes, with a defensive Rust cap of five minutes for direct command inputs.

Performance changes must not turn this into rapid polling. The current design sleeps once, performs one clipboard comparison, and conditionally clears.

## Export performance

Batch export creates a text string and temporary Blob URL in the frontend. At the supported maximum of 500 passwords this should remain small enough for normal desktop memory.

Do not introduce streaming/filesystem complexity unless measured requirements exceed the current bounded workload.

## Startup and dependency weight

Release performance includes more than generator speed. Review:

- frontend bundle size;
- Rust/Tauri binary/package size;
- native startup time;
- dependency count and initialization cost;
- webview readiness.

A dependency that adds a large runtime or binary cost should be justified with measured benefit.

## Measuring core generation

If core behavior changes materially, add a benchmark harness rather than using ad-hoc prints containing secrets.

Safe measurements should operate on generated values only long enough to prevent optimization from removing work and must not print/store those values.

Useful cases:

- password lengths 4, 20, 64, 128;
- all character classes vs restricted class policies;
- passphrases 3, 5, 12 words;
- with/without numeric suffix;
- batch counts 1, 10, 100, 500;
- strength estimation measured separately.

Benchmarks are not currently part of the committed repository; if added, document their files in [`repository-reference.md`](repository-reference.md).

## Release measurement

For a performance-sensitive release candidate, record:

- commit/tag;
- release/debug build type;
- OS/architecture;
- hardware class;
- operation/options/count;
- sample count and summary metric;
- whether strength estimation is included.

Do not compare an optimized release build against an unoptimized debug build and call the difference a code regression/improvement.

## Regression triage

When a performance regression is reported:

1. reproduce on the same build type;
2. identify frontend vs IPC vs Rust core vs zxcvbn vs OS clipboard/package startup;
3. profile without logging secrets;
4. check recent dependency changes;
5. create a minimal non-secret benchmark/reproduction;
6. fix the responsible layer;
7. add a benchmark/regression test when stable and useful;
8. verify security invariants are unchanged.

## What performance must never compromise

No performance target justifies:

- weaker/non-cryptographic randomness;
- modulo-biased selection;
- removal of Rust validation;
- silent loss of an enabled required character class;
- reduced passphrase selection quality;
- skipped security warnings;
- secret caching/history;
- logging credentials;
- broader Tauri permissions;
- a network generation service.
