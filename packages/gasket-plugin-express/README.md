# @gasket/plugin-express

Adds Express to your application.

## Guides

- [Setup Guide] for adding middleware and routes.
- [Common "Gotchas"] encountered with Express middleware.

## Installation

```
npm i @gasket/plugin-express
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginExpress from '@gasket/plugin-express';

export default makeGasket({
  plugins: [
+   pluginExpress
  ]
});
```

## Configuration

All the configurations for the plugin are added under `express` in the config:

- `compression`: true by default. Can be set to false if applying compression
  differently.
- `excludedRoutesRegex`: (deprecated) renamed to more correct `middlewareInclusionRegex`.
- `middlewareInclusionRegex`: RegExp filter to apply toward request URLs to determine when Gasket middleware will run. You can use negative lookahead patterns to exclude routes like static resource paths.
- 'trustProxy': Enable trust proxy option, [see Express documentation on Express behind proxies](https://expressjs.com/en/guide/behind-proxies.html)

#### Example configuration

```js
export default makeGasket({
  plugins: [
    pluginExpress
  ],
  express: {
    compression: false,
    middlewareInclusionRegex: /^(?!\/_next\/)/,
    trustProxy: true
  }
});
```

## Actions

### getExpressApp

Get the Express app instance.

```js
const app = actions.gasket.getExpressApp();
```

Only a single Express instance is created for per Gasket, ensuring anyplace you
may need to access the app, you'll have the same instance.

## Lifecycles

### express

Executed **after** the `middleware` event for when you need full control over
the `express` instance.

```js
export default {
  name: 'sample-plugin',
  hooks: {
    /**
    * Update Express app instance
    *
    * @param {Gasket} gasket The Gasket API
    * @param {Express} express Express app instance
    * @returns {function|function[]} middleware(s)
    */
    express: async function (gasket, express) {
    }
  }
};
```

### errorMiddleware

Executed after the `express` event. All middleware functions returned from this
hook will be applied to Express.

```js
export default {
  name: 'sample-plugin',
  hooks: {
    /**
    * Add Express error middlewares
    *
    * @param {Gasket} gasket The Gasket API
    * @returns {function|function[]} error middleware(s)
    */
    errorMiddleware: function (gasket) {
    }
  }
};
```

## How it works

This plugins hooks the [createServers] lifecycles from [@gasket/plugin-https].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Setup Guide]:docs/setup.md
[Common "Gotchas"]:docs/gotchas.md

[@gasket/plugin-https]:/packages/gasket-plugin-https/README.md
[createServers]:/packages/gasket-plugin-https/README.md#createservers
