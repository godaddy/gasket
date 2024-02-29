# @gasket/plugin-response-data

Add support for attaching environment specific data to responses.

This plugin assembles data from environment-specific file(s) which is then
usable by server code from the response object and can be accessed in browser
code via GasketData or Redux.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-response-data
```

#### Existing apps

```
npm i @gasket/plugin-response-data
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-response-data'
    ]
  }
}
```

## Usage

There are two file structure methods available for defining config of different
environments in apps.

1. Multiple files with [Environment per file]
2. Single file with [Environments inline]

### Environment files

By default, this plugin imports files from your `/gasket-data` directory to
assemble your application's response data. You can change this directory with
the `gasketData.dir` option in your `gasket.config.js`:

```js
module.exports = {
  gasketData: {
    dir: './src/gasket-data'
  }
};
```

Gasket first decides which _environment_ you're running in. By default, this
comes from the `NODE_ENV` environment variable or the `--env` command-line
argument which can be set from the `GASKET_ENV` environment variable.
Environments can be subdivided (say, for multiple data centers) through dotted
identifiers. Example: `production.v1`.

Once this environment identifier is determined, files are imported based on the
identifier and deep merged together. Files must be CommonJS `.js` modules or
`.json` files with the name of your environment. You may optionally have a
`base.js[on]` file shared across all environments. Given the example environment
`production.v1`, the following files may be merged together:

```
production.v1.js
production.js
base.js
```

If you run your application via `gasket local` or explicitly set your
environment to `local`, there's additional merging behavior:

```
local.overrides.js
local.js
development.js (or dev.js)
base.js
```

The optional `local.overrides.js` is something that can be on individual
workstations and ignored in your `.gitignore`. Depending on if you're naming
your development environment `dev` or `development`, that will automatically be
merged with your `local` configuration.

### Environments inline

Additionally, you can optionally add an `gasket-data.config.js` file to the
root of your app's directory, alongside the `gasket.config.js`. This file
allows you to set up [inline environment overrides], as opposed to in separate
files, following the same rules as the `gasket.config.js`.

If you happen to set up both `./gasket-data` and `gasket-data.config.js`,
the configurations will be merged with `./gasket-data` taking priority.
The `.json` extension is also supported for this file.

To support easy local development, you can use an `gasket-data.config.local.js`
which will merge in your own local configuration for development. This file
should not be committed, and specified in `.gitignore`.

### Server Access

The plugin attaches the configuration from your config files to a `gasketData`
property of the Response object.

#### Example with Middleware

Custom Express middleware (provided you ensure that your middleware runs _after_
the config plugin). For example, in `/lifecycles/middleware.js`:

```js
module.exports = {
  timing: {
    after: ['@gasket/gasket-data']
  },
  handler(gasket) {
    return (req, res, next) => {
      if (res.gasketData.featureFlags.betaSite) {
        res.redirect(res.gasketData.betaSiteURL);
      } else {
        next();
      }
    }
  }
}
```

#### Example with Next.js

If you are developing a front end with Next.js, config is accessible to
server-side rendering via `getInitialProps`:

```jsx
import * as React from 'react';

PageComponent.getInitialProps = function({ isServer, res }) {
  if (isServer) {
    return {
      flags: res.gasketData.featureFlags
    };
  }
  // ...
}
```

### Browser Access

If you need access to config values in client-side code, this can be done
by defining a `public` property in your `gasket-data.config.js`.

```js
module.exports = {
  public: {
    test1: 'config value 1 here',
    test2: 'config value 2 here'
  }
};
```

TODO - how to add to html

The plugin will return these `public` properties to your browser, to be
accessed by `@gasket/data`. They are available like so:

```js
import gasketData from '@gasket/data';

console.log(gasketData.test1); // config value 1 here
```

### Browser Access with Redux

If you need access to config values in client-side code, this can be done
through your redux store. The config plugin looks for a `public` property of
your configuration in `gasket-data.config.js` and places it under a `gasketData`
property in your initial public state.

```js
module.exports = {
  environments: {
    dev: {
      public: {
        url: 'https://your-dev-service-endpoint.com'
      }
    },
    test: {
      public: {
        url: 'https://your-test-service-endpoint.com'
      }
    }
  }
};
```

In this example, url can be selected from `state.gasketData.url` with Redux
in the browser.

## Lifecycles

### gasketData

The `gasketData` event is fired once the config file contents are normalized.
Hooks are passed the gasket API and the current configuration and should return
a new configuration object with injected modifications. This event will occur
once during startup, and hooks may be asynchronous. Sample:

```js
const fetchRemoteConfig = require('./remote-config');

module.exports = {
  hooks: {
    async gasketData(gasket, gasketData) {
      const remoteCfg = await fetchRemoteConfig();

      return {
        ...gasketData,
        ...remoteCfg
      };
    }
  }
}
```

### responseData

On each request, the `responseData` event is fired, enabling plugins to
inject configuration derived from the request being processed. It is passed the
gasket API, the public gasketData, and a context with the request & response.
Again, hooks should return a new object instead of mutating an existing object.
This is _especially_ vital in the case of this event to avoid cross-request
information leaks.
Sample:

```js
const getFeatureFlags = require('./feature-flags');

module.exports = {
  hooks: {
    async responseData(gasket, publicGasketData, { req, res }) {
      const featureFlags = await getFeatureFlags({
        shopperId: req.user.shopperId,
        locale: req.cookies.market,
        plid: req.user.resellerId
      });

      return {
        ...publicGasketData,
        featureFlags
      };
    }
  }
}
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[Environment per file]:#environment-files
[Environments inline]:#environments-inline

[inline environment overrides]:/packages/gasket-cli/docs/configuration.md#environments
