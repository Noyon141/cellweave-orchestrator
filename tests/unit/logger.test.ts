import { describe, it, expect, vi } from "vitest";
import { Logger } from "../../src/observability/logger.js";

describe("Structured Logger", () => {
  it("outputs structured JSON logs with correlation context", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new Logger("info", {
      organizationId: "org_123",
      analysisRunId: "run_456",
    });

    log.info("Analysis step started", { stepKey: "normalize" });

    expect(spy).toHaveBeenCalledTimes(1);
    const loggedRaw = spy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(loggedRaw);

    expect(parsed.level).toBe("INFO");
    expect(parsed.message).toBe("Analysis step started");
    expect(parsed.context.organizationId).toBe("org_123");
    expect(parsed.context.analysisRunId).toBe("run_456");
    expect(parsed.data.stepKey).toBe("normalize");
    expect(parsed.timestamp).toBeDefined();

    spy.mockRestore();
  });

  it("redacts sensitive scientific matrix and expression data from logs", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new Logger("info");

    log.info("Inspecting payload", {
      matrixData: [0.1, 0.4, 0.8],
      expressionCounts: [100, 200],
      geneBarcodes: ["AAACCC", "GGGTTT"],
      safeField: "valid_summary",
    });

    const parsed = JSON.parse(spy.mock.calls[0]?.[0] as string);
    expect(parsed.data.matrixData).toBe("[REDACTED_SCIENTIFIC_CONTENT]");
    expect(parsed.data.expressionCounts).toBe("[REDACTED_SCIENTIFIC_CONTENT]");
    expect(parsed.data.geneBarcodes).toBe("[REDACTED_SCIENTIFIC_CONTENT]");
    expect(parsed.data.safeField).toBe("valid_summary");

    spy.mockRestore();
  });

  it("respects configured log levels", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new Logger("warn");

    log.info("Should not appear");
    log.debug("Should not appear");

    expect(infoSpy).not.toHaveBeenCalled();
    infoSpy.mockRestore();
  });
});
