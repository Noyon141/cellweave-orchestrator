---
name: add-compute-step
description: Adds an orchestrated scientific compute step through ComputeProvider without leaking provider-specific or scientific implementation into Temporal.
---

# Add Compute Step

1. Confirm the scientific step is present in the authorized pipeline design.
2. Confirm science implementation/contract exists or coordinate its contract change.
3. Call `ComputeProvider`, never Modal directly from workflow/domain logic.
4. Select logical resource profile from authorized estimation logic.
5. Enforce estimated/max compute units, runtime, and memory class.
6. Pass only scoped signed input/output capabilities and required parameters.
7. Track provider job id in operational diagnostics.
8. Poll/wait through Activities without blocking HTTP requests.
9. Support cancellation.
10. Register outputs/manifests idempotently.
11. Record actual usage with `runId:stepId:attempt`.
12. Add retry, OOM-ceiling, provider-capacity, cancellation, and duplicate-attempt tests.
