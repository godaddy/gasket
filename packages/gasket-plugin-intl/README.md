# @gasket/plugin-intl

This primary responsibility of this plugin is to build a manifest of locale
settings for loader packages to load locale paths.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-intl
```

#### Existing apps

```
npm i @gasket/plugin-intl
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-intl'
    ]
  }
}
```

## Configuration

To be set in under `intl` in the `gasket.config.js`. No configuration is
required. However, these options exist to customize an app's setup.

### Options

- `basePath` - (string) Base URL where locale files are served
- `defaultPath` - (string) Path to endpoint with JSON files (default:
  `/locales`). See [Locales Path] section.
- `defaultLocale` - (string) Locale to fallback to when loading files (default:
  `en`)
- `locales` - (string[]) Ordered list of accepted locales. If set, the preferred
  locale will be resolved based on the request `accept-language` header.
- `localesMap` - (object) Mapping of locales to share files. See [Locales Map]
  section.
- `localesDir` - (string) Path to on-disk directory where locale files exists
  (default: `./public/locales`)
- `manifestFilename` - (string) Change the name of the manifest file (default:
  `locales-manifest.json`)
- `serveStatic` - (boolean|string) Enables ability to serve static locale files.
  If set to `true`, the app will use the `defaultPath` as the static endpoint
  path. This option can also be set to a string, to be used as the static
  endpoint path.
- `modules` - (boolean|object) Enable locale files collation from node modules.
  Disabled by default, enable by setting to an object with options below, or set
  to `true` to use the default options. See [Module Locales] section.
  - `localesDir` - (string) Lookup dir for module files (default: `locales`)
  - `excludes` - (string[]) List of modules to ignore
- `nextRouting` - (boolean) Enable [Next.js Routing] when used with
  [@gasket/plugin-nextjs]. (default: true)

#### Example config

```js
// gasket.config.js

module.exports = {
  intl: {
    defaultLocale: 'fr-FR',
    locales: ['fr-FR', 'en-US', 'zh-TW', 'zh-CN', 'zh-HK', 'zh-SG'],
    localesMap: {
      'zh-HK': 'zh-TW',
      'zh-SG': 'zh-CN'
    }
  }
}
```

## Usage

Loader packages, such as [@gasket/react-intl] for React and Next.js apps, can
utilize settings from the [locales manifest] for loading locale files. Also, for
apps with a server element, request based settings can be made available with
the response via [Gasket data].

For the most part, app developers should not need to interface directly with
these setting objects, but rather understand how loaders use them to resolve
locale paths for structuring their locale files and constructing their apps.
This is what will be described in the next few sections.

### Locales Path

A `localesPath` should be the URL endpoint where static JSON files are
available. An app or component can use this path to resolve the correct file to
load for a given locale. The `localesPath` in the manifest is the default, but
loaders can allow custom ones to be set.

For example, lets say we are serving the following locale files:

```
locales
├── en.json
└── fr.json
```

With this structure, the `localesPath` should be `/locales`. When loading
messages for the `en` locale, the resolved path would be `/locales/en.json`.

When a component or function then needs to fetch translations for a given
locale, say `en`, it will take the `localesPath`, and append the locale name
with `.json` extension.

### Split Locales

JSON locale files can be split up and loaded as needed to tune an app's
performance. For example, say you have a heavy component with lots of translated
text. This heavy component is not used on the main page, so we can download
those translations later to improve our initial page load.

```
locales
├── en.json
├── fr.json
└── heavy-component
    ├── en.json
    └── fr.json
```

We would then set the `localesPath` to `/locales/heavy-component`. When loading
messages for the `en` locale, the resolved path would be
`/locales/heavy-component/en.json`.

### Template Paths

As an alternative to the above `<group>/<locale>.json` structural format, an app
could also organize files by `<locale>/<group>.json`. In this case, the
`localesPath` must be specified with `locale` as a path param.

For example, let us say we are serving the following locale files:

```
locales
├── en
    ├── common.json
    └── heavy-component.json
