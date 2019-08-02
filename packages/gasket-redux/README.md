# @gasket/redux

Redux configuration for Gasket apps.

## Functions

- `configureMakeStore(options, [postCreate])` - Returns a makeStore function

### Parameters

- `options` - (object) Options object
  - `initialState` - (object) Optionally set any preloaded state
  - `reducers` - (object) Map of identifiers and reducer functions
  - `middleware` - (function[]) Additional redux middleware to apply
  - `enhancers` - (function[]) Any other redux store enhancers
  - `logging` - (boolean) set to true if you want to enable redux logger. (default: false)
- `postCreate` - (function) Executed after the store is create the resulting
  store as the argument

### Return Value

- `makeStore` - (function) Creates the redux store for each server-side request
  and once on the client, hydrating with the state from the server.

## How to use it

Gasket apps ship with a default a redux configuration which includes the
redux-thunk middleware. This should be sufficient for most app needs, however
the `configureMakeStore` can be used to do any additional configuration.
The most common use case is to add reducers as the app level.

By default, custom store configurations can be placed in a `store.js` at the root
of your app. If you wish for it to reside elsewhere, direct the
`redux.makeStore` property to it in your app's gasket.config.js. Custom
make-store files should use CommonJS imports since they will be executed in
NodeJS for SSR.

### Example adding reducers

```js
// ./store.js

const { configureMakeStore } = require('@gasket/redux');
const reducers = require('./reducers'); // apps reducers

module.exports = configureMakeStore({ reducers });
```

### Example adding middleware in a custom path (redux-saga)

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

Next in the gasket.config.js, set the `redux.makeStore` field to the file.
This will start up the app using the custom configuration.

```js
// gasket.config.js

module.exports = {
  redux: {
    makeStore: './lib/make-store.js'
  }
};
```

## React Components

- `withReducers(reducers)(component)` - Higher-order component to wrap pages
  or components.

Reducers can also be attached at the component level when working with React.
This is particularly useful for shared components as it avoids requiring
consuming apps to know what reducers to add to their store configurations.
For this, the `withReducers` HOC is provided to dynamically attach the reducers
to the store when a component mounts.


### Attach reducers for a shared component

```jsx harmony
// shared-component.js

import { connect } from 'react-redux';
import { withReducers } from '@gasket/redux/react';
const exampleReducers = {
  example: state => state
};

class SharedComponent extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(exampleActionCreator());
  }

  render() {
    return (
      <div>
        <h4>My Shared Component</h4>
      </div>
    );
  }
}

export default withReducers(exampleReducers)(connect()(SharedComponent));
```

### Attach reducers for a Next.js page

After setting up your Next.js `_app.js` will need to be set up with [`next-redux-wrapper`](https://github.com/kirill-konshin/next-redux-wrapper#how-it-works),
reducers can also be dynamically attached at the page level. This is useful for
SSR and in which the reducers will be attached during the getInitialProps.

This example demonstrates how `withReducers` could be encapsulated in a
re-usable page level HOC and used for multiple pages.

```jsx harmony
// lib/pageDecorator.js

import { withReducers } from '@gasket/redux/react';
const exampleReducers = {
  exampleA: state => state,
  exampleB: state => state
};

export default PageComponent => withReducers(exampleReducers)(PageComponent);
```

```jsx harmony
// pages/page-one.js

import pageDecorator from '../lib/pageDecorator';

export default pageDecorator(() => (
  <div>
    <h1>This is Page One!</h1>
  </div>
));
```

```jsx harmony
// pages/page-two.js

import pageDecorator from '../lib/pageDecorator';

class PageTwo extends React.Component {
  render() {
    return (
      <div>
        <h1>This is Page Two!</h1>
      </div>
    );
  }
}

export default pageDecorator(PageTwo);
```

### How dynamic reducer attaching works

The `withReducers` HOC is implemented via the
[`redux-dynostore`](https://github.com/ioof-holdings/redux-dynostore) suite.
This `withReducers` function takes a key/value object. Each value is a reducer
function, and each key tells where this reducer's state output is written to
in the store object. For example, given this initial store state:

```js
{
  customer: customerState,
  cart: cartState
}
```

...once you mount a component using
`withReducers({ prefs: preferencesReducer })`, the state will have the shape:

```js
{
  customer: customerState,
  cart: cartState,
  prefs: preferencesReducerOutput
}
```

Note that if the state had already had a `prefs` property, this will be
overwritten by the new reducer. For this reason, we recommend the best practice
of each reducer, whether static or dynamic, to have its own dedicated
"keyspace". For more specific details, see the documentation on
react-dynostore's
[shallowStateHandler](https://github.com/ioof-holdings/redux-dynostore/tree/master/packages/redux-dynostore-core#statehandler).
