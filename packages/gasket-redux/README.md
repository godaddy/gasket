# @gasket/redux

Redux configuration for Gasket apps.

## Installation

```
npm i @gasket/redux
```

## Functions

### configureMakeStore

Set up Redux store configuration and return a `makeStore` function

**Signature**

- `configureMakeStore(options, [postCreate]): makeStore`
- `configureMakeStore(optionsFn, [postCreate]): makeStore`

**Props**

- `options` - (object) Options object
  - `initialState` - (object) Optionally set any preloaded state
  - `reducers` - (object) Map of identifiers and reducer functions which will be
    [combined].
  - `rootReducer` - (function) Optional entry reducer. If returned state is
    unchanged, it will pass through to combined `reducers`.
  - `middleware` - (function[]) Additional redux middleware to apply
  - `enhancers` - (function[]) Any other redux store enhancers
  - `logging` - (boolean) set to true if you want to enable redux logger.
    (default: false)
- `optionsFn` - (function) function that returns the options object.
- `postCreate` - (function) Executed after the store is create the resulting
  store as the argument
- 

**Return Value**

- `makeStore` - (function) Creates the redux store for each server-side request
  and once on the client, hydrating with the state from the server.

### getOrCreateStore

Creates a helper to check if an existing store is in the context, otherwise it
will make a new instance. Context can include a `store` property directly or on
`req` and can be Next.js App or Page context.

**Signature**

- `getOrCreateStore(makeStore): (context) => Store`

**Props**

- `makeStore` - (function) Creates the redux store for each server-side request
  and once on the client, hydrating with the state from the server. Will only
  be called if an existing store is not found within the context.

## Usage

This package is only compatible with Gasket apps that use the [pages router] in Next.js with a [custom server].

Gasket apps no longer ship with a default redux configuration which includes the
redux-thunk middleware. The `configureMakeStore` can be used to do any configuration. The
most common use case is to add reducers at the app level.

By default, custom store configurations can be placed in a `store.js` at the
root of your app or in a `./redux` dir. If you wish for it to reside elsewhere,
direct the `redux.makeStore` property to it in your app's `gasket.js` file.

#### Example: adding reducers

```js
// ./store.js

import { configureMakeStore } from '@gasket/redux';
import reducers from './reducers'; // apps reducers

export default configureMakeStore({ reducers });
```

#### Example: initial state

If you are adding keys to the initial state without reducers, you make get
an `unexpected key found in previous state` error. In this case consider using
[@gasket/data] for these static-like values, or register placeholder reducers
in your store.

```diff
// ./store.js

import { configureMakeStore } from '@gasket/redux';
import myReducers './reducers'; // apps reducers

const reducers = {
  ...myReducers,
+  custom: f => f || null
};

const initialState = { custom: 'example' };

export default configureMakeStore({ initialState, reducers });
```


#### Example: adding middleware in a custom path (redux-saga)

```js
// ./lib/make-store.js

import sagaMiddleWare from 'redux-saga'.default();
import { configureMakeStore } from '@gasket/redux';
import reducers from '../reducers';
import rootSaga from '../sagas';

const middleware = [sagaMiddleWare];

export default configureMakeStore({ reducers, middleware }, store => {
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

Next in the gasket.js, set the `redux.makeStore` field to the file. This will start up the app using the custom configuration.

```js
// gasket.js

export default makeGasket({
  redux: {
    makeStore: './lib/make-store.js'
  }
});
```

#### Example: passing custom thunk middleware

The default thunk middleware can be overridden with a customized version by
passing `thunkMiddleware`. A common use case for this is to use the
`withExtraArgument` feature of `redux-thunk`.

```js
// ./store.js

import { configureMakeStore } from '@gasket/redux';
import reducers from './reducers';
import thunk from 'redux-thunk';

const myExtraArg = {};
const thunkMiddleware = thunk.withExtraArgument(myExtraArg);

export default configureMakeStore({ reducers, thunkMiddleware });
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[pages router]:https://nextjs.org/docs/pages
[custom server]:https://nextjs.org/docs/pages/
[combined]: https://redux.js.org/api/combinereducers
[@gasket/data]: /packages/gasket-data/README.md
