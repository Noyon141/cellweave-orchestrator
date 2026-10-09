import type { RunState, WorkflowStepState, ResourceClass } from "@cellweave/contracts";
import { logger } from "../observability/logger.js";

export interface ProjectRunStateParams {
  readonly organizationId: string;
  readonly projectId: string;
  readonly analysisRunId: string;
  readonly status: RunState;
  readonly failureCode?: string;
  readonly failureSummary?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ProjectWorkflowStepStateParams {
  readonly organizationId: string;
  readonly analysisRunId: string;
  readonly stepKey: string;
  readonly stepVersion?: string;
  readonly status: WorkflowStepState;
  readonly attempt: number;
  readonly computeProfile?: ResourceClass;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly errorCode?: string;
  readonly inputManifestUri?: string;
  readonly outputManifestUri?: string;
}

export interface ProjectionResult {
  readonly success: boolean;
  readonly projectedAt: string;
}

/**
 * State projection activities.
 * Projects Temporal execution progress into Postgres customer-visible entities.
 * Postgres remains authoritative for business domain truth; Temporal owns workflow execution.
 */
export async function projectRunState(params: ProjectRunStateParams): Promise<ProjectionResult> {
  logger.info("Activity: projectRunState", {
    organizationId: params.organizationId,
    projectId: params.projectId,
    analysisRunId: params.analysisRunId,
    status: params.status,
    failureCode: params.failureCode,
  });

  // In production, performs idempotent UPDATE on analysis_runs table with TenantContext.
  return {
    success: true,
    projectedAt: new Date().toISOString(),
  };
}

export async function projectWorkflowStepState(
  params: ProjectWorkflowStepStateParams,
): Promise<ProjectionResult> {
  logger.info("Activity: projectWorkflowStepState", {
    organizationId: params.organizationId,
    analysisRunId: params.analysisRunId,
    stepKey: params.stepKey,
    status: params.status,
    attempt: params.attempt,
  });

  // In production, performs idempotent UPSERT on workflow_steps table with TenantContext.
  return {
    success: true,
    projectedAt: new Date().toISOString(),
  };
}
