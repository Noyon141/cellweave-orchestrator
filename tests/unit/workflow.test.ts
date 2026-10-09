import { describe, it, expect, vi } from "vitest";
import type { HealthResponse } from "@cellweave/contracts";
import type {
  PlaceholderWorkflowInput,
  PlaceholderWorkflowOutput,
} from "../../src/workflows/placeholder.js";

// Mock proxyActivities to test workflow logic deterministically without requiring a live Temporal test server binary in unit tests
vi.mock("@temporalio/workflow", () => ({
  proxyActivities: () => ({
    checkOrchestratorHealth: async (): Promise<HealthResponse> => ({
      status: "healthy",
      version: "0.1.0",
      schemaVersion: "1.0.0",
      timestamp: "2026-10-09T00:00:00.000Z",
    }),
  }),
}));

describe("Placeholder Workflow", () => {
  it("executes deterministically and dispatches activity proxy", async () => {
    const { placeholderHealthWorkflow } = await import("../../src/workflows/placeholder.js");

    const input: PlaceholderWorkflowInput = {
      runId: "run_smoke_01",
      triggeredBy: "ci_smoke_test",
    };

    const output: PlaceholderWorkflowOutput = await placeholderHealthWorkflow(input);

    expect(output.runId).toBe("run_smoke_01");
    expect(output.status).toBe("COMPLETED");
    expect(output.health.status).toBe("healthy");
    expect(output.health.version).toBe("0.1.0");
  });
});
