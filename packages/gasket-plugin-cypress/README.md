# @gasket/plugin-cypress

Creates a Cypress-based testing environment for your Gasket application.

## Installation


## Usage

When you create a new Gasket application that includes the
`@gasket/plugin-cypress`, it configures a Cypress-based testing environment. It
will automatically add the following `scripts` to your `package.json`:

- `npm run cypress`: Opens the Cypress Test Runner using the default
  configuration values from `cypress.config.js`. It runs all tests specified in
  the **test** folder.
- `npm run cypress:headless`: Runs all Cypress tests to completion in headless
  mode. The tests should be located in the **test** folder, or in the folder
  defined by `integrationFolder` in the `cypress.config.js` configuration.
- `npm run e2e`: Starts the Next.js production server (`next start`) and opens
  the Cypress Test Runner for end-to-end testing. The server runs at
  `http://localhost:3000` by default.
- `npm run e2e:headless`: Similar to `npm run e2e`, but runs the Cypress tests
  to completion in headless mode.

### Important Notes

- Before running `npm run cypress` or `npm run cypress:headless`, make sure the
  server is running in a separate terminal tab. You can start the server by
  running `npm run start` (or `npm run start:local`).
- Before starting the server for the first time, you must run
  `npm run build` to ensure that all necessary assets are built and available
  for testing.

## Additional Configuration

The plugin automatically detects if your project is a React-based application
and adjusts its setup accordingly:

- For React projects, it adds additional dependencies like
  `start-server-and-test` for easier server and test management.
- Test files and configuration files will be added under a generator directory.

## License

[MIT](./LICENSE.md)
