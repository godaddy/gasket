# @gasket/plugin-logger

This plugin adds a logger to your Gasket application and introduces lifecycles
for custom logger implementations. This plugin is included by default in all
Gasket applications.

At this time, there is only one plugin which implements a
custom logger: `@gasket/plugin-winston`.

## Configuration

Configuration for `@gasket/plugin-logger` lives under the `logger` key in `gasket.config`.

| Option | Type | Default | Description |
|---|---|---|---|
| `overrideConsole` | `boolean` | `false` | When `true`, replaces the global `console` methods (`log`, `info`, `warn`, `error`, `debug`) with calls to `gasket.logger`. |

### overrideConsole

>  **Note:** `overrideConsole` only takes effect when a custom logger is registered via the `createLogger` lifecycle; it has no effect when the default console-based fallback logger is in us

Some third-party packages (e.g. SDKs, component libraries) call `console.*` directly and bypass the configured logger pipeline entirely. This causes issues such as multi-line plain-text output appearing in structured log aggregators (e.g. Elastic) instead of properly formatted log entries, because the formatting, transport, and metadata configuration in `gasket.logger` is never applied.

Enabling `overrideConsole` patches the global `console` methods during the `init` lifecycle — early enough to capture all subsequent output — and routes them through `gasket.logger`, so log levels, structured metadata, and transports work consistently across the entire app.

```js
// gasket.config.js
export default {
  logger: {
    overrideConsole: true
  }
};
```

> **Note:** This is an opt-in stop-gap for apps where third-party dependencies cannot be updated to accept a custom logger instance. The preferred long-term solution is to update those libraries to accept a logger instance so that `gasket.logger` can be passed down directly.

## Installation

This plugin is only used by presets for `create-gasket-app` and is not installed for apps.

## Actions

### getLogger

Get the logger instance using the Actions API.

```js
const logger = gasket.actions.getLogger();
```

## Lifecycles

### createLogger

To implement a custom logger, hook the `createLogger` lifecycle.
Your hook must be synchronous and return an object with this shape:

```typescript
type Logger = {
  [level: string]: (...args: Array<any>) => void,
  child: (metadata: Object) => Logger,
  close?: () => Promise<void> // Optional
}
```

The `level` keys are the log levels that your logger supports. The values are
functions that accept any number of arguments and write them to the log. Your
logger must support, at minimum, the following levels:

- `debug`
- `error`
- `info`
- `warn`

The `child` function is used to create a new logger with additional metadata.
The `metadata` argument is set of properties that will be included in every log
entry. The `child` function must return a new logger with the same shape as the
parent logger.

The `close` function, if supplied, is called when the application is shutting
down and should be used to close any open resources.

## Test

If you are contributing to this plugin, use the following to run the tests:

```shell
npm test
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->
