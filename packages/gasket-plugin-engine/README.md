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
optional. All plugins should follow the naming convention
`@gasket/{name}-plugin`.

## What is a Preset?

A preset is simply an array of plugins information to add to gasket.
The special preset `@gasket/default-preset` is used by default if you
have no plugin customization. Presets should follow the naming convention
`@gasket/{name}-preset`.

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

Items in these arrays are module names. Gasket supports shorthand naming;
`'mocha'` expands to `@gasket/mocha-plugin` in the `add` and `remove` arrays,
`default` expands to `@gasket/default-preset` in the `presets` array.

If no config file or plugin configuration is present in `gasket.config.js`, the
equivalent configuration is:

```js
module.exports = {
  plugins: {
    presets: ['default']
  },
}
```

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

The `execApply` method execution is ordered like `exec`, but you must invoke the handler yourself with explicit arguments. These arguments can be dynamic based on the plugin itself. e.g.:

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

For a working example, see [@gasket/default-preset]. In addition, you can also
augment the context used in `gasket create` from within your preset. In this
example, `gasket create` is used with the `@gasket/default-preset`. There are 6
prompts that are presented to the user during the creation of the application.

```
$ gasket create whats-that-name
create __debug__
📦  Download preset: @gasket/default-preset
📓  Using @gasket/default-preset@2.3.0
? What is your app description? In a word? .......chaos
? Which packager would you like to use? npm
? Do you want a git repo to be initialized? No
? Choose your unit test suite none (not recommended)
📚  Write package.json contents into __debug__
⏰  Installing node modules ./__debug__. This might be some time………
```

You can set these values ahead of time in your preset so that the associated
prompts are never asked. In a preset's `package.json`, you can set the above
values ahead of time by creating a `gasket.create` object:

```json
{
  "name": "snl-preset",
  "gasket": {
    "create": {
      "appDescription": "In a word? .......chaos",
      "packageManager": "npm",
      "gitInit": false,
      "testPlugin": "none"
    }
  }
}
```

You can also _extend_ other presets by adding an `extending` property to your
main file:

```js
// index.js
module.exports = require('@gasket/resolve/plugins')({
  dirname: __dirname,
  resolve: name => require(name),
  extending: [
    'television-preset', // you can just do a string if it's a module
    require('comedy-preset') // or you can require it manually
  ]
});

```

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

[@gasket/default-preset]: TODO: Add this when it exists
