const SENSITIVE_KEY =
  /(?:api[_-]?key|authorization|cookie|credential|email|passphrase|password|private[_-]?key|secret|session|token)/i;
const MAX_DEPTH = 4;

export type SafeLogScalar = string | number | boolean | null;
export type SafeLogEntry = SafeLogScalar | SafeLogEntry[] | SafeLogRecord;
export interface SafeLogRecord {
  [key: string]: SafeLogEntry;
}

function redactValue(value: unknown, depth: number): SafeLogEntry {
  if (depth > MAX_DEPTH) return "[TRUNCATED]";
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const result: SafeLogRecord = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactValue(nested, depth + 1);
    }
    return result;
  }
  return `[${typeof value}]`;
}

export function redactForLog(record: Record<string, unknown>): SafeLogRecord {
  return redactValue(record, 0) as SafeLogRecord;
}
