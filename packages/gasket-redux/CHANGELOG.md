# CHANGELOG

### 3.0.0

- Move to monorepo
- Remove default reducers to be specified by apps
- Move React utils to separate import path:
```diff
- import { withReducers } from '@gasket/redux';
+ import { withReducers } from '@gasket/redux/react';
```

### 2.1.3

- Use shallow merging strategy for dynamic reducer state

### 2.1.2

- Support `redux@4`

### 2.1.0

- Set logging to false by default

### 2.0.2

- Upgrading and aligning dependencies

### 2.0.1

- Adding an option `logging` to configureMakeStore call, to enable or disable redux logger

### 2.0.0

- Upgraded to Babel 7 and the `@babel/` namespace packages.
- Upgraded to latest `@gasket/*` packages that received the same update.
