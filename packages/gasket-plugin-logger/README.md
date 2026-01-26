# @gasket/plugin-logger

This plugin adds a logger to your Gasket application and introduces lifecycles
for custom logger implementations. This plugin is included by default in all
Gasket applications.

At this time, there is only one plugin which implements a
custom logger: `@gasket/plugin-winston`.

## Installation

This plugin is only used by templates for `create-gasket-app` and is not installed for apps.

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
