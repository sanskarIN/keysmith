# Performance

## Budgets

- Single password generation should feel instantaneous on supported desktop hardware.
- A 500-item batch should remain interactive and avoid unnecessary work per item.
- UI actions must not intentionally add artificial delays.
- The frontend bundle should stay small enough for immediate local startup.
- Native clipboard/export/link adapters should remain bounded and should not create unbounded worker/thread growth from repeated UI actions.

## Current performance design

- Password generation performs bounded random sampling and a shuffle only over the requested password length.
- Candidate character sets are deduplicated before sampling, preventing repeated custom symbols from expanding/weighting the pool unnecessarily.
- The maximum password length is 128 and batch size is capped at 500, bounding core CPU/memory work from normal IPC requests.
- Passphrases select only the requested 3–12 words from the packaged EFF list.
- zxcvbn scoring is retained for single-password and passphrase results where the UI displays a strength estimate.
- Batch generation intentionally returns lightweight `{ secret }` records and does **not** run zxcvbn once per batch item because the Batch UI does not display per-item strength. This avoids up to 500 unnecessary strength-estimation calls on the maximum batch path.
- Batch rendering is capped at 500 rows, so virtualization is unnecessary at the current product limit.
- Clipboard auto-clear uses one long-lived reschedulable worker instead of creating one sleeping thread per copy action.
- Batch export performs one bounded plaintext write after the user chooses a destination in the native save dialog; no polling or background sync is involved.
- Async generation/export results are discarded when they belong to an obsolete UI revision, avoiding stale render work.
- The app has no generation-time network requests or database queries.

## Measurement policy

Do not publish invented timing numbers. Before a stable release or after changing a hot path, measure release builds on representative Windows, macOS, and Linux hardware and record:

- startup-to-interactive time,
- single 20-character password generation latency,
- 500 × 128-character batch generation latency,
- 12-word passphrase generation latency,
- memory behavior during repeated maximum-size batches,
- repeated clipboard copy/reschedule behavior without worker growth,
- maximum-size batch export save latency to a local destination,
- packaged frontend asset size.

Use warm-up runs and report the hardware, operating system, build profile, sample count, and statistic used. Treat large regressions as release blockers when they make documented interactions noticeably non-interactive.

## Native operation measurement notes

Do not include time spent waiting for the user to interact with a native save dialog in export write latency. Measure the write after a destination is selected.

Clipboard auto-clear deliberately waits for user-configured time; that delay is product behavior, not latency. Measure only copy/scheduling overhead and ensure repeated copies do not create an increasing number of background workers.

External-link opening depends on operating-system browser/mail handlers and is not a generation-performance metric.

## Profiling guidance

Profile before optimizing. For Rust, use platform-appropriate CPU profilers on release builds. For the UI, use native WebView developer tools during development. Do not record generated credentials in profiler labels, traces, screenshots, export paths, or benchmark fixtures; use clearly fictional deterministic test data where a fixture is required.
