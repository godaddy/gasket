<p align="center">
  <img alt="Gasket" src="site/logo-cover.svg" width="496">
</p>

<p align="center">
Framework Maker for JavaScript Applications
</p>

---
<section class="badge-section" align="center">

[![License][license-badge]][license]
[![Contributors][contributors-badge]][contributors]
[![PRs Welcome][prs-welcome-badge]][prs-welcome]
[![Code of Conduct][coc-badge]][coc]
[![tweet][tweet-badge]][tweet]

</section>

Gasket helps developers make frameworks to power their apps. There are several
presets and plugins available with which to make frameworks and construct apps.
The various commands, lifecycles, and structures are all enabled by different
plugins you can choose to use.

If you are new to Gasket, you might want to first give it a spin following the
[Quick Start Guide]. From there, reference the guides to start developing your
apps and making your frameworks.

> The tables of contents below are generated by the **docs** command enabled by
> [@gasket/plugin-docs], which is recommended to view app docs. Links will load
> the docs for the plugin or package that implements the feature.

<!-- START GENERATED -->

<!-- generated by `gasket docs` -->

## Guides

Help and explanations docs

| Name                          | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| [Quick Start Guide]           | Get up and running on Gasket                           |
| [Upgrades Guide]              | Steps necessary to upgrade major versions              |
| [Lifecycle Flowchart]         | A flowchart detailing how lifecycles are interrelated. |
| [Configuration Guide]         | Configuring Gasket apps                                |
| [Plugins Guide]               | How to use and author plugins                          |
| [Presets Guide]               | How to use and author presets                          |
| [Package Management Guide]    | Managing dependencies in Gasket apps                   |
| [Common "Gotchas"]            | Tips and tricks to be aware of                         |
| [Progressive Web Apps Guide]  | Making Progressive Web Apps (PWA) with Gasket          |
| [Express Setup Guide]         | Adding middleware and routes for Express               |
| [Next.js Routing Guide]       | Basic and advance routing for Next.js                  |
| [Next.js Deployment Guide]    | Steps to deploy a Next.js Gasket app                   |
| [Next.js Redux Guide]         | Using Redux with Next.js Gasket apps                   |
| [Webpack Configuration Guide] | Configuring Webpack in Gasket apps                     |

## Commands

Available commands

| Name      | Description                                 |
| --------- | ------------------------------------------- |
| [analyze] | Generate analysis report of webpack bundles |
| [build]   | Prepare the app to be started               |
| [create]  | Create a new Gasket app                     |
| [docs]    | Generate docs for the app                   |
| [help]    | Get usage details for Gasket commands       |
| [local]   | Build and start the app in development mode |
| [start]   | Run the prepared app                        |

## Lifecycles

Available lifecycles

| Name                    | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| [appEnvConfig]          | Adjust app level config after merged for the env              |
| [appRequestConfig]      | Adjust app level config for each request                      |
| [build][1]              | Prepare the app to be started                                 |
| [composeServiceWorker]  | Update the service worker script                              |
| [configure]             | Allows plugins to adjust config before command is run         |
| [create][2]             | App level plugins                                             |
| [createServers]         | Setup the `create-servers` options                            |
| [docsGenerate]          | Generate graphs for display in documation                     |
| [docsSetup]             | Set up what docs are captured and how to transform them       |
| [docsView]              | View the collated documentation                               |
| [errorMiddleware]       | Add Express style middleware for handling errors with Fastify |
| [errorMiddleware][3]    | Add Express style middleware for handling errors              |
| [express]               | Modify the Express instance to for adding endpoints           |
| [fastify]               | Modify the Fastify instance to for adding endpoints           |
| [getCommands]           | Allows plugins to add CLI commands                            |
| [init]                  | Signals the start of any Gasket command before it is run      |
| [initReduxState]        | Initializes state of the Redux store                          |
| [initReduxStore]        | Plugin access to Redux store instance                         |
| [initWebpack]           | Create a webpack config                                       |
| [intlLocale]            | Set the language for which locale files to load               |
| [logTransports]         | Setup Winston log transports                                  |
| [manifest]              | Modify the the web manifest for a request                     |
| [metadata]              | Allows plugins to adjust their metadata                       |
| [metrics]               | Collect metrics for an app                                    |
| [middleware]            | Add Express style middleware for Fastify                      |
| [middleware][4]         | Add Express style middleware                                  |
| [next]                  | Update the next app instance before prepare                   |
| [nextConfig]            | Setup the next config                                         |
| [nextExpress]           | Access the prepared next app and express instance             |
| [postCreate]            | App level plugins                                             |
| [preboot]               | Any setup before the app starts                               |
| [prompt]                | Gasket config for an app                                      |
| [servers]               | Access to the server instances                                |
| [serviceWorkerCacheKey] | Get cache keys for request based service workers              |
| [start][5]              | Run the prepared app                                          |
| [terminus]              | Setup the `terminus` options                                  |
| [webpack]               | Modify webpack config with partials or by mutating            |
| [webpackChain]          | Setup webpack config by chaining                              |
| [webpackConfig]         | Transform the webpack config, with the help of webpack-merge  |
| [workbox]               | Setup Workbox config and options                              |

