# `@gasket/plugin-mocha`

- Add `postCreate` hook to remove plugin from created gasket
  app dependencies ([#179])

### 5.0.0

- Open Source Release
- Move test framework generated content ([#114])

### 1.4.1

- Fix package.json scripts to wrap glob patterns in double-quotes

### 1.4.0

- Align package structure and dependencies

### 1.3.0

- Changed package manager install to support both npm and yarn

### 1.2.0

- Upgrades to dependencies in create hook.

### 1.1.1

- Un-ignore `pages` so the `generator` folder is correctly included on `npm publish`

### 1.1.0

- Use `setup-env` to prepare the test environment. This will automatically set
  `NODE_ENV=test` if nothing is provided by the users, making it compatible
  with our Windows users.

### 1.0.0

- Initial release.


[#114]: https://github.com/godaddy/gasket/pull/114
[#179]: https://github.com/godaddy/gasket/pull/179
