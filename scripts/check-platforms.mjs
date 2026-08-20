import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [packageText, cargoText, libText, capabilityText, androidText, iosText, htmlText, mobileCss] =
  await Promise.all([
    read("package.json"),
    read("src-tauri/Cargo.toml"),
    read("src-tauri/src/lib.rs"),
    read("src-tauri/capabilities/default.json"),
    read("src-tauri/tauri.android.conf.json"),
    read("src-tauri/tauri.ios.conf.json"),
    read("index.html"),
    read("src/mobile.css"),
  ]);

const packageJson = JSON.parse(packageText);
const capability = JSON.parse(capabilityText);
const android = JSON.parse(androidText);
const ios = JSON.parse(iosText);

for (const script of [
  "icons:generate",
  "android:init",
  "android:dev",
  "android:build:apk",
  "android:build:aab",
  "ios:init",
  "ios:prepare",
  "ios:dev",
  "ios:build",
]) {
  assert(typeof packageJson.scripts?.[script] === "string", `Missing npm script: ${script}`);
}

for (const dependency of [
  "tauri-plugin-clipboard-manager",
  "tauri-plugin-dialog",
  "tauri-plugin-fs",
]) {
  assert(cargoText.includes(`${dependency} = \"2\"`), `Missing Rust dependency: ${dependency}`);
}

assert(!cargoText.includes("arboard"), "Desktop-only arboard dependency must not be restored");
assert(libText.includes("tauri_plugin_clipboard_manager::init()"), "Clipboard plugin is not initialized");
assert(libText.includes("tauri_plugin_dialog::init()"), "Dialog plugin is not initialized");
assert(libText.includes("tauri_plugin_fs::init()"), "Filesystem plugin is not initialized");

assert(android.bundle?.android?.minSdkVersion === 24, "Android minSdkVersion must remain 24");
assert(ios.bundle?.iOS?.minimumSystemVersion === "14.0", "iOS minimumSystemVersion must remain 14.0");

const permissions = new Set(capability.permissions ?? []);
assert(permissions.has("dialog:allow-save"), "Save dialog permission is missing");
assert(permissions.has("fs:allow-write-text-file"), "Text export permission is missing");
assert(permissions.has("fs:allow-read-text-file"), "Export verification read permission is missing");

assert(htmlText.includes("viewport-fit=cover"), "Mobile viewport safe-area support is missing");
assert(htmlText.includes("/src/mobile.css"), "Mobile stylesheet is not loaded");
assert(htmlText.includes("Windows · macOS · Linux · Android · iOS"), "About platform list is incomplete");
assert(mobileCss.includes("env(safe-area-inset-top)"), "Mobile safe-area CSS is missing");
assert(mobileCss.includes("@media (pointer: coarse)"), "Touch-target CSS is missing");

console.log("Cross-platform configuration checks passed for Windows, macOS, Linux, Android, and iOS.");
