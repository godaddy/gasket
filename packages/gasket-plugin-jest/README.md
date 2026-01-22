# @gasket/plugin-jest

Creates a `jest` with `enzyme` based testing environment for your Gasket
application.

## Installation

This plugin is only used by templates for `create-gasket-app` and is not installed for apps.

## Usage

When you create a new Gasket application that is configured with the `jest`
plugin it will prepare it with a `jest` based testing environment. It will add
the following `scripts` to the `package.json`:

- `npm test`, Runs the files matching default jest glob pattern, i.e. includes
  files from __tests__ folder and all `*.test.js` or `*.spec.js` files.
- `npm run test:watch` Same as `npm test` but now watches your tests and
  automatically re-runs the tests when changes are detected.
- `npm run test:coverage` Same as `npm test`, but generates coverage information
  for all the files matching the `collectCoverageFrom` pattern in
  `jest.config.js` file.

`enzyme` is included with this plugin, which makes it easier to assert,
manipulate, and traverse your React Components.

## License

[MIT](./LICENSE.md)
