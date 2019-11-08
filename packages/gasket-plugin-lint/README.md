# @gasket/plugin-lint

The `lint-plugin` adds `eslint-config-godaddy-react` and `stylelint` to your application.

## Installation

```
npm install --save @gasket/plugin-lint
```

## Usage

The plugin will add a few lint commands into your app's `package.json`. These
commands will be configured against the CLI of your choice (e.g. `npm` or `yarn`).
For example, in the example commands below `npm run lint` will run eslint on your
`.js{x}` files.

```json
  "scripts": {
    "lint": "eslint --ext .js,.jsx .",
    "lint:fix": "npm run lint -- --fix",
    "stylelint": "stylelint \"**/*.scss\"",
    "pretest": "npm run lint && npm run stylelint"
  },
  ...
```
