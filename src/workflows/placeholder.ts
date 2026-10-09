import { proxyActivities } from "@temporalio/workflow";
import type { HealthResponse } from "@cellweave/contracts";
import type * as activities from "../activities/index.js";
import { TRANSIENT_ACTIVITY_RETRY_POLICY } from "../policies/retry.js";

const { checkOrchestratorHealth } = proxyActivities<typeof activities>({
  startToCloseTimeout: "30s",
  retry: TRANSIENT_ACTIVITY_RETRY_POLICY,
});

export interface PlaceholderWorkflowInput {
  readonly runId: string;
  readonly triggeredBy: string;
}

export interface PlaceholderWorkflowOutput {
  readonly runId: string;
  readonly status: "COMPLETED";
  readonly health: HealthResponse;
}

/**
 * Phase 0 Placeholder Workflow.
 * Verifies Temporal Worker connectivity, deterministic workflow compilation,
 * and activity proxy dispatch without implementing the full production AnalysisWorkflow (Phase 4).
 */
export async function placeholderHealthWorkflow(
  input: PlaceholderWorkflowInput,
): Promise<PlaceholderWorkflowOutput> {
  const health = await checkOrchestratorHealth();

  return {
    runId: input.runId,
    status: "COMPLETED",
    health,
  };
}