## Structures

Available structure

| Name               | Description                                            |
| ------------------ | ------------------------------------------------------ |
| [.docs/]           | Output of the docs command                             |
| [config/]          | App configuration using environment files              |
| [lifecycles/]      | JavaScript files to hook lifecycles with matching name |
| [pages/]           | NextJS routing                                         |
| [plugins/]         | One-off plugins for apps                               |
| [public/]          | NextJS static files                                    |
| [public/locales/]  | Locale JSON files with translation strings             |
| test/              | Test files                                             |
| [app.config.js]    | App configuration with environment overrides           |
| [gasket.config.js] | Gasket config for an app                               |
| [jest.config.js]   | Jest configuration                                     |
| [redux/store.js]   | Setup to make Redux store                              |

## Presets

Available presets

| Name                    | Version | Description                                |
| ----------------------- | ------- | ------------------------------------------ |
| [@gasket/preset-api]    | 6.10.0  | Create Express-based API with Gasket       |
| [@gasket/preset-nextjs] | 6.10.0  | Basic NextJS Framework                     |
| [@gasket/preset-pwa]    | 6.10.0  | Turn Gasket apps into Progressive Web Apps |

## Plugins

Available plugins

| Name                            | Version | Description                                                                |
| ------------------------------- | ------- | -------------------------------------------------------------------------- |
| [@gasket/plugin-analyze]        | 6.10.0  | Gasket Analyzer Plugin                                                     |
| [@gasket/plugin-command]        | 6.10.0  | Plugin to enable other plugins to inject new gasket commands               |
| [@gasket/plugin-config]         | 6.10.0  | Supports application-specific (non-Gasket) configuration                   |
| [@gasket/plugin-docs]           | 6.10.0  | Centralize doc files from plugins and modules                              |
| [@gasket/plugin-docs-graphs]    | 6.10.0  | Generate mermaid graphs of an applications gasket lifecycles               |
| [@gasket/plugin-docsify]        | 6.10.0  | View collated docs with Docsify                                            |
| [@gasket/plugin-elastic-apm]    | 6.10.0  | Adds Elastic APM instrumentation to your application                       |
| [@gasket/plugin-express]        | 6.10.0  | Adds express support to your application                                   |
| [@gasket/plugin-fastify]        | 6.10.0  | Adds fastify support to your application                                   |
| [@gasket/plugin-git]            | 6.10.0  | Adds git support to your application                                       |
| [@gasket/plugin-https]          | 6.10.0  | Create http/s servers with graceful termination                            |
| [@gasket/plugin-intl]           | 6.10.0  | NodeJS script to build localization files.                                 |
| [@gasket/plugin-jest]           | 6.10.0  | Integrated jest into your application.                                     |
| [@gasket/plugin-lifecycle]      | 6.10.0  | Allows a gasket/ directory to be used for lifecycle hooks in applications. |
| [@gasket/plugin-lint]           | 6.10.0  | Adds GoDaddy standard linting to your application                          |
| [@gasket/plugin-log]            | 6.10.0  | Gasket log plugin                                                          |
| [@gasket/plugin-manifest]       | 6.10.0  | The web app manifest for progressive Gasket applications                   |
| [@gasket/plugin-metadata]       | 6.10.0  | Adds metadata to gasket lifecycles                                         |
| [@gasket/plugin-metrics]        | 6.10.0  | Collect metrics for gasket commands                                        |
| [@gasket/plugin-mocha]          | 6.10.0  | Integrates mocha based testing in to your Gasket application               |
| [@gasket/plugin-nextjs]         | 6.10.0  | Adds Next support to your application                                      |
| [@gasket/plugin-redux]          | 6.10.0  | Gasket Redux Setup                                                         |
| [@gasket/plugin-service-worker] | 6.10.0  | Gasket Service Worker Plugin                                               |
| [@gasket/plugin-start]          | 6.10.0  | Adds commands for building and starting Gasket apps                        |
| [@gasket/plugin-swagger]        | 6.10.0  | Generate and serve swagger docs                                            |
| [@gasket/plugin-webpack]        | 6.10.0  | Adds webpack support to your application                                   |
| [@gasket/plugin-workbox]        | 6.10.0  | Gasket Workbox Plugin                                                      |

