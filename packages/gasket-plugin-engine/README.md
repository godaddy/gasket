# @gasket/plugin-engine

Plugin engine for gasket. This is used internally by `@gasket/cli`.

* [What is a Plugin?](#what-is-a-plugin)
* [What is a Preset?](#what-is-a-preset)
* [Configuring Plugins](#configuring-plugins)
* [Direct Usage](#direct-usage)

## What is a Plugin?

A plugin a a module in the `gasket` ecosystem that provides a unit of
functionality. Some plugins are core to the overall application, others
optional.

`@gasket` plugins should follow the naming convention `@gasket/{name}-plugin`,
which will allow them to be referenced using [short names](#short-names).
Otherwise, plugins need to end with the `-plugin` suffix. This is how gasket
determines what packages are plugins or not.

#### Good names

```
@gasket/example-plugin
example-plugin
@myscope/example-plugin
```

#### Bad names

These will **not** be resolved as valid plugins.

```
@gasket/example
example
@myscope/example
```


## Configuring Plugins

To configure your plugins and presets, update (or create) `gasket.config.js`,
adding a `plugins` object. This takes three string arrays:

```js
module.exports = {
  plugins: {
    presets: [ /* Presets you would like to add */ ],
    add:     [ /* Plugins to add after presets are added */ ],
    remove:  [ /* Plugins to remove */ ]
  },
  // ...
}
```

### Short names
Items in these arrays are module names. Gasket supports shorthand naming;
`'mocha'` expands to `@gasket/mocha-plugin` in the `add` and `remove` arrays,
`nextjs` expands to `@gasket/nextjs-preset` in the `presets` array.

### GasketAPI

The `GasketAPI` object passed to hook functions has the following members:

#### config

The Gasket configuration object, typically derived from `gasket.config.js`.

#### exec(event, ...args)

The `exec` method enables a plugin to introduce new lifecycle events. When
calling `exec`, await the `Promise` it returns to wait for the hooks of other
plugins to finish. If the lifecycle event is for producing data, the `Promise`
will contain an `Array` of the hook data stored in the order the hooks were
executed.

#### execSync(event, ...args)

The `execSync` method is like `exec`, only all hooks must execute synchronously.
The synchronous result is an Array of the hook return values. Using synchronous
methods limits flexibility, so it's encouraged to use async methods whenever
possible.

#### execMap(event, ...args)

The `execMap` method is just like `exec`, only the Promise result is an
object map with each key being the name of the plugin and each value the
result from the hook. Only the plugins that hooked the event will have keys
present in the map.

#### execMapSync(event, ...args)

The `execSyncSync` method is like `execMap`, only all hooks must execute
synchronously.

#### execApply(event, async applyFn)

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

#### execApplySync(event, applyFn)

The `execApply` method is like `execApply`, only all hooks must execute
synchronously.

#### execWaterfall(event, value, ...args)

The `execWaterfall` method is like `exec`, only it allows you to have each
hook execute sequentially, with each result being passed as the first argument
to the next hook. It's like an asynchronous version of `Array.prototype.reduce`.
The final result is returned in the resulting Promise.

#### execWaterfallSync(event, value, ...args)

The `execWaterfallSync` method is like `execWaterfall`, only each hook must
execute synchronously. The final value is returned synchronously from this call.
Using synchronous methods limits flexibility, so it's encouraged to use async
methods whenever possible.

#### hook({ event, handler, timing, pluginName })

Injects additional lifecycle hooks at runtime. Takes a single object parameter
with the following properties:

| Property     | Required? | Description |
|--------------|-----------|-------------|
| `event`      | Yes       | The name of the event to hook. This is the same thing as the property name in the `hooks` of a plugin definition. |
| `handler`    | Yes       | The function to call when the event occurs. The function should take the same form as the `hooks` callbacks in a plugin definition. |
| `timing`     | No        | Ordering constraints for when the hook will execute. Same as the optional `timing` property in plugin hooks.  |
| `pluginName` | No        | Defaults to an auto-generated name. Only supply this if you need other hooks to be able to order themselves relative to this hook via `timing` constraints. Important note: only one hook per event is allowed per plugin name, so if your plugin is injecting dynamic hooks, be sure that the names are dynamic enough to avoid conflicts. |

### Plugin priority

When a preset extends another preset, the version of the plugin registered can
be overridden if the parent preset sets a different dependency version.
Additionally, if an app specifies a plugin directly in the gasket.config using
`add`, the version determined by the app will instead be registered.

## Direct Usage

This package is used internally by `@gasket/cli`, so you probably do not need to
use this directly. If you do, instantiate an engine, passing in the
`gasket.config.js` export.

```js
const PluginEngine = require('@gasket/plugin-engine');
const gasketConfig = require('../gasket.config');

const pluginEngine = new PluginEngine(gasketConfig, context);
```

The plugin engine will parse the configuration, import the configured plugins,
and register their hooks. The engine instance is the same
[GasketAPI](#gasketapi) object passed to hook handlers.

### PluginEngine `context`

Execution of plugins through a `PluginEngine` instance is dependent on the
`context` of that operation. Currently the `context` consists of:

- `resolveFrom`: absolute path to prepend to any `moduleName` before
  attempting resolution with `require`.

e.g.

```js
const PluginEngine = require('@gasket/plugin-engine');

const path = require('path');
const resolveFrom = path.resolve('./someapp');
const gasketConfig = require(path.join(resolveFrom, 'gasket.config'));

const pluginEngine = new PluginEngine(gasketConfig, { resolveFrom });
```

The above will resolve all Plugins and Presets from within `./someapp` instead
of resolving relative to the current directory.

##### LICENSE: [MIT](./LICENSE)
