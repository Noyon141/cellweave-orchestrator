---
trigger: glob
description: "Applies strict TypeScript and Temporal determinism rules to orchestrator code."
globs: "**/*.ts"
---

# TypeScript + Temporal Determinism

Mandatory:
- strict TypeScript
- no `any`
- explicit state/result/error types
- discriminated unions
- exhaustive switches
- generated cross-repository contracts

Workflow code:
- deterministic
- no direct database calls
- no direct network calls
- no random/time/provider access except deterministic Temporal APIs
- no hidden side effects
- version behavior deliberately when replay compatibility requires it

Non-deterministic work belongs in Activities.
