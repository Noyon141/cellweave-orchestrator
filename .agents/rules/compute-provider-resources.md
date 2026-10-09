---
trigger: model_decision
description: "Use for ComputeProvider, Modal adapter, job resources, admission, cost ceilings, or compute portability."
---

# Compute Provider and Resource Rules

`ComputeProvider` contract:
- submit
- status
- cancel
- result

Initial adapter:
`ModalComputeProvider`.

No workflow/domain logic imports Modal-specific payloads directly.

Logical resource profiles:
- CPU_SMALL
- CPU_MEMORY
- CPU_HIGH_MEMORY
- GPU_SMALL
- GPU_LARGE

Resource estimation considers:
cells, genes, sparsity, dataset size, requested method, batch count.

Before expensive work determine:
- memory requirement
- CPU class
- GPU requirement
- expected compute units

Every run receives:
- estimatedComputeUnits
- maxComputeUnits
- maxRuntime
- maxMemoryClass

Enforced ceiling terminates compute.

Organization controls may include monthly budget, per-run budget, concurrent-job limit.

Do not invent numeric ceilings or plan limits before benchmarking/authorized configuration.