## Modules

Supporting modules

| Name                       | Version | Description                                                                          |
| -------------------------- | ------- | ------------------------------------------------------------------------------------ |
| [@gasket/assets]           | 6.10.0  | Gasket assets                                                                        |
| [@gasket/cli]              | 6.10.0  | CLI for rapid application development with gasket                                    |
| [@gasket/data]             | 6.10.0  | Helper package for accessing embedded Gasket Data in the browser                     |
| [@gasket/engine]           | 6.10.0  | Plugin engine for gasket                                                             |
| [@gasket/fetch]            | 6.10.0  | Gasket Fetch API                                                                     |
| [@gasket/helper-intl]      | 6.10.0  | Internal helpers used by loaders to resolve locale file paths                        |
| [@gasket/log]              | 6.10.0  | Gasket client and server logger                                                      |
| [@gasket/nextjs]           | 6.10.0  | Gasket integrations for Next.js apps                                                 |
| [@gasket/react-intl]       | 6.10.0  | React component library to enable localization for gasket apps.                      |
| [@gasket/redux]            | 6.10.0  | Gasket Redux Configuration                                                           |
| [@gasket/resolve]          | 6.10.0  | Essential module resolution & configuration management for gasket plugins & presets. |
| [@gasket/typescript-tests] | 6.10.0  | Not a published package; hosts unit tests to verify TypeScript support               |
| [@gasket/utils]            | 6.10.0  | Reusable utilities for Gasket internals                                              |
| [create-gasket-app]        | 6.10.0  | starter pack for creating a gasket app                                               |

<!-- LINKS -->

