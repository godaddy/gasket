# @gasket/plugin-express

Adds Express to your application.

## Guides

- [Setup Guide] for adding middleware and routes.
- [Common "Gotchas"] encountered with Express middleware.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-express
```

#### Existing apps

```
npm i @gasket/plugin-express
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-express'
    ]
  }
}
```

## Configuration

All the configurations for the plugin are added under `express` in the config:

- `compression`: true by default. Can be set to false if applying compression
  differently.
- `excludedRoutesRegex`: (deprecated) renamed to more correct `middlewareInclusionRegex`.
- `middlewareInclusionRegex`: RegExp filter to apply toward request URLs to determine when Gasket middleware will run. You can use negative lookahead patterns to exclude routes like static resource paths.
- `routes`: [Glob pattern](https://github.com/isaacs/node-glob#glob-primer) for source files exporting route-defining functions. These functions will be passed the express `app` object, and therein they can attach handlers and middleware.
- 'trustProxy': Enable trust proxy option, [see Express documentation on Express behind proxies](https://expressjs.com/en/guide/behind-proxies.html)

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['@gasket/express']
  },
  express: {
    compression: false,
    routes: 'api/*.js',
    middlewareInclusionRegex: /^(?!\/_next\/)/,
    trustProxy: true
  }
}
```

### Middleware paths

The `gasket.config.js` can contain a `middleware` property, which is an array of
objects that map plugins to route or path patterns, allowing apps to tune which
middleware are triggered for which requests.

```js
  middleware: [
    {
      plugin:'gasket-plugin-example', // Name of the Gasket plugin
      paths: ['/api']
    },
    {
      plugin:'@some/gasket-plugin-example',
      paths: [/\/default/]
    },
    {
      plugin: '@another/gasket-plugin-example',
      paths: ['/proxy', /\/home/]
    }
  ]
```

## Lifecycles

### middleware

Executed when the `express` server has been created, it will apply all returned
functions as middleware.

```js
module.exports = {
  hooks: {
    /**
    * Add Express middleware
    *
    * @param {Gasket} gasket The Gasket API
    * @param {Express} app - Express app instance
    * @returns {function|function[]} middleware(s)
    */
    middleware: function (gasket, app) {
      return require('x-xss-protection')();
    }
  }
}
```

You may also return an `Array` to inject more than one middleware.

### express

Executed **after** the `middleware` event for when you need full control over
the `express` instance.

```js
module.exports = {
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
}
```

### errorMiddleware

Executed after the `express` event. All middleware functions returned from this
hook will be applied to Express.

```js
module.exports = {
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
}
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
