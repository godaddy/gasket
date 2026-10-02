---
"@gasket/plugin-https": patch
---

`startServer` now waits for the servers to start and rejects if they fail (e.g. port already in use), instead of resolving immediately and only logging the error.
