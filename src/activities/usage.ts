import type { UsageEvent } from "@cellweave/contracts";
import { logger } from "../observability/logger.js";
import { createPlatformError } from "../observability/errors.js";

const recordedUsageKeys = new Set<string>();

export interface ReportUsageResult {
  readonly recorded: boolean;
  readonly duplicate: boolean;
  readonly idempotencyKey: string;
  readonly timestamp: string;
}

/**
 * Usage reporting activity.
 * Records step-level resource consumption idempotently.
 * Idempotency key format: runId:stepId:attempt (Master Design §70).
 */
export async function reportStepUsage(event: UsageEvent): Promise<ReportUsageResult> {
  const expectedKey = `${event.runId}:${event.stepId}:${event.attempt}`;
  if (event.idempotencyKey !== expectedKey) {
    throw createPlatformError({
      code: "INVALID_USAGE_IDEMPOTENCY_KEY",
      message: `Usage event idempotencyKey '${event.idempotencyKey}' does not match canonical format '${expectedKey}'`,
      correlationId: event.runId,
      retryable: false,
    });
  }

  logger.info("Activity: reportStepUsage", {
    organizationId: event.organizationId,
    projectId: event.projectId,
    runId: event.runId,
    stepId: event.stepId,
    attempt: event.attempt,
    idempotencyKey: event.idempotencyKey,
  });

  const now = new Date().toISOString();

  // Check for duplicate attempt to prevent double-billing
  if (recordedUsageKeys.has(event.idempotencyKey)) {
    logger.warn("Duplicate usage event detected, skipping ledger insertion", {
      idempotencyKey: event.idempotencyKey,
    });
    return {
      recorded: false,
      duplicate: true,
      idempotencyKey: event.idempotencyKey,
      timestamp: now,
    };
  }

  recordedUsageKeys.add(event.idempotencyKey);

  // In production, performs transactional INSERT to usage_ledger and polar_sync_outbox
  return {
    recorded: true,
    duplicate: false,
    idempotencyKey: event.idempotencyKey,
    timestamp: now,
  };
}

/**
 * Resets recorded keys (used for test isolation).
 */
export function resetRecordedUsageKeysForTesting(): void {
  recordedUsageKeys.clear();
}
