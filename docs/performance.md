# Performance

KeySmith has no network or database hot path. Interactive generation should feel immediate.

## Budgets

- Single password/passphrase generation: target under 50 ms on typical supported desktop hardware, excluding first-run startup.
- Batch generation of 500 passwords: target under 1 second on typical supported desktop hardware.
- UI interactions: avoid blocking the main thread for perceptible durations.
- Frontend bundle: keep dependencies intentionally small; avoid framework/runtime additions without measured benefit.

## Measurement

Rust microbenchmarks can be added if core generation changes materially. Release smoke testing should record regressions rather than optimizing from intuition. zxcvbn evaluation may dominate generation time and should be profiled separately from CSPRNG generation.
