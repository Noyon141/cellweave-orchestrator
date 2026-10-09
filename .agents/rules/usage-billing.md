---
trigger: model_decision
description: "Use for usage reporting, ledger events, Polar outbox coordination, duplicate protection, or quota enforcement."
---

# Usage / Billing Orchestration

Internal raw measurements can include:
cpu_seconds, gpu_seconds, memory_class, bytes_processed, storage_byte_hours, egress_bytes.

Customer concepts:
Compute Credits, Storage Allowance.

Usage event identity:
`runId:stepId:attempt`.

Retries must never duplicate usage charges.

Expected flow:
scientific step completes
→ usage event
→ immutable usage ledger insert
→ billing outbox insert
→ Polar event
→ acknowledgement projection.

Polar is not the entitlement engine.
Entitlement validation uses local business state via an authorized Activity/application boundary.

On cancellation/failure, finalize actual usage according to completed/consumed work; do not fabricate zero usage or duplicate usage.
