# Upgrade to v7 (Active)

This guide will take you through updating `@gasket/*` packages to `7.x`.

## Update Dependency Versions

Update all `@gasket/` scoped packages to the v7 major version.

This is not an exhaustive list, but rather a sampling of dependencies to
demonstrate what to look for:

```diff
"dependencies": {
-    "@gasket/fetch": "^6.0.2",
+    "@gasket/fetch": "^7.0.0",
-    "@gasket/data": "^6.5.0",
+    "@gasket/data": "^7.0.0",
-    "@gasket/plugin-workbox": "^6.4.1",
+    "@gasket/plugin-workbox": "^7.0.0",
}
```

## Removed packages

### @gasket/gasket-cli

### @gasket/gasket-plugin-docsify

Removed in [#681].
Instead, use [@gasket/gasket-plugin-docusaurus] for local documentation.

### @gasket/gasket-plugin-config

Refactored as [@gasket/gasket-plugin-data] with several interface changes.

## Removed deprecated features

### @gasket/plugin-workbox

Remove deprecated `assetPrefix` config support. Use `basePath` instead ([#661])

### @gasket/plugin-nextjs

Remove deprecated `next` config support. Use `nextConfig` instead ([#655])

### @gasket/gasket-utils

Remove deprecated `applyEnvironmentOverrides` ([#649])

### @gasket/plugin-intl

Remove deprecated support for `languageMap`, `defaultLanguage`, `assetPrefix` config options. ([#666])

### @gasket/plugin-webpack

- Remove deprecated lifecycles. ([#665])
- Remove `webpackMerge` util.

### @gasket/plugin-elastic-apm

- Remove deprecated config support. ([#668])
- Do not start in preboot, log warning if not started.

## Migrating away from req/res attachments

Using the `req` and `res` objects for adding attachments and accessing data has been a common pattern in Gasket applications. This pattern is being deprecated in favor of using the new Gasket Actions API introduced in v7.

### Motivation

Middleware in Gasket apps runs for every request, regardless of whether it is used or not. We added support for [middleware paths] to help reduce this, but it is still not ideal and requires the developer to manage something that should be optimized already by the plugin.

As a caveat of the middleware pattern, when the `req` and `res` objects are decorated with various added properties, it is not always easy to know what is available and when.

In addition to issues with middleware, we need to move away from reliance on `req` and `res` objects to fully utilize Nextjs 14 features such as [App Router] and [streaming].

The Gasket Actions API provides a more structured way to access and modify data in Gasket applications. This API is designed to be more consistent and easier to use than the previous pattern of adding attachments to `req` and `res` objects.

The `req` object can be used as a Gasket Action argument to give access to headers, cookies, queries, or to be used as a `WeakMap` key for repeated calls.

### Example

When retrieving a variable called `myValue` in middleware, you might have done something like this:

```js
const myValue = res.locals.myValue;
```

Going forward, the recommended way to access `myValue` would be through a Gasket Action like this:

```js
const myValue = gasket.actions.getMyValue(req);
```

The Gasket Action is defined as a hook in the plugin:

```js
// plugin-example.js

export default({
  name: 'plugin-example',
  actions: {
    async getMyValue(gasket, req) {
      // Returns myValue
      // Use the req argument to access headers, cookies, queries, etc.
    }
  }
})
```

## Set Docusaurus as The Default Docs Generator

Replace `docsify` with `docusaurus` for gasket docs. ([#673])

## Align Lifecycles to use Context Object in Params

We had some lifecycles
that did not conform to the context object pattern we have in place for many other lifecycles. ([#669])

The reason for utilizing this context object is to enable the execution of these lifecycle methods under two distinct scenarios:

1. During build time, when there is no request object available.
2. During run time, when the request object becomes available.

Affected lifecycles:

- `initReduxState`
- `nextPreHandling` `.d.ts` type file

If your app or plugins hooks these lifecycles you may need to adjust them.

```diff
- async initReduxState(gasket, config, req, res) {
+ async initReduxState(gasket, config, { req, res }) {
```

## @gasket/plugin-elastic-apm

Add setup script to create hook. ([#672])

## Rename and Refactor @gasket/plugin-config as @gasket/plugin-data

We have had a lot of confusion around the config plugin and its purpose.
As such, we are renaming and refocusing what the plugin does.
That is, to allow environment-specific data to be accessible for requests,
with public data available with responses.

Instead of the generic 'config' name, we will term this 'gasketData' which pairs
well with the `@gasket/data` package - which is what makes this data accessible
in browser code.

Existing apps will need to update their Gasket config to use the new plugin name.

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginData from '@gasket/plugin-data';
import gasketData from './gasket-data.js';

export default makeGasket({
  plugins: [
    pluginData
  ],
  gasketData
});
```

Individual environment files are no longer supported.
Instead, you may specify environment-specific data in the `gasketData` object.
Additionally, we are dropping the `redux` property, aligning on `public`.

If coming from an `app.config.js` you will want to change the name to `gasket-data.js`

```diff
- <app-root-dir>/app.config.js
+ <app-root-dir>/gasket-data.js
```

If you add lifecycle hooks for modifying the config data before, 
you will need to update the hook name to `gasketData` and adjust the signature.

`appEnvConfig` -> `gasketData`
`appRequestConfig` -> `publicGasketData`

See the [@gasket/gasket-plugin-data] docs for more details.

## Bring Your Own Logger

Gasket's logging infrastructure was comprised of two main parts:

1. `@gasket/plugin-log`: Manages lifecycle timing and executes the `logTransports` hook for adding extra transports to the logger configuration.
2. `@gasket/log`: Implements logging using Diagnostics (Client-side) and Winston (Server-side).

While these components worked together to initialize `gasket.logger`, not all applications utilized them. Additionally, despite Winston's prevalence, we need to be aware of the numerous logging libraries in the ecosystem when adopting Gasket. The following updates aim to address these concerns:

Updates:
- Removed `@gasket/log`
- Created a new `@gasket/plugin-logger` to replace `@gasket/plugin-log`
- The new logger is included by default in Gasket apps
- Created `@gasket/plugin-winston` to customize the default logger
- Added a per-request logger with updatable metadata
- Updated the default redux logger to use the per-request logger
- Updated presets to use the winston logger

`@gasket/plugin-winston` is the new default logger for Gasket apps. Use this plugin in place of `@gasket/plugin-log` to customize the default logger.

```diff
// gasket.config.js

module.exports = {
  plugins: {
    add: [
-      '@gasket/plugin-log'
+      '@gasket/plugin-winston'
    ]
  }
}
```

`@gasket/plugin-winston` does not support `log` when customizing the logger in `gasket.config.js`.

```diff
// gasket.config.js

module.exports = {
-  log: {
-    prefix: 'my-app'
-  },
  winston: {
    level: 'warning'
  },
```

Existing Gasket apps will need to make changes to how they handle logging. Logging levels now follow `console` conventions. Loggers at minimum support the following levels:

- `debug`
- `error`
- `info`
- `warn`

```diff
// gasket.logger.warning changes
- gasket.logger.warning
+ gasket.logger.warn

// logger.log changes
- logger.log
+ logger.info
```

The lifecycle method formerly known as `logTransports` is now `winstonTransports`.

```diff
- // /lifecycles/log-transports.js
+ // /lifecycles/winston-transports.js
```
[#640]

## Bring Your Own Intl Provider

The `@gasket/react-intl` package is convenience wrapper for connecting
`@gasket/plugin-intl` features to a Next.js/React app, and which and had a hard
dependency on the `react-intl` package.

In our new version, users have more flexibility to choose their own intl provider.
While `react-intl` is still a good choice, it is no longer a hard dependency.
Another change is instead of magic webpack and process.env setups for importing
a generated manifest of translations, an explicit import of a generated `intl.js`
file necessary.

```diff
// pages/_app.js
- import { withIntlProvider } from '@gasket/react-intl';
+ import { withMessagesProvider } from '@gasket/react-intl';
+ import { useRouter } from 'next/router';
+ import { IntlProvider } from 'react-intl';
+ import intlManager from '../path/to/intl.js';

- const App = props => <div>{props.children}</div>
- export default withIntlProvider()(App);

+ const IntlMessagesProvider = withMessagesProvider(intlManager)(IntlProvider);
+ export default function App({ Component, pageProps }) {
+   const router = useRouter();
+   return (
+     <IntlMessagesProvider locale={router.locale}>
+       <Component {...pageProps} />
+     </IntlMessagesProvider>
+   );
+ }
```

The above example shows how to use the `withMessagesProvider` HOC to wrap the
`IntlProvider` from `react-intl`, however, note that it can now be swapped out
with another other provider now.

See [@gasket/react-intl] for more details and other changes.

## Intl Manager

As pointed out in the previous section, the `intlManager` is a new concept that
is required to be passed to the `withMessagesProvider` HOC. This manager is
responsible for loading and managing the translations for the app.

Locale files that are registered as statics are loaded at app startup and are
available for SSR.
Other locale files can be loaded on-demand in the browser.
No longer is `getInitialProps` or other Next.js props methods required.

As such, some of the component options have changed, and we adjusted some naming
for clarification.

```diff
- import { withLocaleRequired } from '@gasket/react-intl';
+ import { withLocaleFileRequired } from '@gasket/react-intl';
import { FormattedMessage } from 'react-intl';

const PageComponent = props => <h1><FormattedMessage id='welcome'/></h1>

- export default withLocaleRequired('/locales/extra', { initialProps: true })(Component);
+ export default withLocaleFileRequired('/locales/extra')(Component);
```

The [@gasket/intl] package should be added as an app dependency.

```shell
npm install @gasket/intl
```

The new `intlManager` pattern enables locale files
to be bundled as Webpack chunks.
As such, it is no longer necessary to store these under the public directory of
a Next.js or serve then with an Express endpoint.
The locale files can exist anywhere, though a top-level `/locales` directory is
recommended as a convention.

See [@gasket/plugin-intl] for more details and other changes.

## Update Redux Store to Use gasketData

Update the placeholder reducer for the initial Redux state with `gasketData`. ([#693])

![alt text](images/redux-with-gasket-data.png)

However, if you are using the `@gasket/plugin-redux` plugin to surface
config-like data to the browser, we recommend switch to GasketData, using the
[@gasket/plugin-data] plugin with [@gasket/data] instead.
The GasketData approach is leaner and works with the Next.js App Router and
Page Router using its built-in server.

```diff

## Plugin Imports

Update plugin strings to be plugin import statements in `gasket.js`. All plugins now need to be imported and used in the `makeGasket` function.

```diff
// gasket.config.js
- module.exports = {
-   plugins: {
-     presets: [
-       '@gasket/plugin-nextjs',
-     ],
-   },
- };

// gasket.js
+ import { makeGasket } from '@gasket/core';
+ import pluginNextjs from '@gasket/plugin-nextjs';

+ export default makeGasket({
+   plugins: [
+     pluginNextjs
+   ],
+   filename: import.meta.filename,
+ });
```

## Custom Commands

Update custom commands to be plugin imports in `gasket.js`. All commands need to be imported and used in the `makeGasket` function.

To create a custom command, you first need to install `@gasket/plugin-command`.

```
npm i @gasket/plugin-command
```

Once installed, import and add it to your list of plugins in `gasket.js`.

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
+ import pluginCommand from '@gasket/plugin-command';

export default makeGasket({
  plugins: [
+    pluginCommand
  ],
  filename: import.meta.filename,
});
```

Custom commands can be defined in line in the list of plugins.

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';

export default makeGasket({
  plugins: [
    pluginCommand,
+    {
+      name: 'my-custom-plugin',
+      hooks: {
+        commands(gasket) {
+          return {
+            id: 'my-custom-cmd',
+            description: 'Custom command plugin',
+            args: [],
+            action: async () => {
+            }
+          }
+        }
+      }
+    }
  ],
  filename: import.meta.filename,
});
```

Another option for defining custom commands is to create a separate file.

```js
// my-custom-plugin.js
export default  {
  name: 'my-custom-plugin',
  hooks: {
    commands(gasket) {
      return {
        id: 'my-custom-cmd',
        description: 'Custom command plugin',
        args: [
          {
            name: 'arg1',
            description: 'Message to display',
            required: true // error if arg1 argument is not provided
          },
          {
            name: 'arg2',
            description: 'Optional message to display'
          }
        ],
        // Arguments are spread into the action function
        action: async (arg1, arg2) => {
          console.log('custom arg:', arg1);
          console.log('custom arg 2:', arg2);
        }
      }
    }
  }
};
```

Once this custom command is defined, import the file and use it in the `makeGasket` function.

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginCommand from '@gasket/plugin-command';
import customPluginCommand from './my-custom-plugin.js`;

export default makeGasket({
  plugins: [
    pluginNextjs,
+    customPluginCommand
  ],
  filename: import.meta.filename,
});
```

Once the command is defined, you can now execute the command.

```bash
node ./gasket.js my-custom-cmd "Hello, World!"
# result: custom arg: Hello, World!

# Optional message
node ./gasket.js my-custom-cmd "Hello, World!" "Optional message"
# result: custom arg: Hello, World!
# result: custom arg 2: Optional message
```

Refer to the [@gasket/plugin-command] README for additional information on customizing commands.

## Remove Magic Directories for Custom Plugins and Lifecycles

### Custom Plugins

Previously, custom plugins defined in the `/plugins` directory did not require any additional configuration. This is no longer
supported in `v7`. Instead, all plugins will need to be explicitly imported to `gasket.js`.

For example, if the plugins folder of your application looks something like the following:
```
/pages
/plugins
  custom-plugin.js
  second-custom-plugin.js
gasket.js
```

The two plugins will be imported to `gasket.js` and added to the list of plugins in `makeGasket`.

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
+ import customPlugin from './plugins/custom-plugin.js';
+ import secondCustomPlugin from './plugins/second-custom-plugin.js';

export default makeGasket({
  plugins: [
+    customPlugin,
+    secondCustomPlugin
  ],
  filename: import.meta.filename,
});
```

### Lifecycles

Support for lifecycle magic directories has also been removed in `v7`. Now lifecycles need to be defined
and hooked in a plugin. One way of doing this is to create a new plugin, import the lifecycles as hooks,
and then import the plugin to `gasket.js`.

```js
// /lifecycles/[lifecycle].js
export function lifecycleHook(gasket) {
  gasket.logger.info('Created lifecycle: ', lifecycle);
};
```

```diff
// /plugins/lifecycles-plugin.js
+ import lifecycle from '../lifecycles/[lifecycle]';

export default {
  name: 'lifecycles-plugin',
  hooks: {
+    lifecycle
  }
};
```

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
+ import lifecyclesPlugin from './plugins/lifecycles-plugin.js';

export default makeGasket({
  plugins: [
+    lifecyclesPlugin
  ],
  filename: import.meta.filename,
});
```

Alternatively, you can hook the lifecycle directly in the plugin and then import
the plugin to `gasket.js`.

```diff
// /plugins/lifecycles-plugin.js

export default {
  name: 'lifecycles-plugin',
  hooks: {
+    lifecycle: async function(gasket) {
+      gasket.logger.info('Created lifecycle: ', lifecycle);
+    }
  }
};
```


<!-- PRs -->
[#647]:https://github.com/godaddy/gasket/pull/647
[#661]:https://github.com/godaddy/gasket/pull/661
[#660]:https://github.com/godaddy/gasket/pull/660
[#655]:https://github.com/godaddy/gasket/pull/655
[#649]:https://github.com/godaddy/gasket/pull/649
[#666]:https://github.com/godaddy/gasket/pull/666
[#665]:https://github.com/godaddy/gasket/pull/665
[#668]:https://github.com/godaddy/gasket/pull/668
[#669]:https://github.com/godaddy/gasket/pull/669
[#673]:https://github.com/godaddy/gasket/pull/673
[#672]:https://github.com/godaddy/gasket/pull/672
[#640]:https://github.com/godaddy/gasket/pull/640
[#680]:https://github.com/godaddy/gasket/pull/680
[#681]:https://github.com/godaddy/gasket/pull/681
[#693]:https://github.com/godaddy/gasket/pull/693

<!-- Links -->
[middleware paths]:https://github.com/godaddy/gasket/blob/main/packages/gasket-plugin-express/README.md#middleware-paths
[streaming]: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
[App Router]: https://nextjs.org/docs/app/building-your-application/routing
[@gasket/plugin-command]: ../packages/gasket-plugin-command/README.md
[@gasket/plugin-intl]: ../packages/gasket-plugin-intl/README.md
[@gasket/intl]: ../packages/gasket-intl/README.md
[@gasket/react-intl]: ../packages/gasket-react-intl/README.md
[@gasket/plugin-data]: ../packages/gasket-plugin-data/README.md
[@gasket/data]: ../packages/gasket-data/README.md
[@gasket/gasket-plugin-data]: ../packages/gasket-plugin-data/README.md
[@gasket/gasket-plugin-docusaurus]: ../packages/gasket-plugin-docusaurus/README.md
[@gasket/gasket-plugin-data]: ../packages/gasket-plugin-data/README.md
