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

We have decoupled several things from Redux, and instead, have a new construct
for delivering config data to the client.

If you are using a non-Next.js app, you will need to add the
[Gasket Data script tag] to be in your document. If you are using a Next.js app,
we have a [new utility HOC] for which can be used to simplify injecting this
script tag into the `_document.js` of your app.

### @gasket/data

We have created a new helper package for accessing Gasket Data in the browser.
This package retrieves the gasketData properties rendered via the aforementioned
script tag, for use on the client.

_Impacted Plugins/Packages: `@gasket/data`_

### How to Add to Gasket Data

There are two ways to add data to the Gasket Data object:

1. Add to the `res.locals.gasketData` object on the server.
2. Add to the `public` config property in `app.config.js`

### `public` Config Property

We have created the `public` property in the `app.config.js` file to allow the
client to access app config properties.

The [@gasket/plugin-config] plugin will return these `public` config properties
to the browser. The [@gasket/data] package will then access the properties and
make them available on `.config`.

_Impacted Plugins/Packages: `@gasket/plugin-config`_

### Config Moved to Gasket Data

At this time, the [Intl] and [App config] objects are the only config objects
that have been moved to the `gasketData` object.

_Impacted Plugins/Packages: `@gasket/plugin-config`, `@gasket/plugin-intl`_

## Redux

As described above, we've made efforts to decouple various plugins from Redux.
This move does not mean Redux is not still useful if you want to continue to use
it in your app or custom plugins. If your app is currently using Redux with the
[@gasket/plugin-redux], here are the steps you will need to take to upgrade.

### Create a store file

In the previous version of [@gasket/plugin-redux], a default make store was
provided. Although uncommon, if your app does not currently have a `store.js`
(or `redux/store.js`) file, you will now need to create one. See
[Redux configuration] for more details.

### Update store file

For a basic Redux setup, there should be no need for and changes to the make
store. However, if your app use using Next.js see the
[Updates for next-redux-wrapper] section below for the necessary changes
required to use the latest Redux changes for Next.js.

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

### Inject Gasket Data

We have created a new package, equipped with a HOC to inject a GasketData script
tag into the DOM. This tag is used by the [@gasket/data] package to make
server-side data available to the browser.

```diff
+ import { withGasketData } from '@gasket/nextjs';

- export default Document;
+ export default withGasketData()(Document);
```

By default, this will inject the script in the `<body/>` after the Next.js
`<Main/>` component, but before `<NextScript/>`.

_Impacted Plugins/Packages: `@gasket/nextjs`_

### Updates for next-redux-wrapper

If you are using [@gasket/plugin-redux] with your Next.js app, then you will
also need to upgrade [next-redux-wrapper] to take advantage of the latest page
data fetching function in Next.js.

```
{
  "name": "my-app",
  "dependencies": {
-   "next-redux-wrapper": "^4.0.1",
+   "next-redux-wrapper": "^6.0.2",
+   "lodash.merge": "^4.6.2",
    "@gasket/plugin-redux": "^6.0.0"
    ...
  }
}
```

You will also want a deep merge utility to help set up a basic HYDRATE actual
handler in the root reducer, as [required by next-redux-wrapper][hydrate
handler]. In this example, and for newly generated Gasket apps, [lodash.merge]
is used.

```diff
// redux/store.js

const { configureMakeStore } = require('@gasket/redux');
+ const { HYDRATE, createWrapper } = require('next-redux-wrapper');
+ const merge = require('lodash.merge')

+ // Basic hydrate reducer for next-redux-wrapper
+ const rootReducer = (state, { type, payload }) => type === HYDRATE ? merge({}, state, payload) : state;

const exampleReducers = require('./reducers');

const reducers = {
  ...exampleReducers
};

- module.exports = configureMakeStore({ reducers });
+ const makeStore = configureMakeStore({ rootReducer, reducers });
+ const nextRedux = createWrapper(({ req }) => makeStore({}, { req }));

+ module.exports = makeStore;
+ module.exports.nextRedux = nextRedux;
```

In addition to exporting the `makeStore` function, you'll want to export the
`nextRedux` wrapper for use in your app code.

In the `_app.js`, you will need to wrap the App component. If you do not have an
existing custom App component, you can do something like this:

```diff
import React from 'react';
+ const { nextRedux } = require('../redux/store');

// Simple functional App component which can be wrapped
function WrappedApp({ Component, pageProps }) {
  return <Component { ...pageProps } />;
}

- export default WrappedApp;
+ export default nextRedux.withRedux(WrappedApp);
```

