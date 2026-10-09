---
name: orchestrator-release-check
description: Checks an orchestrator release against Temporal determinism, recovery, retry, cancellation, usage, security, observability, and production gates.
---

# Orchestrator Release Check

Verify:
- strict TypeScript
- generated contracts
- deterministic workflows
- all I/O in Activities
- deterministic workflow ids
- crash/replay recovery
- duplicate-start safety
- retry classification
- cancellation
- QC signal
- quota pause/resume
- compute provider abstraction
- resource ceilings
- scoped science credentials
- usage idempotency
- reconciliation
- structured telemetry
- provider-failure detection
- documentation updated

Do not approve a release that can lose, duplicate, or double-bill a run.
