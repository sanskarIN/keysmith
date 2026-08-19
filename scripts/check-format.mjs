import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const IGNORED = new Set([".git", "dist", "node_modules", "target", "src-tauri/target"]);
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".lock",
  ".md",
  ".mjs",
  ".rs",
  ".svg",
  ".toml",
  ".ts",
  ".txt",
  ".yml",
  ".yaml",
]);
const TEXT_NAMES = new Set([
  ".editorconfig",
  ".env.example",
  ".gitattributes",
  ".gitignore",
  "LICENSE",
  "NOTICE",
]);

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    const projectPath = relative(ROOT, absolute).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (!IGNORED.has(entry.name) && !IGNORED.has(projectPath)) {
        files.push(...(await collect(absolute)));
      }
      continue;
    }
    if (TEXT_NAMES.has(entry.name) || TEXT_EXTENSIONS.has(extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

const problems = [];
for (const file of await collect(ROOT)) {
  const content = await readFile(file, "utf8");
  const path = relative(ROOT, file).replaceAll("\\", "/");
  if (content.includes("\r")) problems.push(`${path}: contains CRLF/CR line endings`);
  if (!content.endsWith("\n")) problems.push(`${path}: missing final newline`);
  const lines = content.split("\n");
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) problems.push(`${path}:${index + 1}: trailing whitespace`);
  });
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Text hygiene checks passed.");
}
