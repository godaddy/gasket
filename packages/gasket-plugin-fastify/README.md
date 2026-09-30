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

- `trustProxy`: Enable trust proxy option, [see Fastify documentation for possible values](https://fastify.dev/docs/latest/Reference/Server/#trustproxy).
  See [trustProxy](#trustproxy) below for the recommended setting.
- `disableRequestLogging`: Turn off request logging, true by default

#### trustProxy

Set it to the addresses of the proxies in front of the app: an IP or CIDR list
such as `['10.0.0.0/8']`, a comma-separated string, or a function that
validates the peer `address`. `true` trusts the whole `X-Forwarded-For` chain,
so `request.ip` becomes whatever the client sent first — any client can prepend
its own entry to that header. Leave it unset when nothing sits in front of the
app — `request.ip` is then the socket peer.

Do not set it to a hop count. Fastify 5 treats a number as "trust no proxy"
(see the [Fastify server reference]), so `request.ip` is the socket peer as if
`trustProxy` were unset. Fastify 4 accepts a hop count, but it assumes every
request passes through the same number of proxies; when paths vary or the app
is reachable directly — for example, some traffic reaches the load balancer
without the CDN — a client on the shorter path supplies the entry the count
selects. An address list behaves the same on both versions.

#### Example configuration

```js
export default makeGasket({
  plugins: [
    pluginFastify
  ],
  fastify: {
    trustProxy: ['10.0.0.0/8'] // the load balancer's network
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
    */
    fastify: async function (gasket, fastify) {
    }
  }
};
```

### errorMiddleware

Executed after the `fastify` event. All error handler functions returned from this
hook will be applied to Fastify in order.

```js
export default {
  name: 'sample-plugin',
  hooks: {
    /**
    * Add error handling for Fastify
    *
    * @param {Gasket} gasket The Gasket API
    * @returns {function|function[]} error handler(s)
    */
    errorMiddleware: function (gasket) {
      return function (err, req, res, next) {
        // handle error or pass to next handler
        next(err);
      };
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
[Fastify server reference]:https://fastify.dev/docs/latest/Reference/Server/#trustproxy
