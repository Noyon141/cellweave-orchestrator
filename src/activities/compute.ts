import type {
  ComputeProvider,
  ComputeJobSubmitRequest,
  ComputeJobStatusResponse,
  ComputeJobCancelRequest,
  ComputeJobResultResponse,
} from "@cellweave/contracts";
import { ModalComputeProvider } from "../providers/compute/modal-compute-provider.js";
import { logger } from "../observability/logger.js";

export interface ComputeJobQueryParams {
  readonly jobId: string;
  readonly providerJobId: string;
}

let defaultComputeProvider: ComputeProvider = new ModalComputeProvider();

export function setGlobalComputeProvider(provider: ComputeProvider): void {
  defaultComputeProvider = provider;
}

export function createComputeActivities(provider: ComputeProvider = defaultComputeProvider) {
  return {
    async submitComputeJob(request: ComputeJobSubmitRequest): Promise<ComputeJobStatusResponse> {
      logger.info("Activity: submitComputeJob", {
        jobId: request.jobId,
        jobType: request.jobType,
        resourceClass: request.resourceClass,
        correlationId: request.correlationId,
      });
      return provider.submit(request);
    },

    async pollComputeJobStatus(params: ComputeJobQueryParams): Promise<ComputeJobStatusResponse> {
      logger.debug("Activity: pollComputeJobStatus", {
        jobId: params.jobId,
        providerJobId: params.providerJobId,
      });
      return provider.status(params.jobId, params.providerJobId);
    },

    async cancelComputeJob(request: ComputeJobCancelRequest): Promise<ComputeJobStatusResponse> {
      logger.info("Activity: cancelComputeJob", {
        jobId: request.jobId,
        providerJobId: request.providerJobId,
        reason: request.reason,
      });
      return provider.cancel(request);
    },

    async fetchComputeJobResult(params: ComputeJobQueryParams): Promise<ComputeJobResultResponse> {
      logger.info("Activity: fetchComputeJobResult", {
        jobId: params.jobId,
        providerJobId: params.providerJobId,
      });
      return provider.result(params.jobId, params.providerJobId);
    },
  };
}

const defaultActivities = createComputeActivities();

export const submitComputeJob = defaultActivities.submitComputeJob;
export const pollComputeJobStatus = defaultActivities.pollComputeJobStatus;
export const cancelComputeJob = defaultActivities.cancelComputeJob;
export const fetchComputeJobResult = defaultActivities.fetchComputeJobResult;
