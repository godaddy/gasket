# @gasket/redux

Redux configuration for Gasket apps.

## Installation

```
npm i @gasket/redux
```

## Functions

- `configureMakeStore(options, [postCreate])` - Returns a makeStore function

### Parameters

- `options` - (object) Options object
  - `initialState` - (object) Optionally set any preloaded state
  - `reducers` - (object) Map of identifiers and reducer functions
  - `middleware` - (function[]) Additional redux middleware to apply
  - `enhancers` - (function[]) Any other redux store enhancers
  - `logging` - (boolean) set to true if you want to enable redux logger.
    (default: false)
- `postCreate` - (function) Executed after the store is create the resulting
  store as the argument

### Return Value

- `makeStore` - (function) Creates the redux store for each server-side request
  and once on the client, hydrating with the state from the server.

## Usage

Gasket apps ship with a default a redux configuration which includes the
redux-thunk middleware. This should be sufficient for most app needs, however
the `configureMakeStore` can be used to do any additional configuration. The
most common use case is to add reducers as the app level.

By default, custom store configurations can be placed in a `store.js` at the
root of your app. If you wish for it to reside elsewhere, direct the
`redux.makeStore` property to it in your app's gasket.config.js. Custom
make-store files should use CommonJS imports since they will be executed in
NodeJS for SSR.

#### Example: adding reducers

```js
// ./store.js

const { configureMakeStore } = require('@gasket/redux');
const reducers = require('./reducers'); // apps reducers

module.exports = configureMakeStore({ reducers });
```

#### Example: adding middleware in a custom path (redux-saga)

```js
// ./lib/make-store.js

const sagaMiddleWare = require('redux-saga').default();
const { configureMakeStore } = require('@gasket/redux');
const reducers = require('../reducers');
const rootSaga = require('../sagas');

const middleware = [sagaMiddleWare];

module.exports = configureMakeStore({ reducers, middleware }, store => {
  // The method below is only needed if you are utilizing
  // next-redux-saga wrapper for handling sagas in `getInitialProps`
  // store.runSagaTask = (saga) => {
  //   store.sagaTask = sagaMiddleWare.run(saga);
  // };
  // store.runSagaTask(rootSaga);

  // This is needed to initialize sagas
  store.sagaTask = sagaMiddleWare.run(saga);
});
```

Next in the gasket.config.js, set the `redux.makeStore` field to the file. This
will start up the app using the custom configuration.

```js
// gasket.config.js

module.exports = {
  redux: {
    makeStore: './lib/make-store.js'
  }
};
```

#### Example: passing custom thunk middleware

The default thunk middleware can be overridden with a customized version by
passing `thunkMiddleware`. A common use case for this is to use the
`withExtraArgument` feature of `redux-thunk`.

```js
// ./store.js

const { configureMakeStore } = require('@gasket/redux');
const reducers = require('./reducers');
const thunk = require('redux-thunk');

const myExtraArg = {};
const thunkMiddleware = thunk.withExtraArgument(myExtraArg);

module.exports = configureMakeStore({ reducers, thunkMiddleware })
```

## License

[MIT](./LICENSE.md)
