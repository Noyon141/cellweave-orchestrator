import { z } from "zod";

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  TEMPORAL_ADDRESS: z.string().min(1).default("localhost:7233"),
  TEMPORAL_NAMESPACE: z.string().min(1).default("default"),
  TEMPORAL_TASK_QUEUE: z.string().min(1).default("cellweave-orchestrator-queue"),
  TEMPORAL_API_KEY: z.string().optional().default(""),
  TEMPORAL_CLIENT_CERT_PATH: z.string().optional().default(""),
  TEMPORAL_CLIENT_KEY_PATH: z.string().optional().default(""),
  MODAL_API_URL: z.string().url().optional().or(z.literal("")),
  MODAL_APP_NAME: z.string().min(1).default("cellweave-science"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): EnvConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

export const config = loadConfig();
