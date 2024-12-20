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

## Configuration

All the configurations for the plugin are added under `fastify` in the config:

- `compression`: true by default. Can be set to false if applying compression
  differently.
- `trustProxy`: Enable trust proxy option, [see Fastify documentation for possible values](https://fastify.dev/docs/latest/Reference/Server/#trustproxy)
- `disableRequestLogging`: Turn off request logging, true by default

#### Example configuration

```js
export default makeGasket({
  plugins: [
    pluginFastify
  ],
  fastify: {
    compression: false,
    routes: 'api/*.js',
    excludedRoutesRegex: /^(?!\/_next\/)/,
    trustProxy: true
  }
});
```

## Actions

### getFastifyApp

Get the Fastify app instance.

```js
const app = actions.gasket.getFastifyApp();
```

Each Gasket creates a single shared Fastify instance, ensuring consistent access to the same app instance wherever it's needed.

## Lifecycles

### fastify

Executed **after** the `middleware` event for when you need full control over
the `fastify` instance.

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
