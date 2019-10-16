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
with the values being either the function itself or an object specifying `timing`
options and the `handler`.

## Hooks

Each `handler` function assigned to an event is invoked by the plugin engine
when an event occurs. If an event is used for collection of data, each callback
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

The `before` and other timing properties establish ordering with respect to other
plugins. You can also use a first or last boolean instead to try to ensure that
it runs first or last (if multiple plugins do this, they'll run in parallel).

The handler functions are called with a `GasketAPI` followed by any arguments
passed when the event was invoked. You can see the full definitions for the
functions available on a `GasketAPI` object [here].

## Testing

Because Gasket plugins are just Objects of functions, it's fairly trivial to
test them. For example, let's say we have this plugin which hooks the `start`
lifecycle.

```js
module.exports = {
  name: 'detective',
  hooks: {
    start: async function gatherClues(gasket) {
      const { logger, exec } = gasket;
      const clues = await Promise.all([
        gasket.exec('motive'),
        gasket.exec('alibi')
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

Here are some basic tests, assuming we're using the `mocha` test framework.

```js
const plugin = require('/path/to/plugin');
const assume = require('assume');
const { stub }  = require('sinon');

describe('detective plugin', function () {
  it('hooks the correct lifecycles', function() {
    const hooks = plugin.hooks;
    assume(Object.keys(hooks)).equals(['init', 'motive', 'alibi']);
  });

  it('provides a motive lifecycle', function () {
    const name = plugin.hooks.motive();
    assume(name).contains('subtle');
  });

  it('executes the lifecyles for each clue', function () {
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

If applications using your plugin are also using the [`@gasket/docs-plugin`] you
can automatically view and generate docs for your application via the `gasket docs`
command. You can capitalize upon this functionality by providing JSDOC in your plugin:

```js
module.exports = {
  name: 'bateman',
  hooks: {
    /**
    * Hooks the alibi lifecycle to provide an excuse.
    *
    * @param {Gasket} gasket - Gasket object
    * @returns {String} What the suspect was doing.
    */
    alibi: function (gasket) {
      gasket.logger.info('🤞');
      return 'A lunch meeting with Cliff Huxtable at the Four Seasons';
    }
  }
}
```

Then, upon running `gasket docs`, developers will automatically find
documentation for the `detective` plugin.

[here]: (../../packages/gasket-plugin-engine#GasketAPI)
[`@gasket/docs-plugin`]: https://github.com/godaddy/gasket/blob/master/packages/gasket-docs-plugin
