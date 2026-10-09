---
name: test-workflow-recovery
description: Executes CellWeave workflow durability checks for worker death, provider failure, duplicate starts, signals, cancellation, quota pause, and reconciliation.
---

# Test Workflow Recovery

Run or implement repository-supported tests that:
1. start a representative analysis;
2. terminate the worker mid-run;
3. restart and verify durable continuation;
4. repeat workflow start with same analysisRunId and verify no duplicate;
5. inject transient provider failure and verify bounded retry;
6. inject permanent scientific validation failure and verify no inappropriate retry loop;
7. pause at QC and resume by signal;
8. cancel during compute and verify provider cancel/remaining skips/usage finalization;
9. pause for quota and resume;
10. leave START_PENDING and verify reconciliation;
11. create an unreported usage/outbox condition and verify reconciliation.

Report any violation of durability/idempotency as release-blocking.
