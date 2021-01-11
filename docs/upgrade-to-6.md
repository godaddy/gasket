# Upgrade to v6

This guide will take you through updating `@gasket/*` packages to `6.x`.

## Update Dependency Versions

Update all `@gasket/` scoped packages to the v6 major version.

This is not an exhaustive list, but rather a sampling of dependencies to
demonstrate what to look for:

```diff
"dependencies": {
-    "@gasket/fetch": "^5.0.2",
+    "@gasket/fetch": "^6.0.0",
-    "@gasket/intl": "^5.5.0",
+    "@gasket/intl": "^6.0.0",
-    "@gasket/plugin-workbox": "^5.4.1",
+    "@gasket/plugin-workbox": "^6.0.0",
}
```

## Redux

## Gasket Data

We have decoupled several things from Redux, and instead have a new construct for passing configuration down to the browser.

### @gasket/data

We have created a new helper package for accessing Gasket Data in the browser and/or when rendering on the server. See usage [here](../packages/gasket-data/README.md).

_Impacted Plugins/Packages: `@gasket/data`_

### `public` Config Property

We have created the `public` config property in the `gasket.config.js` file to allow the client to access config properties. See usage [here](../packages/gasket-plugin-config/README.md#config-with-public-config).

_Impacted Plugins/Packages: `@gasket/plugin-config`_

## Next.js

Update `next` and `react`/`react-dom` versions to v10 and v17 respectively.

```diff
"dependencies": {
-   "next": "^9.2.1",
+   "next": "^10.0.0",
-   "react": "^16.13.1",
+   "react": "^17.0.0",
-   "react-dom": "^16.8.6",
+   "react-dom": "^17.0.0",
}
```

## Fetch

Gasket is no longer providing a browser ponyfill for the `fetch` api. If you are supporting older browsers that don't have `fetch`, please bring your own polyfill.

_Impacted Plugins/Packages: `@gasket/fetch`_

## Intl Support

### Update `@gasket/intl` Imports

`@gasket/intl` has been renamed to `@gasket/react-intl`, so imports will need to be updated.

```diff
-   import { withLocaleRequired } from '@gasket/intl';
+   import { withLocaleRequired } from '@gasket/react-intl';
```

## Static Site Generation Support

### Update Lifecycle Signatures with Context Object

In order to better support static site generation, we have updated the `@gasket/plugin-service-worker`, `@gasket/plugin-workbox`, `@gasket/plugin-manifest` lifecycles' signatures to pass in a context object instead of the usual `req, res`.

```diff
// potential usage

-   module.exports = async function workbox(gasket, config, req, res) {
-     const response = res;
-   }
+   module.exports = async function workbox(gasket, config, context) {
+     const { res: response } = context;
+   }
```

_Impacted Plugins/Packages: `@gasket/plugin-service-worker`, `@gasket/plugin-workbox`, `@gasket/plugin-manifest`_

## Webpack 5

Update `webpack` to v5.

```diff
"devDependencies": {
-   "webpack": "^4.44.1",
+   "webpack": "^5.9.0"
}
```

### Config

We have removed the generated Webpack config defaults. The `node` config options that were previously prescribed, have changed. You can find more info about configuring Node.js options with Webpack 5 [here](https://webpack.js.org/configuration/node/).

## Deprecate Zones Config

In order to continue aligning with Next.js, we have deprecated the `zone` config, and replaced it with the `basePath` config.

Update property in `gasket.config.js`.

```diff
// gasket.config.js

module.exports = {
-   zone: '/app-path-prefix'
+   basePath: '/app-path-prefix'
}
```

Update all references to `zone` with `basePath`.

```diff
// example reference

-   const { zone } = gasket.config;
+   const { basePath } = gasket.config;
```

_Impacted Plugins/Packages: `@gasket/plugin-nextjs`, `@gasket/plugin-workbox`_

## Fallback Naming Removal


