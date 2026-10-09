---
name: add-temporal-activity
description: Adds a Temporal Activity for non-deterministic work with least privilege, classified retries, timeouts/ceilings, observability, and contract safety.
---

# Add Temporal Activity

1. Confirm the side effect/I/O cannot live in deterministic workflow code.
2. Use generated contract types.
3. Define least-privilege inputs; do not pass master credentials to science jobs.
4. Define result/error classifications.
5. Mark transient vs permanent failures.
6. Apply bounded retry behavior appropriate to classification.
7. Add correlation identifiers and structured telemetry.
8. Ensure duplicate Activity attempts are safe/idempotent where side effects exist.
9. Add cancellation handling where provider operation can be cancelled.
10. Add unit/integration tests for success, transient failure, permanent failure, duplicate attempt, and cancellation where relevant.
