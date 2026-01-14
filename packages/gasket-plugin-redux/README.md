# @gasket/plugin-redux

Gasket plugin to setup Redux store availability to Express middleware.


⚠️ _DEPRECATED - This plugin will be removed in a future major version.
Compatibility is limited to Next.js apps using [pages router] with [custom server]
and [@gasket/plugin-middleware]._

## Installation

```
npm i @gasket/plugin-redux @gasket/plugin-middleware
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginRedux from '@gasket/plugin-redux';
+ import pluginMiddleware from '@gasket/plugin-middleware';

export default makeGasket({
  plugins: [
+   pluginRedux,
+   pluginMiddleware
  ]
});
```

## Configuration

Gasket apps will need to have a `store.js` file either which can be imported
to the `gasket.js`.

The store.js file should export a makeStore function. Use `configureMakeStore`
from [@gasket/redux] to simplify this setup.

App developers can choose to use different file location setting the
`redux.makeStore` option in their gasket.js file. See option details below.

### Options

- `makeStore` - (string) relative path to a custom makeStore configuration. If
  not specified, the plugin will check if a `store.js` file exists in the root
  of your project. Otherwise, the default will be used. This must be a CommonJS
  module.
- `initState` - (object) initial state to include in the store

#### Example config

```js
// gasket.js

export default makeGasket({
  redux: {
    makeStore: './relative/path/to/customMakeStore.js',
    initState: {
      urls: {
        fooService: 'https://foo.url/',
        barService: 'https://bar.url/'
      }
    }
  },

  // You can override initState by environment
  environments: {
    test: {
      redux: {
        initState: {
          urls: {
            fooService: 'https://test.foo.url/'
          }
        }
      }
    }
  }
});
```

```js
// customMakeStore.js

import { configureMakeStore } from '@gasket/redux';
import reducers from './reducers'; // app's reducers

export default configureMakeStore({ reducers });
```

## Usage

This plugin attaches a `store` object to the node request object. This allows
redux to be invoked in express middleware and the same store instance used
during server-side rendering.

#### Example middleware

```js
async function doSomethingMiddleware(req, res, next) {
  try {
    await req.store.dispatch(myActionCreator());
    next();
  } catch(err) {
    next(err);
  }
}
```

## Lifecycles

### initReduxState

This plugin fires an `initReduxState` event when constructing the initial
server-side state for the redux store. Plugins that need to modify this initial
state can hook this event and return a modified version of the initial state or
a Promise that resolves to a new initial state. Example plugin:

```js
import getExperiments from './get-experiments';

export default {
  name: 'gasket-plugin-example',
  hooks: {
    initReduxState(gasket, state, { req, res }) {
      return {
        ...state,
        experiments: getExperiments(req)
      }
    }
  }
};
```

The hook is passed the following parameters:

| Parameter | Description                           |
|:----------|:--------------------------------------|
| `gasket`  | The `gasket` API                      |
| `state`   | The initial state of the redux so far |
| `req`     | The express request object            |
| `res`     | The express response object           |

### initReduxStore

The plugin fires an `initReduxStore` event after the server-side redux store has
been constructed. This gives other plugins a chance to do such things as read
the initial state or fire off actions to populate the store. Asynchronous
actions should return a Promise. Example plugin:

```js
import getExperiments from './get-experiments-action';

export default {
  name: 'gasket-plugin-example',
  hooks: {
    initReduxStore(gasket, store, { req, res }) {
      store.dispatch(getExperiments(req));
    }
  }
};
```

The hook is passed the following parameters:

| Parameter | Description                 |
|:----------|:----------------------------|
| `gasket`  | The `gasket` API            |
| `store`   | The redux store             |
| `req`     | The express request object  |
| `res`     | The express response object |

## Integrations

### Adding reducers

If you have a plugin which installs a package with reducers, you can
include those in the generated store.js during the **create** command.

In the `create` lifecycle hook of your plugin, you can access
`reduxReducers` to add import and entry statements while will be injected to the store template.

```js
export default {
  name: 'gasket-plugin-example',
  hooks: {
    create(gasket, createContext) {
      const { reduxReducers } = createContext;
      
      // Prefer to have named reduces in an object
      reduxReducers.addImport("const manyExampleReducer = require('@example/reducers');")
      // Add a spread entry of the named reducers
      reduxReducers.addEntry('...manyExampleReducer')
      
      // Ideally, the reducers are keyed already be in a object as
      // in the previous example. If not, however, you can provide the
      // key in the entry for a single reducer.
      reduxReducers.addImport("const { singleExampleReducer } = require('@example/components');")
      reduxReducers.addEntry('example: singleExampleReducer')      
    }
  }
};
```

With these imports and entries added, the resulting store file should
resemble:

```js
import { configureMakeStore } from '@gasket/redux';
import manyExampleReducer from '@example/reducers';
import { singleExampleReducer } from '@example/components';

const reducers = {
  ...manyExampleReducer,
  example: singleExampleReducer
};

const makeStore = configureMakeStore({ reducers });

export default makeStore;
```

### Accessing the store file

In your app code, you should be able to simply import/require the store
file as needed. In most cases, this should not even be necessary. The
Redux store instance will be created during a request and made available
as `req.store`.

In some situations, such as in shared packages used by multiple apps
where the store file needs to be accessed, but its location is unknown,
an environment variable is set, which can be referenced.

```js
const makeStore = require(process.env.GASKET_MAKE_STORE_FILE);
```

During runtime this will be available, and when bundled via Webpack it
will be replaced by the [EnvironmentPlugin].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[pages router]:https://nextjs.org/docs/pages
[custom server]:https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
[@gasket/redux]:/packages/gasket-redux/README.md#gasketredux
[@gasket/plugin-middleware]:/packages/gasket-plugin-middleware/README.md
[EnvironmentPlugin]:https://webpack.js.org/plugins/environment-plugin/
