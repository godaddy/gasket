# @gasket/plugin-middleware

An optional plugin when used applies middleware to express or fastify.

## Installation

```
npm i @gasket/plugin-middleware
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginMiddleware from '@gasket/plugin-middleware';

export default makeGasket({
  plugins: [
+   pluginMiddleware
  ]
});
```

## Configuration

All the configurations for middleware setup are added under `express` or `fastify` in the config:

- `compression`: true by default. Can be set to false if applying compression
  differently.
- `excludedRoutesRegex`: (deprecated) renamed to more correct `middlewareInclusionRegex`.
- `middlewareInclusionRegex`: RegExp filter to apply toward request URLs to determine when Gasket middleware will run. You can use negative lookahead patterns to exclude routes like static resource paths.
- `trustProxy`: Enable trust proxy option, [Fastify trust proxy documentation] or [Express trust proxy documentation]
- `routes`: for source files exporting route-defining functions. These functions will be passed the fastify `app` object, and therein they can attach handlers and middleware.

### Example Express configuration

```js
export default makeGasket({
  plugins: {
    pluginMiddleware,
    pluginExpress
  },
  express: {
    compression: false,
    routes: 'api/*.js',
    middlewareInclusionRegex: /^(?!\/_next\/)/,
    trustProxy: true
  }
});
```

### Example Fastify configuration

```js
export default makeGasket({
  plugins: {
    pluginMiddleware,
    pluginFastify
  },
  fastify: {
    compression: false,
    routes: 'api/*.js',
    middlewareInclusionRegex: /^(?!\/_next\/)/,
    trustProxy: true
  }
});
```

## Middleware paths

The `gasket.js` can contain a `middleware` property, which is an array of
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

Executed when the `fastify` or `express` server has been created, it will apply all returned
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

<!-- LINKS -->

[Fastify trust proxy documentation]:https://fastify.dev/docs/latest/Reference/Server/#trustproxy
[Express trust proxy documentation]:https://expressjs.com/en/guide/behind-proxies.html
