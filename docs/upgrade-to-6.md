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

We have created a new helper package for accessing Gasket Data in the browser and/or when rendering on the server.

On the client, this package is able to access the gasketData properties rendered in a script tag:

```html
<!-- example.html -->

<script id="GasketData" type="application/json">
  { "something": "interesting" }
</script>
```

```js
// example.js

import gasketData from '@gasket/data';

console.log(gasketData.something); // interesting
```

To make data available for server-side rendering, plugins should add to the `res.locals.gasketData` object:

```js
// ssr-example.js

middleware() {
  return (req, res, next) => {
    res.locals.gasketData = res.locals.gasketData || {};
    res.locals.gasketData.example = { fake: 'data' };
    next();
  }
}
```

_Impacted Plugins/Packages: `@gasket/data`_

### `public` Config Property

We have created the `public` config property in the `gasket.config.js` file to allow the client to access config properties.

```js
// gasket.config.js

module.exports = {
  public: {
    test1: 'config value 1 here',
  },
};
```

The `@gasket/plugin-config` plugin will return these `public` config properties to the browser. The `@gasket/data` package will then be able to access the properties and make them available on `.config`:

```js
import gasketData from '@gasket/data';

console.log(gasketData.config.test1); // config value 1 here
```

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

```js
// SERVICE WORKER USAGE EXAMPLE

module.exports = async function composeServiceWorker(gasket, content, context) {
  const { req, res } = context;

  const { market = 'en-US' } = req.cookies || {};
  const marketFile = `${market.toLowerCase()}.js`;

  const partial = await readFile(path.join('sw', marketFile), 'utf8');

  return content + partial;
};
```

```js
// WORKBOX USAGE EXAMPLE

module.exports = function workbox(gasket, config, context) {
  const { req, res } = context;

  if (req) {
    // adjust config for request-based service workers using headers, cookies, etc.
  }

  // return a config partial which will be merged
  return {
    runtimeCaching: [
      {
        urlPattern: /https:\/\/some.api.com/,
        handler: 'networkFirst',
      },
    ],
  };
};
```

```js
// MANIFEST USAGE EXAMPLE

module.exports = async function manifest(gasket, manifest, context) {
  const { req } = context;

  const whitelisted = await checkAgainstRemoteWhitelist(req.ip);
  return {
    ...manifest,
    orientation: gasket.config.orientation,
    theme_color: req.secure && whitelisted ? '#00ff00' : '#ff0000',
  };
};
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

### Removed Config Defaults

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

We have removed support of existing apps/plugins using the legacy postfixed
naming format.

Please ensure that all plugins and presets adhere to the project-type prefixed naming
convention. This formatting allows user plugins to be referenced with short
names and will help avoid collisions.

### Plugins

| scope   | format                          | short             | description                    |
| :------ | :------------------------------ | :---------------- | :----------------------------- |
| project | `@gasket/plugin-<name>`         | `@gasket/<name>`  | Official Gasket project plugin |
| user    | `@<scope>/gasket-plugin-<name>` | `@<scope>/<name>` | Any user plugins with a scope  |
| user    | `@<scope>/gasket-plugin`        | `@<scope>`        | Scope-only user plugins        |
| none    | `gasket-plugin-<name>`          | `<name>`          | Any user plugins with no scope |

### Presets

| scope   | format                          | short             | description                    |
| :------ | :------------------------------ | :---------------- | :----------------------------- |
| project | `@gasket/preset-<name>`         | `@gasket/<name>`  | Official Gasket project preset |
| user    | `@<scope>/gasket-preset-<name>` | `@<scope>/<name>` | Any user presets with a scope  |
| user    | `@<scope>/gasket-preset`        | `@<scope>`        | Scope-only user presets        |
| none    | `gasket-preset-<name>`          | `<name>`          | Any user presets with no scope |
