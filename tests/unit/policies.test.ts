import { describe, it, expect } from "vitest";
import {
  TRANSIENT_ACTIVITY_RETRY_POLICY,
  NON_RETRYABLE_ERROR_TYPES,
  isTransientError,
} from "../../src/policies/retry.js";
import { buildCancellationResult } from "../../src/policies/cancellation.js";

describe("Retry and Cancellation Policies", () => {
  it("defines standard retry policies with non-retryable error exclusions", () => {
    expect(TRANSIENT_ACTIVITY_RETRY_POLICY.maximumAttempts).toBe(5);
    expect(TRANSIENT_ACTIVITY_RETRY_POLICY.nonRetryableErrorTypes).toBeDefined();

    for (const errorType of NON_RETRYABLE_ERROR_TYPES) {
      expect(TRANSIENT_ACTIVITY_RETRY_POLICY.nonRetryableErrorTypes).toContain(errorType);
    }
  });

  it("classifies transient vs permanent errors correctly", () => {
    expect(isTransientError(new Error("Connection reset"))).toBe(true);
    expect(isTransientError({ retryable: false })).toBe(false);
    expect(isTransientError({ name: "SCIENTIFIC_VALIDATION_ERROR" })).toBe(false);
    expect(isTransientError({ code: "OUT_OF_MEMORY_CEILING" })).toBe(false);
  });

  it("builds canonical cancellation results", () => {
    const result = buildCancellationResult({
      runId: "run_cancel_1",
      reason: "User cancelled via UI",
      activeProviderJobCancelled: true,
      usageFinalized: true,
    });

    expect(result.runId).toBe("run_cancel_1");
    expect(result.runState).toBe("CANCELLED");
    expect(result.activeProviderJobCancelled).toBe(true);
    expect(result.usageFinalized).toBe(true);
    expect(result.cancelledAt).toBeDefined();
  });
});
