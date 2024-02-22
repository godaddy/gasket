# State Management with Redux

There are two ways to manage the client-side state in a Next.js based Gasket
app. You can either use the React component state or use Redux.

**React state** is managed within a component. If it's needed in another
sub-component, you will have to pass it explicitly through props and if those
values need to be updated by these sub-components than they will have to use
callback functions to update it.

This works out well normally, until you have a multi-level component structure
where component state has to be received and passed down through every component
in the middle, just so some child component can access and use that state value.

Also, since React state is managed within a component, the state data is lost
once the component is unmounted. So moving from page to page will re-initialize
the state data.

On the other hand, **Redux state** is maintained globally. Any component that
needs that value can connect to the store and read it from there. Also, updating
the state value is as simple as dispatching an `action`.

## When to use Redux

So it may feel like using Redux should *always* be the way to go. However, we
have to be careful about that, as there are some drawbacks of using Redux too
much. It may have negative performance implications. It will increase the
complexity of your application, making it harder to refactor, and also likely
reduce the re-usability of your components.

*So when should we absolutely use Redux?*

- If a state value is needed across pages.

- If a state value is initialized with server side rendering and later used from
  client. Before we go any further, please take a moment to review How to use
  [@gasket/redux].

#### Example 1: Keep data in Redux state

In this example `store.js` creates a Redux store, and attaches a reducer from
`redux-reducer.js`. `ComponentA` invokes the actions from `redux-actions.js` and
`ComponentB` connects to Redux store to read the current count.

<details>
<summary>component-a.js</summary>
<p>

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { increment, decrement } from './redux-actions';
import { connect } from 'react-redux';

class ComponentA  extends React.Component {
  static propTypes = {
    increment: PropTypes.func,
    decrement: PropTypes.func
  };

  increment = () => {
    this.props.increment();
  };

  decrement = () => {
    this.props.decrement();
  };

  render() {
    return (
      <div>
        <button onClick={ this.increment }>Increment</button>
        <button onClick={ this.decrement }>Decrement</button>
      </div>
    );
  }
}

export default connect(null, { increment, decrement })(ComponentA);
```

</p>
</details>

<details>
<summary>component-b.js</summary>
<p>

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class ComponentB  extends React.Component {
  static propTypes = {
    currentCount: PropTypes.number
  };

  render() {
    return (
      <div>
        Current Count: { this.props.currentCount }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentCount: state.reduxReducer.currentCount
  };
}

export default connect(mapStateToProps)(ComponentB);
```

</p>
</details>

<details>
<summary>redux-actions.js</summary>
<p>

```javascript
const INCREASE_BY_ONE = 'INCREASE_BY_ONE';
const DECREASE_BY_ONE = 'DECREASE_BY_ONE';
const INITIALIZE_COUNT = 'INITIALIZE_COUNT';

const initialize = (count) => {
  return {
    type: INITIALIZE_COUNT,
    payload: count
  };
};

const increment = () => {
  return {
    type: INCREASE_BY_ONE
  };
};

const decrement = () => {
  return {
    type: DECREASE_BY_ONE
  };
};

module.exports = {
  initialize,
  increment,
  decrement,
  INCREASE_BY_ONE,
  DECREASE_BY_ONE,
  INITIALIZE_COUNT
};
```

</p>
</details>

<details>
<summary>redux-reducer.js</summary>
<p>

```javascript
const { INCREASE_BY_ONE, DECREASE_BY_ONE, INITIALIZE_COUNT } = require('../components/redux/redux-actions');

function reducer(state = {}, action) {
  const getCurrentCount = (state) => {
    if (!state.currentCount) {
      return 0;
    }
    return state.currentCount;
  };
  const currentCount = getCurrentCount(state);
  switch (action.type) {
    case INITIALIZE_COUNT: {
      return { ...state, currentCount: action.payload };
    }
    case INCREASE_BY_ONE: {
      return { ...state, currentCount: currentCount + 1 };
    }
    case DECREASE_BY_ONE: {
      return { ...state, currentCount: currentCount > 0 ? currentCount - 1 : currentCount };
    }
    default:
      return state;
  }
};

module.exports = {
  increment: reducer
}
```

</p>
</details>

<details>
<summary>redux/store.js</summary>
<p>

This file will have been generated for you by default. Your job will merely be
to include the app's reducers.

