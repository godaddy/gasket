# Redux with NextJS App Router

## Overview

Our current implementation of Redux in Gasket apps relies heavily on `getInitialProps` and the `_app.js` file which is not available in the App Router project structure. We use `next-redux-wrapper` in our current `@gasket/redux` and `@gasket/plugin-redux` packages. 
It is now recommended to use the `@reduxjs/toolkit` in place of the `redux` package. In particular, the `createStore` method is deprecated, which we currently use in the `@gasket/redux` package. 

If your app needs Redux with App Router, set it up directly with
[@reduxjs/toolkit] instead.

## Setup Guide

This guide assumes you have created a Gasket application using the
[Next.js App Router template]. If you haven't yet, create one with:

```bash
npx create-gasket-app@latest my-app --template @gasket/template-nextjs-app
```

### Install dependencies

```bash
npm install @reduxjs/toolkit react-redux
```

### Create your Redux store

Create a `redux/` directory at the project root with a store and hooks file:

```
my-app/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── redux/
│   ├── hooks.ts
│   └── store.ts
├── gasket.ts
└── ...
```

Define a `makeStore` function in `store.ts` that creates a new store instance.
Each request should get its own store to avoid sharing state between users.

```typescript
// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';

export const makeStore = () => {
  return configureStore({
    reducer: {}
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
```

If you have an existing Redux setup you'd like to replicate, refer to the
Redux Toolkit docs on [configureStore] for migration patterns.

Create typed hooks in `hooks.ts` to use throughout your app instead of the
plain `react-redux` hooks:

```typescript
// redux/hooks.ts
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, AppStore, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```

### Create a store provider

The provider is a client component that creates the store instance and shares
it with the component tree. Add it to the `app/` directory:

```
my-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── store-provider.tsx
├── redux/
│   ├── hooks.ts
│   └── store.ts
└── ...
```

```tsx
// app/store-provider.tsx
'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../redux/store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={ storeRef.current }>{children}</Provider>;
}
```

### Update the root layout

The template's `app/layout.tsx` already uses `withGasketData` to inject Gasket
data. Add the `StoreProvider` inside the layout so it wraps all routes:

```diff
// app/layout.tsx
import React from 'react';
import gasket from '@/gasket';
import { withGasketData } from '@gasket/nextjs/layout';
+ import StoreProvider from './store-provider';

function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <StoreProvider>
      <html lang='en'>
        <body>{children}</body>
      </html>
    </StoreProvider>
  );
}

export default withGasketData(gasket)(RootLayout);
```

If only certain routes need the Redux store, you can wrap those route layouts
individually instead of the root layout.

Any component that interacts with the Redux store **must** be a client
component. Accessing the Redux store requires React context that is only
available in client components.

<!-- Links -->
[Next.js App Router template]:https://github.com/godaddy/gasket/tree/main/packages/gasket-template-nextjs-app
[next-redux-wrapper]:https://github.com/kirill-konshin/next-redux-wrapper
[@reduxjs/toolkit]:https://redux-toolkit.js.org/
[configureStore]:https://redux-toolkit.js.org/usage/migrating-to-modern-redux#store-setup-with-configurestore
