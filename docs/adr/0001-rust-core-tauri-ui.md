# ADR 0001: Rust core with Tauri TypeScript UI

- Status: Accepted
- Date: 2026-08-19

## Context

KeySmith needs security-sensitive local generation with a polished cross-platform desktop interface.

## Decision

Use a framework-independent Rust domain crate for generation and a Tauri 2 shell with vanilla TypeScript/Vite presentation. Keep the IPC surface narrow.

## Consequences

Security logic is testable without a webview, the app remains lightweight, and platform packaging is centralized in Tauri. Native Tauri prerequisites are required on each build platform.
