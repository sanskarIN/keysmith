# Troubleshooting

## Desktop bridge unavailable

If the UI says the Tauri bridge is unavailable, it was probably opened through a plain browser/Vite session. Use `npm run tauri dev`.

## Clipboard unavailable

Some Linux desktop sessions or sandboxed environments may deny clipboard access. Generation still works; copy manually from the displayed output if your environment permits.

## Native build dependency errors

Re-check current Tauri prerequisites for the operating system, then confirm Rust and Node are supported versions.

## Port 1420 already in use

Stop the process using the port. KeySmith intentionally uses `strictPort` so Tauri does not silently connect to a different development server.

## Dependency installation problems

Delete `node_modules`, verify Node/npm versions, then run `npm install` again. Review dependency and lockfile changes before committing them to release branches.
