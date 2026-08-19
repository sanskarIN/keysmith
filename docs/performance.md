# Performance

## Budgets

- Single password generation should feel instantaneous on supported desktop hardware.
- A 500-item batch should remain interactive and avoid unnecessary work per item.
- UI actions must not intentionally add artificial delays.
- The frontend bundle should stay small enough for immediate local startup.

## Current performance design

- Password generation performs bounded random sampling and a shuffle only over the requested password length.
- The maximum password length is 128 and batch size is capped at 500, bounding CPU and memory work from untrusted IPC inputs.
- Passphrases select only the requested 3–12 words from the packaged EFF list.
- zxcvbn scoring is retained for single-password and passphrase results where the UI displays a strength estimate.
- Batch generation intentionally returns lightweight `{ secret }` records and does **not** run zxcvbn once per batch item because the Batch UI does not display per-item strength. This removes up to 500 unnecessary strength-estimation calls from the maximum batch path.
- Batch rendering is capped at 500 rows, so virtualization is unnecessary at the current product limit.
- The app has no generation-time network requests or database queries.

## Measurement policy

Do not publish invented timing numbers. Before a stable release or after changing a hot path, measure release builds on representative Windows, macOS, and Linux hardware and record:

- startup-to-interactive time,
- single 20-character password generation latency,
- 500 × 128-character batch generation latency,
- 12-word passphrase generation latency,
- memory behavior during repeated maximum-size batches,
- packaged frontend asset size.

Use warm-up runs and report the hardware, operating system, build profile, sample count, and statistic used. Treat large regressions as release blockers when they make the documented interactions noticeably non-interactive.

## Profiling guidance

Profile before optimizing. For Rust, use platform-appropriate CPU profilers on release builds. For the UI, use the native WebView developer tools during development. Do not record generated credentials in profiler labels, traces, screenshots, or benchmark fixtures; use clearly fictional deterministic test data where a fixture is required.
