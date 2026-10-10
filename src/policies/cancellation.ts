import type { RunState } from "@cellweave/contracts";

export interface CancellationRequest {
  readonly runId: string;
  readonly reason: string;
  readonly requestedBy: string;
  readonly requestedAt: string;
}

export interface CancellationResult {
  readonly runId: string;
  readonly cancelledAt: string;
  readonly activeProviderJobCancelled: boolean;
  readonly usageFinalized: boolean;
  readonly runState: Extract<RunState, "CANCELLED">;
  readonly reason: string;
}

/**
 * Validates and constructs the structured cancellation record.
 */
export function buildCancellationResult(params: {
  runId: string;
  reason: string;
  activeProviderJobCancelled: boolean;
  usageFinalized: boolean;
}): CancellationResult {
  return {
    runId: params.runId,
    cancelledAt: new Date().toISOString(),
    activeProviderJobCancelled: params.activeProviderJobCancelled,
    usageFinalized: params.usageFinalized,
    runState: "CANCELLED",
    reason: params.reason,
  };
}