```diff
- const { configureMakeStore } = require('@gasket/redux');
+ const { configureMakeStore, getOrCreateStore } = require('@gasket/redux');
const { HYDRATE, createWrapper } = require('next-redux-wrapper');
+ const incrementReducers = require('./redux-reducer');

const rootReducer = (state, { type, payload }) => type === HYDRATE ? { ...state, ...payload } : state;
const reducers = {
+  ...incrementReducers
};

const makeStore = configureMakeStore({ rootReducer, reducers });
const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
module.exports.nextRedux = nextRedux;
```

See the section below on [next-redux-wrapper v6] if you have an existing app and
want to use the latest [automatic optimization] changes from Next.js.

</p>
</details>

<details>
<summary>pages/index.js</summary>
<p>

```javascript
import React from 'react';
import ComponentA from '../component-a';
import ComponentB from '../component-b';

export const IndexPage = () => (
  <div>
    <ComponentA />
    <ComponentB />
  </div>
);

export default IndexPage;

```

</p>
</details>

#### Example 2: Initialize state value with SSR

Initialize Redux state from server side by dispatching a Redux action. Modified
`pages/index.js` shown below.

```diff
import React from 'react';
import ComponentA from '../components/redux/component-a';
import ComponentB from '../components/redux/component-b';
+ import { nextRedux } from '../redux/store.js';
+ import { initialize } from '../components/redux/redux-actions';

export const IndexPage = () => (
  <div>
    <ComponentA />
    <ComponentB />
  </div>
);

+ export const getServerSideProps = nextRedux.getServerSideProps(ctx) {
+   const { store } = ctx;
+   await store.dispatch(initialize(5));
+
+   return {};
+ };

export default IndexPage;
```

## next-redux-wrapper v6

If you are coming from a version of [next-redux-wrapper] prior to v6, you will
need to make the following changes to your existing store.

```diff
- const { configureMakeStore } = require('@gasket/redux');
+ const { configureMakeStore, getOrCreateStore } = require('@gasket/redux');
const incrementReducers = require('./redux-reducer');
+ const { HYDRATE, createWrapper } = require('next-redux-wrapper');

+ const rootReducer = (state, { type, payload }) => type === HYDRATE ? { ...state, ...payload } : state;
const reducers = {
  ...incrementReducers
};

const makeStore = configureMakeStore({
+  rootReducer,
  reducers
});
+ const nextRedux = createWrapper(getOrCreateStore(makeStore));

module.exports = makeStore;
+ module.exports.nextRedux = nextRedux;
```

The `createWrapper` function accepts the Next.js [AppContext]. We can use the
`getOrCreateStore` helper which will return a function that checks if an
existing store is on available on context, such as from [@gasket/plugin-redux],
and return it. If there is not a store, a new one will be created from the
provided `makeStore` argument.

You can now continue to use `getInitialProps` in your pages, or move to use
`getStaticProps` or `getServerSideProps` as in the [SSR example] by import
`nextRedux` export from the store file.

When it comes to the `rootReducer`, you can use this to handle
[state hydration]. There are a few different approaches for this, but the
generated default and example above should suffice for the most part. See the
`next-redux-wrapper` docs for other [state hydration] examples.

As an example, if your Gasket app and/or plugins set up the initial Redux state
for a request, such as with the [initReduxState] lifecycle, then this state will
be what is required to hydrate the Redux store within the browser, as well as
any other state added via `getServerSideProps`. if you notice problems appearing
with your state, be sure to inspect the `HYDRATE` action with [Redux DevTools]
to see how you might best reconcile the hydration state or organize the state
object.

<!-- LINKS -->

[next-redux-wrapper v6]: #next-redux-wrapper-v6
[SSR example]: #example-2-initialize-state-value-with-ssr
[@gasket/redux]: /packages/gasket-redux/README.md
[initReduxState]: /packages/gasket-plugin-redux/README.md#initreduxstate

[automatic optimization]: https://nextjs.org/docs/advanced-features/automatic-static-optimization
[next-redux-wrapper]: https://github.com/kirill-konshin/next-redux-wrapper
[state hydration]: https://github.com/kirill-konshin/next-redux-wrapper#state-reconciliation-during-hydration
[Redux DevTools]: https://github.com/reduxjs/redux-devtools

