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

## Hooks

Each handler function assigned to an event is invoked by the plugin engine when
and event occurs. If the event is used for collection of data, each callback
should return data. If the handling is asynchronous, the callback should return
a `Promise`.

If multiple plugins hook the same event, they'll run in parallel if async or in
arbitrary order if synchronous. If a plugin wants to specify more specific
sequencing, the hook should be an object with a timing property and handler
function instead of a plain function. For example, this plugin contains an
`init` hook that specifically runs *after* the `metadata` plugin:

```js
module.exports = {
  name: 'will-run-after-metadata',
  dependencies: [/* List of dependencies */]
  hooks: {
    init: {
      timing: {
        after: [ 'metadata' ]
      },
      handler: async function init(gasket) {
        const { config } = gasket;
        console.log(config.name);
      }
    }
  }
}
```

In short, a hook should have the following type:

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

## Testing

Because Gasket plugins are just families of functions, it's fairly trivial to
test them. For example, let's say we have this super

```js
module.exports = {
  name: 'superhero'
  hooks: {
    gatherIdentities: async function(gasket) {
      const names = await Promise.all([
        gasket.exec('batman'),
        gasket.exec('superman')
      ]);

      return names;
    },
    batman: function () {
      return 'Bruce Wayne';
    },
    superman: function () {
      return 'Clark Kent';
    }
  }
}
```

Here are some basic test, assuming we're using the `mocha` test framework.

```js
const plugin = require('/path/to/plugin');
const assume = require('assume');
const sinon = require('sinon');

describe('superheroes', function () {
  it('hooks the correct lifecycles', function() {
    const hooks = plugin.hooks;
    assume(Object.keys(hooks)).equals(['gatherIdentities', 'batman', 'superman']);
  });

  it('correctly reveals Batman\'s secret identity', function () {
    const name = plugin.hooks.batman();
    assume(name).equals('Bruce Wayne');
  });

  it('executes the lifecyles for each superhero', function () {
    const stub = sinon.stub();
    const gasket = {
      exec: async function(hero) {
        stub(hero);
        return hero;
      }
    };

    const names = await plugin.hooks.gatherIdenties(gatherIdentities);
    assume(names).has.length(2);
    assume(stub.calledTwice).to.be.true();
    assume(stub.calledWith('batman')).to.be.true();
    assume(stub.calledWith('superman')).to.be.true();
  });
});
```

## Docs
