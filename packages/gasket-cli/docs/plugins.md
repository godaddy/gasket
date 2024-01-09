# Authoring Plugins

A published plugin must be its own installable `npm` module, following the
plugin [naming convention]. Alternatively, you can create [one-off plugins]
specifically for your app.

A plugin's main export should have the following structure:

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
prerequisites. The `hooks` map has a key for every event the plugin handles,
with the values being either the function itself or an object specifying
`timing` options and the `handler`.

## Hooks

Each `handler` function assigned to an event is invoked by the plugin engine
when that event occurs. If an event is used for data collection, each callback
should return data. If the handling is asynchronous, the callback should return
a `Promise`.

If multiple plugins hook the same event, they'll run in parallel if async or in
arbitrary order if synchronous. If a plugin wants to specify a more specific
sequencing, the hook should be an object with a timing property and handler
function instead of a plain function. For example, this plugin contains an
`init` hook that specifically runs *after* the `metadata` plugin:

```js
module.exports = {
  name: 'will-run-after-metadata',
  hooks: {
    init: {
      timing: {
        after: [ 'metadata' ]
      },
      handler: async function initHook(gasket) {
        const { config } = gasket;
        console.log(config.name);
      }
    }
  }
}
```

In summary, a hook should have the following type:

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

The timing properties establish the execution order of a lifecycle hook with
respect to that of other plugins. This does not change the order of lifecycle
events, only the execution order of the hooks for the lifecycle event.

| Property | Description |
|----------|-------------|
| `before` | Array of names of plugins whose hooks for the lifecycle your own hook should run before. This guarantees that the hooks of those other plugins will wait for your hook to complete before running. |
| `after` | Array of names of plugins whose hooks for the lifecycle your own hook should run after. This guarantees that your hook will wait for the hooks of those other plugins to complete before running. |
| `first` | Boolean indicating that your hook will run before that of any other plugin. This should be avoided whenever possible, as it prevents other hooks from running before yours, unless they also set `first`. Instead, use the `before` property to list *known plugins* that have hooks known to be incompatible with running before or in parallel to yours. If multiple plugins use this flag for the same lifecycle, they will run in parallel unless `before` or `after` are also set. |
| `last` | Boolean indicating that your hook will run after those of all other plugins. This should be avoided whenever possible, as it prevents other hooks from running after yours, unless they also set `last`. Instead, use the `after` property to list *known plugins* that must have their hooks complete before yours runs. If multiple plugins use this flag for the same lifecycle, they will run in parallel unless `before` or `after` are also set. |

The handler functions are called with a `GasketAPI` followed by any arguments
passed when the event was invoked. You can see the full definitions for the
functions available on a `GasketAPI` object [here].

## Testing

Because Gasket plugins are just objects of functions, they are relatively easy
to test. For example, let's say we have this plugin, which hooks the `start`
lifecycle:

```js
module.exports = {
  name: 'detective',
  hooks: {
    start: async function gatherClues(gasket) {
      const { logger, exec } = gasket;
      const clues = await Promise.all([
        exec('motive'),
        exec('alibi')
      ]);

      logger.info(clues);
    },
    motive: function () {
      return 'That subtle off-white coloring';
    },
    alibi: function () {
      return 'Was returning some video tapes';
    }
  }
}
```

Here are some basic tests, assuming we're using the `mocha` test framework:

```js
const plugin = require('/path/to/plugin');
const assume = require('assume');
const { stub }  = require('sinon');

describe('detective plugin', function () {
  it('hooks the correct lifecycles',

 function() {
    const hooks = plugin.hooks;
    assume(Object.keys(hooks)).equals(['init', 'motive', 'alibi']);
  });

  it('provides a motive lifecycle', function () {
    const name = plugin.hooks.motive();
    assume(name).contains('subtle');
  });

  it('executes the lifecycles for each clue', async function () {
    const execStub = stub();
    const logSub = stub();
    const gasket = {
      exec: execStub,
      logger: {
        info: logStub
      }
    };

    await plugin.hooks.start(gasket);

    assume(execStub.calledTwice).to.be.true();
    assume(execStub.calledWith('motive')).to.be.true();
    assume(execStub.calledWith('alibi')).to.be.true();

    assume(logStub.calledOnce).to.be.true();
  });
});
```

## Documentation

If applications using your plugin also use the [@gasket/plugin-docs], you can
automatically view and generate documentation for your application using the
`gasket docs` command. To best take advantage of this functionality, provide a
`README.md` with documentation and a `metadata` hook to illustrate which
lifecycles are invoked.

```js
module.exports = {
  name: 'detective',
  hooks: {
    // other hook implementations
    metadata(gasket, data) {
      return {
        ...data,
        lifecycles: [{
          name: 'motive',
          description: 'A reason for doing something.',
          method: 'exec',
          parent: 'start'
        }, {
          name: 'alibi',
          description: 'A claim or evidence that one was elsewhere during the act.',
          method: 'exec',
          parent: 'start'
        }]
      };
    }
  }
}
```

Then, running `gasket docs` will automatically provide documentation for the
`detective` plugin.

## One-off Plugins

While it's encouraged to build plugins as separate packages, you have the
flexibility to create one-off plugins for your app. Files in a `plugins/`
directory at the root of your Gasket project will be automatically loaded by the
CLI for the engine. This allows you to connect to lifecycles, set timings, or
add your own hooks.

These app-level plugins enable quick experimentation before deciding which ones
are suitable for reuse across apps. If you find yourself duplicating app-level
plugins across multiple apps, consider extracting them as npm packages, which
can be versioned, published, and imported into your different apps.

[one-off plugins]:#one-off-plugins
[here]:/packages/gasket-engine/README.md
[@gasket/plugin-docs]:/packages/gasket-plugin-docs/README.md
[naming convention]: /packages/gasket-resolve/README.md
