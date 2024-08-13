# @gasket/plugin-swagger

Gasket plugin for working with Swagger specs, and uses [swagger-ui-express] to
serve Swagger UI docs with Express and uses [fastify-swagger] to serve Swagger UI 
docs with Fastify.

## Installation

```
npm i @gasket/plugin-swagger
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginSwagger from '@gasket/plugin-swagger';

export default makeGasket({
  plugins: [
+   pluginSwagger
  ]
});
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
    [swagger-ui-express] options for what is supported.
  - **`uiConfig`** - (object) Optional custom UI options. Only for use with Fastify. See [@fastify/swagger-ui] options for what is supported.

#### Example from JSDocs

By specifying the `swagger.jsdocs` options in the `gasket.js`, the
Swagger definition file will be generated with `gasket build`. It can be output
to either a JSON (default) or YAML file.

```js
// gasket.js

export default makeGasket({
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
});
```

#### Example from YAML

In this example, the Swagger spec will not be generated, but rather demonstrates
how it can be hand-crafted via YAML file.

```js
// gasket.js

export default makeGasket({
  swagger: {
    definitionFile: 'swagger.yaml'
  }
});
```

## License

[MIT](./LICENSE.md)

<!-- LINK -->
[swagger-ui-express]: https://github.com/scottie1984/swagger-ui-express
[@fastify/swagger-ui]: https://github.com/fastify/fastify-swagger-ui
[swagger-jsdocs]: https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md
