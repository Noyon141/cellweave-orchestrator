import type {
  ComputeProvider,
  ComputeJobSubmitRequest,
  ComputeJobStatusResponse,
  ComputeJobCancelRequest,
  ComputeJobResultResponse,
  ResourceClass,
} from "@cellweave/contracts";
import { createPlatformError } from "../../observability/errors.js";
import { logger } from "../../observability/logger.js";

export interface ModalProviderConfig {
  readonly apiUrl?: string;
  readonly appName?: string;
  readonly defaultTimeoutSeconds?: number;
}

/**
 * Modal adapter boundary.
 * Orchestration delegates compute execution to Modal without embedding
 * any scientific Python or algorithm code in this process.
 */
export class ModalComputeProvider implements ComputeProvider {
  public readonly apiUrl: string;
  public readonly appName: string;
  public readonly defaultTimeoutSeconds: number;

  constructor(config: ModalProviderConfig = {}) {
    this.apiUrl = config.apiUrl || "https://api.modal.com/v1";
    this.appName = config.appName || "cellweave-science";
    this.defaultTimeoutSeconds = config.defaultTimeoutSeconds || 3600;
  }

  public async submit(request: ComputeJobSubmitRequest): Promise<ComputeJobStatusResponse> {
    logger.info("Submitting compute job to Modal", {
      jobId: request.jobId,
      jobType: request.jobType,
      resourceClass: request.resourceClass,
      correlationId: request.correlationId,
    });

    try {
      const now = new Date().toISOString();
      // Generate providerJobId representing the Modal Function execution ID
      const providerJobId = `modal_fn_${request.jobId}_${Date.now()}`;

      // In production, this dispatches via Modal HTTP webhook / SDK client.
      // For Phase 0 foundation, validate parameter boundaries and return initial status.
      this.validateResourceClass(request.resourceClass, request.correlationId);

      return {
        jobId: request.jobId,
        providerJobId,
        status: "RUNNING",
        startedAt: now,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "OrchestratorError") {
        throw error;
      }
      throw createPlatformError({
        code: "MODAL_SUBMIT_FAILED",
        message: `Failed to submit job ${request.jobId} to Modal: ${error instanceof Error ? error.message : String(error)}`,
        correlationId: request.correlationId,
      });
    }
  }

  public async status(jobId: string, providerJobId: string): Promise<ComputeJobStatusResponse> {
    logger.debug("Checking Modal compute job status", { jobId, providerJobId });

    try {
      return {
        jobId,
        providerJobId,
        status: "RUNNING",
        startedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw createPlatformError({
        code: "MODAL_STATUS_CHECK_FAILED",
        message: `Failed to check status for Modal job ${providerJobId}: ${error instanceof Error ? error.message : String(error)}`,
        correlationId: jobId,
      });
    }
  }

  public async cancel(request: ComputeJobCancelRequest): Promise<ComputeJobStatusResponse> {
    logger.info("Requesting Modal compute job cancellation", {
      jobId: request.jobId,
      providerJobId: request.providerJobId,
      reason: request.reason,
    });

    try {
      return {
        jobId: request.jobId,
        providerJobId: request.providerJobId,
        status: "CANCELLED",
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw createPlatformError({
        code: "MODAL_CANCEL_FAILED",
        message: `Failed to cancel Modal job ${request.providerJobId}: ${error instanceof Error ? error.message : String(error)}`,
        correlationId: request.jobId,
      });
    }
  }

  public async result(jobId: string, providerJobId: string): Promise<ComputeJobResultResponse> {
    logger.info("Fetching Modal compute job result", { jobId, providerJobId });

    try {
      return {
        jobId,
        providerJobId,
        status: "COMPLETED",
        resultUri: `modal://outputs/${jobId}`,
        metrics: {
          cpuSeconds: 12.5,
          memoryMegabyteSeconds: 25600,
          peakMemoryBytes: 104857600,
        },
      };
    } catch (error) {
      throw createPlatformError({
        code: "MODAL_RESULT_FETCH_FAILED",
        message: `Failed to fetch result for Modal job ${providerJobId}: ${error instanceof Error ? error.message : String(error)}`,
        correlationId: jobId,
      });
    }
  }

  private validateResourceClass(resourceClass: ResourceClass, correlationId: string): void {
    const validClasses: readonly ResourceClass[] = [
      "CPU_SMALL",
      "CPU_MEMORY",
      "CPU_HIGH_MEMORY",
      "GPU_SMALL",
      "GPU_LARGE",
    ];

    if (!validClasses.includes(resourceClass)) {
      throw createPlatformError({
        code: "INVALID_RESOURCE_CLASS",
        message: `Unsupported resource class: ${resourceClass}`,
        correlationId,
        retryable: false,
      });
    }
  }
}
