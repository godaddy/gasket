# @gasket/config-plugin

Supports application-specific (non-Gasket) configuration

## What Is This

This plugin:

* Assembles a configuration for your environment from
  [config files](#application-config-files)
* [Exposes the configuration](#accessing-config) to server-side code and redux
* Enables plugins to [update the environment's config](#appenvconfig)
* Enables plugins to [inject request-specific configuration](#apprequestconfig)

## Installing

```shell
npm install --save @gasket/config-plugin
```

...and add it to your `gasket.config.js`.

```js
module.exports = {
  plugins: {
    add: ['config']
  }
};
```

## Configuring Your Application

By default, this plugin imports files from your `/config` directory to assemble
your application's config. You can change this directory with the `configPath`
option in your `gasket.config.js`:

```js
module.exports = {
  configPath: './src/config'
};
```

Gasket first decides which _environment_ you're running in. By default, this
comes from the `NODE_ENV` environment variable or the `--env` command-line 
argument. This can also be overridden by the `env` property of 
`gasket.config.js`. Environments can be sub-divided (say, for multiple data 
centers) through dotted identifiers. Example: `production.v1`.

Once this environment identifier is determined, files are imported based on the
identifier and deep merged together. Files must be CommonJS `.js` modules or
`.json` files with the name of your environment. You may optionally have a 
`base.js[on]` file shared across all environments. Given the example 
environment `production.v1`, the following files may be merged together:

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
your development environment `dev` or `development`, that will automatically
be merged with your `local` configuration.

## Alternative Configuration

Additionally, you can optionally add an `app.config.js` file to the root of
your app's directory, alongside the `gasket.config.js`. This config file allows
you to set up [inline environment overrides], as opposed to in separate files,
following the same rules as the `gasket.config.js`.

If you happen to set up config in both `./config` and `app.config.js`, the
configurations will be merged with `./config` taking priority. The `.json`
extension is also supported for this file.

To support easy local development, you can use an `app.config.local.js`
which will merge in your own local configuration for development. This file
should not be committed, and specified in `.gitignore`.

## Accessing Config

The plugin attaches the configuration from your config files to a `config` 
property of the express request object. This makes it accessible to server-side
`getInitialProps` calls:

```jsx harmony
import * as React from 'react';

export default PageComponent extends React.Component {
  static getInitialProps({ isServer, req }) {
    if (isServer) {
      return {
        flags: req.config.featureFlags
      };      
    }
  }
  
  // ...
}
```

...and custom express middleware (provided you ensure that your middleware 
runs _after_ the config plugin). For example, in `/lifecycles/middleware.js`:

```js
module.exports = {
  timing: { after: ['config'] },
  handler(gasket) {
    return (req, res, next) => {
      if (req.config.featureFlags.betaSite) {
        res.redirect(req.config.betaSiteURL);
      } else {
        next();
      }
    }
  }
}
```

If you need access to config values in client-side code, this can be done
through your redux store. The config plugin looks for a `redux` property of your
configuration and places it under a `config` property in your initial redux
state.

## Lifecycle Events

### appEnvConfig

The `appEnvConfig` event is fired once the config file contents are normalized.
Hooks are passed the gasket API and the current configuration and should
return a new configuration object with injected modifications. This event will
occur once during startup, and hooks may be asynchronous. Sample:

```js
const fetchRemoteConfig = require('./remote-config');

module.exports = {
  hooks: {
    async appEnvConfig(gasket, config) {
      const remoteCfg = await fetchRemoteConfig();

      return {
        ...config,
        ...remoteCfg
      };
    }
  }
}
```

### appRequestConfig

On each request, the `appRequestConfig` event is fired, enabling plugins to
inject configuration derived from the request being processed. It is passed
the gasket API, the config, and the Express request & response. Again, hooks
should return a new object instead of mutating an existing object. This is
_especially_ vital in the case of this event to avoid cross-request information
leaks. Sample:

```js
const getFeatureFlags = require('./feature-flags');

module.exports = {
  hooks: {
    async appRequestConfig(gasket, config, req, res) {

      const featureFlags = await getFeatureFlags({
        shopperId: req.user.shopperId,
        locale: req.cookies.market,
        plid: req.user.resellerId
      });

      return {
        ...config,
        featureFlags
      };
    }
  }
}
```

[inline environment overrides]:https://github.com/godaddy/gasket/docs/blob/master/guides/configuration.md#environments
