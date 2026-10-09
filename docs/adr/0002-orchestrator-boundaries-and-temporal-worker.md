# ADR 0002: Orchestrator Boundaries and Temporal Worker Architecture

## Status
Accepted

## Context
`cellweave-orchestrator` is responsible for durable workflow execution across long-running scientific analysis pipelines. Clear architectural boundaries are required to prevent orchestration from leaking into customer API endpoints, business database ownership, or scientific implementation.

## Decisions

1. **No Customer-Facing REST API**: The orchestrator is an infrastructure worker process. It exposes no public HTTP routes. Interactions occur via Temporal workflows, signals, and internal activities.
2. **Deterministic Workflow Execution**: All workflow code must be pure and deterministic. Direct database access, network I/O, clock access, or random number generation are forbidden in workflows and isolated strictly to Activities.
3. **Temporal vs Postgres Authority**: Temporal is the sole authority for execution state, retry counters, timers, and activity progress. Postgres remains authoritative for business entities, user permissions, customer-visible projections, and billing records. Workflow state is projected into Postgres via idempotent Activities.
4. **ComputeProvider Abstraction**: Scientific jobs are dispatched through the `ComputeProvider` contract. No domain logic or workflow directly calls Modal APIs. Modal is an execution provider, not the workflow source of truth.
5. **No Scientific Algorithms in Orchestrator**: Scientific logic (Scanpy, Scrublet, scVI, AnnData manipulation) is owned by `cellweave-science` and executed remotely. The orchestrator coordinates lifecycle, capabilities, manifests, and usage.
6. **Classified Retries and Idempotent Usage**: Activities classify errors as transient (retryable) vs permanent (non-retryable). Usage events are keyed by `runId:stepId:attempt` to guarantee duplicate executions never duplicate billing.

## Consequences
- Workflow code remains replay-safe and upgrade-safe.
- Modal or alternative compute providers can be swapped without touching workflow logic.
- Failures and worker crashes are safely recovered by Temporal.
