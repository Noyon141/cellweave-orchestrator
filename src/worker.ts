import { NativeConnection, Worker } from "@temporalio/worker";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/env.js";
import * as activities from "./activities/index.js";
import { logger } from "./observability/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WorkerOptions {
  address?: string;
  namespace?: string;
  taskQueue?: string;
}

export async function createWorker(options: WorkerOptions = {}): Promise<Worker> {
  const address = options.address || config.TEMPORAL_ADDRESS;
  const namespace = options.namespace || config.TEMPORAL_NAMESPACE;
  const taskQueue = options.taskQueue || config.TEMPORAL_TASK_QUEUE;

  logger.info("Initializing Temporal Worker", {
    address,
    namespace,
    taskQueue,
    nodeEnv: config.NODE_ENV,
  });

  let tlsOptions: { clientCertPair: { crt: Buffer; key: Buffer } } | undefined;

  if (config.TEMPORAL_CLIENT_CERT_PATH && config.TEMPORAL_CLIENT_KEY_PATH) {
    logger.info("Configuring mTLS for Temporal connection");
    const [crt, key] = await Promise.all([
      fs.readFile(config.TEMPORAL_CLIENT_CERT_PATH),
      fs.readFile(config.TEMPORAL_CLIENT_KEY_PATH),
    ]);
    tlsOptions = {
      clientCertPair: { crt, key },
    };
  }

  const connection = await NativeConnection.connect({
    address,
    tls: tlsOptions,
  });

  const workflowsPath = path.resolve(__dirname, "./workflows/index.js");

  const worker = await Worker.create({
    connection,
    namespace,
    taskQueue,
    workflowsPath,
    activities,
  });

  return worker;
}

export async function runWorker(): Promise<void> {
  const worker = await createWorker();

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, initiating graceful worker shutdown`);
    worker.shutdown();
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  logger.info("Temporal Worker started and listening for tasks");
  await worker.run();
  logger.info("Temporal Worker shutdown completed");
}

// Auto-run if executed directly as entrypoint
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runWorker().catch((err: unknown) => {
    logger.error("Fatal worker startup failure", undefined, err);
    process.exit(1);
  });
}