From there, your pages and other components can continue to connect to the store
using [react-redux] as before.

### Remove Support for `next-routes`

We have removed built-in support for `next-routes`. Instead, we encourage using
Next.js default page routing.

A few examples of differences _(this is not an exhaustive list)_:

1. A `routes.js` file is no longer required to define routes. Next.js has a
   file-system based router. When a file is added to the `pages` directory, it
   is automatically available as a route.

2. The client-side components have a slightly different API:

```diff
// pages/index.js

- <Link route='/blog/hello-world'>
+ <Link href="/blog/hello-world">
    <a>Hello world</a>
  </Link>
```

3. To access the `router` object directly, the `useRouter` hook can be used
   instead of requiring methods from `./routes`.

```diff
- import { Router } from '../routes'
+ import { useRouter } from 'next/router'
```

4. The methods available with each `router` object are slightly different.

```diff
- router.pushRoute('/blog/hello-world')
+ router.push('/blog/hello-world')
```

These are just a few examples of the differences between `next-routes` and the
default Next.js routing. We recommend reviewing the [Next.js routing
documentation] for further details.

## Fetch

Gasket is no longer providing a browser ponyfill for the `fetch` API. If you are
supporting older browsers that don't have `fetch`, please bring your own
polyfill.

_Impacted Plugins/Packages: `@gasket/fetch`_

## Intl

There are several changes to [@gasket/plugin-intl]. Unfortunately, some of these
may be breaking changes depending on how your app consumes the plugin. In this
section, we will walk through the potential adjustments require to upgrade this
plugin.

_Impacted Plugins/Packages: `@gasket/plugin-intl`_

### Simplified deployments

We've simplified how the plugin works with source locales files to be more
easily deployed to a CDN along with other static content. The locale files are
now no longer copied to a `build/` dir, but now stay put. By default, the
[@gasket/plugin-intl] will now look for these under `public/locales/`, however
this can be configured with the `intl.localesDir` [config options].

```diff
// gasket.config.js

module.exports = {
  plugins: {
    add: ['@gasket/plugin-intl']
  },
+  intl: {
+    localesDir: 'locales'
+  }
}
```

Note that if you are building a Next.js app using [@gasket/plugin-nextjs], you
could simply move your `locales/` dir, to `public/locales/`, and Next.js will
serve them along with your other static content.

#### Ignore generated manifest

At build time, a manifest JSON for the locales file is generated. Because this
will now go into your source locales directory, you may choose to git ignore it
to avoid unnecessarily committing it.

```diff
# .gitignore

+ locales-manifest.json
```

#### Opt-in Serving

If you wish to continue having your server serve the locale files, this can be
enabled using the `intl.serveStatic` [config options].

```diff
// gasket.config.js

module.exports = {
  plugins: {
    add: ['@gasket/plugin-intl']
  },
+  intl: {
+    serveStatic: true
+  }
}
```

### Module files

If your app used locale files from NPM module dependencies, this is an opt-in
feature now, which can be enabled in the Gasket config using the `intl.modules`
[config options].

```diff
// gasket.config.js

module.exports = {
  plugins: {
    add: ['@gasket/plugin-intl']
  },
+  intl: {
+    modules: true
+  }
}
```

It works slightly different now in that the NPM module locale files will now be
copied under a `modules/` dir within your working configured `intl.localesDir`.
This makes the localesPath simple for your components.

For example, if you the change to your code would be something like:

```diff
- <LocaleRequired identifier={{ module: '@myscope/some-module', namespace: 'namespace' }}>
+ <LocaleRequired localesPath='/locales/modules/@myscope/some-module/namespace'>
  ...
</LocaleRequired>
```

#### Ignore copied files

Because the `modules/` dir will be generated under the configured
`intl.localesDir` at build time, you may choose to `.gitignore` that directory
to avoid unnecessarily committing those files to the git repo.

```diff
# .gitignore

+ public/locales/modules/
```

### Lifecycle name

If you have a custom lifecycle hook to determine the locale, either in a plugin
or [lifecycle file], then you will need to update the name and the signature.

```diff
// gasket-plugin-example.js

module.exports = {
  hooks: {
-    intlLanguage: async function intlLanguageHook(gasket, language, req) {
+    intlLocale: async function intlLocaleHook(gasket, locale, { req }) {
      ...
      return locale;
    }
  }
}
```

