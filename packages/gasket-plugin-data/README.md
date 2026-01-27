# @gasket/plugin-data

Add support for environment and request specific data such as settings and
configurations.

Many times, applications need to have different configurations based on
environments.
This plugin simplifies the process of managing this data and also provides
hooks to gather user or request-specific data.

## Installation

#### New apps

```
npm i @gasket/plugin-data
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginData from '@gasket/plugin-data';

 export default makeGasket({
  plugins: [
+   pluginData
  ]
});
```

Also, add a `gasket-data.js` file to the root of your project, import and assign
it to the `data` property of the Gasket config.

```diff
import { makeGasket } from '@gasket/core';
+import pluginLogger from '@gasket/plugin-logger';
+import pluginData from '@gasket/plugin-data';

+ import gasketData from './gasket-data.js';

export default makeGasket({
  plugins: [
    pluginLogger,
+    pluginData
  ],
+  data: gasketData
});
```

## Configuration

While you can declare `data` definition directly in your `makeGasket` config,
it is recommended to use a separate `gasket-data.js` file by convention.
This can also be a `.ts` file if the project is using TypeScript.

This definition file allows you to set up [inline environment overrides] to
adjust things like API URLs and settings based on the runtime environment.

```js
// gasket-data.js
export default {
  environments: {
    local: {
      api: 'http://localhost:3000'
    },
    test: {
      api: 'https://test-api.example.com'
    },
    prod: {
      api: 'https://api.example.com'
    }
  }
};
```

## Actions

### getGasketData

This action is used to retrieve the current configuration data. It can be used
in any lifecycle hook or server-side code.

### getPublicGasketData

This action is used to retrieve the public configuration data particular to a
request.
It is referred to as "public" meaning it is safe to expose to the client.

#### Example with Next.js

If you are developing a front end with Next.js, config is accessible to
server-side rendering via `getInitialProps`:

```jsx
import gasket from '../gasket.js';

PageComponent.getInitialProps = async function({ isServer, req }) {
  if (isServer) {
    const publicData = await gasket.actions.getPublicGasketData(req);
    return {
      flags: publicData.featureFlags
    };
  }
  // ...
}
```

When this action is called, it will trigger the `publicGasketData` lifecycle to
allow plugins to inject request-specific data. The results are cached for the
lifetime of the request.

### Browser Access

If you need access to config values in client-side code, this can be done
by defining a `public` property in your `gasket-data.js`.

```js
export default {
  public: {
    test1: 'config value 1 here',
    test2: 'config value 2 here'
  }
};
```

From there, we recommend looking at the [withGasketData] HOC from the
`@gasket/nextjs` package. This will use the [getPublicGasketData] action to get
the `public` data and render it to a script tag for browser access.

## Lifecycles

### gasketData

The `gasketData` event is fired once the config file contents are normalized.
Hooks are passed the gasket API and the current configuration and should return
a new configuration object with injected modifications. This event will occur
once during startup, and hooks may be asynchronous. Sample:

```js
import fetchRemoteConfig from './remote-config.js';

export default {
  name: 'sample-plugin',
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

### publicGasketData

When the `getPublicGasketData` action used for request-specific data,
the `publicGasketData` lifecycle is fired, enabling plugins to inject
data related the request being processed. It is passed the
gasket API, the public gasketData, and a context with the request.

Sample:

```js
import getFeatureFlags from './feature-flags.js';

export default {
  name: 'gasket-plugin-example',
  hooks: {
    async publicGasketData(gasket, publicData, { req }) {
      const featureFlags = await getFeatureFlags({
        shopperId: req.user.shopperId,
        locale: req.cookies.market,
        plid: req.user.resellerId
      });

      return {
        ...publicData,
        featureFlags
      };
    }
  }
}
```

## Gasket Data vs Gasket Config

**Gasket Data**

Gasket Data comes in two forms:
- **Private data** - Server-side only data from the `gasketData` lifecycle, never sent to the client
- **Public data** - Client-safe data from the `publicGasketData` lifecycle, embedded in HTML and accessible via `@gasket/data`

**Gasket Config**

Configuration defined in a `gasket.js` file. It contains application settings, plugin configurations, and environment-specific options. It is not meant to be used as a location to save runtime data.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[getPublicGasketData]: #getpublicgasketdata
[withGasketData]: /packages/gasket-nextjs/README.md#withgasketdata

<!-- TODO - recover configuration doc -->
[inline environment overrides]:/packages/gasket-cli/docs/configuration.md#environments
