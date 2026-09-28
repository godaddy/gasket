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
- `trustProxy`: Enable trust proxy option, [see Fastify documentation for possible values](https://fastify.dev/docs/latest/Reference/Server/#trustproxy).
  See [trustProxy](#trustproxy) below for the recommended setting.
- `disableRequestLogging`: Turn off request logging, true by default

#### trustProxy

Set it to the number of proxies in front of the app. `true` trusts the whole
`X-Forwarded-For` chain, so `request.ip` becomes whatever the client sent
first — any client can prepend its own entry to that header. Leave it unset
when nothing sits in front of the app — `request.ip` is then the socket peer.

A hop count assumes every request passes through the same number of proxies.
When paths vary — for example, some traffic reaches the load balancer without
the CDN — a client on the shorter path supplies the entry the count selects.
Trust the proxies by address instead: an IP or CIDR list such as
`['10.0.0.0/8']`, or a function.

#### Example configuration

```js
export default makeGasket({
  plugins: [
    pluginFastify
  ],
  fastify: {
    compression: false,
    excludedRoutesRegex: /^(?!\/_next\/)/,
    trustProxy: 1 // one load balancer in front
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

## Guides

- [Removing @fastify/express] - Migration guide for removing `@fastify/express` dependency and using native Fastify patterns

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[@gasket/plugin-https]:/packages/gasket-plugin-https/README.md
[createServers]:/packages/gasket-plugin-https/README.md#createservers
[Removing @fastify/express]:docs/remove-fastify-express.md
