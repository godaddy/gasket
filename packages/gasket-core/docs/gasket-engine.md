# Gasket Engine

Plugin engine for Gasket.

## What is a Plugin?

A plugin a a module in the `gasket` ecosystem that provides a unit of
functionality. Some plugins are core to the overall application, others
optional.

For documentation on plugins, refer to the [plugin guide].

## Gasket Object

The `Gasket` object is created by the `makeGasket` function and is passed to hook functions with the following members:

### config

The Gasket configuration object, typically derived from the object passed into `makeGasket` in the `gasket.js` file.

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

## Direct Usage

The `GasketEngine` is used internally by the `makeGasket` function, so you probably do not need
to use this directly. If you do, instantiate an engine, by passing in an array of plugins.

```js
import { GasketEngine } from '@gasket/core';
import pluginHttps from '@gasket/plugin-https';
import pluginData from '@gasket/plugin-data';

const pluginEngine = new GasketEngine([
  pluginHttps,
  pluginData
]);
```

The plugin engine will parse the configuration, import the configured plugins,
and register their hooks.

## Tracing

The Gasket Engine uses the [`debug`](https://www.npmjs.com/package/debug) package to trace the plugin lifecycle. If you set the `DEBUG` environment variable to `gasket:engine` you'll see additional output in `stderr` indicating when things are invoked.

<!-- LINKS -->

[plugin guide]: /docs/authoring-plugins.md