[Quick Start Guide]:docs/quick-start.md
[Upgrades Guide]:docs/upgrades.md
[Lifecycle Flowchart]:/docs/generated-docs/lifecycle-graphs.md
[Configuration Guide]:/packages/gasket-cli/docs/configuration.md
[Plugins Guide]:/packages/gasket-cli/docs/plugins.md
[Presets Guide]:/packages/gasket-cli/docs/presets.md
[Package Management Guide]:/packages/gasket-cli/docs/package-management.md
[Common "Gotchas"]:/packages/gasket-cli/docs/gotchas.md
[Progressive Web Apps Guide]:/packages/gasket-preset-pwa/docs/pwa-support.md
[Express Setup Guide]:/packages/gasket-plugin-express/docs/setup.md
[Next.js Routing Guide]:/packages/gasket-plugin-nextjs/docs/routing.md
[Next.js Deployment Guide]:/packages/gasket-plugin-nextjs/docs/deployment.md
[Next.js Redux Guide]:/packages/gasket-plugin-nextjs/docs/redux.md
[Webpack Configuration Guide]:/packages/gasket-plugin-webpack/docs/webpack.md
[analyze]:/packages/gasket-plugin-analyze/README.md#commands
[build]:/packages/gasket-plugin-start/README.md#build-command
[create]:/packages/gasket-cli/README.md#commands
[docs]:/packages/gasket-plugin-docs/README.md#commands
[help]:/packages/gasket-cli/README.md#commands
[local]:/packages/gasket-plugin-start/README.md#local-command
[start]:/packages/gasket-plugin-start/README.md#start-command
[appEnvConfig]:/packages/gasket-plugin-config/README.md#appEnvConfig
[appRequestConfig]:/packages/gasket-plugin-config/README.md#appRequestConfig
[1]:/packages/gasket-plugin-start/README.md#build
[composeServiceWorker]:/packages/gasket-plugin-service-worker/README.md#composeServiceWorker
[configure]:/packages/gasket-plugin-command/README.md#configure
[2]:/packages/gasket-cli/README.md#create
[createServers]:/packages/gasket-plugin-https/README.md#createServers
[docsGenerate]:/packages/gasket-plugin-docs/README.md#docsGenerate
[docsSetup]:/packages/gasket-plugin-docs/README.md#docsSetup
[docsView]:/packages/gasket-plugin-docs/README.md#docsView
[errorMiddleware]:/packages/gasket-plugin-fastify/README.md#errorMiddleware
[3]:/packages/gasket-plugin-express/README.md#errorMiddleware
[express]:/packages/gasket-plugin-express/README.md#express
[fastify]:/packages/gasket-plugin-fastify/README.md#express
[getCommands]:/packages/gasket-plugin-command/README.md#getCommands
[init]:/packages/gasket-plugin-command/README.md#init
[initReduxState]:/packages/gasket-plugin-redux/README.md#initReduxState
[initReduxStore]:/packages/gasket-plugin-redux/README.md#initReduxStore
[initWebpack]:/packages/gasket-plugin-webpack/README.md#initwebpack
[intlLocale]:/packages/gasket-plugin-intl/README.md#intlLocale
[logTransports]:/packages/gasket-plugin-log/README.md#logTransports
[manifest]:/packages/gasket-plugin-manifest/README.md#manifest
[metadata]:/packages/gasket-plugin-metadata/README.md#metadata
[metrics]:/packages/gasket-plugin-metrics/README.md#metrics
[middleware]:/packages/gasket-plugin-fastify/README.md#middleware
[4]:/packages/gasket-plugin-express/README.md#middleware
[next]:/packages/gasket-plugin-nextjs/README.md#next
[nextConfig]:/packages/gasket-plugin-nextjs/README.md#nextConfig
[nextExpress]:/packages/gasket-plugin-nextjs/README.md#nextExpress
[postCreate]:/packages/gasket-cli/README.md#postcreate
[preboot]:/packages/gasket-plugin-start/README.md#start
[prompt]:/packages/gasket-cli/README.md#prompt
[servers]:/packages/gasket-plugin-https/README.md#servers
[serviceWorkerCacheKey]:/packages/gasket-plugin-service-worker/README.md#serviceWorkerCacheKey
[5]:/packages/gasket-plugin-start/README.md#start
[terminus]:/packages/gasket-plugin-https/README.md#terminus
[webpack]:/packages/gasket-plugin-webpack/README.md#webpack
[webpackChain]:/packages/gasket-plugin-webpack/README.md#webpackChain
[webpackConfig]:/packages/gasket-plugin-webpack/README.md#webpackConfig
[workbox]:/packages/gasket-plugin-workbox/README.md#workbox
[.docs/]:/packages/gasket-plugin-docs/README.md#options
[config/]:/packages/gasket-plugin-config/README.md
[lifecycles/]:/packages/gasket-plugin-lifecycle/README.md
[pages/]:https://nextjs.org/docs/routing/introduction
[plugins/]:/packages/gasket-cli/docs/plugins.md#one-off-plugins
[public/]:https://nextjs.org/docs/basic-features/static-file-serving
[public/locales/]:/packages/gasket-plugin-intl/README.md#Options
[app.config.js]:/packages/gasket-plugin-config/README.md
[gasket.config.js]:/packages/gasket-cli/docs/configuration.md
[jest.config.js]:https://jestjs.io/docs/configuration
[redux/store.js]:/packages/gasket-plugin-redux/README.md
[@gasket/preset-api]:/packages/gasket-preset-api/README.md
[@gasket/preset-nextjs]:/packages/gasket-preset-nextjs/README.md
[@gasket/preset-pwa]:/packages/gasket-preset-pwa/README.md
[@gasket/plugin-analyze]:/packages/gasket-plugin-analyze/README.md
[@gasket/plugin-command]:/packages/gasket-plugin-command/README.md
[@gasket/plugin-config]:/packages/gasket-plugin-config/README.md
[@gasket/plugin-docs]:/packages/gasket-plugin-docs/README.md
[@gasket/plugin-docs-graphs]:/packages/gasket-plugin-docs-graphs/README.md
[@gasket/plugin-docsify]:/packages/gasket-plugin-docsify/README.md
[@gasket/plugin-elastic-apm]:/packages/gasket-plugin-elastic-apm/README.md
[@gasket/plugin-express]:/packages/gasket-plugin-express/README.md
[@gasket/plugin-fastify]:/packages/gasket-plugin-fastify/README.md
[@gasket/plugin-git]:/packages/gasket-plugin-git/README.md
[@gasket/plugin-https]:/packages/gasket-plugin-https/README.md
[@gasket/plugin-intl]:/packages/gasket-plugin-intl/README.md
[@gasket/plugin-jest]:/packages/gasket-plugin-jest/README.md
[@gasket/plugin-lifecycle]:/packages/gasket-plugin-lifecycle/README.md
[@gasket/plugin-lint]:/packages/gasket-plugin-lint/README.md
[@gasket/plugin-log]:/packages/gasket-plugin-log/README.md
[@gasket/plugin-manifest]:/packages/gasket-plugin-manifest/README.md
[@gasket/plugin-metadata]:/packages/gasket-plugin-metadata/README.md
[@gasket/plugin-metrics]:/packages/gasket-plugin-metrics/README.md
[@gasket/plugin-mocha]:/packages/gasket-plugin-mocha/README.md
[@gasket/plugin-nextjs]:/packages/gasket-plugin-nextjs/README.md
[@gasket/plugin-redux]:/packages/gasket-plugin-redux/README.md
[@gasket/plugin-service-worker]:/packages/gasket-plugin-service-worker/README.md
[@gasket/plugin-start]:/packages/gasket-plugin-start/README.md
[@gasket/plugin-swagger]:/packages/gasket-plugin-swagger/README.md
[@gasket/plugin-webpack]:/packages/gasket-plugin-webpack/README.md
[@gasket/plugin-workbox]:/packages/gasket-plugin-workbox/README.md
[@gasket/assets]:/packages/gasket-assets/README.md
[@gasket/cli]:/packages/gasket-cli/README.md
[@gasket/data]:/packages/gasket-data/README.md
[@gasket/engine]:/packages/gasket-engine/README.md
[@gasket/fetch]:/packages/gasket-fetch/README.md
[@gasket/helper-intl]:/packages/gasket-helper-intl/README.md
[@gasket/log]:/packages/gasket-log/README.md
[@gasket/nextjs]:/packages/gasket-nextjs/README.md
[@gasket/react-intl]:/packages/gasket-react-intl/README.md
[@gasket/redux]:/packages/gasket-redux/README.md
[@gasket/resolve]:/packages/gasket-resolve/README.md
[@gasket/typescript-tests]:/packages/gasket-typescript-tests/README.md
[@gasket/utils]:/packages/gasket-utils/README.md
[create-gasket-app]:/packages/create-gasket-app/README.md
<!-- END GENERATED -->

## License

Gasket is [MIT licensed](./LICENSE.md).

<!-- badges -->
[license-badge]: https://img.shields.io/github/license/godaddy/gasket?style=flat-square
[license]: https://opensource.org/licenses/MIT
[prs-welcome-badge]: https://img.shields.io/badge/PRs-welcome-blue.svg?style=flat-square
[prs-welcome]: https://github.com/godaddy/gasket/blob/master/CONTRIBUTING.md
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square&color=blue
[coc]: https://github.com/godaddy/gasket/blob/master/CODE_OF_CONDUCT.md
[contributors-badge]: https://img.shields.io/github/contributors/godaddy/gasket.svg?style=flat-square
[contributors]: https://github.com/godaddy/gasket/graphs/contributors
[tweet-badge]: https://img.shields.io/twitter/url?url=https%3A%2F%2Ftwitter.com%2Fgasketjs?style=flat-square
[tweet]: https://twitter.com/intent/tweet?text=Check%20out%20gasket!%20https://github.com/godaddy/gasket%20%F0%9F%91%8D
