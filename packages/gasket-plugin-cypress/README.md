# @gasket/plugin-cypress

Creates a `cypress` based testing environment for your Gasket application.

## Installation

This plugin should only be used during the create command for new apps.

```
gasket create <app-name> --plugins @gasket/plugin-cypress
```

## Usage

When you create a new gasket application that is configured with the `cypress`
plugin it will prepare it with a `cypress` based testing environment. It will
add the following `scripts` to the `package.json`:

NOTE: before running `npm run cypress` or `npm run cypress:headless`, you should
first start the server in a separate tab. Before starting the server for the
first time, you must run `gasket build`/`npm run build` in order for things to
work properly.

- `npm run cypress`, opens the Cypress Test Runner and uses the default
  configuration values from `cypress.config.js`, which uses all tests specified
  in the **tests** folder
- `npm run cypress:headless` runs all cypress tests to completion. the cypress
  tests must be located in the **test** folder or whatever folder value is set
  for `integrationFolder` in the `cypress.config.js` config
- `npm run e2e` starts the Next.js production server in conjunction with opening
  the Cypress Test Runner
- `npm run e2e:headless` Same as `npm run e2e`, but runs the cypress tests to
  completion in the command line

## License

[MIT](./LICENSE.md)
