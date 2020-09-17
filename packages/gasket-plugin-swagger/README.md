# @gasket/plugin-swagger

Gasket plugin for working with Swagger specs, and uses [swagger-ui-express] to
serve Swagger UI docs.

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
    [swagger-ui-express] options for what is supported.

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

## License

[MIT](./LICENSE.md)

<!-- LINK -->
[swagger-ui-express]: https://github.com/scottie1984/swagger-ui-express
[swagger-jsdocs]: https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md