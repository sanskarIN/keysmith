import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const IGNORED_DIRECTORIES = new Set([".git", "dist", "node_modules", "target"]);
const IGNORED_FILES = new Set(["scripts/check-secrets.mjs"]);
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".rs",
  ".toml",
  ".ts",
  ".txt",
  ".yml",
  ".yaml",
]);
const TEXT_NAMES = new Set([".editorconfig", ".env.example", ".gitattributes", ".gitignore", "LICENSE", "NOTICE"]);
const PATTERNS = [
  ["private key material", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9]{30,}/],
  ["GitHub fine-grained token", /github_pat_[A-Za-z0-9_]{40,}/],
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["Slack token", /xox[baprs]-[A-Za-z0-9-]{20,}/],
  ["Google API key", /AIza[0-9A-Za-z_-]{35}/],
];

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    const projectPath = relative(ROOT, absolute).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (!IGNORED_DIRECTORIES.has(entry.name)) files.push(...(await collect(absolute)));
      continue;
    }
    if (IGNORED_FILES.has(projectPath)) continue;
    if (TEXT_NAMES.has(entry.name) || TEXT_EXTENSIONS.has(extname(entry.name))) files.push(absolute);
  }
  return files;
}

const findings = [];
for (const file of await collect(ROOT)) {
  const content = await readFile(file, "utf8");
  const projectPath = relative(ROOT, file).replaceAll("\\", "/");
  for (const [name, pattern] of PATTERNS) {
    if (pattern.test(content)) findings.push(`${projectPath}: possible ${name}`);
  }
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log("No high-confidence secret patterns detected.");
}
