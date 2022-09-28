# `@gasket/plugin-mocha`

### 6.34.4

- Upgrade eslint-plugin-unicorn v43 ([#436])
- Upgrade setup-env to v2 ([#459])
- Upgrade sinon to v14 ([#460])

### 6.34.3

- Upgrade mocha v10 ([#442])

### 6.34.2

- Upgrade jsdom to v20 ([#440])

### 6.17.1

- Update glob path from `__dirname` ([#337])

### 6.16.0

- Updates to support not generating a .babelrc file when creating new apps ([#334])

### 6.12.0

- Replaced enzyme with React Testing Library. ([#324])

### 6.0.0

- Version alignment
- Upgraded dev dependencies ([#182], [#216], [#247])

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
[#182]: https://github.com/godaddy/gasket/pull/182
[#216]: https://github.com/godaddy/gasket/pull/216
[#247]: https://github.com/godaddy/gasket/pull/247
[#324]: https://github.com/godaddy/gasket/pull/324
[#334]: https://github.com/godaddy/gasket/pull/334
[#337]: https://github.com/godaddy/gasket/pull/337
[#436]: https://github.com/godaddy/gasket/pull/436
[#440]: https://github.com/godaddy/gasket/pull/440
[#442]: https://github.com/godaddy/gasket/pull/442
[#459]: https://github.com/godaddy/gasket/pull/459
[#460]: https://github.com/godaddy/gasket/pull/460
