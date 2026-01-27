# @gasket/plugin-middleware

The `@gasket/plugin-middleware` plugin provides an easy way to apply middleware
to Express or Fastify.

## Installation

To install the plugin, run:

```sh
npm i @gasket/plugin-middleware
```

### Fastify Support

When using this plugin with Fastify, you must also install `@fastify/express` as a peer dependency:

```sh
npm i @fastify/express
```

This package is required for Express-style middleware compatibility with Fastify.

Then, update your `gasket.js` configuration file to include the plugin:

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

You can configure the middleware settings under either the `express` or
`fastify` sections in your `gasket.js` file, depending on which framework you are
using.

### Configuration Options

- `compression` (default: `true`): Enable or disable response compression. Set
  to `false` if compression is handled elsewhere.
- `excludedRoutesRegex`: (deprecated) Use `middlewareInclusionRegex` instead.
- `middlewareInclusionRegex`: A regular expression to filter request URLs and
  determine when Gasket middleware should run. You can use this to exclude
  routes like static resource paths.
- `trustProxy`: Enable the "trust proxy" option. Refer to the [Fastify trust
  proxy documentation] or the [Express trust proxy documentation] for more
  details.
- `routes`: A path or glob pattern pointing to files that export route-defining
  functions. These functions receive the `app` object (Fastify or Express) to
  attach handlers and middleware.

<!-- TODO: do we still need the routes config option? -->

### Example Configuration for Express

```js
// gasket.js

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

### Example Configuration for Fastify

```js
// gasket.js

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

You can define middleware paths in your `gasket.js` file using the `middleware`
property. This property is an array of objects that map plugins to specific
route or path patterns, allowing you to control which middleware is triggered
for specific requests.

```js
// gasket.js

export default makeGasket({
  ...
  middleware: [
    {
      plugin: 'gasket-plugin-example', // Name of the Gasket plugin
      paths: ['/api']
    },
    {
      plugin: '@some/gasket-plugin-example',
      paths: [/\/default/]
    },
    {
      plugin: '@another/gasket-plugin-example',
      paths: ['/proxy', /\/home/]
    }
  ]
  ...
});

```

## Lifecycles

### middleware

The `middleware` lifecycle is executed when the Fastify or Express server is
created. It applies all returned functions as middleware.

```js
export default {
  name: 'sample-plugin',
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

## Logging

This plugin attaches a `logger` object to the request object.
This object has a `metadata` method that allows you to attach details to any log
entry related to the request.
For example, you can add the user ID to each log entry.
When logging within the context of a request, use the `req.logger` object
instead of the global `gasket.logger` so that contextual information is included
in the log entry. Here is an example of how to attach metadata to  `req.logger`
object and how to use it:

```js
function someMiddleware(req, res, next) {
  req.logger.metadata({ userId: req.user.id });
  next();
}

function someOtherMiddleware(req, res, next) {
  req.logger.info('Some log message');
  next();
}
```

You can also return an array if you need to inject multiple middleware
functions.

<!-- LINKS -->

[Fastify trust proxy documentation]:https://fastify.dev/docs/latest/Reference/Server/#trustproxy
[Express trust proxy documentation]:https://expressjs.com/en/guide/behind-proxies.html
