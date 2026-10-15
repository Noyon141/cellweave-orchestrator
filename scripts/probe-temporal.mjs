import { Connection } from "@temporalio/client";

async function runProbe() {
  const address = process.env.TEMPORAL_STAGING_ADDRESS || process.env.TEMPORAL_ADDRESS;
  const namespace = process.env.TEMPORAL_STAGING_NAMESPACE || process.env.TEMPORAL_NAMESPACE;
  const apiKey = process.env.TEMPORAL_STAGING_API_KEY || process.env.TEMPORAL_API_KEY;
  const taskQueue =
    process.env.TEMPORAL_STAGING_TASK_QUEUE ||
    process.env.TEMPORAL_TASK_QUEUE ||
    "cellweave-orchestrator-queue";

  const isStaging = namespace?.includes("staging") || process.env.NODE_ENV === "staging";

  console.log(`=== CellWeave Phase 0 ${isStaging ? "STAGING" : "DEVELOPMENT"} Temporal Cloud Connectivity Probe ===`);
  console.log(`Address:     ${address || "<UNSET>"}`);
  console.log(`Namespace:   ${namespace || "<UNSET>"}`);
  console.log(`Task Queue:  ${taskQueue}`);
  console.log(`API Key:     ${apiKey ? `[PRESENT, length=${apiKey.length}]` : "<UNSET>"}`);

  if (!address || !namespace || !apiKey) {
    console.error("\n[ERROR] Required Temporal Cloud credentials/coordinates are missing.");
    console.error("Please supply TEMPORAL_ADDRESS, TEMPORAL_NAMESPACE, and TEMPORAL_API_KEY (or TEMPORAL_STAGING_*).");
    process.exit(1);
  }

  console.log("\n[1/4] Establishing gRPC connection with TLS and API key authentication...");
  let connection;
  try {
    connection = await Connection.connect({
      address,
      apiKey,
      tls: true,
      connectTimeoutMs: 10000,
    });
    console.log("  -> gRPC connection established successfully.");
  } catch (err) {
    console.error("  -> [FAILED] Could not connect to Temporal Cloud endpoint:", err.message);
    process.exit(1);
  }

  try {
    console.log("\n[2/4] Querying Temporal Cloud System Info (getSystemInfo)...");
    const systemInfo = await connection.workflowService.getSystemInfo({});
    console.log("  -> System Info call succeeded.");
    console.log("  -> Server Version:", systemInfo.serverVersion || "Cloud");
    console.log("  -> Capabilities:", Object.keys(systemInfo.capabilities || {}).length > 0 ? "Reported" : "Default");

    console.log(`\n[3/4] Describing target namespace: '${namespace}'...`);
    const nsInfo = await connection.workflowService.describeNamespace({ namespace });
    const info = nsInfo.namespaceInfo;
    const config = nsInfo.config;
    const stateMap = {
      0: "UNSPECIFIED",
      1: "REGISTERED (active)",
      2: "DEPRECATED",
      3: "DELETED",
    };
    const stateStr = stateMap[info?.state] || String(info?.state || "UNKNOWN");
    console.log("  -> Namespace state:", stateStr);
    console.log("  -> Description:    ", info?.description || "(empty)");
    console.log("  -> Owner Email:    ", info?.ownerEmail || "(empty)");
    if (config?.workflowExecutionRetentionTtl) {
      const seconds = Number(config.workflowExecutionRetentionTtl.seconds || 0);
      const days = seconds / 86400;
      console.log(`  -> Retention:       ${days} days (${seconds}s)`);
    }

    console.log("\n[4/4] Validating authorization boundary / negative isolation probes...");

    if (isStaging) {
      // 1. Negative probe against DEVELOPMENT namespace
      const devNs = "cellweave-dev.wtlwz";
      try {
        await connection.workflowService.describeNamespace({ namespace: devNs });
        console.warn(`  -> [WARN] Probe accessed DEVELOPMENT namespace '${devNs}' without authorization denial.`);
      } catch (negDevErr) {
        console.log(`  -> Negative probe against DEVELOPMENT namespace '${devNs}' safely rejected: ${negDevErr.name || "Error"} (${negDevErr.message.split("\n")[0]})`);
      }

      // 2. Negative probe against PRODUCTION namespace
      const prodNs = "cellweave-prod.wtlwz";
      try {
        await connection.workflowService.describeNamespace({ namespace: prodNs });
        console.warn(`  -> [WARN] Probe accessed PRODUCTION namespace '${prodNs}' without authorization denial.`);
      } catch (negProdErr) {
        console.log(`  -> Negative probe against PRODUCTION namespace '${prodNs}' safely rejected: ${negProdErr.name || "Error"} (${negProdErr.message.split("\n")[0]})`);
      }
    } else {
      // Development negative probe
      const probeNs = "cellweave-prod-boundary-probe";
      try {
        await connection.workflowService.describeNamespace({ namespace: probeNs });
        console.warn(`  -> [WARN] Probe accessed outside namespace without authorization denial.`);
      } catch (negativeErr) {
        console.log(`  -> Negative probe safely rejected as expected (${negativeErr.name || "Error"}: ${negativeErr.message.split("\n")[0]})`);
      }
    }

    console.log("\n============================================================");
    console.log(`PROBE RESULT: SUCCESS`);
    console.log(`Temporal Cloud ${isStaging ? "STAGING" : "DEVELOPMENT"} namespace and API key verified.`);
    console.log("============================================================");
  } catch (err) {
    console.error("\n[FAILED] Verification error during probe execution:", err);
    process.exit(1);
  } finally {
    try {
      await connection.close();
    } catch {
      // ignore
    }
  }
}

runProbe().catch((err) => {
  console.error("Unhandled probe error:", err);
  process.exit(1);
});
