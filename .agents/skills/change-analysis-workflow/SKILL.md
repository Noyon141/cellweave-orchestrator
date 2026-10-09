---
name: change-analysis-workflow
description: Changes CellWeave Temporal AnalysisWorkflow while preserving determinism, state ownership, human gates, replay safety, usage idempotency, and recovery.
---

# Change AnalysisWorkflow

1. Locate exact system-design requirement and current pipeline version.
2. Confirm the change belongs in orchestration, not science or web.
3. Map affected run/step states and signals.
4. Preserve workflow determinism; move all I/O to Activities.
5. Preserve deterministic workflow id.
6. Preserve QC human-review gate where applicable.
7. Identify retry classification and cancellation semantics.
8. Identify artifact invalidation/selective recomputation impact.
9. Identify usage/billing idempotency impact.
10. Preserve replay compatibility or use an explicit versioning strategy already present in the repo.
11. Add tests for restart/replay, duplicate starts, failure, cancellation, and signals as applicable.
12. Verify customer-visible projection remains in Postgres, not Temporal history.
