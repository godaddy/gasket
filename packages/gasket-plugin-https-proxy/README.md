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

## Actions

### startProxyServer

Use this action to start the HTTPS proxy server.

```js
import gasket from './gasket.js';
gasket.actions.startProxyServer();
```

## Lifecycles

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
        ...devProxyConfig,
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
