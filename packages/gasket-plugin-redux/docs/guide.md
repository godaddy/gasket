# State Management with Redux

There are two ways to manage the client-side state in a Next.js based Gasket app. You can either
use the React component state or use Redux.

**React state** is managed within a component. If it's needed in another sub-component,
you will have to pass it explicitly through props and if those values need to be updated
by these sub-components than they will have to use callback functions to update it.

This works out well normally, until you have a multi-level component structure where
component state has to be received and passed down through every component in the middle,
just so some child component can access and use that state value.

Also, since React state is managed within a component, the state data is lost once the
component is unmounted. So moving from page to page will re-initialize the state data.

On the other hand, **Redux state** is maintained globally. Any component that needs
that value can connect to the store and read it from there. Also, updating the state
value is as simple as dispatching an `action`.

## When to use redux

So it may feel like using Redux should *always* be the way to go. However, we have to
be careful about that, as there are some drawbacks of using Redux too much. It may
have negative performance implications. It will increase the complexity of your
application, making it harder to refactor, and also likely reduce the re-usability of
your components.

*So when should we absolutely use Redux?*

- If a state value is needed across pages.

- If a state value is initialized with server side rendering and later used from client.
Before we go any further, please take a moment to review How to use [@gasket/redux].

#### Example 1: Keep data in redux state

In this example `store.js` creates a redux store, and attaches a reducer from
`redux-reducer.js`. `ComponentA` invokes the actions from `redux-actions.js`
and `ComponentB` connects to redux store to read the current count.

<details><summary>component-a.js</summary>
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

<details><summary>component-b.js</summary>
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

<details><summary>redux-actions.js</summary>
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

<details><summary>redux-reducer.js</summary>
<p>

```javascript
const { INCREASE_BY_ONE, DECREASE_BY_ONE, INITIALIZE_COUNT } = require('../components/redux/redux-actions');

module.exports = function reducer(state = {}, action) {
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
```

</p>
</details>

<details><summary>store.js</summary>
<p>

```javascript
const { configureMakeStore } = require('@gasket/redux');
const reduxReducer = require('./redux-reducer');

const reducers = {
  reduxReducer
};

module.exports = configureMakeStore({ reducers });
```

</p>
</details>

<details><summary>pages/index.js</summary>
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

Initialize redux state from server side by dispatching redux action.
Modified `pages/index.js` shown below.

```diff
import React from 'react';
import ComponentA from '../components/redux/component-a';
import ComponentB from '../components/redux/component-b';
+ import { initialize } from '../components/redux/redux-actions';

export const IndexPage = () => (
  <div>
    <ComponentA />
    <ComponentB />
  </div>
);

+ IndexPage.getInitialProps = async function (ctx) {
+   const { isServer, store } = ctx;
+
+   if (isServer) {
+     await store.dispatch(initialize(5));
+   }
+
+   return {};
+ };

export default IndexPage;
```

<!-- LINKS -->

[@gasket/redux]: /packages/gasket-redux/README.md
