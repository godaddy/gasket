# Extending Core Gasket Functionality

The Gasket framework assembles a lot of pieces of functionality into one
application platform. It may be daunting figuring out how to change its default
behavior to fit your needs. This document will point you to the proper resources
on customizing your application.

## Gasket Configuration

Much of Gasket's behavior can be driven through updating your
`gasket.config.js[on]` file. See the [Configuration guide] for more details on
the Gasket config file, and see the documentation for the [plugins] to see which
config settings are available.

<!--
    TBD: Create a unified table of all configuration settings so you don't have
    to hunt for what you need!
-->

## Lifecycle Hooks

Most of gasket's back-end functionality is implemented through a system of
_plugins_. If you're wanting to add additional functionality, you should
understand the [plugin engine], specifically the concept of events and hooks.
By authoring a custom plugin or a [lifecycle script], you can inject new
behaviors into your server or build process.

The following is a list of all Gasket commands, plugins, and lifecycle events,
and flowcharts showing how they all connect.

Lifecycle keys

<!-- Do not edit; run `npm run generate` to generate this content. -->
<!-- BEGIN_LIFECYCLE_AUTOGEN -->

* [Flowchart legend](../images/lifecycle/legend.svg)
* [Full lifecycle flowchart](../images/lifecycle/full.svg)
* Gasket Commands
  * analyze - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-analyze) - [flow chart](../images/lifecycle/commands/analyze.svg)
  * build - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-build) - [flow chart](../images/lifecycle/commands/build.svg)
  * create - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-create) - [flow chart](../images/lifecycle/commands/create.svg)
  * local - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-local) - [flow chart](../images/lifecycle/commands/local.svg)
  * start - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-start) - [flow chart](../images/lifecycle/commands/start.svg)
* Plugins
  * analyze - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-analyze-plugin) - [flow chart](../images/lifecycle/plugins/analyze.svg)
  * assets - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-assets-plugin) - [flow chart](../images/lifecycle/plugins/assets.svg)
  * command - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-command-plugin) - [flow chart](../images/lifecycle/plugins/command.svg)
  * config - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-config-plugin) - [flow chart](../images/lifecycle/plugins/config.svg)
  * express - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-express-plugin) - [flow chart](../images/lifecycle/plugins/express.svg)
  * https - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-https-plugin) - [flow chart](../images/lifecycle/plugins/https.svg)
  * intl - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-intl-plugin) - [flow chart](../images/lifecycle/plugins/intl.svg)
  * jest - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-jest-plugin) - [flow chart](../images/lifecycle/plugins/jest.svg)
  * lifecycle - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-lifecycle-plugin) - [flow chart](../images/lifecycle/plugins/lifecycle.svg)
  * lint - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-lint-plugin) - [flow chart](../images/lifecycle/plugins/lint.svg)
  * log - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-log-plugin) - [flow chart](../images/lifecycle/plugins/log.svg)
  * mocha - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-mocha-plugin) - [flow chart](../images/lifecycle/plugins/mocha.svg)
  * nextjs - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-nextjs-plugin) - [flow chart](../images/lifecycle/plugins/nextjs.svg)
  * redux - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-redux-plugin) - [flow chart](../images/lifecycle/plugins/redux.svg)
  * serviceWorker - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-serviceWorker-plugin) - [flow chart](../images/lifecycle/plugins/serviceWorker.svg)
  * webpack - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-webpack-plugin) - [flow chart](../images/lifecycle/plugins/webpack.svg)
  * workbox - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-workbox-plugin) - [flow chart](../images/lifecycle/plugins/workbox.svg)
* Lifecycle Events
  * appEnvConfig - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-config-plugin#appenvconfig)
  * appRequestConfig - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-config-plugin#apprequestconfig)
  * build - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-build) - [flow chart](../images/lifecycle/events/build.svg)
  * composeServiceWorker - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-service-worker-plugin#composeserviceworker) - [flow chart](../images/lifecycle/events/composeServiceWorker.svg)
  * configure - docs TBD - [flow chart](../images/lifecycle/events/configure.svg)
  * create - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#create) - [flow chart](../images/lifecycle/events/create.svg)
  * errorMiddleware - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-express-plugin#errormiddleware)
  * express - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-express-plugin) - [flow chart](../images/lifecycle/events/express.svg)
  * getCommands - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-command-plugin#getcommands)
  * init - docs TBD - [flow chart](../images/lifecycle/events/init.svg)
  * initOclif - docs TBD - [flow chart](../images/lifecycle/events/initOclif.svg)
  * initReduxState - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-redux-plugin#initreduxstate) - [flow chart](../images/lifecycle/events/initReduxState.svg)
  * initReduxStore - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-redux-plugin#initreduxstore)
  * middleware - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-express-plugin#middleware) - [flow chart](../images/lifecycle/events/middleware.svg)
  * next - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-nextjs-plugin#next)
  * preboot - docs TBD - [flow chart](../images/lifecycle/events/preboot.svg)
  * serviceWorkerCacheKey - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-service-worker-plugin#serviceworkercachekey)
  * start - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-start) - [flow chart](../images/lifecycle/events/start.svg)
  * webpack - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-webpack-plugin#webpack) - [flow chart](../images/lifecycle/events/webpack.svg)
  * webpackChain - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-webpack-plugin#webpackchain)
  * workbox - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-workbox-plugin#workbox)

<!-- END_LIFECYCLE_AUTOGEN -->

## Page Content

The content rendered on each of your application pages comes from `/pages/*` -
Your app-specific React component pages

[plugin engine]: /packages/gasket-plugin-engine
[lifecycle script]: /packages/gasket-plugin-lifecycle
[Configuration guide]: ./configuration.md
[plugins]: /packages
