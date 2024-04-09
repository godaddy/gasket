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

## Lifecycles

When a new Gasket is created, there are two lifecycles executed: [configure] and
[actions].

### configure

The `configure` lifecycle is the first lifecycle executed when a Gasket is
instantiated.
This allows any registered plugin to adjust the configuration before further
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

### actions

The `actions` lifecycle is the second lifecycle executed when a Gasket is created.
This lets plugins register actions that can be fired by the application code.

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

In this example, we register an action `getDoodads` that will only execute if the
`example` configuration is set to `true`.
It will then execute the `doodads` lifecycle, allowing any registered plugin to
provide doodads.
