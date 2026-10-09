---
trigger: always_on
description: "Prevents unspecified orchestration/provider details from becoming accidental architecture."
---

# Do Not Guess

Read `docs/architecture/DO-NOT-GUESS.md`.

Do not silently choose:
- initial always-on worker hosting provider
- numeric retry/timeout/resource ceilings not provided by authorized config/design
- service credential technology
- task-queue topology beyond the documented stages
- alternative compute provider
- billing conversion formula

Preserve abstractions and report unresolved inputs.
