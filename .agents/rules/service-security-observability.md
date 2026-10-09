---
trigger: always_on
description: "Constrains service credentials, worker/science permissions, structured telemetry, sensitive logs, and failure classification."
---

# Orchestrator Security and Observability

Service-to-service credentials are short-lived and scoped with:
issuer, audience, scope, expiration.

Static shared master keys are not permanent architecture.

Science compute receives only:
- specific input signed URL
- specific output capability
- manifest fragment
- required parameters

It does not receive BetterAuth, Polar, R2 master, or DB admin credentials.

Structured logs only.
Never log scientific matrix contents or expression vectors.

Correlate where appropriate:
organizationId, analysisRunId, workflowId, step/attempt, provider job id.

Distinguish:
PLATFORM_ERROR vs SCIENTIFIC_VALIDATION_ERROR.

Relevant metrics:
queued/running/failed runs, retries, time per step, cancellation, CPU/GPU, memory/OOM, cost per run.

Provider failures must be detectable.
