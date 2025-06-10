# @gasket/plugin-https-proxy

Create an HTTPS proxy server with Gasket to use as a sidecar for frameworks that
do not handle HTTPS, such as Next.js. This can be useful for local development
when you want to test HTTPS features and use secure cookies for
authentication, etc.
It can also be used in production if it is necessary for your application to
handle HTTPS requests on the container.

## Installation

```
npm i @gasket/plugin-https-proxy
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginHttpsProxy from '@gasket/plugin-https-proxy';

export default makeGasket({
  plugins: [
+   pluginHttpsProxy
  ]
});
```

## Configuration

To be set under `httpsProxy` in the `gasket.js` file.

This uses the [http-proxy] package and its complete set of available [options].

```diff
// gasket.js
export default makeGasket({
+  httpsProxy: {
+    protocol: 'https',
+    hostname: 'my-host.com',
+    port: 443,
+    xfwd: true,
+    ws: true,
+    target: {
+      host: 'localhost',
+      port: 80
+    }
+  }
});
```

The above example forwards HTTPS requests on port `443` to `localhost:80`.

The `protocol` and `hostname` are only used for logging about the proxy server
and should not be confused with `target.protocol` and `target.host` which
are used for the actual destination server.

### Example SNI Config

While not specifically called out in the [http-proxy] documentation, the
`ssl` settings are what get passed to node's `createServer` method.
As such, you can use `SNICallback` from the [createServer options].

```diff
// gasket.js
export default makeGasket({
 httpsProxy: {
   protocol: 'https',
   hostname: 'my-host.com',
   port: 443,
   xfwd: true,
   ws: true,
   target: {
     host: 'localhost',
     port: 80
   },
+   ssl: {
+     SNICallback: (hostname, cb) => {
+       const ctx = tls.createSecureContext({
+         key: fs.readFileSync(`./certs/${hostname}.key`),
+         cert: fs.readFileSync(`./certs/${hostname}.crt`)
+       });
+       cb(null, ctx);
     }
   }
 }
});
```

> The above snippet is for demonstration purposes only.
> You should not be reading your certs from the filesystem for each request.

## Actions

### startProxyServer

Use this action to start the HTTPS proxy server.

```js
import gasket from './gasket.js';
gasket.actions.startProxyServer();
```


The complete flow is:

1. Waits for `gasket.isReady` (ensuring async configuration is complete)
2. Executes the `prebootHttpsProxy` lifecycle (one-time initialization)
3. Executes the `httpsProxy` lifecycle for dynamic configuration
4. Creates and starts the proxy server
## Lifecycles

### prebootHttpsProxy

This lifecycle is executed before the proxy server is started. It is a good place to
execute operations that need to happen before the proxy server is started.

```js
/**
 * Executed before the proxy server is started.
 *
 * @param {Gasket} gasket Gasket API.
 */
prebootHttpsProxy: async function prebootHttpsProxy(gasket) {
  // async operations
}
```

#### When to use `prebootHttpsProxy` vs `prepare`

The `preboot` lifecycle runs **once** when the proxy server starts, while the `prepare` lifecycle runs for **every** Gasket instance creation. Use `preboot` for:

- One-time proxy server initialization
- Setting up shared SSL/TLS contexts
- Loading certificates that will be reused across requests
- Establishing persistent connections or pools

Use `prepare` for:

- Per-instance configuration
- Setting up instance-specific state
- Operations that need fresh initialization for each Gasket instance

> **Note**: In SSR applications, new Gasket instances may be created for different contexts, causing `prepare` to run multiple times. For proxy servers, this can lead to unnecessary overhead. Use `preboot` for expensive initialization operations.
### httpsProxy

While most settings can be configured in the `httpsProxy` configuration,
this lifecycle can be used to adjust the `httpsProxy` options when
the HTTPS proxy server is being started, which is helpful for dynamic
configuration and loading of certs.

```js
export default {
  name: 'example-plugin',
  hooks: {
    httpsProxy: async function (gasket, httpsProxyConfig) {
      return {
        ...httpsProxyConfig,
        hostname: 'local.example.com',
        port: 8443
      }
    }
  }
}
```

## License

[MIT](./LICENSE.md)

[http-proxy]: https://www.npmjs.com/package/http-proxy
[options]: https://www.npmjs.com/package/http-proxy#options
[createServer options]: https://nodejs.org/docs/latest-v22.x/api/tls.html#tlscreateserveroptions-secureconnectionlistener
