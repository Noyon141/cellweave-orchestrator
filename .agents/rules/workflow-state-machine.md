---
trigger: always_on
description: "Defines CellWeave analysis and workflow-step state machines and their durable ownership."
---

# Workflow State Machines

Run states:
DRAFT
UPLOADING
VALIDATING
QC_RUNNING
QC_REVIEW_REQUIRED
QUEUED
RUNNING
PAUSED_QUOTA
CANCEL_REQUESTED
CANCELLED
SUCCEEDED
FAILED

Terminal:
SUCCEEDED, FAILED, CANCELLED.

Workflow-step states:
PENDING, QUEUED, RUNNING, SUCCEEDED, RETRYING, FAILED, SKIPPED, CANCELLED.

Each attempt records:
- attempt
- started/completed time
- compute resources
- error classification
- cost
- logs reference
- input/output manifests as designed

Failure never automatically destroys intermediate outputs.

Temporal owns execution progress; customer-visible projections are persisted outside workflow history.
