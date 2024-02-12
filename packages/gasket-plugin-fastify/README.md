# @gasket/plugin-fastify

Adds Fastify to your application.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-fastify
```

#### Existing apps

```
npm i @gasket/plugin-fastify
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-fastify'
    ]
  }
}
```

## Configuration

All the configurations for the plugin are added under `fastify` in the config:

- `compression`: true by default. Can be set to false if applying compression
  differently.
- `excludedRoutesRegex`: Routes to be excluded based on a regex
- `trustProxy`: Enable trust proxy option, [see Fastify documentation for possible values](https://fastify.dev/docs/latest/Reference/Server/#trustproxy)

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['@gasket/fastify']
  },
  fastify: {
    compression: false,
    excludedRoutesRegex: /^(?!\/_next\/)/,
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

Executed when the `fastify` server has been created, it will apply all returned
functions as middleware.

```js
module.exports = {
  hooks: {
    /**
    * Add Fastify middleware
    *
    * @param {Gasket} gasket The Gasket API
    * @param {Fastify} app - Fastify app instance
    * @returns {function|function[]} middleware(s)
    */
    middleware: function (gasket, app) {
      return require('x-xss-protection')();
    }
  }
}
```

You may also return an `Array` to inject more than one middleware.

### fastify

Executed **after** the `middleware` event for when you need full control over
the `fastify` instance.

```js
module.exports = {
  hooks: {
    /**
    * Update Fastify app instance
    *
    * @param {Gasket} gasket The Gasket API
    * @param {Fastify} fastify Fastify app instance
    * @returns {function|function[]} middleware(s)
    */
    fastify: async function (gasket, fastify) {
    }
  }
}
```

### errorMiddleware

Executed after the `fastify` event. All middleware functions returned from this
hook will be applied to Fastify.

```js
module.exports = {
  hooks: {
    /**
    * Add Fastify error middlewares
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

[@gasket/plugin-https]:/packages/gasket-plugin-https/README.md
[createServers]:/packages/gasket-plugin-https/README.md#createservers
