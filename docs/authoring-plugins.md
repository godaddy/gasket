# Authoring Plugins

A published plugin must be its own installable `npm`. You may also create [one-off plugins] for an app.

A plugin's main export has the following shape:

```js
export default {
  name: 'gasket-plugin-awesome',
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
with the values being either the function itself or an object specifying
`timing` options and the `handler`.

## Recommended naming convention

It is recommended that the `name` property in plugins adhere to the project-type prefixed naming convention.

When naming a plugin, prefix it with `gasket-plugin-`. This will help you easily identify the type of package you are installing.

For example, if you were to create a plugin called `foo` you would name it `gasket-plugin-foo`.

If your project uses [scoped packages], the scope name would be added to the front of the plugin name followed by a `/`. For example, if the plugin name from above were included in a project with a scope of `@test` the name would be `@test/gasket-plugin-foo`.

## Hooks

Each `handler` function assigned to an event is invoked by the plugin engine
when an event occurs. If an event is used for collection of data, each callback
should return data. If the handling is asynchronous, the callback should return
a `Promise`.

If multiple plugins hook the same event, they'll run in parallel if async or in
arbitrary order if synchronous. If a plugin wants to specify more specific
sequencing, the hook should be an object with a timing property and handler
function instead of a plain function. For example, this plugin contains a
`create` hook that specifically runs *after* the `@gasket/plugin-nextjs` plugin:

```js
export default {
  name: 'will-run-after-nextjs-plugin',
  hooks: {
    create: {
      timing: {
        after: ['@gasket/plugin-nextjs']
      },
      handler: async function create(gasket, { pkg }) {
        pkg.add('dependencies', {
          'will-run-after-nextjs-plugin': '^1.1.1'
        });
      }
    }
  }
}
```

In short, a hook should have the following type:

```ts
type HandlerFunction = (Gasket, ...args: any[]) => any;

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

The timing properties establish the execution order of a lifecycle hook with respect to that of other plugins. This does not change the order of lifecycle events, only the execution order of the hooks for the lifecycle event. 

| Property | Description |
|----------|-------------|
| `before` | Array of names of plugins whose hooks for the lifecycle your own hook should run before. This will guarantee that the hooks of those other plugins will wait for your hook to complete before running. |
| `after` | Array of names of plugins whose hooks for the lifecycle your own hook should run after. This will guarantee that your hook will wait for the hooks of those other plugins to complete before running. |
| `first` | Boolean indicating that your hook will run before that of any other plugin. You should avoid this whenever possible because it will prevent the ability of other hooks to run before yours, unless they also set `first`. Instead, use the `before` property to list _known plugins_ that have hooks known to be incompatible with running before or in parallel to yours. If multiple plugins use this flag for the same lifecycle, they will run in parallel unless `before` or `after` are also set. |
| `last` | Boolean indicating that your hook will run after those of all the other plugins. You should avoid this whenever possible because it will prevent the ability of other hooks to run after yours, unless they also set `last`. Instead, use the `after` property to list _known plugins_ that must have their hooks complete before yours runs. If multiple plugins use this flag for the same lifecycle, they will run in parallel unless `before` or `after` are also set. |

The handler functions are called with a `Gasket` object followed by any arguments
passed when the event was invoked. You can see the full definitions for the
functions available on a `Gasket` object [here].

## Testing

Because Gasket plugins are just Objects of functions, it's fairly trivial to
test them. For example, let's say we have this plugin which hooks the `create`
lifecycle.

```js
export default {
  name: 'gasket-plugin-example',
  description: 'An example plugin',
  version: '1.1.1',
  hooks: {
    create: {
      timing: {
        after: ['@gasket/plugin-nextjs']
      },
      handler: async function create(gasket, { pkg }) {
        pkg.add('dependencies', {
          'will-run-after-nextjs-plugin': '^1.1.1'
        });
      }
    }
  }
}
```

Here are some basic tests, assuming we're using the `jest` test framework.

```js
import plugin from '/path/to/plugin';

describe('example plugin', function () {
  it('hooks the correct lifecycles', function() {
    const hooks = plugin.hooks;
    expect(Object.keys(hooks)).equals(['create']);
  });

  it('has the correct create hook timings', function () {
    expect(plugin.hooks.create.timing.after).toEqual(['@gasket/plugin-nextjs']);
  });

  it('has expected properties', function () {
    expect(plugin).toHaveProperty('name', plugin.name);
    expect(plugin).toHaveProperty('version', plugin.version);
    expect(plugin).toHaveProperty('description', plugin.description);
  });
});
```

## Documentation

If applications using your plugin are also using the [@gasket/plugin-docs] you
can automatically view and generate docs for your application via the `gasket
docs` command. To best take advantage of this functionality, you should provide
a `README.md` enumerating documentation, as well as `metadata` hook to best
illustrate which lifecycles are invoked.

```js
export default {
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

Then, upon running `node gasket.js docs`, developers will automatically find
documentation for the `detective` plugin.

## One-off plugins

While it is encouraged to build plugins as separate packages, the ability to
create one-off plugins in an app is available. This gives you access to tie into lifecycles, set timings, or even add your own hooks.

These types of app-level plugins allow you to experiment quickly, before deciding
what is best for reuse across apps. If you find yourself duplicating app-level
plugins across apps, be sure to extract it as an npm package which can be
versioned, published, and imported to your different apps.

[one-off plugins]:#one-off-plugins
[here]:/packages/gasket-core/docs/gasket-engine.md
[@gasket/plugin-docs]:/packages/gasket-plugin-docs/README.md
[scoped packages]: https://docs.npmjs.com/about-scopes
