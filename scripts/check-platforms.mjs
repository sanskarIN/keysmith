import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [
  packageText,
  workspaceText,
  cargoText,
  libText,
  capabilityText,
  androidText,
  iosText,
  htmlText,
  mainText,
  apiText,
  webRuntimeText,
  webCargoText,
  manifestText,
  serviceWorkerText,
  mobileCss,
] = await Promise.all([
  read("package.json"),
  read("Cargo.toml"),
  read("src-tauri/Cargo.toml"),
  read("src-tauri/src/lib.rs"),
  read("src-tauri/capabilities/default.json"),
  read("src-tauri/tauri.android.conf.json"),
  read("src-tauri/tauri.ios.conf.json"),
  read("index.html"),
  read("src/main.ts"),
  read("src/api.ts"),
  read("src/web-runtime.ts"),
  read("crates/keysmith-web/Cargo.toml"),
  read("public/manifest.webmanifest"),
  read("public/sw.js"),
  read("src/mobile.css"),
]);

const packageJson = JSON.parse(packageText);
const capability = JSON.parse(capabilityText);
const android = JSON.parse(androidText);
const ios = JSON.parse(iosText);
const manifest = JSON.parse(manifestText);

for (const script of [
  "web:dev",
  "web:build",
  "web:preview",
  "wasm:build",
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

assert(workspaceText.includes('"crates/keysmith-web"'), "WebAssembly crate is missing from workspace");
assert(webCargoText.includes('features = ["wasm_js"]'), "Browser CSPRNG backend is not enabled");
assert(webCargoText.includes('keysmith-core = { path = "../keysmith-core" }'), "Web runtime must reuse keysmith-core");
assert(webRuntimeText.includes('/wasm/keysmith_web.js'), "Browser WASM runtime loader is missing");
assert(apiText.includes("webRuntime.generatePassword"), "Browser password fallback is missing");
assert(apiText.includes('navigator.serviceWorker.register("/sw.js")'), "PWA service-worker registration is missing");
assert(apiText.includes('manifest.href = "/manifest.webmanifest"'), "PWA manifest registration is missing");
assert(manifest.display === "standalone", "PWA manifest must remain installable as standalone");
assert(serviceWorkerText.includes("keysmith_web_bg.wasm"), "Service worker must cache the WASM runtime");

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
assert(htmlText.includes("Windows · macOS · Linux · Android · iOS"), "Native About platform list is incomplete");

const sharedCssImport = 'import "./styles.css";';
const mobileCssImport = 'import "./mobile.css";';
const sharedCssIndex = mainText.indexOf(sharedCssImport);
const mobileCssIndex = mainText.indexOf(mobileCssImport);
assert(sharedCssIndex >= 0, "Shared stylesheet import is missing from src/main.ts");
assert(mobileCssIndex >= 0, "Mobile stylesheet import is missing from src/main.ts");
assert(
  mobileCssIndex > sharedCssIndex,
  "Mobile stylesheet must be imported after shared styles so mobile overrides win the cascade",
);

assert(mobileCss.includes("env(safe-area-inset-top)"), "Mobile safe-area CSS is missing");
assert(mobileCss.includes("@media (pointer: coarse)"), "Touch-target CSS is missing");

console.log(
  "Cross-platform configuration checks passed for Web/PWA, ChromeOS, Windows, macOS, Linux, Android, and iOS.",
);
