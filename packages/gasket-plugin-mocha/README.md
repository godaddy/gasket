# @gasket/plugin-mocha

Creates a `mocha`, `nyc`, `sinon`, `chai` based testing environment for your
Gasket application.

## Installation

This plugin is only used by templates for `create-gasket-app` and is not installed for apps.

## Usage

When you create a new gasket application that is configured with the `mocha`
plugin it will prepare it with a `mocha` based testing environment. It will add
the following `scripts` to the `package.json`:

- `npm test`, Runs the `.test.js` files in your `test` folder and generates
  coverage information of each of the files you test.
- `npm run test:runner` Same as `npm test`, but without coverage information.
- `npm run test:watch` Same as `npm run test:runner` but now watches your tests
  and automatically re-runs the tests when changes are detected.

The following test utilities are included:

- `chai` Installed as default assertion framework using the `expect` syntax.
- `sinon` Create spies, stubs and mocks.
- `enzyme` Easier to assert, manipulate, and traverse your React Components.

The tests are automatically processed with babel using the `.babelrc` that is in
the root of your application. We've also configured `enzyme` for the latest
support React, and prepared the test environment with `jsdom` so you can use the
`mount` functionality of `enzyme`.

## License

[MIT](./LICENSE.md)