The context option will have the `req` and `res` objects from the request.

### Config option names

We have also aligned our config names to use _locale_ instead of _language_.

```diff
// gasket.config.js

module.exports = {
  plugins: {
    add: ['@gasket/plugin-intl']
  },
  intl: {
-    languageMap: { 'zh-HK': 'zh-TW' },
+    localesMap: { 'zh-HK': 'zh-TW' },
-    defaultLanguage: 'en',
+    defaultLocale: 'en',
  }
}
```

### Decoupled from Redux

Before, to use [@gasket/plugin-intl] in your app, you were also required to use
[@gasket/plugin-redux] along with Redux bindings in your React code. This is now
simplified to work with [Gasket Data], and Redux is no longer required.

```diff
// gasket.config.js

module.exports = {
  plugins: {
    add: [
      '@gasket/plugin-intl'
-      '@gasket/plugin-redux'
    ]
  }
}
```

If you use Redux for other things in your app, feel free to continue to do so.
However, there may be some changes in your app code if you were adding locale
files and selecting messages with the Redux hooks before.

#### Loading messages

To add locale files during server requests now, instead of using the
`initReduxState` lifecycle hook, you should now use [withLocaleRequired] method
from the request object in the middleware lifecycle, or wherever `req` is
accessible in your code flow.

```diff
// gasket-plugin-example.js

module.exports = {
  hooks: {
-    initReduxState() { ... }
+    middleware() {
+      return function middleware(req, res, next) {
+      req.withLocaleRequired('/locales');
+      next();
+    }
  }
}
```

This will load and add those messages from the locales file to GasketData,
available for server-side rendering, and also for selecting messages in API
routes or otherwise.

#### Selecting messages

To select messages, you will need to pull them off of `res.locals.gasketData`,
however, there is a helper method added to the request object to make this easy.
See the Intl plugin docs for a [select locale message example].

## Intl for React

There are a few new features and improvements to the Gasket Intl package for
React, however, this guide focuses on what changes are necessary to upgrade. To
read up on the new features, refer to the [@gasket/react-intl] docs.

_Impacted Plugins/Packages: ~`@gasket/intl`~, `@gasket/react-intl`_

### Package rename

To clarify the purpose of this Gasket Intl package and differentiate it from any
future tie in packages (Vue, Svelte, etc), it has been renamed to include
"React".

As such, `@gasket/intl` should now be brought in as `@gasket/react-intl`. This
will affect your module imports:

```diff
// example-component.js

- import { withLocaleRequired } from '@gasket/intl';
+ import { withLocaleRequired } from '@gasket/react-intl';
```

as well as your package.json dependencies:

```diff
{
  "name": "my-app",
  "dependencies": {
-   "@gasket/intl": "^5.0.0",
+   "@gasket/react-intl": "^6.0.0"
    "@gasket/plugin-intl": "^6.0.0"
    ...
  }
}
```

### Simplified locale paths

We now have a much simpler approach for specifying the paths to load locale
files from. These were previously referred to as "identifiers" in the old
documentation. Now, we call them the "localesPath", and they are just a string.

```diff
- <LocaleRequired identifier={{ namespace: 'namespace' }}>
+ <LocaleRequired localesPath='/locales/namespace'>
  ...
</LocaleRequired>
```

For a more detailed explanation, refer to the [localesPath docs][localesPath].

### Next.js Initial Props

To allow for a static generation of pages, the `withLocaleRequired` HOC no
longer automatically adds `getInitialProps` to the component. It will still
fetch the locale file, but this will happen in the browser only now.

However, if you still want to server-render pages with locale files preloaded,
you can re-enable `getInitialProps` with the HOC `initialProps` option.

```diff
import { withLocaleRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

const Component = props => <h1><FormattedMessage id='welcome'/></h1>

- export default withLocaleRequired('/locales')(Component);
+ export default withLocaleRequired('/locales', { initialProps: true })(Component);
```

## Static Progressive Web App Changes

### Update Lifecycle Signatures with Context Object

To better support static site generation, we have updated the
[@gasket/plugin-service-worker] and [@gasket/plugin-workbox] lifecycles'
signatures to pass in a context object instead of the usual `req, res`.

```diff
// SERVICE WORKER USAGE EXAMPLE

- module.exports = async function composeServiceWorker(gasket, content, req) {
+ module.exports = async function composeServiceWorker(gasket, content, { req }) {
```

