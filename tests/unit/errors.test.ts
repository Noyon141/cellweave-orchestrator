import { describe, it, expect } from "vitest";
import {
  createPlatformError,
  createScientificValidationError,
} from "../../src/observability/errors.js";

describe("Error Classification and Domain Error Factory", () => {
  it("creates retryable PLATFORM_ERROR", () => {
    const error = createPlatformError({
      code: "MODAL_NETWORK_TIMEOUT",
      message: "Network timeout connecting to compute provider",
      correlationId: "run_test_01",
    });

    expect(error.classification).toBe("PLATFORM_ERROR");
    expect(error.retryable).toBe(true);
    expect(error.code).toBe("MODAL_NETWORK_TIMEOUT");
    expect(error.correlationId).toBe("run_test_01");

    const contractErr = error.toContractError();
    expect(contractErr.code).toBe("MODAL_NETWORK_TIMEOUT");
    expect(contractErr.retryable).toBe(true);
  });

  it("creates non-retryable SCIENTIFIC_VALIDATION_ERROR", () => {
    const error = createScientificValidationError({
      code: "INSUFFICIENT_CELLS",
      message: "Dataset contains fewer than minimum required cells for clustering",
      correlationId: "run_test_02",
      recommendedAction: "Upload a dataset with at least 50 cells.",
    });

    expect(error.classification).toBe("SCIENTIFIC_VALIDATION_ERROR");
    expect(error.retryable).toBe(false);
    expect(error.code).toBe("INSUFFICIENT_CELLS");
    expect(error.recommendedAction).toBe("Upload a dataset with at least 50 cells.");

    const contractErr = error.toContractError();
    expect(contractErr.retryable).toBe(false);
  });
});
