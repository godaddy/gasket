# @gasket/plugin-fastify

Adds Fastify to your application.

## Installation

#### New apps

```
npm i @gasket/plugin-fastify
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginFastify from '@gasket/plugin-fastify';

export default makeGasket({
  plugins: [
+   pluginFastify
  ]
});
```

## Fastify Version Support

This plugin supports both Fastify v4 and v5 through an internal adapter pattern. The appropriate version-specific adapter is automatically selected based on your installed Fastify version.

### Fastify v4
- **Installation**: `npm install fastify@^4`

### Fastify v5
- **Installation**: `npm install fastify@^5`

The plugin automatically detects your Fastify version and applies the correct configuration. No manual configuration is required.

## Configuration

All the configurations for the plugin are added under `fastify` in the config:

- `trustProxy`: Enable trust proxy option, [see Fastify documentation for possible values](https://fastify.dev/docs/latest/Reference/Server/#trustproxy)
- `disableRequestLogging`: Turn off request logging, true by default

#### Example configuration

```js
export default makeGasket({
  plugins: [
    pluginFastify
  ],
  fastify: {
    trustProxy: true
  }
});
```

### Route Definition

Routes can be defined in a in-app plugin in the `plugins` directory. The plugin will hook the `fastify` lifecycle to add the routes to the fastify app.

```js
// plugins/routes-plugin.js
export default {
  name: 'routes-plugin',
  hooks: {
    fastify: async function (gasket, app) {
      app.get('/hello', (req, res) => {
        res.send('Hello World!');
      });
    }
  }
};
```

## Lifecycles

### fastify

Used to add routes and middleware directly to the `fastify` instance.

```js
export default {
  name: 'sample-plugin',
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
};
```

### errorMiddleware

Executed after the `fastify` event. All middleware functions returned from this
hook will be applied to Fastify.

```js
export default {
  name: 'sample-plugin',
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
};
```

## How it works

This plugins hooks the [createServers] lifecycles from [@gasket/plugin-https].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[@gasket/plugin-https]:/packages/gasket-plugin-https/README.md
[createServers]:/packages/gasket-plugin-https/README.md#createservers
