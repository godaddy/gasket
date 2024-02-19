# `@gasket/redux`

### 6.45.2

- Tune `devDeps`, update test script ([#670])

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])

### 6.34.2

- Upgrade eslint-plugin-jest ([#457])

### 6.0.8

- Add default placeholder for `config` in the initial state ([#261])

### 6.0.7

- Provide `getOrCreateStore` for finding existing store on a context ([#259])

### 6.0.0

- Support for adding an entry root reducer ([#173])
- No longer provid a default make-store ([#173])
- Upgraded dev dependencies ([#247])

### 5.0.0

- Open Source Release

### 3.2.1

- Fix package.json scripts to wrap glob patterns in double-quotes

### 3.2.0

- Add support to customize thunk middleware ([#80])

### 3.1.0

- Align package structure and dependencies

### 3.0.1

- Fix placeholder reducers should never return undefined
- Fixed make-store export

### 3.0.0

- Move to monorepo
- Removed default reducers to be specified by apps
- Removed `@redux-dynostore` dependency
- Removed React dependencies and `withReducers` component.

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


[#80]: https://github.com/godaddy/gasket/pull/80
[#173]: https://github.com/godaddy/gasket/pull/173
[#247]: https://github.com/godaddy/gasket/pull/247
[#259]: https://github.com/godaddy/gasket/pull/259
[#261]: https://github.com/godaddy/gasket/pull/261
[#436]: https://github.com/godaddy/gasket/pull/436
[#457]: https://github.com/godaddy/gasket/pull/457
[#670]: https://github.com/godaddy/gasket/pull/670
