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

## Gasket Data

We have decoupled several things from Redux, and instead have a new construct for delivering config data to the client.

### @gasket/data

We have created a new helper package for accessing Gasket Data in the browser. This package retrieves the gasketData properties rendered via a script tag injected into the DOM.

_Impacted Plugins/Packages: `@gasket/data`_

### How to Add to Gasket Data

There are 2 ways to add data to the Gasket Data object:

1. Add to the `res.locals.gasketData` object on the server.
2. Add to the `public` config property in `app.config.js`

### `public` Config Property

We have created the `public` property in the `app.config.js` file to allow the client to access app config properties.

The `@gasket/plugin-config` plugin will return these `public` config properties to the browser. The `@gasket/data` package will then have access to the properties and make them available on `.config`.

_Impacted Plugins/Packages: `@gasket/plugin-config`_

### Config Moved to Gasket Data

At this time, the [Intl](#intl-support) and [App config](#public-config-property) objects are the only config objects that have been moved to the `gasketData` object.

_Impacted Plugins/Packages: `@gasket/plugin-config`, `@gasket/plugin-intl`_

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

### @gasket/nextjs

We have created a new package, equipped with an HOC to inject a GasketData script tag into the DOM. This tag is used by the `@gasket/data` package to make server-side data available to the browser.

By default this will inject the script in the `<body/>` after the Next.js `<Main/>` component, but before `<NextScript/>`.

_Impacted Plugins/Packages: `@gasket/nextjs`_

### Remove Support for `next-routes`

We have removed built-in support for `next-routes`. Instead, we encourage using Next.js default page routing.

A few examples of differences _(this is not an exhaustive list)_:

1. A `routes.js` file is no longer required to define routes. Next.js has a file-system based router. When a file is added to the `pages` directory it's automatically available as a route.

2. The client-side components have a slightly different API:

```diff
// pages/index.js

- <Link route='/blog/hello-world'>
+ <Link href="/blog/hello-world">
    <a>Hello world</a>
  </Link>
```

3. To access the `router` object directly, the `useRouter` hook can be used instead of requiring methods from `./routes`.

```diff
- import { Router } from '../routes'
+ import { useRouter } from 'next/router'
```

4. The methods available with each `router` object are slightly different.

```diff
- router.pushRoute('/blog/hello-world')
+ router.push('/blog/hello-world')
```

These are just a few examples of the differences between `next-routes` and the default Next.js routing. We recommend reviewing the [Next.js routing documentation](https://nextjs.org/docs/routing/introduction) for further details.

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
// SERVICE WORKER USAGE EXAMPLE

- module.exports = async function composeServiceWorker(gasket, content, req) {
+ module.exports = async function composeServiceWorker(gasket, content, context) {
    const { req } = context;
    ...
  };
```

```diff
// WORKBOX USAGE EXAMPLE

- module.exports = function workbox(gasket, config, req) {
+ module.exports = function workbox(gasket, config, context) {
    const { req } = context;
    ...
  };
```

```diff
// MANIFEST USAGE EXAMPLE

- module.exports = async function manifest(gasket, manifest, { req }) {
+ module.exports = async function manifest(gasket, manifest, context) {
  const { req } = context;
  ...
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

```diff
- @gasket/example-plugin
+ @gasket/plugin-example
```

Please ensure that all plugins and presets adhere to the project-type prefixed naming convention. This formatting allows user plugins to be referenced with short names and will help avoid collisions.

_Impacted Plugins/Packages: `@gasket/resolve`, `@gasket/engine`_
