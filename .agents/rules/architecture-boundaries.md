---
trigger: always_on
description: "Preserves the Temporal orchestration boundary and prevents business database or scientific compute leakage."
---

# Orchestration Boundary

Own durable execution, not customer API, business persistence truth, or scientific algorithms.

Never:
- expose customer-facing REST API
- turn Temporal history into the business database
- embed Scanpy/scvi scientific algorithms in workflow code
- directly call Modal throughout domain/workflow logic
- give science jobs primary DB credentials
- duplicate cross-service schemas owned by `cellweave-contracts`

All provider I/O and DB/network work belongs in Activities or adapters.

Compute is accessed through `ComputeProvider`.

The orchestrator may project workflow state into Postgres through authorized activity/application boundaries; it does not redefine domain truth.
