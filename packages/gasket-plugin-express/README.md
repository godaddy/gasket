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

All the configurations for the plugin are added under `express` in the config.

### Route Definition

Routes can be defined in a in-app plugin in the `plugins` directory. The plugin will hook the `express` lifecycle to add the routes to the express app.

```js
// plugins/routes-plugin.js
export default {
  name: 'routes-plugin',
  hooks: {
    express: async function (gasket, app) {
      app.get('/hello', (req, res) => {
        res.send('Hello World!');
      });
    }
  }
};
```

## Lifecycles

### express

Used to add routes and middleware directly to the `express` instance.

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
