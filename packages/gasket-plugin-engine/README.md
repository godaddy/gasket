# @gasket/plugin-engine

Plugin engine for gasket. This is used internally by `@gasket/cli`.

* [What is a Plugin?](#what-is-a-plugin)
* [What is a Preset?](#what-is-a-preset)
* [Configuring Plugins](#configuring-plugins)
* [Authoring Plugins](#authoring-plugins)
  - [Hooks](#hooks)
  - [Gasket API](#gasketapi)
* [Authoring Presets](#authoring-presets)
  - [Preset data structure](#preset-data-structure)
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

## What is a Preset?

A preset is simply a package with gasket plugins dependencies. This allows
common plugins to be grouped together, and loaded by way of a preset.

`@gasket` presets should follow the naming convention `@gasket/{name}-preset`,
which will allow them to be referenced using [short names](#short-names).
Otherwise, presets need to end with the `-preset` suffix. This is how gasket
determines what packages are presets or not.

#### Good names

```
@gasket/example-preset
example-preset
@myscope/example-preset
```

#### Bad names

These will **not** be resolved as valid presets.

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

## Authoring Plugins

A published plugin must be its own installable `npm` module, with the naming
convention `@gasket/{name}-plugin`. You may also create anonymous one-off
plugins for an application by placing a module in a `plugins` directory in an
application's root directory.

A plugin's main export has the following shape:

```js
module.exports = {
  name: 'awesome', // Required for published plugins. Should match the name in the module pattern '@gasket/{name}-plugin'.
  dependencies: [/* list of plugin names */],
  hooks: {
    hookA(gasket) {

    },
    async hookB(gasket) {

    },
    hookC: {
      timing: {},
      handler(gasket) {

      }
    }
  }
};
```

The optional `dependencies` array lists other plugins that must be installed as
a prerequisite. The `hooks` map has a key for every event the plugin handles,
with the values being either the function itself or an object specifying timing
options and the handler.

### Hooks

Each handler function assigned to an event is invoked by the plugin engine when
and event occurs. If the event is used for collection of data, each callback
should return data. If the handling is asynchronous, the callback should return
a `Promise`.

If multiple plugins hook the same event, they'll run in parallel if async or in
arbitrary order if synchronous. If a plugin wants to specify more specific
sequencing, the hook should be an object with a timing property and handler
function instead of a plain function. In short, a hook should have the
following type:

```ts
type HandlerFunction = (GasketAPI, ...args: any[]) => any;

type Hook = HandlerFunction | {
  timing: {
    before?: Array<string>,
    after?: Array<string>,
    first?: boolean,
    last?: boolean
  },
  handler: HandlerFunction
}
```

The before and/or properties establish ordering with respect to other plugins.
You can also use a first or last boolean instead to try to ensure that it runs
first or last (if multiple plugins do this, they'll run in parallel).

The handler functions are called with a `GasketAPI` followed by any arguments
passed when the event was invoked.

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

## Authoring Presets

The anatomy of a preset is very simple. In its most basic form, it should have
an index JavaScript file, which can just export an empty object, and a
package.json file with dependencies of gasket plugins.

For example, a `package.json` file may look like:

```json
{
  "name": "example-preset",
  "main": "index.js", 
  "dependencies": {
    "example-plugin": "^1.0.0", 
    "@my/other-plugin": "^2.0.0" 
  }
}
```

With the `index.js` as:

```js
module.exports = {
  require
}
```

It is recommended, though not required, for presets to export their `require`
instance. This will help the loader properly resolve plugin dependencies,
especially during development when module linking may be used.

You can set create values ahead of time in your preset so that the associated
prompts are never asked. To do so, in a preset's index.js, set the
`createContext` object with the properties you want to define.

```js
module.exports = {
  require,
  createContext: {
    appDescription: "In a word? .......chaos",
    packageManager: "npm",
    gitInit: false,
    testPlugin: "none"
  }
}
```

You can also _extend_ other presets by adding them as dependencies to a parent
preset. For example, by adding:

```diff
{
  "name": "example-preset",
  "main": "index.js", 
  "dependencies": {
    "example-plugin": "^1.0.0", 
    "@my/other-plugin": "^2.0.0",
+    "@some/base-preset": "^3.0.0"
  }
}
```

This base preset's plugins will also be registered when the app loads.

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
