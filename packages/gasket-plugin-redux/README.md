# @gasket/plugin-redux

Gasket plugin to setup redux store available to express middleware.

## Installation

#### New apps

***Recommended***

```
gasket create <app-name> --plugins @gasket/plugin-redux
```

#### Existing apps

```
npm i @gasket/plugin-redux @gasket/redux redux
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-redux'
    ]
  }
}
```

## Configuration

By default, Gasket apps will use the makeStore function from
`@gasket/redux/make-store`. App developers can choose to use different makeStore
file by utilizing `configureMakeStore` from [@gasket/redux] and then pointing to
this file in the gasket.config.js.

### Options

- `makeStore` - (string) relative path to a custom makeStore configuration. If
  not specified, the plugin will check if a `store.js` file exists in the root
  of your project. Otherwise, the default will be used. This must be a CommonJS
  module.
- `initState` - (object) initial state to include in the store

#### Example config

```js
// gasket.config.js

module.exports = {
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
}
```

```js
// customMakeStore.js

const { configureMakeStore } = require('@gasket/redux');
const reducers = require('./reducers'); // app's reducers
const Log = require('@gasket/log');     // custom log implementation

module.exports = configureMakeStore({ reducers, logger: new Log() });
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
const getExperiments = require('./get-experiments');

module.exports = {
  id: 'gasket-plugin-example',
  hooks: {
    initReduxState(gasket, state, req, res) {
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
const getExperiments = require('./get-experiments-action');

module.exports = {
  id: 'gasket-plugin-example',
  hooks: {
    initReduxStore(gasket, store, req, res) {
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

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[@gasket/redux]:/packages/gasket-redux/README.md#gasketredux
