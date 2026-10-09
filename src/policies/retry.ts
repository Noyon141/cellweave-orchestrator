import type { RetryPolicy } from "@temporalio/workflow";

/**
 * Standard non-retryable error names that must never be retried infinitely.
 * Master Design §41:
 * - invalid dataset
 * - unsupported schema
 * - scientific validation failure
 * - out-of-memory after resource ceiling
 * - user permission failure
 * - quota exhaustion
 */
export const NON_RETRYABLE_ERROR_TYPES = [
  "SCIENTIFIC_VALIDATION_ERROR",
  "INVALID_DATASET",
  "UNSUPPORTED_SCHEMA",
  "OUT_OF_MEMORY_CEILING",
  "USER_PERMISSION_FAILURE",
  "QUOTA_EXHAUSTION",
  "INVALID_RESOURCE_CLASS",
  "NON_RETRYABLE_PLATFORM_ERROR",
] as const;

/**
 * Standard retry policy for transient platform/network/storage/rate-limit operations.
 */
export const TRANSIENT_ACTIVITY_RETRY_POLICY: RetryPolicy = {
  initialInterval: "1s",
  backoffCoefficient: 2,
  maximumInterval: "30s",
  maximumAttempts: 5,
  nonRetryableErrorTypes: [...NON_RETRYABLE_ERROR_TYPES],
};

/**
 * Retry policy for state projection and usage reporting.
 * Must retry transient network/database hiccups to maintain consistency.
 */
export const CRITICAL_PROJECTION_RETRY_POLICY: RetryPolicy = {
  initialInterval: "500ms",
  backoffCoefficient: 2,
  maximumInterval: "10s",
  maximumAttempts: 10,
  nonRetryableErrorTypes: [...NON_RETRYABLE_ERROR_TYPES],
};

/**
 * Classifies an error to determine whether it is retryable or permanent.
 */
export function isTransientError(error: unknown): boolean {
  if (error && typeof error === "object") {
    if ("retryable" in error && typeof error.retryable === "boolean") {
      return error.retryable;
    }
    if ("name" in error && typeof error.name === "string") {
      if (
        NON_RETRYABLE_ERROR_TYPES.includes(error.name as (typeof NON_RETRYABLE_ERROR_TYPES)[number])
      ) {
        return false;
      }
    }
    if ("code" in error && typeof error.code === "string") {
      if (
        NON_RETRYABLE_ERROR_TYPES.includes(error.code as (typeof NON_RETRYABLE_ERROR_TYPES)[number])
      ) {
        return false;
      }
    }
  }
  return true;
}
