# @gasket/plugin-vitest

Creates a vitest based testing environment for your Gasket application.

## Installation

This plugin is only used by templates for `create-gasket-app` and is not installed for apps.

## Usage

When you create a new Gasket application that is configured with the `vitest`
plugin it will prepare it with a `vitest` based testing environment. It will add
the following `scripts` to the `package.json`:

- `npm test`, Runs all test files that include `*.test.` or `*.spec.`.
- `npm run test:watch` Same as `npm test` but now watches your tests and
  automatically re-runs the tests when changes are detected.
- `npm run test:coverage` Same as `npm test`, but generates coverage information
  for all the files matching the `test.coverage` options in the
  `vitest.config.js` file.


## License

[MIT](./LICENSE.md)
