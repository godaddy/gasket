# @gasket/plugin-https

A plugin that creates `http`, `https` and/or `http2` servers based on the given
`gasket` configuration.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-https
```

#### Existing apps

```
npm i @gasket/plugin-https
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-https'
    ]
  }
}
```

## Configuration

You can specify what port to open up on, or what certificates to use via
`gasket.config.js`.

```js
// gasket.config.js
module.exports = {
  hostname: 'example.com',
  http: 80,
  https: {
    port: 443,
    root: '/path/to/ssl/files',
    key: 'your-key.pem',
    cert: 'your-cert.pem',
    ca: 'your-ca.pem' // Can be an Array of CAs
  },
  terminus: {
    healthcheck: ['/healthcheck', '/healthcheck.html']
  }
};
```

[Terminus] is configured with the following defaults:

- `healthcheck`: `['/healthcheck', '/healthcheck.html']`
- `signals`: `['SIGTERM']`

Any of the options that are specified on the Terminus project page are accepted
in the `terminus` object. Just note that the functions are already assigned by
default to trigger the appropriate lifecycle events.

### HTTP/2

You can configure both HTTPS and HTTP/2 on the same socket with
[ALPN negotiation].

```diff
// gasket.config.js
module.exports = {
  http: 80,
-  https: {
+  http2: {
    port: 443,
    root: '/path/to/ssl/files',
    key: 'your-key.pem',
    cert: 'your-cert.pem',
    ca: 'your-ca.pem' // Can be an Array of CAs,
+    allowHTTP1: true
  }
};
```

## Lifecycles

### createServers

Executed in order to retrieve the server options and the handler. Prefer to configure HTTP and port information in the `gasket.config.js` or
`configure` lifecycle.

```js
/**
* In this example returns the express app
*
* @param {Gasket} gasket Gasket API.
* @param {Object} serverOpts Server options.
* @returns {Express} The web server.
* @public
*/
createServers: async function createServers(gasket, serverOpts) {
  const newServerOpts;
  return { ...serverOpts, ...newServerOpts, handler: express() };
}
```

### servers

Your application can use this plugin to hook the `servers` hook. These servers
are provided directly from the [create-servers] callback.

```js
/**
 * Called when all servers are created.
 *
 * @param {Gasket} gasket The Gasket API
 * @param {object} servers - http and/or https servers
 * @return {Promise<object>} updated manifest
 */
module.exports = async function serversHook(gasket, servers) {
  const cert = servers.https.cert;

  console.log('Started https server with cert:');
  console.log(cert);
}
```

In a typical use case, the `servers` object will contain server instances for
`http` and `https` keys. In some cases if there are multiple configs and servers
created, this will be an array of servers. See [create-servers] docs for more
details.

### terminus

Allows you to dynamically configure terminus and override any of the handlers
that we assign by default. Our default handlers `onSendFailureDuringShutdown`,
`beforeShutdown`, `onSignal`, and `onShutdown` all take care of triggering the
appropriate lifecycle events, so if you override those, you will no longer
receive those events.

```js
/**
 * Allows for dynamic configuration
 *
 * @param {Gasket} gasket Gasket API.
 * @param {Object} terminus Terminus options.
 * @returns {Object} The configuration.
 * @public
 */
module.exports = {
  hooks: {
    terminus: async function (gasket, terminus) {
      console.log(terminus); // { ... terminus options ... }

      return terminus
    }
  }
}
```

### healthcheck

Triggered when the specified `healthcheck` route is requested on the server.
This lifecycle allows you to assert if everything in your server is still
working as intended. A thrown error is considered a failed checked.

```js
module.exports = {
  hooks: {
    healthcheck: async function healthcheck(gasket, HealthCheckError) {
      await checkDatabaseConnection();
      await doAnotherSanityCheck();
    }
  }
}
```

The lifecycle receives the custom `HealthCheckError` class from terminus if you
want to throw custom errors.

### onSendFailureDuringShutdown

Triggered when terminus about to send a 503 Error to the healthcheck route but
server is currently shutting down.

```js
module.exports = {
  hooks: {
    onSendFailureDuringShutdown: async function onSendFailureDuringShutdown(gasket) {
      gasket.logger.info('healthcheck failed but we are already shutting down');
    }
  }
}
```

### beforeShutdown

Triggered when we've received a signal that triggered the shutdown process of
the server. This is the first function that is called and allows you to clean up
your server before it's stopped.

```js
module.exports = {
  hooks: {
    beforeShutdown: async function beforeShutdown(gasket) {
      gasket.logger.info('the server is about to shut down');
    }
  }
}
```

### onSignal

Triggered when the server is stopped. Allowing you to clean up everything you
need before your `node` process is shutting down.

```js
module.exports = {
  hooks: {
    onSignal: async function onSignal(gasket) {
      await stopDatabaseConnect();
      await cleanupTmpFiles();
    }
  }
}
```

### onShutdown

Triggered when the `onSignal` lifecycle has completed, right before the `node`
process is killed.

```js
module.exports = {
  hooks: {
    onShutdown: async function onShutdown(gasket) {
      gasket.logger.info('Closing server');
    }
  }
}
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[create-servers]: https://github.com/http-party/create-servers#create-servers
[terminus]: https://github.com/godaddy/terminus
[ALPN negotiation]: https://nodejs.org/api/http2.html#http2_alpn_negotiation

