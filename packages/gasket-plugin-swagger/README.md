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
  - **`mode`** - (string) `'static'` (default) or `'introspect'`. Controls how the API spec is produced. See [Modes](#modes) below.
  - **`definitionFile`** - (string) Target swagger spec file, either json or
    yaml. (Default: `'swagger.json'`)
  - **`apiDocsRoute`** - (string) Route to Swagger UI (Default: `'/api-docs'`)
  - **`jsdoc`** - (object) If set, the definitionFile will be generated based on
    JSDocs in the configured files. See the [swagger-jsdocs] options for what is
    supported. Ignored when `mode` is `'introspect'`.
  - **`ui`** - (object) Optional custom UI options. See
    [swagger-ui-express] options for what is supported.
  - **`uiOptions`** - (object) Optional custom UI options. Only for use with Fastify. See [@fastify/swagger-ui] options for what is supported.
  - **`spec`** - (object) Base metadata for introspect mode (info, components, security, servers, etc.). Ignored when `mode` is `'static'`. The output format is auto-detected from the spec content: if `spec.swagger` is present, Swagger 2.0 output is used; otherwise OpenAPI 3.x is the default.

## Modes

### `static` (default)

Serves a pre-built definition file. Compatible with both Express and Fastify. All existing apps use this mode automatically — no config change needed.

The output format is auto-detected from the loaded file: if the file has an `openapi` key, it is served as OpenAPI 3.x; otherwise Swagger 2.0 is assumed.

### `introspect` (Fastify only)

`@fastify/swagger` discovers your routes automatically via its `onRoute` hook. No definition file is built or loaded. The `spec` property provides base metadata (title, version, security schemes, etc.).

The output format is auto-detected from `spec` content: if `spec.swagger` is set, Swagger 2.0 output is produced; otherwise OpenAPI 3.x is used (the default).

#### Example from JSDocs

By specifying the `swagger.jsdocs` options in the `gasket.js`, the
Swagger definition file will be generated with `build` Gasket lifecycle hook. It can be output
to either a JSON (default) or YAML file.

To hook the build lifecycle you can update your npm scripts to include the following:

```diff
// JS apps

+ "scripts": {
+   "build": "node gasket.js build"
+ }
```

```diff
// TypeScript apps

+ "scripts": {
+   "build": "tsx gasket.ts build"
+ }
```

```diff
// Using Node 24+

+ "scripts": {
+   "build": "node gasket.ts build"
+ }
```

To keep your Swagger definition file up-to-date, you can run `npm run build` whenever you make changes to the swagger property in your
`gasket.js` file or modify JSDoc comments in your routes folder. This will rebuild the Swagger file to capture the latest updates accurately.

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
    apiDocsRoute: '/api-docs'       // Default
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

#### Example with introspect mode (Fastify)

For Fastify apps using TypeBox or other schema providers, set `mode: 'introspect'`
to enable runtime route introspection. Routes are discovered automatically —
no definition file or JSDocs needed.

Output defaults to OpenAPI 3.x. Pass `spec.swagger: '2.0'` to produce Swagger 2.0 output instead.

```js
// gasket.js

export default makeGasket({
  swagger: {
    mode: 'introspect',
    spec: {
      info: {
        title: 'My API',
        version: '1.0.0'
      }
    }
  }
});
```

> In Gasket, all `fastify` lifecycle hooks receive the same root Fastify instance, and `@fastify/swagger` uses Fastify's `onRoute` hook to collect routes — including routes registered before the swagger plugin. Route ordering does not affect discovery.

## License

[MIT](./LICENSE.md)

<!-- LINK -->
[swagger-ui-express]: https://github.com/scottie1984/swagger-ui-express
[@fastify/swagger-ui]: https://github.com/fastify/fastify-swagger-ui
[swagger-jsdocs]: https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md
