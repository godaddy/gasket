---
"@gasket/plugin-logger": minor
---

Add opt-in `logger.overrideConsole` configuration. When enabled, patches the global `console` methods during the `init` lifecycle and routes them through `gasket.logger`. Because all output now passes through the logger's configured pipeline (formatters, transports, metadata), third-party dependencies that previously called `console.*` directly will automatically produce structured, consistently formatted log entries. Only takes effect when a custom logger is registered via `createLogger`.
