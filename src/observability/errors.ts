import type { DomainError } from "@cellweave/contracts";

export type ErrorClassification = "PLATFORM_ERROR" | "SCIENTIFIC_VALIDATION_ERROR";

export class OrchestratorError extends Error {
  public readonly classification: ErrorClassification;
  public readonly code: string;
  public readonly correlationId: string;
  public readonly retryable: boolean;
  public readonly technicalDetail: string;
  public readonly recommendedAction: string;
  public readonly details: Record<string, unknown> | undefined;

  constructor(params: {
    message: string;
    code: string;
    classification: ErrorClassification;
    correlationId: string;
    retryable?: boolean;
    technicalDetail?: string;
    recommendedAction?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = "OrchestratorError";
    this.code = params.code;
    this.classification = params.classification;
    this.correlationId = params.correlationId;
    this.retryable = params.retryable ?? params.classification === "PLATFORM_ERROR";
    this.technicalDetail = params.technicalDetail ?? params.message;
    this.recommendedAction =
      params.recommendedAction ??
      (params.classification === "PLATFORM_ERROR"
        ? "Retry the operation or contact platform support if the issue persists."
        : "Review dataset metadata and parameters before resubmitting.");
    this.details = params.details;
  }

  public toContractError(): DomainError {
    return {
      code: this.code,
      message: this.message,
      technicalDetail: this.technicalDetail,
      recommendedAction: this.recommendedAction,
      correlationId: this.correlationId,
      retryable: this.retryable,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export function createPlatformError(params: {
  code: string;
  message: string;
  correlationId: string;
  technicalDetail?: string;
  recommendedAction?: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
}): OrchestratorError {
  return new OrchestratorError({
    ...params,
    classification: "PLATFORM_ERROR",
    retryable: params.retryable ?? true,
  });
}

export function createScientificValidationError(params: {
  code: string;
  message: string;
  correlationId: string;
  technicalDetail?: string;
  recommendedAction?: string;
  details?: Record<string, unknown>;
}): OrchestratorError {
  return new OrchestratorError({
    ...params,
    classification: "SCIENTIFIC_VALIDATION_ERROR",
    retryable: false,
  });
}
