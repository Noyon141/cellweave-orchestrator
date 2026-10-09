import { describe, it, expect } from "vitest";
import { loadConfig } from "../../src/config/env.js";

describe("Configuration and Environment Loader", () => {
  it("loads default configuration when no environment variables are set", () => {
    const config = loadConfig({});
    expect(config.NODE_ENV).toBe("development");
    expect(config.TEMPORAL_ADDRESS).toBe("localhost:7233");
    expect(config.TEMPORAL_NAMESPACE).toBe("default");
    expect(config.TEMPORAL_TASK_QUEUE).toBe("cellweave-orchestrator-queue");
    expect(config.MODAL_APP_NAME).toBe("cellweave-science");
    expect(config.LOG_LEVEL).toBe("info");
  });

  it("loads explicit environment overrides correctly", () => {
    const custom = loadConfig({
      NODE_ENV: "staging",
      TEMPORAL_ADDRESS: "temporal-staging.cellweave.internal:7233",
      TEMPORAL_NAMESPACE: "cellweave-staging",
      TEMPORAL_TASK_QUEUE: "staging-pipeline-queue",
      LOG_LEVEL: "debug",
    });

    expect(custom.NODE_ENV).toBe("staging");
    expect(custom.TEMPORAL_ADDRESS).toBe("temporal-staging.cellweave.internal:7233");
    expect(custom.TEMPORAL_NAMESPACE).toBe("cellweave-staging");
    expect(custom.TEMPORAL_TASK_QUEUE).toBe("staging-pipeline-queue");
    expect(custom.LOG_LEVEL).toBe("debug");
  });

  it("throws validation error on invalid environment values", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "invalid-env" as unknown as string,
      }),
    ).toThrow(/Invalid environment configuration/);
  });
});
