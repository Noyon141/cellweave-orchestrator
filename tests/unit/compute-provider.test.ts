import { describe, it, expect } from "vitest";
import { ModalComputeProvider } from "../../src/providers/compute/modal-compute-provider.js";
import { MockComputeProvider } from "../../src/providers/compute/mock-compute-provider.js";

describe("Compute Provider Boundaries", () => {
  describe("ModalComputeProvider", () => {
    it("submits a compute job with valid resource class", async () => {
      const provider = new ModalComputeProvider();
      const response = await provider.submit({
        jobId: "job_01",
        jobType: "run_qc",
        resourceClass: "CPU_SMALL",
        payloadUri: "r2://buckets/datasets/canonical.h5ad",
        maxRuntimeSeconds: 300,
        correlationId: "corr_01",
      });

      expect(response.jobId).toBe("job_01");
      expect(response.status).toBe("RUNNING");
      expect(response.providerJobId).toContain("modal_fn_job_01");
    });

    it("rejects unsupported resource class with non-retryable error", async () => {
      const provider = new ModalComputeProvider();
      await expect(
        provider.submit({
          jobId: "job_02",
          jobType: "run_qc",
          resourceClass: "INVALID_GPU_PROFILE" as unknown as "CPU_SMALL",
          payloadUri: "r2://buckets/datasets/canonical.h5ad",
          maxRuntimeSeconds: 300,
          correlationId: "corr_02",
        }),
      ).rejects.toThrow(/Unsupported resource class/);
    });

    it("handles status, cancellation and result contracts", async () => {
      const provider = new ModalComputeProvider();
      const statusRes = await provider.status("job_01", "modal_fn_01");
      expect(statusRes.status).toBe("RUNNING");

      const cancelRes = await provider.cancel({
        jobId: "job_01",
        providerJobId: "modal_fn_01",
        reason: "User requested cancellation",
      });
      expect(cancelRes.status).toBe("CANCELLED");

      const resultRes = await provider.result("job_01", "modal_fn_01");
      expect(resultRes.status).toBe("COMPLETED");
      expect(resultRes.metrics.cpuSeconds).toBeGreaterThan(0);
    });
  });

  describe("MockComputeProvider", () => {
    it("manages simulated job lifecycle for testing", async () => {
      const mock = new MockComputeProvider();
      const submitRes = await mock.submit({
        jobId: "test_job_10",
        jobType: "normalize",
        resourceClass: "CPU_SMALL",
        payloadUri: "mock://input",
        maxRuntimeSeconds: 60,
        correlationId: "corr_mock",
      });

      expect(submitRes.status).toBe("RUNNING");

      mock.setJobStatus("test_job_10", "COMPLETED");
      const statusRes = await mock.status("test_job_10", submitRes.providerJobId);
      expect(statusRes.status).toBe("COMPLETED");

      const resultRes = await mock.result("test_job_10", submitRes.providerJobId);
      expect(resultRes.status).toBe("COMPLETED");
      expect(resultRes.metrics.cpuSeconds).toBe(10);
    });
  });
});
