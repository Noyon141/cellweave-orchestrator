---
trigger: model_decision
description: "Use for AnalysisWorkflow, QC signal, analysis stage ordering, manual annotation signals, quota resume, or workflow behavior changes."
---

# AnalysisWorkflow

Canonical sequence:
1. validate entitlement
2. validate dataset
3. prepare canonical input
4. run QC
5. WAIT FOR HUMAN QC CONFIRMATION
6. filter
7. normalize
8. select features
9. PCA
10. neighbors
11. UMAP
12. clustering
13. automatic annotation
14. markers
15. generate artifacts
16. finalize provenance
17. record usage
18. complete

Signal:
`confirmQC(parameters)`

Signals also support:
- cancel
- manual annotation decision
- resume after quota purchase

Do not remove the human QC gate.
Do not reorder scientifically meaningful stages without explicit architectural/scientific approval represented by a new pipeline version.

Selective recomputation follows artifact DAG invalidation:
- presentation-only changes do not rerun science
- annotation changes do not rerun UMAP
- filter changes invalidate downstream and branch a new run
