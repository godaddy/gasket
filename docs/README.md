# Gasket

Gasket is a framework to help you quickly create a node+React web application. 
You'll get server-side rendering, Redux, routing, SASS, bundling, and more right 
out of the box. For a description of all the technologies, see the [Gasket Tech Stack]
document.

## Table of Contents

- [Guides]
- [CLI]
- [Structure]
  - [Special Directories]
    - [pages/]
    - [locales/]
    - [config/]
    - [lifecycles/]
    - [plugins/]
  - [Common Directories]
    - [components/]
    - [lib/]
  - [Special Files]
    - [package.json]
    - [gasket.config.js]
    - [routes.js]
    - [store.js]
- [Components]
- [Plugins]
- [Presets]
- [Utils]
- [Code Style]
- [Further Reading]

## Guides

The following documents provide more information on how to use Gasket.
For an overview of what is available for Gasket apps continue reading below.

- [Quick Start Guide]
- [Package Management Guide]
- [Routing Guide]
- [Configuration Guide]
- [Testing Guide]
- [Lifecycle Guide]
- [Webpack Guide]
- [Deployment Guide]
- [Custom Express Routes/Middleware Guide]
- [Extensibility Guide]
- [White Labeling Guide]
- [Common "Gotchas"]
- [State Management Guide]

## CLI

To get started with Gasket, you will first you need the [cli][@gasket/cli].

```bash
npm install --global @gasket/cli
```

OR

```bash
yarn global add @gasket/cli
```

Gasket apps can use either `npm` or `yarn` for their package manager.
We reference `npm` for the docs here-on, so assume interchangeability with
`yarn` unless otherwise noted.

The first command you run is:

```bash
gasket create your-app-name
```

Where `your-app-name` is the name of you app.

The create command lays out the scaffolding and initial structure for your app
and gives you a working app that you can spin up locally with no other upfront
config. See the [Quick Start Guide] for additional details in getting a
new Gasket app set up and running.

There are several other commands available from [@gasket/cli].
You can read up on these in the [CLI Commands] docs.

## Structure

A typical Gasket app may have a structure that resembles:

```bash
# special directories
pages/
locales/
config/
plugins/
lifecycles/

# common directories
components/
lib/

# special files
package.json
gasket.config.js
routes.js
store.js

# generated test and dotfiles

```

### Special Directories

Directories whose name indicates a behavior for how Gasket and/or Next.js
utilizes the files within. Changing the directory name means losing
the behavior.

#### pages/

Pages are a feature that comes with [Next.js]. These are top-level React
components which also serve as your routes. For example, an `index.js` file in
this directory is what is loaded when a user browses to `/` on your
app. An about.js file becomes `/about`, and so on.

Page components can have their props initialized for server rendering and
routing in the browser by using `getInitialProps`. Routes can be parameterized
in order for pages to receive props from the urls path or query params. This is
discussed in more detail in the [Routing Guide].

Files in this directory are registered as entry points into the webpack config
for code splitting purposes to control load prioritization of your app.

#### locales/

These are JSON files with your text translations, to provide localized text for 
your users. Locale files can be organized by culture or market id,
i.e. `en-US.json`,  `fr.json`, or `fr-FR.json`.
Alternatively, organized with a namespace within culture directories,
i.e. `en-US/home.json` and `en-US/about.json`.

Locales can then be made available to your app at the page or component level
using the components from [@gasket/intl]. Additional details and configuration
for managing the locale files are described in the [@gasket/intl-plugin] docs.

#### config/

App-level configuration which can be established per environment by files
per each. For example, you could have `development.js` and `production.js`
files, whose configuration is loaded and available to your app based
on the runtime environment. This is enabled by the [@gasket/config-plugin],
whose docs provide greater details on how config files can be structured.

Gasket-level plugins or Next.js configuration can be adjusted in the
[gasket.config.js] file.

#### plugins/

The many features of Gasket are built as plugins, and the ability to create
app-level plugins is available. Any file in this plugins directory, following
the `<name>-plugin.js` naming convention, is automatically picked up by the
[plugin-engine][@gasket/plugin-engine]. This gives you access to tie into
lifecycles, set timings, or even add your own hooks.

Plugins are designed with the ability to be reused across apps. So, if you
find yourself duplicating plugin code, be sure to separate it as an npm package
which can be versioned, published, and imported to your different apps.

