import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function readText(path) {
  return readFile(new URL(path, root), "utf8");
}

const packageJson = JSON.parse(await readText("package.json"));
const tauriConfig = JSON.parse(await readText("src-tauri/tauri.conf.json"));
const cargoToml = await readText("Cargo.toml");
const indexHtml = await readText("index.html");

const expected = packageJson.version;

if (typeof expected !== "string" || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(expected)) {
  throw new Error(`package.json contains an invalid semantic version: ${String(expected)}`);
}

const cargoVersion = cargoToml.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
if (!cargoVersion) {
  throw new Error("Could not find workspace package version in Cargo.toml");
}

const checks = [
  ["Cargo.toml workspace version", cargoVersion],
  ["src-tauri/tauri.conf.json version", tauriConfig.version],
];

for (const [label, actual] of checks) {
  if (actual !== expected) {
    throw new Error(`${label} is ${String(actual)} but package.json is ${expected}`);
  }
}

const uiVersions = [...indexHtml.matchAll(/\b\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?\b/g)].map(
  (match) => match[0],
);

if (uiVersions.length === 0) {
  throw new Error("index.html does not expose an application version");
}

const mismatchedUiVersions = [...new Set(uiVersions.filter((version) => version !== expected))];
if (mismatchedUiVersions.length > 0) {
  throw new Error(
    `index.html contains version(s) that do not match ${expected}: ${mismatchedUiVersions.join(", ")}`,
  );
}

const requestedVersion = process.env.KEYSMITH_EXPECTED_VERSION?.replace(/^v/, "");
if (requestedVersion && requestedVersion !== expected) {
  throw new Error(
    `Requested release version ${requestedVersion} does not match repository version ${expected}`,
  );
}

console.log(`Version metadata is consistent at ${expected}.`);
