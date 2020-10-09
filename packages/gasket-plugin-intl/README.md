# @gasket/plugin-intl

This primary responsibility of this plugin is to build a manifest of locale
settings, and provide a utility for loader packages to resolve locale paths.

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
- `localesPath` - (string) Path to endpoint with JSON files (default:
  `/locales`). See [Locales Path] section.
- `defaultLocale` - (string) Locale to fallback to when loading files (default:
  `en`)
- `localesMap` - (object) Mapping of locales to share files. See [Locales Map]
  section.
- `localesDir` - (string) Path to on-disk directory where locale files exists
  (default: `./public/locales`)
- `manifestFilename` - (string) Change the name of the manifest file (default:
  `locales-manifest.json`)
- `modules` - (boolean|object) Enable locale files collation from node modules.
  Disabled by default, enable by setting to an object with options below, or set
  to `true` to use the default options. See [Module Locales] section.
  - `localesDir` - (string) Lookup dir for module files (default: `locales`)
  - `excludes` - (string[]) List of modules to ignore

#### Example config

```js
// gasket.config.js

module.exports = {
  intl: {
    defaultLocale: 'fr-FR',
    localesMap: {
      'zh-HK': 'zh-TW',
      'zh-SG': 'zh-CN'
    }
  }
}
```

## Usage

This plugin provides a utility class for resolving locale paths to load files by
loader packages. One such loader package is [@gasket/intl] which can manage
locales for React and Next.js apps. Loaders can utilize settings from the
[locales manifest]. Also, for apps with a server element, request based settings
can be made available with the [response data].

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

For example, lets say we are serving the following locale files:

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
[locales manifest]. If it does not exist, a fallback will be attempted; if a
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
customers, but this serves as safety mechanism to make sure your app remains
somewhat readable for unexcepted locales. Also note, however, that you can
associate known locales to share a translation using `localesMap`.

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
application can load the locale file for `zh-TW` instead.

### Locales Manifest

When the Gasket **build** command is run, a manifest file is generated and
output to the configured `localesDir`. This is used to inform loader packages of
the available locale paths and settings. The manifest file can be served as a
static file, must most commonly is automatically bundled into the app.

Again, the locale manifest is generated at build time, and is useful for static
settings. If apps or loaders need configuration based on a user's request, the
respond data can be utilized.

Because the locales manifest JSON file is generated each build, you may want to
configure your SCM to ignore committing this file, such as with a `.gitignore`
entry.

### Response Data

Request based settings are available from the response object at
`res.gasketData.intl`. For apps that support server-rendering, the
`res.gasketData` object can be rendered as a [global window object] to make the
`intl` settings further available to loader packages in the browser.

For instance, this could be used to customize the `locale` for a user, by
implementing a custom Gasket plugin using the [intlLocale lifecycle].

## Lifecycles

### intlLocale

By default, the plugin will determine the locale from the first entry in the
`accept-language` header of a request. However, you can override this behavior
by implementing an `intlLocale` hook in an app or plugin. The `intlLocale` hook
takes the following parameters:

- `gasket` - (object) Gasket session config
- `locale` - (string) Default locale specified by Gasket Intl
- `req` - (object) Request object
- `req` - (object) Response object

It should then return a string indicating the user's locale. If no value is
returned, Gasket will use `en-US`. Note that this is only available for Gasket
apps with a server element; not for static sites.

#### Example usage

```js
module.exports = {
  hooks: {
    intlLocale: async function intlLocaleHook(gasket, locale, req, res) {
      const { env } = gasket.config;
      // Always use en-US in dev for some reason....
      if(env === 'dev') return 'en-US';
      // This example could be handled via languageMap, but...
      if(locale.includes('fr')) {
        return 'fr-FR';
      }
      // If no special cases apply, use the default locale provided by Gasket.
      return locale;
    }
  }
}
```

## Module Files

There are several strategies for managing locale files for an app. By default,
the plugin assumes they will be static files committed to the app's under a
`public/locales` directory.

Another practice is to locale files under different npm modules. My enabling the
`intl.modules` option in the `gasket.config.js`, when the app builds, the plugin
looks for packages with a `locale` directory in the node modules. Each locale
file is then copied to the `localesDir` to be served or distributed as a static
file for your app. These will be placed under a `modules` directory, and the
paths included in the locales manifest with content hashes.

So, say for example, you have a shared package (`my-shared-pkg`) used across
multiple apps with common locale files. If these exist in a `locales` directory
at the root of the package (`my-shared-pkg/locales`) they can be copied to your
static locales directory (`./public/locales/modules/my-shared-pkg/*.json`). You
can then simply use this for a [locales path] with your loader
(`/locales/modules/my-shared-pkg`).

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
[response data]:#response-data
[intlLocale lifecycle]:#intllocale

[@gasket/intl]: /packages/gasket-intl/README.md
[service worker config]: /packages/gasket-plugin-service-worker/README.md

[global window object]:https://developer.mozilla.org/en-US/docs/Glossary/Global_object

