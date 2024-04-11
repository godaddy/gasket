# @gasket/core

## Installation

#### Existing apps

```shell
npm install @gasket/core
```

Add a `gasket.mjs` file to the root of your project.
This can be a `.js` extension if your package.json has the `type` field set to `module`.
It is also possible to use with a `.ts` extension if you have TypeScript configured.

```js
// gasket.mjs
import { makeGasket } from '@gasket/core';
import LoggerPlugin from '@gasket/plugin-logger';
import MyPlugin from './my-plugin';

export default makeGasket({
  plugins: [
    LoggerPlugin,
    MyPlugin
  ]
});
```

You can now import the Gasket instance from your `gasket.mjs` file into your
application code.
With a Gasket, you can fire **actions** that will trigger **lifecycles** hooked
by plugins which encapsulate functionality allowing reuse across many applications.

### Registered plugins

A plugin is a module that exports a `name` and `hooks` object
(See [Plugins Guide]).
In your `gasket.mjs` file, you can import plugins and add them to the `plugins`
array of the Gasket configuration.

## Lifecycles

When a new Gasket is created, there are three lifecycles executed in the
following order:
1. [init]
2. [actions]
3. [configure]

### init

The `init` lifecycle allows the earliest entry to setting up a Gasket instance.
It can be used for setting up an initial state.

```js
// gasket-plugin-example.mjs

export const name = 'gasket-plugin-example';

let _initializedTime;

export const hooks = {
  init(gasket) {
    _initializedTime = Date.now();
  }
};
```

While it is possible to attach properties to the `gasket` instance, it is not
recommended.
If a plugin needs to make properties available to other plugins, it should
register an action that can be executed to retrieve the value.

```diff
// gasket-plugin-example.mjs

export const name = 'gasket-plugin-example';

let _initializedTime;

export const hooks = {
  init(gasket) {
-    gasket.initializedTime = Date.now();
+    _initializedTime = Date.now();
  },
+  actions() {
+    return {
+      getInitializedTime() {
+        return _initializedTime;
+      }
+    }
+  },
  configure(gasket) {
-    const time = gasket.initializedTime;
+    const time = gasket.actions.getInitializedTime();
  }
};
```

### actions

The `actions` lifecycle is the second lifecycle executed when a Gasket is created.
This will let plugins register actions that can be fired by the application code
where the Gasket is imported, or in other plugins.

```js
// gasket-plugin-example.mjs

export const name = 'gasket-plugin-example';

export const hooks = {
  actions(gasket) {
    return {
      async getDoodads() {
        if(gasket.config.example) {
          const dodaads = await gasket.exec('dodaads');
          return dodaads.flat()
        }
      }
    }
  }
};
```

### configure

The `configure` lifecycle is the first lifecycle executed when a Gasket is
instantiated.
This allows any [registered plugins] to adjust the configuration before further
lifecycles are executed.

```js
// gasket-plugin-example.mjs

export const name = 'gasket-plugin-example';

export const hooks = {
  configure(gasket, gasketConfig) {
    // Modify the configuration
    return {
      ...gasketConfig,
      example: true
    };
  }
};
```

In this example, we register an action `getDoodads` that will only execute if the
`example` configuration is set to `true`.
It will then execute the `doodads` lifecycle, allowing any registered plugin to
provide doodads.

[init]: #init 
[actions]: #actions 
[configure]: #configure 
[registered plugins]: #registered-plugins
[Plugins Guide]:/packages/gasket-cli/docs/plugins.md
