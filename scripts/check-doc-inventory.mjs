import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const INVENTORY_PATH = "docs/repository-reference.md";

const [{ stdout }, inventory] = await Promise.all([
  execFileAsync("git", ["ls-files", "-z"], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  }),
  readFile(INVENTORY_PATH, "utf8"),
]);

const trackedFiles = stdout
  .split("\0")
  .filter(Boolean)
  .sort((left, right) => left.localeCompare(right));

const missing = trackedFiles.filter((file) => !inventory.includes(`\`${file}\``));

if (missing.length > 0) {
  console.error(
    [
      `${INVENTORY_PATH} is missing ${missing.length} tracked file(s):`,
      ...missing.map((file) => `- ${file}`),
      "",
      "Document every tracked project file before merging.",
    ].join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(`Documentation inventory covers all ${trackedFiles.length} tracked files.`);
}
