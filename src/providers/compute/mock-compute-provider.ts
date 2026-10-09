import type {
  ComputeProvider,
  ComputeJobSubmitRequest,
  ComputeJobStatusResponse,
  ComputeJobCancelRequest,
  ComputeJobResultResponse,
} from "@cellweave/contracts";

export class MockComputeProvider implements ComputeProvider {
  private readonly jobs: Map<
    string,
    {
      status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED" | "TIMEOUT";
      providerJobId: string;
      startedAt: string;
      completedAt?: string;
      resultUri?: string;
    }
  > = new Map();

  public async submit(request: ComputeJobSubmitRequest): Promise<ComputeJobStatusResponse> {
    const providerJobId = `mock_job_${request.jobId}`;
    const startedAt = new Date().toISOString();
    this.jobs.set(request.jobId, {
      status: "RUNNING",
      providerJobId,
      startedAt,
    });

    return {
      jobId: request.jobId,
      providerJobId,
      status: "RUNNING",
      startedAt,
    };
  }

  public async status(jobId: string, providerJobId: string): Promise<ComputeJobStatusResponse> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return {
        jobId,
        providerJobId,
        status: "FAILED",
        startedAt: new Date().toISOString(),
        errorMessage: "Job not found",
      };
    }
    return {
      jobId,
      providerJobId: job.providerJobId,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }

  public async cancel(request: ComputeJobCancelRequest): Promise<ComputeJobStatusResponse> {
    const job = this.jobs.get(request.jobId);
    const now = new Date().toISOString();
    if (job) {
      job.status = "CANCELLED";
      job.completedAt = now;
    }
    return {
      jobId: request.jobId,
      providerJobId: request.providerJobId,
      status: "CANCELLED",
      startedAt: job?.startedAt || now,
      completedAt: now,
    };
  }

  public async result(jobId: string, providerJobId: string): Promise<ComputeJobResultResponse> {
    const job = this.jobs.get(jobId);
    const status = job?.status === "CANCELLED" ? "CANCELLED" : "COMPLETED";

    return {
      jobId,
      providerJobId,
      status,
      resultUri: `mock://artifacts/${jobId}`,
      metrics: {
        cpuSeconds: 10,
        memoryMegabyteSeconds: 16000,
        peakMemoryBytes: 67108864,
      },
    };
  }

  public setJobStatus(
    jobId: string,
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED" | "TIMEOUT",
  ): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = status;
      if (status === "COMPLETED" || status === "FAILED" || status === "CANCELLED") {
        job.completedAt = new Date().toISOString();
      }
    }
  }
}