```diff
// WORKBOX USAGE EXAMPLE

- module.exports = function workbox(gasket, config, req) {
+ module.exports = function workbox(gasket, config, { req }) {
```

The purpose for using this context object is to allow these lifecycle methods to
be run at build time without a request object, or at run time, when the request
object is present.

_Impacted Plugins/Packages: `@gasket/plugin-service-worker`,
`@gasket/plugin-workbox`, `@gasket/plugin-manifest`_

## Webpack 5

Webpack 5 support is now available! We have tuned all of our plugins and
packages to fully support Webpack 5.

```diff
"devDependencies": {
-   "webpack": "^4.44.1",
+   "webpack": "^5.9.0"
}
```

One potentially breaking change to note is that [@gasket/plugin-webpack] no
longer sets up predefined package excludes as before. This was necessary to
support configuration changes in Webpack 5.

If you stick with Webpack 4, yet want to bring back the former excludes, you can
[configure Webpack] in your `gasket.config.js` with them:

```diff
// gasket.config.js

module.exports = {
+  webpack: {
+    node: {
+      fs: 'empty',
+      net: 'empty',
+      tls: 'empty'
+    }
+  }
}
```

If you do upgrade to Webpack 5, you can instead configure [resolve.fallback] as
needed, which is described in the [Webpack 5 docs].

### Removed Config Defaults

We have removed the generated Webpack config defaults. The `node` config options
that were previously prescribed, have changed. You can find more info about
configuring Node.js options with Webpack 5 on the [webpack website].

## Aligning Base Path Config

Instead of using the `zone` config, we will now be using the `basePath`
property, to keep in alignment with Next.js.

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

In your plugins/presets, you'll need to align to the [naming convention] of
plugins and presets. We no longer have fallback naming support.

```diff
- @gasket/example-plugin
+ @gasket/plugin-example

- @user/example-plugin
+ @user/plugin-example

- intl
+ @gasket/plugin-intl
```

Please ensure that all plugins and presets adhere to the project-type prefixed
naming convention. This formatting allows user plugins to be referenced with
short names and will help avoid collisions.

_Impacted Plugins/Packages: `@gasket/resolve`, `@gasket/engine`_

<!-- LINKS -->

[intl]: #intl
[app config]: #public-config-property
[next.js routing documentation]: https://nextjs.org/docs/routing/introduction
[webpack website]: https://webpack.js.org/configuration/node/
[gasket data script tag]: /packages/gasket-data/README.md#usage
[new utility HOC]: #inject-gasket-data
[@gasket/plugin-config]: /packages/gasket-plugin-config/README.md
[@gasket/data]: /packages/gasket-data/README.md
[@gasket/plugin-workbox]: /packages/gasket-data/README.md
[@gasket/plugin-service-worker]: /packages/gasket-data/README.md
[naming convention]: /packages/gasket-resolve/README.md#plugins

<!-- LINKS -->

[Gasket Data]: #gasket-data
[Updates for next-redux-wrapper]: #updates-for-next-redux-wrapper

[@gasket/plugin-intl]: /packages/gasket-plugin-intl/README.md
[config options]: /packages/gasket-plugin-intl/README.md#options
[localesPath]: /packages/gasket-plugin-intl/README.md#locales-path
[withLocaleRequired]: /packages/gasket-plugin-intl/README.md#withlocalerequired
[select locale message example]: /packages/gasket-plugin-intl/README.md#selectlocalemessage
[@gasket/react-intl]: /packages/gasket-react-intl/README.md
[@gasket/plugin-nextjs]: /packages/gasket-plugin-nextjs/README.md
[lifecycle file]: /packages/gasket-plugin-lifecycle/README.md#usage
[@gasket/plugin-redux]: /packages/gasket-plugin-redux/README.md
[Redux configuration]: /packages/gasket-plugin-redux/README.md#configuration
[@gasket/plugin-webpack]: /packages/gasket-plugin-webpack/README.md
[configure webpack]: /packages/gasket-plugin-webpack/docs/webpack.md#gasket-webpack-config

[next-redux-wrapper]: https://github.com/kirill-konshin/next-redux-wrapper
[hydrate handler]: https://github.com/kirill-konshin/next-redux-wrapper#usage
[lodash.merge]: https://www.npmjs.com/package/lodash.merge
[react-redux]: https://github.com/reduxjs/react-redux
[resolve.fallback]: https://webpack.js.org/configuration/resolve/#resolvefallback
[Webpack 5 docs]: https://webpack.js.org/configuration/node/