#### lifecycles/

The simplest way to have app-specific code which can hook into the
[plugin-engine][@gasket/plugin-engine], is to have a file per lifecycle.
For example, a `middleware.js` file in this directory is executed during
the *middleware* lifecycle. This feature is enabled by the
[@gasket/lifecycle-plugin] whose docs has more details and examples.

[Learn more about all available lifecycles](guides/lifecycles.md)

### Common Directories

Directories that have no "special" properties, but are commonly used for
organizing app code.

#### components/

React components and code used by your page components can exist here.

#### lib/

Or maybe **common/**. Basically, code that is used in _both_ React and
Node+Express code.

For example, any code used by your Redux store creators, such as
reducers, constants, etc., may live here. The reason being that the Redux
store is instantiated by Node to be available to the Express server,
yet is also bundled by webpack for use in the browser.

Also note, any code loaded directly by Node should be authored as
CommonJS-style modules as mentioned in [Common "Gotchas"]. This is another
reason to use a lib directory; to separate this form of code from your other
app code, such as your components.

### Special Files

Special config-like files used by Gasket.

#### package.json

Configuration for your app's scripts and node modules go here and comes
preconfigured with all the proper dependencies needed to run a Gasket app.
This is used by both [npm][npm package.json] and [yarn][yarn package.json]
package managers and can also include configuration for other tools.

#### gasket.config.js

Configuring Gasket plugins or additional Next.js config can be handle here.
This file is expected by [@gasket/plugin-engine] and each of the [plugins] will
describe in their docs what configuration options are available.

#### routes.js

This special file is discussed in the [advanced routing] guide which utilizes
[next-routes] for setting up parameterized routes for your pages.

Enabled by the [@gasket/nextjs-plugin], it can be configured to point to a
different file instead by setting the `routes` property of `gasket.config.js`

#### store.js

By default, Gasket uses the `make-store` file from [@gasket/redux].
However, if you want to configure the make store function, this special file
is used instead. This feature is enabled by [@gasket/redux-plugin],
which has examples of configuring the store creator.

It is possible to configure the plugin to point to a different file instead
by setting the `redux.makeStore` property of `gasket.config.js`.

## Components

- [@gasket/intl] - Require locales for pages or components.
- [@gasket/redux] - Redux store configuration and reducer attachment.

## Presets

Presets are a collection of plugins. See [Configuring Plugins] for details.

## Plugins

Plugins available for use by Gasket apps. For details on adding and removing plugins,
see [Configuring Plugins].

### Defaults

- [@gasket/analyze-plugin] - For `gasket analyze` to generate bundle reports.
- [@gasket/assets-plugin] - Adds asset bundling and SVG optimization.
- [@gasket/config-plugin] - Enables [config/] dir for app-level config.
- [@gasket/express-plugin] - Add `express` to your application.
- [@gasket/https-plugin] - Creates `http` and `https` servers based on the given gasket configuration.
- [@gasket/intl-plugin] - Discover, bundle, and serve locale files.
- [@gasket/lifecycle-plugin] - Enables [lifecycles/] dir for app-level hooks.
- [@gasket/log-plugin] - Sets up server logger instance.
- [@gasket/nextjs-plugin] - Adds `next` to your application.
- [@gasket/redux-plugin] - Enables [store.js] and redux store for Express.
- [@gasket/webpack-plugin] - Adds `webpack` support to your application.

#### Extras

- [@gasket/proxy-plugin] - Make functions and endpoints for requests to services.

## Utils

Additional modules for use within your application code.

- [@gasket/log] - Add logging with support for both server and browser.
- [@gasket/fetch] - Fetch API that works on both server and browser.
- [reduxful] - Generate Redux actions, reducers, and selectors for APIs.

## Code Style

Development modules to help with code quality.

- [godaddy-style] - GoDaddy Javascript style eslint rules
- [@godaddy/eslint-plugin-react-intl] - eslint checks for react-intl (Coming soon)
- [stylelint-config-godaddy] - CSS and SASS style linting rules

## Further Reading

- [Gasket Docs][Gasket Docs] - You're already here!
- [Gasket Tech Stack] - Description of all the technologies used by Gasket
- [Next.js] - Docs and examples from the underlying framework.

<!-- TOC -->
[CLI]:#cli
[Structure]:#structure

[Special Directories]:#special-directories
[pages/]:#pages
[locales/]:#locales
[config/]:#config
[lifecycles/]:#lifecycles
[plugins/]:#plugins

[Common Directories]:#common-directories
[components/]:#components
[lib/]:#lib

[Special Files]:#special-files
[package.json]:#packagejson
[gasket.config.js]:#gasketconfigjs
[routes.js]:#routesjs
[store.js]:#storejs

[Components]:#components-1
[Plugins]:#plugins-1
[Presets]:#presets
[Utils]:#utils
[Code Style]:#code-style
[Guides]:#guides
[Further Reading]:#further-reading

<!-- Docs Links -->
[Quick Start Guide]: guides/quick-start.md
[Package Management Guide]: guides/package-management.md
[Routing Guide]: guides/routing.md
[Configuration Guide]: guides/configuration.md
[Testing Guide]: guides/testing.md
[Lifecycle Guide]: guides/lifecycles.md
[Webpack Guide]: guides/webpack.md
[Deployment Guide]: guides/deployment.md
[Custom Express Routes/Middleware Guide]: guides/express.md
[Extensibility Guide]: guides/extensibility.md
[White Labeling Guide]: guides/white-labeling.md
[Common "Gotchas"]: guides/gotchas.md
[Migrating from HUI]: guides/from-hui.md
[Gasket Tech Stack]: guides/tech-stack.md
[State Management Guide]: guides/state-management.md

<!-- Doc Details Links -->
[Advanced Routing]: guides/routing.md#advanced-routing
[Gasket Docs]: README.md

<!-- Gasket Repo Links -->
[@gasket/cli]:https://github.com/godaddy/gasket/tree/master/packages/gasket-cli  
[@gasket/nextjs-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-nextjs-plugin#gasketnextjs-plugin
[@gasket/webpack-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-webpack-plugin#gasketwebpack-plugin
[@gasket/express-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-express-plugin#gasketexpress-plugin
[@gasket/intl]:https://github.com/godaddy/gasket/tree/master/packages/gasket-intl
[@gasket/redux]:https://github.com/godaddy/gasket/tree/master/packages/gasket-redux#gasketredux
[@gasket/log]:https://github.com/godaddy/gasket/tree/master/packages/gasket-log#gasketlog
[@gasket/analyze-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-analyze-plugin#gasketanalyze-plugin
[@gasket/assets-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-assets-plugin
[@gasket/config-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-config-plugin#gasketconfig-plugin
[@gasket/intl-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-intl-plugin
[@gasket/lifecycle-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-lifecycle-plugin#gasketlifecycle-plugin
[@gasket/log-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-log-plugin#gasket-log-plugin
[@gasket/proxy-plugin]:https://github.com/godaddy/gasket/tree/master/packages/proxy-plugin
[@gasket/redux-plugin]:https://github.com/godaddy/gasket/tree/master/packages/gasket-redux-plugin
[@gasket/plugin-engine]:https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-engine#gasketplugin-engine
[@gasket/fetch]:https://github.com/godaddy/gasket/tree/master/packages/gasket-fetch#gasketfetch
[stylelint-config-godaddy]:https://github.com/godaddy/stylelint-config-godaddy
[@gasket/https-plugin]: https://github.com/godaddy/gasket/tree/master/packages/gasket-https-plugin#gaskethttps-plugin

<!-- Other Repo Links -->
[reduxful]:https://github.com/godaddy/reduxful
<!-- TODO: fill in correct link when opensourced -->
[@godaddy/eslint-plugin-react-intl]: https://github.com/eslint-plugin-react-intl-link-to-be-arranged

<!-- Gasket Repo Docs Links -->
[CLI Commands]:https://github.com/godaddy/gasket/tree/master/packages/gasket-cli#commands
[Configuring Plugins]:https://github.com/godaddy/gasket/tree/master/packages/gasket-plugin-engine#configuring-plugins

<!-- Next.js Links -->
[Next.js]:https://github.com/zeit/next.js
[Custom Document]:https://github.com/zeit/next.js/#custom-document
[Custom App]:https://github.com/zeit/next.js/#custom-app

<!-- External Links -->
[godaddy-style]:https://github.com/godaddy/javascript#godaddy-style
[next-routes]:https://github.com/fridays/next-routes
[npm package.json]:https://docs.npmjs.com/files/package.json
[yarn package.json]:https://yarnpkg.com/lang/en/docs/package-json/
