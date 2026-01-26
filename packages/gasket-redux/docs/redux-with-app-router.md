# Redux with NextJS App Router

## Overview

Our current implementation of Redux in Gasket apps relies heavily on `getInitialProps` and the `_app.js` file which is not available in the App Router project structure. We use `next-redux-wrapper` in our current `@gasket/redux` and `@gasket/plugin-redux` packages. 
It is now recommended to use the `@reduxjs/toolkit` in place of the `redux` package. In particular, the `createStore` method is deprecated, which we currently use in the `@gasket/redux` package. 

In the new version of Gasket, we have decided to have the user setup Redux, instead of having a 
package available.

## Setup Guide

Follow the steps below to add Redux to an existing Gasket application that is using the NextJS App Router architecture. 

This guide assumes that a Gasket application has already been created using a Next.js template. For details on how to do so please see the [quick start guide].  

```bash
create-gasket-app --template @gasket/template-nextjs-app
```

When prompted, make sure to select yes to using the App Router architecture.

### Install `react-redux` and `@reduxjs/toolkit` in your Gasket app

```bash
npm install @reduxjs/toolkit react-redux
```

### Create your redux store

In the root of your project, create a redux folder as well as a store and hooks file. You should have something like the following for your folder and file structure.

```
/app
  layout.js
  page.js
/components
  index-page.js
/redux
  hooks.js
  store.js
```

Then define a `makeStore` function in `store.js` to be used across your application that will create a new store for each request.

```javascript
// store.js

import { configureStore } from '@reduxjs/toolkit';

export const makeStore = () => {
  return configureStore({
    reducer: {},
  });
}
```

If you have an existing Redux setup that you would like to replicate, please refer to the Redux Toolkit docs on [configureStore]. This documentation includes some helpful ways to migrate to modern redux patterns. There is also a detailed example using Middleware and Persistance for reference.

We will also need to establish some hooks in the `hooks.js` file. This is especially helpful
when using TypeScript to avoid circular dependencies.

```javascript
// hooks.js

import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
export const useAppStore = useStore.withTypes();
```

### Create a Provider Wrapper

This provider will use the `makeStore` function defined in the `store.js` file. The provider will create the store and share it with the children components. We will add the Provider component to the app directory. Your file structure should now look something like the following.

```
/app
  layout.js
  page.js
  store-provider.jsx
/components
  index-page.js
/redux
  hooks.js
  store.js
```

```javascript
// app/store-provider.jsx
'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../redux/store'

export default function StoreProvider({ children }) {
  const storeRef = useRef()
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
```

### Wrap Gasket App with Provider

Now that we have the store provider created, we have to wrap the layout component if all the routes will need the Redux store. Otherwise we can wrap each route handler specifically with the provider. 

Here's an example of a layout component with the StoreProvider we created in the previous step.

```javascript
// app/layout.js
import React from 'react';
import PropTypes from 'prop-types';
import StoreProvider from './store-provider.jsx'

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <html lang='en'>
        <body>{children}</body>
      </html>
    </StoreProvider>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node
};
```

Any component that interacts with the Redux store, _must_ be a client component. Accessing the Redux store requires React context that is only available via client components.

<!-- Links -->
[quick start guide]:https://github.com/godaddy/gasket/blob/main/docs/quick-start.md
[configureStore]:https://redux-toolkit.js.org/usage/migrating-to-modern-redux#store-setup-with-configurestore
