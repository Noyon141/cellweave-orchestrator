---
trigger: model_decision
description: "Use for retry policy, cancellation, START_PENDING recovery, quota pause/resume, stale resource cleanup, or reconciliation."
---

# Retry, Cancellation, Reconciliation

Retry:
- network failures
- temporary storage failures
- Modal capacity failures
- transient DB failures
- provider rate limiting

Do not indefinitely retry:
- invalid dataset
- unsupported schema
- scientific validation failure
- OOM after resource ceiling
- user permission failure
- quota exhaustion

Classify every failure.

Run start consistency:
- create DB run as START_PENDING
- start Temporal with deterministic workflow id
- if start fails, reconciliation retries
- same workflow id remains idempotent

Cancellation:
Next.js request → Temporal cancellation → cancel active Modal job where possible → skip remaining work → finalize usage → CANCELLED.

Quota:
RUNNING → PAUSED_QUOTA → user tops up/upgrades → resume signal → continue.

Periodic reconciliation checks:
- START_PENDING
- Temporal projections
- stale uploads
- orphaned multipart uploads
- unreported usage
- unsynced Polar events
- stuck deletion jobs
- expired signed-upload sessions

Do not silently lose paid jobs.
