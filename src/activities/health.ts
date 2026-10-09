import type { HealthResponse } from "@cellweave/contracts";
import { logger } from "../observability/logger.js";

export async function checkOrchestratorHealth(): Promise<HealthResponse> {
  logger.info("Orchestrator health check activity executed");

  return {
    status: "healthy",
    version: "0.1.0",
    schemaVersion: "1.0.0",
    timestamp: new Date().toISOString(),
  };
}
