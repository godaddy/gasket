# @gasket/plugin-intl

This primary responsibility of this plugin is to build the intl manager script.

## Installation

```
npm i @gasket/plugin-intl
```

Modify `plugins` section of your `gasket.js`:

```diff
// gasket.js
import { makeGasket } from '@gasket/core';
+ import pluginIntl from '@gasket/plugin-intl';

export default makeGasket({
  plugins: [
+    pluginIntl
  ],
  intl: {
    locales: ['en-US', 'fr-FR']
  }
})
```

## Configuration

To be set under `intl` in the `gasket.js`. No configuration is
required. However, these options exist to customize an app's setup.

### Options

- `locales` - (string[]) Ordered list of accepted locales. If set, the preferred
  locale will be resolved based on the request `accept-language` header.
- `defaultLocale` - (string) Locale to fallback to when loading files. Defaults
  to the first `locales` entry if not set.
- `localesMap` - (object) Mapping of locales to share files. See [Locales Map]
  section.
- `localesDir` - (string) Path to on-disk directory where locale files exists
  (default: `./locales`)
- `defaultLocaleFilePath` - (string) Lookup path for locale files (default:
  `locales`). See [Locales Path] section.
- `managerFilename` - (string) Change the name of the manager file
  (default: `intl.js`)
- `modules` - (boolean|object|string[]) Enable locale files collation from node modules.
  Disabled by default, enable by setting to an object with options below, or set
  to `true` to use the default options. See [Module Locales] section.
  - `localesDir` - (string) Lookup dir for module files (default: `locales`)
  - `excludes` - (string[]) List of modules to ignore
- `nextRouting` - (boolean) Enable [Next.js Routing] when used with
  [@gasket/plugin-nextjs]. (default: true)

#### Example config

```js
// gasket.js

export default makeGasket({
  intl: {
    defaultLocale: 'fr-FR',
    locales: ['fr-FR', 'en-US', 'zh-TW', 'zh-CN', 'zh-HK', 'zh-SG'],
    localesMap: {
      'zh-HK': 'zh-TW',
      'zh-SG': 'zh-CN'
    }
  }
});
```

## Usage

The plugin will generate an `intl.js` file that can be used to manage locale
files for an app.
For details on how the intl manager can be used, see the
[@gasket/intl] package.

### Locale File Path

A `localeFilePath` represents be the target where static JSON files exist.
An app or component can use this path to resolve the correct file to
load for a given locale.

For example, let's say we are serving the following locale files:

```
locales
├── en.json
└── fr.json
```

With this structure, the `localeFilePath` should be `locales`. When loading
messages for the `en` locale, the resolved file would be `locales/en.json`.

When a component or function then needs to fetch translations for a given
locale, say `en`, it will take the `localeFilePath`, and append the locale
name with `.json` extension.

### Dynamic Locale Files

Messages can be split across locale files and loaded dynamically as needed to
tune an app's performance. For example, say you have a heavy component with
many translated messages. This heavy component is not used on the main page,
so we can download those translations later to improve our initial page load.

```
locales
├── en.json
├── fr.json
└── heavy-component
    ├── en.json
    └── fr.json
```

We would then set the `localeFilePath` to `locales/heavy-component`.
When loading messages for the `en` locale, the resolved file would be
`locales/heavy-component/en.json`.

### Template Paths

As an alternative to the above `<group>/<locale>.json` structural format, an app
could also organize files by `<locale>/<group>.json`. In this case, the
`localeFilePath` must be specified with `locale` as a path param.

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

We would then set the `localeFilePath` to `locales/:locale/heavy-component`.

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
// gasket.js

export default makeGasket({
  intl: {
    defaultLocale: 'fr-FR',
    locales: ['fr-FR', 'en-US', 'zh-TW', 'zh-CN', 'zh-HK', 'zh-SG'],
    nextRouting: false
  }
});
```

### Locales Map

Locales can be directly mapped to other locales which an app has known files
for.

```js
// gasket.js

export default makeGasket({
  intl: {
    locales: ['en-US', 'zh-TW', 'zh-CN'],
    localesMap: {
      'zh-HK': 'zh-TW',
      'zh-SG': 'zh-CN'
    }
  }
});
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

## Actions

### getIntlLocale

This action invokes the `intlLocale` lifecycle hook to determine the user's locale.

parameters:
- `req` - (object) Request object

```js
const intlLocale = await actions.gasket.getIntlLocale(req);
```

### getIntlManager

This action is used to access the intl manager by other plugins.

```js
const intlManager = actions.gasket.getIntlManager();
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
export default {
  name: 'my-intl-plugin',
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
`./public/locales` directory and served under a `locales` path. This directory
can be changed with the `localesDir` config option, and the default path
configured with `localeFilePath`.

Another practice is to locale files under different npm modules. By enabling the
`intl.modules` option in the `gasket.js`, when the app builds, the plugin
looks for packages with a `./locales` sub-directory in the node modules. Each
locale file is then copied to a `modules` directory under the directory
configured for `localesDir` (i.e. `./public/locales/modules`). This allows these
files found under node modules to be served or distributed as a static file.

So, for example,say you have a shared package (`my-shared-pkg`) used across
multiple apps. This packages has common locale JSON files under a `./locales`
directory at the root of the package (`my-shared-pkg/locales`). These will be
copied to your static locales directory
(`./public/locales/modules/my-shared-pkg/*.json`). You can then set the
[locale file path] with your loader (`locales/modules/my-shared-pkg`).

Because the `modules` directory is generated with each build, you may want to
configure your SCM to ignore committing this file, such as with a `.gitignore`
entry.

## Module Files Examples

Finds all node_modules with a `./locales` subdirectory.

```js
// gasket.js

export default makeGasket({
  intl: {
    // Enable module files
    modules: true
  }
});
```

Find all node_modules with a `./i18n` subdirectory, excluding `my-shared-pkg`.

```js
// gasket.js

export default makeGasket({
  intl: {
    modules: {
        localesDir: 'i18n',
        excludes: ['my-shared-pkg']
    }
  }
});
```

Find all packages listed and their `./locales` dir or specified subdirectory.

```js
// gasket.js

export default makeGasket({
  intl: {
    modules: [
      'my-shared-pkg',
      '@site/my-shared-pkg',
      'my-other-shared-pkg/with/custom/locales-dir'
    ]
  }
});
```

## Debugging

If you are experiencing difficulties seeing with locale files not working as expected, it can be helpful to enable debug logging for your gasket server via the `DEBUG` environment variable under the namespace `gasket`:

```shell
DEBUG=gasket:* npm run local
```

Once enabled, look for messages under the namespace `gasket:plugin:intl` and `gasket:intl` for a detailed accounting on what's happening behind the scenes.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[locale file path]:#locale-file-path
[locales map]:#locales-map
[locales manifest]:#locales-manifest
[module locales]:#module-files
[Gasket data]:#gasket-data
[intlLocale lifecycle]:#intllocale
[Next.js Routing]:#nextjs-routing

[@gasket/intl]: /packages/gasket-intl/README.md
[@gasket/react-intl]: /packages/gasket-react-intl/README.md
[@gasket/plugin-nextjs]: /packages/gasket-plugin-nextjs/README.md
[GasketData script tag]: /packages/gasket-data/README.md
[Next.js Internationalized Routing]: https://nextjs.org/docs/advanced-features/i18n-routing

[global window object]:https://developer.mozilla.org/en-US/docs/Glossary/Global_object

