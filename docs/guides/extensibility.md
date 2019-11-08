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
  * analyze - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-analyze) - [flow chart](../images/lifecycle/plugins/analyze.svg)
  * assets - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-assets) - [flow chart](../images/lifecycle/plugins/assets.svg)
  * command - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-command) - [flow chart](../images/lifecycle/plugins/command.svg)
  * config - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-config) - [flow chart](../images/lifecycle/plugins/config.svg)
  * express - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-express) - [flow chart](../images/lifecycle/plugins/express.svg)
  * https - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-https) - [flow chart](../images/lifecycle/plugins/https.svg)
  * intl - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-intl) - [flow chart](../images/lifecycle/plugins/intl.svg)
  * jest - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-jest) - [flow chart](../images/lifecycle/plugins/jest.svg)
  * lifecycle - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-lifecycle) - [flow chart](../images/lifecycle/plugins/lifecycle.svg)
  * lint - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-lint) - [flow chart](../images/lifecycle/plugins/lint.svg)
  * log - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-log) - [flow chart](../images/lifecycle/plugins/log.svg)
  * mocha - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-mocha) - [flow chart](../images/lifecycle/plugins/mocha.svg)
  * nextjs - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-nextjs) - [flow chart](../images/lifecycle/plugins/nextjs.svg)
  * redux - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-redux) - [flow chart](../images/lifecycle/plugins/redux.svg)
  * serviceWorker - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-serviceWorker) - [flow chart](../images/lifecycle/plugins/serviceWorker.svg)
  * webpack - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-webpack) - [flow chart](../images/lifecycle/plugins/webpack.svg)
  * workbox - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-workbox) - [flow chart](../images/lifecycle/plugins/workbox.svg)
* Lifecycle Events
  * appEnvConfig - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-config#appenvconfig)
  * appRequestConfig - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-config#apprequestconfig)
  * build - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-build) - [flow chart](../images/lifecycle/events/build.svg)
  * composeServiceWorker - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-service-worker#composeserviceworker) - [flow chart](../images/lifecycle/events/composeServiceWorker.svg)
  * configure - docs TBD - [flow chart](../images/lifecycle/events/configure.svg)
  * create - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#create) - [flow chart](../images/lifecycle/events/create.svg)
  * errorMiddleware - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-express#errormiddleware)
  * express - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-express) - [flow chart](../images/lifecycle/events/express.svg)
  * getCommands - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-command#getcommands)
  * init - docs TBD - [flow chart](../images/lifecycle/events/init.svg)
  * initOclif - docs TBD - [flow chart](../images/lifecycle/events/initOclif.svg)
  * initReduxState - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-redux#initreduxstate) - [flow chart](../images/lifecycle/events/initReduxState.svg)
  * initReduxStore - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-redux#initreduxstore)
  * middleware - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-express#middleware) - [flow chart](../images/lifecycle/events/middleware.svg)
  * next - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-nextjs#next)
  * preboot - docs TBD - [flow chart](../images/lifecycle/events/preboot.svg)
  * serviceWorkerCacheKey - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-service-worker#serviceworkercachekey)
  * start - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#gasket-start) - [flow chart](../images/lifecycle/events/start.svg)
  * webpack - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-webpack#webpack) - [flow chart](../images/lifecycle/events/webpack.svg)
  * webpackChain - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-webpack#webpackchain)
  * workbox - [docs](https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-workbox#workbox)

<!-- END_LIFECYCLE_AUTOGEN -->

## Page Content

The content rendered on each of your application pages comes from `/pages/*` -
Your app-specific React component pages

[plugin engine]: /packages/gasket-plugin-engine
[lifecycle script]: /packages/gasket-plugin-lifecycle
[Configuration guide]: ./configuration.md
[plugins]: /packages