├── fr
    ├── common.json
    └── heavy-component.json
```

We would then set the `localesPath` to `/locales/:locale/heavy-component.json`.

Now, when a component or function then needs to load translations for a given
locale, say `en`, it will substitute it in for the `:locale` param in the path.

### Locale Fallbacks

Before a locale path is loaded, it's existence is first checked against the
[locales manifest]. If it does not exist, a fallback will be attempted. If a
locale includes both language and region parts, it will try just the language
before going to the `defaultLocale`.

For example, say our default locale is `en-US`, and we have locale files for
`en` and `fr`. If we have a request for a page with the locale `fr-CH`, our
fallback would occur as:

```
fr-CH -> fr
```

Since we have a `fr` file, it stops there. Now, say we have another request for
`de-CH`. Since we do not have locale files for either `de-CH` or `de`, only
`en`, our fallback would look like:

```
de-CH -> de -> en-US -> en
               └── (default)
```

So for `de-CH`, we would be loading the `en` locale file. Not ideal for your
customers, but this serves as a safety mechanism to make sure your app remains
somewhat readable for unexpected locales. Also note, however, that you can
associate known locales to share a translations with another locale using
`localesMap`.

### Next.js Routing

If your Gasket app is using the [@gasket/plugin-nextjs] for Next.js support,
when setting `locales` and `defaultLocale`, these will automatically be used to
configure [Next.js Internationalized Routing].

You can opt-out of this behavior by setting `nextRouting` to false.

```js
// gasket.config.js
module.exports = {
  intl: {
    defaultLocale: 'fr-FR',
    locales: ['fr-FR', 'en-US', 'zh-TW', 'zh-CN', 'zh-HK', 'zh-SG'],
    nextRouting: false
  }
}
```

### Locales Map

Locales can be directly mapped to other locales which an app has known files
for.

```js
// gasket.config.js
module.exports = {
  intl: {
    localesMap: {
      'zh-HK': 'zh-TW',
      'zh-SG': 'zh-CN'
    }
  }
}
```

Using this example, if a customer's language is set to `zh-HK`, then the
application can load the locale file for `zh-TW`.

### Locales Manifest

When the Gasket **build** command is run, a manifest file is generated and
output to the configured `localesDir`. This is used to inform loader packages of
the available locale paths and settings. The manifest file can be served as a
static file, but is most commonly bundled into the app.

Again, the locale manifest is generated at build time, and is useful for static
settings. If apps or loaders need configuration based on a user's request, the
response data can be utilized.

Because the locales manifest JSON file is generated each build, you may want to
configure your SCM to ignore committing this file, such as with a `.gitignore`
entry.

## Gasket Data

Request based settings are available from the response object at
`res.locals.gasketData.intl`. For apps that support server-rendering, the
`res.locals.gasketData` object can be rendered as a [global window object] to
make the `intl` settings further available to loader packages in the browser.

For instance, this could be used to customize the `locale` for a user, by
implementing a custom Gasket plugin using the [intlLocale lifecycle].

### withLocaleRequired

**Signature**

- `req.withLocaleRequired(localesPath)`

This loader method is attached to the request object which allows locale paths
to be loaded on the server. The loaded locale props will added into Gasket data
at `res.locals.gasketData.intl`, which can be pre-rendered into a
[GasketData script tag] to avoid an extra request.

```js
// lifecycles/middleware.js

module.exports = function middlewareHook(gasket) {
  return function middleware(req, res, next) {
    req.withLocaleRequired('/locales');
    next();
  }
}
```

For Next.js apps, prefer to use one of the loader approaches provided by
[@gasket/react-intl/next].

### selectLocaleMessage

**Signature**

- `req.selectLocaleMessage(id, [defaultMessage])`

If you have cases where you need locale messages loaded for non HTML documents,
such as for as translated API responses, as a convenience, you can use this
method to select a loaded message for the request locale.

```js
// lifecycles/express.js

