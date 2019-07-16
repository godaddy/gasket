# @gasket/core-plugin

Providers the core server infrastructure for the `gasket` project.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Lifecycles](#lifecycles)

## Installation

```
npm install --save @gasket/core-plugin @gasket/log-plugin
```

## Configuration

The core plugin is configured using the `gasket.config.js` file. There are
various of parts of the application that can be configured in this configuration
file.

- `env`: When set to `dev`, it will run the `nextjs` server in development mode.
- `next`: Instead of adding a dedicated `next.config.js`, this property is used
  instead. Everything you can configure in the [next.config][next.config] can
  be added here.
- `http`: An object accepted by [create-servers][create-servers] that contains
  the port number that the HTTP server needs to run on, or a supply a port number directly
- `https`: If you want to start both a HTTP and HTTPS server, or just a HTTPS
  server, you can specify the options accepted by [create-servers][create-servers]
  here.
- `routes`: If you are doing advanced routing
  and want to customize the path where your routes are defined, you can set this
  to a relative module path to your router (default `./routes`).

Please note that in the case of `http` and `https`, you do not need to specify
the `handler` option, this is done for your by the plugin.

#### Example configuration

```js
module.exports = {
  env: process.env.NODE_ENV,
  next: {
    poweredByHeader: false,
    useFileSystemPublicRoutes: false,
    generateBuildId: () => Date.now()
  },
  http: 80,
  https: {
    port: 443,
    root: '/path/to/ssl/files',
    key: 'your-key.pem',
    cert: 'your-cert.pem',
    ca: 'your-ca.pem', // Can be an Array of CAs
  }
}
```

## Lifecycles

When the `start` lifecycle event is triggered, this plugin will initiate the
following lifecycles.

#### webpackChain

Executed before the `webpack` lifecycle, allows you to easily create the
initial webpack configuration using a chaining syntax that is provided by the
`webpack-chain` library. The resulting configuration is then merged with:

- The WebPack configuration that is provided by the `next` framework
- WebPack configuration that is specified in the `gasket.config.js` as `webpack` object.

The result of this will be passed into the `webpack` hook as base configuration.

#### webpack

Executed when the `next` server is preparing the bundles, so it's executed
**after** the `next` event. It receives the full webpack config as first
argument, the second argument is an object that contains information that `next`
gathered from the application such as the amount of pages etc.

See [next.js/customizing webpack](https://nextjs.org/docs#customizing-webpack-config)

```js
module.exports = {
  hooks: {
    webpack: function (gasket, config, { buildId, dev, isServer, defaultLoaders }) {
      console.log(config);  // webpack.config object.
    }
  }
}
```

#### next

Executed when the `next` server has been created. It will receive a reference to
the created `next` instance.

```js
module.exports = {
  hooks: {
    next: function (gasket, next) {
      next.setAssetPrefix('https://my.cdn.com/dir/');
    }
  }
}
```

#### nextConfig

Executed before the `next` server has been created. It will receive a reference to the `next` config.
This will allow you to modify the `next` config before the `next` server is created.

```js
module.exports = {
  hooks: {
    nextConfig(gasket, config) {
      return {
        ...config,
        modification: 'newValue'
      };
    }
  }
}
```

#### middleware

Executed when the `express` server has been created, it will apply all returned
functions as middleware.

```js
module.exports = {
  hooks: {
    middleware: function (gasket) {
      return require('x-xss-protection')();
    }
  }
}
```

You may also return an `Array` to inject more than one middleware.

Your middleware will not be executed for any requests going to `/_next/*`,
which are routes dedicated toward next.js functionality.

#### express

Executed **after** the `middleware` event for when you need full control over
the `express` instance.

```js
module.exports = {
  hooks: {
    express: function (gasket, app) {
      app.param(function (param, validator) {
        return function (req, res, next, val) {
          next();
        }
      })
    }
  }
}
```

#### errorMiddleware

Executed after the `express` event and the next.js handler. All middleware or
middleware arrays returned from these hooks will be applied after the next.js
handler.

#### ssr

Server-side rendering has been setup. Executed after the `express` and `next`
hooks so this will give you access to both instances allows you to respond
with `next.render` calls in express based routes.

```js
module.exports = {
  hooks: {
    ssr: function (gasket, { next, express }) {
      express.post('/contact-form', (req, res) => {
        // DO STUFF WITH RECEIVED DATA
        //
        // And once we're done, we can `next.render` to render the `pages/thanks`
        // file as a response.
        next.render(req, res, '/thanks', req.params);
      });
    }
  }
}
```

---

When the `build` lifecycle event is triggered, this plugin will initiate the
following lifecycles.

#### webpack, webpackChain

Triggered when the `next build` command is executing. This allows you to supply
your own custom webpack middleware/plugins and what not.

[next.config]: https://nextjs.org/docs#custom-configuration
[create-servers]: https://www.npmjs.com/package/create-servers
