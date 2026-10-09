import { describe, it, expect, beforeEach } from "vitest";
import {
  checkOrchestratorHealth,
  projectRunState,
  projectWorkflowStepState,
  reportStepUsage,
  resetRecordedUsageKeysForTesting,
} from "../../src/activities/index.js";
import type { UsageEvent } from "@cellweave/contracts";

describe("Temporal Activity Boundaries", () => {
  beforeEach(() => {
    resetRecordedUsageKeysForTesting();
  });

  describe("Health Activity", () => {
    it("reports healthy status conforming to contracts", async () => {
      const health = await checkOrchestratorHealth();
      expect(health.status).toBe("healthy");
      expect(health.version).toBe("0.1.0");
      expect(health.schemaVersion).toBe("1.0.0");
      expect(health.timestamp).toBeDefined();
    });
  });

  describe("State Projection Activities", () => {
    it("projects run state idempotently with tenant context", async () => {
      const result = await projectRunState({
        organizationId: "org_alpha",
        projectId: "proj_beta",
        analysisRunId: "run_gamma",
        status: "RUNNING",
      });

      expect(result.success).toBe(true);
      expect(result.projectedAt).toBeDefined();
    });

    it("projects workflow step state idempotently", async () => {
      const result = await projectWorkflowStepState({
        organizationId: "org_alpha",
        analysisRunId: "run_gamma",
        stepKey: "qc",
        status: "SUCCEEDED",
        attempt: 1,
        computeProfile: "CPU_SMALL",
      });

      expect(result.success).toBe(true);
      expect(result.projectedAt).toBeDefined();
    });
  });

  describe("Usage Reporting Activity", () => {
    const validUsageEvent: UsageEvent = {
      schemaVersion: "1.0.0",
      idempotencyKey: "run_100:step_qc:1",
      organizationId: "org_alpha",
      projectId: "proj_beta",
      runId: "run_100",
      stepId: "step_qc",
      attempt: 1,
      measurements: {
        cpuSeconds: 30,
        memoryClass: "CPU_SMALL",
      },
      timestamp: new Date().toISOString(),
    };

    it("records usage for valid canonical idempotency key", async () => {
      const result = await reportStepUsage(validUsageEvent);
      expect(result.recorded).toBe(true);
      expect(result.duplicate).toBe(false);
      expect(result.idempotencyKey).toBe("run_100:step_qc:1");
    });

    it("detects and avoids duplicate billing on repeated attempt", async () => {
      const first = await reportStepUsage(validUsageEvent);
      expect(first.recorded).toBe(true);

      const duplicate = await reportStepUsage(validUsageEvent);
      expect(duplicate.recorded).toBe(false);
      expect(duplicate.duplicate).toBe(true);
    });

    it("rejects non-canonical idempotency key format", async () => {
      const invalidKeyPayload: UsageEvent = {
        ...validUsageEvent,
        idempotencyKey: "invalid_arbitrary_key",
      };

      await expect(reportStepUsage(invalidKeyPayload)).rejects.toThrow(
        /does not match canonical format/,
      );
    });
  });
});
