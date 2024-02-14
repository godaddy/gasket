# @gasket/engine

Plugin engine for Gasket. This is used internally by the Gasket CLI.

## What is a Plugin?

A plugin a a module in the `gasket` ecosystem that provides a unit of
functionality. Some plugins are core to the overall application, others
optional.

For documentation on plugins, refer to the [plugin guide].

## What is a Preset?

A preset is simply a package with Gasket plugins dependencies. This allows
common plugins to be grouped together, and loaded by way of a preset.

For documentation on presets, refer to the [preset guide].

## GasketAPI

The `GasketAPI` object passed to hook functions has the following members:

### config

The Gasket configuration object, typically derived from `gasket.config.js`.

### `exec(event, ...args)`

The `exec` method enables a plugin to introduce new lifecycle events. When
calling `exec`, await the `Promise` it returns to wait for the hooks of other
plugins to finish. If the lifecycle event is for producing data, the `Promise`
will contain an `Array` of the hook data stored in the order the hooks were
executed.

### `execSync(event, ...args)`

The `execSync` method is like `exec`, only all hooks must execute synchronously.
The synchronous result is an Array of the hook return values. Using synchronous
methods limits flexibility, so it's encouraged to use async methods whenever
possible.

### `execMap(event, ...args)`

The `execMap` method is just like `exec`, only the Promise result is an object
map with each key being the name of the plugin and each value the result from
the hook. Only the plugins that hooked the event will have keys present in the
map.

### `execMapSync(event, ...args)`

The `execSyncSync` method is like `execMap`, only all hooks must execute
synchronously.

### `execApply(event, async applyFn)`

The `execApply` method execution is ordered like `exec`, but you must invoke the
handler yourself with explicit arguments. These arguments can be dynamic based
on the plugin itself. e.g.:

```js
await gasket.execApply('someEvent', async (plugin, handler) => {
  // Creating the "Contextual thing" can be sync or async. async params are
  // fully supported with this pattern if necessary.
  const arg = await Contextual.thingWith(plugin);
  return handler(arg); // The gasket parameter is automatically applied
});
```

### `execApplySync(event, applyFn)`

The `execApply` method is like `execApply`, only all hooks must execute
synchronously.

### `execWaterfall(event, value, ...args)`

The `execWaterfall` method is like `exec`, only it allows you to have each hook
execute sequentially, with each result being passed as the first argument to the
next hook. It's like an asynchronous version of `Array.prototype.reduce`. The
final result is returned in the resulting Promise.

### `execWaterfallSync(event, value, ...args)`

The `execWaterfallSync` method is like `execWaterfall`, only each hook must
execute synchronously. The final value is returned synchronously from this call.
Using synchronous methods limits flexibility, so it's encouraged to use async
methods whenever possible.

### `hook({ event, handler, timing, pluginName })`

Injects additional lifecycle hooks at runtime. Takes a single object parameter
with the following properties:

| Property     | Required? | Description                                                                                                                                                                                                                                                                                                                                 |
|:-------------|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `event`      | Yes       | The name of the event to hook. This is the same thing as the property name in the `hooks` of a plugin definition.                                                                                                                                                                                                                           |
| `handler`    | Yes       | The function to call when the event occurs. The function should take the same form as the `hooks` callbacks in a plugin definition.                                                                                                                                                                                                         |
| `timing`     | No        | Ordering constraints for when the hook will execute. Same as the optional `timing` property in plugin hooks.                                                                                                                                                                                                                                |
| `pluginName` | No        | Defaults to an auto-generated name. Only supply this if you need other hooks to be able to order themselves relative to this hook via `timing` constraints. Important note: only one hook per event is allowed per plugin name, so if your plugin is injecting dynamic hooks, be sure that the names are dynamic enough to avoid conflicts. |

## Plugin priority

When a preset extends another preset, the version of the plugin registered can
be overridden if the parent preset sets a different dependency version.
Additionally, if an app specifies a plugin directly in the gasket.config using
`add`, the version determined by the app will instead be registered.

## Direct Usage

This package is used internally by the Gasket CLI, so you probably do not need
to use this directly. If you do, instantiate an engine, passing in the
`gasket.config.js` export.

```js
const PluginEngine = require('@gasket/engine');
const gasketConfig = require('../gasket.config');

const pluginEngine = new PluginEngine(gasketConfig, context);
```

The plugin engine will parse the configuration, import the configured plugins,
and register their hooks. The engine instance is the same
[GasketAPI](#gasketapi) object passed to hook handlers.

## PluginEngine `context`

Execution of plugins through a `PluginEngine` instance is dependent on the
`context` of that operation. Currently the `context` consists of:

- `resolveFrom`: absolute path to prepend to any `moduleName` before attempting
  resolution with `require`.

e.g.

```js
const PluginEngine = require('@gasket/engine');

const path = require('path');
const resolveFrom = path.resolve('./someapp');
const gasketConfig = require(path.join(resolveFrom, 'gasket.config'));

const pluginEngine = new PluginEngine(gasketConfig, { resolveFrom });
```

The above will resolve all Plugins and Presets from within `./someapp` instead
of resolving relative to the current directory.

## Tracing

The Gasket engine uses the [`debug`](https://www.npmjs.com/package/debug) package to trace the plugin lifecycle. If you set the `DEBUG` environment variable to `gasket:engine` you'll see additional output in `stderr` indicating when things are invoked.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[preset guide]: /packages/gasket-cli/docs/presets.md
[plugin guide]: /packages/gasket-cli/docs/plugins.md
