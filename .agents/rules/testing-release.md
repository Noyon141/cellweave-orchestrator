---
trigger: model_decision
description: "Use for orchestrator tests, workflow replay/recovery, failure injection, retry/cancel/quota behavior, or release qualification."
---

# Orchestrator Testing / Release

Required behavior tests include:
- deterministic same-id start
- duplicate start does not duplicate execution
- worker killed mid-workflow recovers
- Activities retry transient failures
- permanent failures stop according to classification
- human QC signal resumes
- cancellation propagates to compute where possible
- remaining steps skip after cancellation
- quota pause survives worker restart
- resume signal continues
- usage event idempotency
- START_PENDING reconciliation
- unsynced billing reconciliation
- stale/orphan cleanup
- Modal failure handling
- state projection consistency

Production qualification includes failure injection and workflow crash/recovery.

A successful happy path is not sufficient.
