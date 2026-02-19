# @gasket/plugin-morgan

Adds the `morgan` request logger to your application.

[Morgan] is an HTTP request logger middleware for node.js.

### Requirements

- [@gasket/plugin-express] or [@gasket/plugin-fastify]

## Installation

```
npm i @gasket/plugin-morgan
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginMorgan from '@gasket/plugin-morgan';

export default makeGasket({
  plugins: [
+   pluginMorgan
  ]
});
```

## Configuration

All the configurations for the plugin are added under `morgan` in the config:

- `format`: The log format to print.
- `options`: Morgan options.

See more format and options on [Morgan middleware page][Morgan].

### Example configuration

Defaults:

```js
export default makeGasket({
  plugins: {
    pluginMorgan
  },
  morgan: {
    format: 'tiny',
    options: {}
  }
});
```

## How it works

This plugin hooks the `express` and `fastify` lifecycles from [@gasket/plugin-express] and [@gasket/plugin-fastify],
adding [Morgan] to format http requests to be logged using the [@gasket/plugin-logger].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Morgan]: http://expressjs.com/en/resources/middleware/morgan.html
[@gasket/plugin-express]: /packages/gasket-plugin-express/README.md
[@gasket/plugin-fastify]: /packages/gasket-plugin-fastify/README.md
[@gasket/plugin-logger]: /packages/gasket-plugin-logger/README.md
