# Authoring Plugins

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
passed when the event was invoked. You can see the full definitions for the
functions available on a `GasketAPI` object [here](../../packages/gasket-plugin-engine#GasketAPI).
