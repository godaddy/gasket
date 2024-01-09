# @gasket/engine

The Plugin Engine for Gasket - an internal tool for the Gasket CLI.

## What is a Plugin?

A Plugin is a module in the `gasket` ecosystem that offers a specific unit of
functionality. Some plugins are integral to the core of the application, while
others are optional.

For detailed documentation on plugins, please refer to the [Plugin
Guide](./packages/gasket-cli/docs/plugins.md).

## What is a Preset?

A Preset is essentially a package containing dependencies on Gasket plugins.
This allows you to group common plugins together and load them via a preset.

For in-depth information on presets, please consult the [Preset
Guide](./packages/gasket-cli/docs/presets.md).

## GasketAPI

The `GasketAPI` object, which is passed to hook functions, provides the
following members:

### config

The Gasket configuration object, typically derived from `gasket.config.js`.

### exec(event, ...args)

The `exec` method enables a plugin to introduce new lifecycle events. When using
`exec`, make sure to await the `Promise` it returns to ensure that other
plugins' hooks have completed. If the lifecycle event is intended to produce
data, the `Promise` will contain an `Array` of hook data stored in the order the
hooks were executed.

### execSync(event, ...args)

The `execSync` method is similar to `exec`, but it requires all hooks to execute
synchronously. The synchronous result is an Array of hook return values. It is
recommended to use async methods whenever possible to maintain flexibility.

### execMap(event, ...args)

The `execMap` method is just like `exec`, except that the Promise result is an
object map with each key representing the name of the plugin and each value
containing the result from the hook. Only the plugins that hooked the event will
have keys present in the map.

### execMapSync(event, ...args)

The `execMapSync` method is similar to `execMap`, but all hooks must execute
synchronously.

### execApply(event, async applyFn)

The `execApply` method's execution is ordered similarly to `exec`, but you must
invoke the handler yourself with explicit arguments. These arguments can be
dynamic based on the plugin itself. For example:

```js
await gasket.execApply('someEvent', async (plugin, handler) => {
  // Creating the "Contextual thing" can be synchronous or asynchronous.
  // Asynchronous parameters are fully supported with this pattern if necessary.
  const arg = await Contextual.thingWith(plugin);
  return handler(arg); // The gasket parameter is automatically applied
});
```

### execApplySync(event, applyFn)

The `execApply` method is similar to `execApply`, but all hooks must execute
synchronously.

### execWaterfall(event, value, ...args)

The `execWaterfall` method is akin to `exec`, but it allows you to have each
hook execute sequentially, with each result being passed as the first argument
to the next hook. It's similar to an asynchronous version of
`Array.prototype.reduce`. The final result is returned in the resulting Promise.

### execWaterfallSync(event, value, ...args)

The `execWaterfallSync` method is similar to `execWaterfall`, but each hook must
execute synchronously. The final value is returned synchronously from this call.
It is encouraged to use async methods whenever possible to maintain flexibility.

### hook({ event, handler, timing, pluginName })

This method injects additional lifecycle hooks at runtime. It takes a single
object parameter with the following properties:

| Property     | Required? | Description                                                                                                                                                                                                                                                                                                                                 |
|:-------------|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `event`      | Yes       | The name of the event to hook, corresponding to the property name in the `hooks` of a plugin definition.                                                                                                                                                                                                                           |
| `handler`    | Yes       | The function to call when the event occurs, following the same format as the `hooks` callbacks in a plugin definition.                                                                                                                                                                                                         |
| `timing`     | No        | Ordering constraints for when the hook will execute, matching the optional `timing` property in plugin hooks.                                                                                                                                                                                                                                |
| `pluginName` | No        | Defaults to an auto-generated name. Only supply this if you need other hooks to be able to order themselves relative to this hook via `timing` constraints. Note: Only one hook per event is allowed per plugin name, so if your plugin is injecting dynamic hooks, ensure that the names are dynamic enough to avoid conflicts.

## Plugin Priority

When a preset extends another preset, the version of the plugin registered can
be overridden if the parent preset sets a different dependency version.
Additionally, if an app specifies a plugin directly in the `gasket.config` using
`add`, the version determined by the app will instead be registered.

## Direct Usage

This package is primarily intended for internal use by the Gasket CLI, so you
probably do not need to use it directly. However, if you do, instantiate an
engine by passing in the `gasket.config.js` export.

```js
const PluginEngine = require('@gasket/engine');
const gasketConfig = require('../gasket.config');

const pluginEngine = new PluginEngine(gasketConfig, context);
```

The plugin engine will parse the configuration, import the configured plugins,
and register their hooks. The engine instance is the same
[GasketAPI](#gasketapi) object passed to hook handlers.

## PluginEngine `context`

Execution of plugins through a `PluginEngine` instance depends on the `context`
of that operation. Currently, the `context` consists of:

- `resolveFrom`: an absolute path to prepend to any `moduleName` before
  attempting resolution with `require`.

For example:

```js
const PluginEngine = require('@gasket/engine');

const path = require('path');
const resolveFrom = path.resolve('./someapp');
const gasketConfig = require(path.join(resolveFrom, 'gasket.config'));

const pluginEngine = new PluginEngine(gasketConfig, { resolveFrom });
```

The above code will resolve all Plugins and Presets from within `./someapp`
instead of resolving relative to the current directory.

## Tracing

The Gasket engine utilizes the [`debug`](https://www.npmjs.com/package/debug)
package to trace the plugin lifecycle. If you set the `DEBUG` environment
variable to `gasket:engine`, you'll see additional output in `stderr` indicating
when things are invoked.

## License

[MIT License](./LICENSE.md)

<!-- LINKS -->

- [Preset Guide](./packages/gasket-cli/docs/presets.md)
- [Plugin Guide](./packages/gasket-cli/docs/plugins.md)
