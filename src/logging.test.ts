import { describe, expect, it } from "vitest";
import { redactForLog } from "./logging";

describe("structured log redaction", () => {
  it("redacts common secret and PII field names recursively", () => {
    const redacted = redactForLog({
      event: "generation_failed",
      password: "fictional-password",
      nested: {
        authorization: "Bearer fictional-token",
        supportEmail: "person@example.invalid",
        count: 3,
      },
    });

    expect(redacted).toEqual({
      event: "generation_failed",
      password: "[REDACTED]",
      nested: {
        authorization: "[REDACTED]",
        supportEmail: "[REDACTED]",
        count: 3,
      },
    });
  });

  it("redacts credential, API-key, session, and private-key fields", () => {
    const redacted = redactForLog({
      credential: "fictional",
      apiKey: "fictional",
      api_key: "fictional",
      sessionId: "fictional",
      privateKey: "fictional",
      private_key: "fictional",
    });

    expect(redacted).toEqual({
      credential: "[REDACTED]",
      apiKey: "[REDACTED]",
      api_key: "[REDACTED]",
      sessionId: "[REDACTED]",
      privateKey: "[REDACTED]",
      private_key: "[REDACTED]",
    });
  });

  it("truncates deeply nested data instead of traversing without bound", () => {
    const redacted = redactForLog({
      level1: { level2: { level3: { level4: { level5: { value: 1 } } } } },
    });

    expect(redacted).toEqual({
      level1: { level2: { level3: { level4: { level5: "[TRUNCATED]" } } } },
    });
  });
});
