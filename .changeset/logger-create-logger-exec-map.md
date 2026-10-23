---
"@gasket/plugin-logger": patch
---

Execute `createLogger` with `execMapSync` so the multiple-logger error names the plugins that hook it

- An async `createLogger` hook now fails with the engine's `execMapSync cannot be used with async hook (createLogger) of plugin (<name>)` instead of `createLogger hooks must be synchronous`
