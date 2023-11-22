# @gasket/plugin-swagger

Gasket plugin for working with Swagger specs, and uses [swagger-ui-express] to
serve Swagger UI docs with Express and uses [fastify-swagger] to serve Swagger UI 
docs with Fastify.

## Installation

#### New apps

***Recommended***

```
gasket create <app-name> --plugins @gasket/plugin-swagger
```

#### Existing apps

```
npm i @gasket/plugin-swagger
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-swagger'
    ]
  }
}
```

## Configuration

- **`swagger`** - (object) The base gasket.config object.
  - **`definitionFile`** - (string) Target swagger spec file, either json or
    yaml. (Default: `'swagger.json'`)
  - **`apiDocsRoute`** - (string) Route to Swagger UI (Default: `'/api-docs'`)
  - **`jsdoc`** - (object) If set, the definitionFile will be generated based on
    JSDocs in the configured files. See the [swagger-jsdocs] options for what is
    supported.
  - **`ui`** - (object) Optional custom UI options. See
    [swagger-ui-express] / [fastify-swagger] options for what is supported.

#### Example from JSDocs

By specifying the `swagger.jsdocs` options in the `gasket.config.js`, the
Swagger definition file will be generated with `gasket build`. It can be output
to either a JSON (default) or YAML file.

```js
// gasket.config.js

module.exports = {
  swagger: {
    jsdoc: {
      definition: {
        openapi: '3.0.0',           // Specification (optional, defaults to swagger: '2.0')
        info: {
          title: 'Theme API',       // Title (required)
          version: '1.0.0'          // Version (required)
        }
      },
      apis: ['api.js'] // Glob path to API Docs
    },
    definitionFile: 'swagger.json', // Default
    apiDocs: '/api-docs'            // Default
  }
}
```

#### Example from YAML

In this example, the Swagger spec will not be generated, but rather demonstrates
how it can be hand-crafted via YAML file.

```js
// gasket.config.js

module.exports = {
  swagger: {
    definitionFile: 'swagger.yaml'
  }
}
```

## Lifecycles

### swaggerExpressMiddleware

The `swaggerExpressMiddleware` lifecycle enables you to add custom middleware that runs prior to the swagger UI middleware if using the express framework. This is useful for adding things like authentication to the swagger UI route. You can add multiple middleware functions by returning an array of functions or a single function.

```js
// /lifecycles/swagger-express-middleware.js

module.exports = (gasket) => [
  (req, res, next) => {
    if (!isAuthorized(req)) {
      return void res.status(403).end('Internal access only');
    }
    next();
  }
];
```

### swaggerFastifyPreHandler

The `swaggerFastifyPreHandler` lifecycle allows you inject a handler or array of handlers that run before the Swagger UI plugin's handler. This will let you accomplish tasks such as authentication.

```js
// /lifecycles/swagger-fastify-validate-request.js

const httpErrors = require('http-errors');

module.exports = (gasket) => [
  async (request, reply) => {
    const isAuthorized = await checkAuth(request);
    if (!isAuthorized) {
      return reply.send(httpErrors.Forbidden('Internal access only'));
    }
  }
];
```

## License

[MIT](./LICENSE.md)

<!-- LINK -->
[swagger-ui-express]: https://github.com/scottie1984/swagger-ui-express
[fastify-swagger]: https://github.com/fastify/fastify-swagger
[swagger-jsdocs]: https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md