module.exports = function expressHook(gasket, app) {
    app.post('/api/v1/something', async function (req, res) {
      // first, load messages for the request locale at the locale path
      req.withLocaleRequired('/locales/api');
      
      const ok = doSomething();
      
      // send a translated response message based on results
      if (ok) {
        res.send(req.selectLocaleMessage('success'));
      } else {
        // Provide a default message incase a locale file as a missing id
        res.status(500).send(req.selectLocaleMessage('exception', 'Bad things man'));
      }
  });
}
```

## Lifecycles

### intlLocale

By default, the plugin will determine the locale from the `accept-language`,
either resolving against the supported `locales` or by taking the first entry.
However, you can override or adjust this behavior by implementing an
`intlLocale` hook in an app or plugin. The `intlLocale` hook takes the following
parameters:

- `gasket` - (object) Gasket session config
- `locale` - (string) Default locale specified by Gasket Intl
- `context` - (object) Lifecycle hook context
  - `req` - (object) Request object
  - `res` - (object) Response object

It should then return a string indicating the user's locale. If no value is
returned, Gasket will use `en-US`. Note that this is only available for Gasket
apps with a server element, not for static sites.

#### Example usage

```js
module.exports = {
  hooks: {
    intlLocale: async function intlLocaleHook(gasket, locale, { req, res }) {
      const { env } = gasket.config;
      // Always use en-US in dev for some reason....
      if(env === 'dev') return 'en-US';
      // This example could be handled via localesMap, but...
      if(locale.includes('fr')) {
        return 'fr-FR';
      }
      // Use the value from a custom cookie...
      if (req?.cookies?.MY_LOCALE) {
        return req.cookies.MY_LOCALE;
      }
      // If no special cases apply, use the provided default or preferred locale
      return locale;
    }
  }
}
```

## Module Files

There are several strategies for managing locale files for an app. By default,
the plugin assumes they will be static files committed to the app's under a
`./public/locales` directory and served under a `/locales` path. This directory
can be changed with the `localesDir` config option, and the default path
configured with `localesPath`.

Another practice is to locale files under different npm modules. By enabling the
`intl.modules` option in the `gasket.config.js`, when the app builds, the plugin
looks for packages with a `./locales` sub-directory in the node modules. Each
locale file is then copied to a `modules` directory under the directory
configured for `localesDir` (i.e. `./public/locales/modules`). This allows these
files found under node modules to be served or distributed as a static file.

So, for example,say you have a shared package (`my-shared-pkg`) used across
multiple apps. This packages has common locale JSON files under a `./locales`
directory at the root of the package (`my-shared-pkg/locales`). These will be
copied to your static locales directory
(`./public/locales/modules/my-shared-pkg/*.json`). You can then set the
[locales path] with your loader (`/locales/modules/my-shared-pkg`).

Because the `modules` directory is generated with each build, you may want to
configure your SCM to ignore committing this file, such as with a `.gitignore`
entry.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[locales path]:#locales-path
[locales map]:#locales-map
[locales manifest]:#locales-manifest
[module locales]:#locales-manifest
[Gasket data]:#gasket-data
[intlLocale lifecycle]:#intllocale
[Next.js Routing]:#nextjs-routing

[@gasket/react-intl]: /packages/gasket-react-intl/README.md
[@gasket/plugin-nextjs]: /packages/gasket-plugin-nextjs/README.md
[@gasket/react-intl/next]: /packages/gasket-react-intl/README.md#nextjs
[GasketData script tag]: /packages/gasket-data/README.md
[Next.js Internationalized Routing]: https://nextjs.org/docs/advanced-features/i18n-routing

[global window object]:https://developer.mozilla.org/en-US/docs/Glossary/Global_object

