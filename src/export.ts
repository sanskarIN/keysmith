export function buildBatchExport(
  secrets: readonly string[],
  createdAt: Date,
  warning: string,
): string {
  return [
    "# KeySmith batch export",
    `# Created: ${createdAt.toISOString()}`,
    `# WARNING: ${warning}`,
    "",
    ...secrets,
    "",
  ].join("\n");
}
