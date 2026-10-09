# CellWeave Orchestrator — Agent Constitution

## Authority
`docs/architecture/CellWeave-Production-Master-System-Design-v1.0.pdf` is authoritative.
Do not invent orchestration behavior outside it.

## Repository responsibility
This repository is a long-running TypeScript/Node Temporal worker and owns:
- Temporal workflows
- Temporal activities
- compute-provider interfaces
- Modal adapter
- workflow state projection
- usage reporting
- cancellation handling
- retry policies
- reconciliation

It exposes no customer-facing REST API.

## Boundary
Temporal is authoritative for workflow execution state, timers, retries, and activity progress.
Postgres remains authoritative for business entities, customer-visible projections, permissions, billing state, and scientific metadata.

Workflow code must remain deterministic and must not perform arbitrary DB/network/provider calls. Non-deterministic work belongs in Activities.

Scientific execution is delegated through `ComputeProvider`; orchestration never becomes the scientific engine.

## Identity and duplicates
Use deterministic workflow id:
`analysis-run:{analysisRunId}`

Starting the same run twice must not create duplicate execution or billing.

## Reliability
Retry only classified transient failures. Do not retry permanent scientific/permission/quota failures indefinitely.
Cancellation, quota pause/resume, worker crash recovery, usage finalization, and background reconciliation are first-class behavior.

## Completion
A workflow change is incomplete until deterministic replay, failure classification, retry/cancellation semantics, state projection, usage/idempotency, observability, and recovery tests pass.
