# @gasket/plugin-intl

This plugin consolidates all locale files under the build folder.

## Installation

```bash
npm install --save @gasket/plugin-intl
```

## Options

- `blacklistModules` - (string[]) list of modules to exclude from bundling.
- `localesDir` - (string) change the name of directory to gather translation
   files from (default: `locales`)
- `outputDir` - (string) path of directory to build locale and manifest files to
   (default: `./build/locales`)
- `assetPrefix` - (string) change the default path to `/_locale` endpoint by
   adding a path prefix here. (default: ''). Used for setting up CDN support
   for locale files. `next.assetPrefix` will be used be unless specified here.
- `languageMap` - (object) specify a language mapping here if required
   (default: {}), e.g.
    ```
    {
        'zh-HK': 'zh-TW',
        'zh-SG': 'zh-CN'
    }
    ```
    Using this example, if a customer's language is set to `zh-HK`, then the
    application will load localization data for `zh-TW` instead.
- `defaultLanguage` - (string) specify a default language to fall back to if
   none of the fallback language translations are available (default: `en-US`)

### Config Example

```js
// gasket.config.js

module.exports = {
  intl: {
    blacklistModules: ['some-module-with-unwanted-locales'],
  }
}
```

## Usage

Add the 'intl-plugin' to gasket config.

## Directory Structure

##### Directly under the app folder

Create a `locales` folder in the application root and add a en-US.json file and
start adding localization keys into it.

##### Under a namespace

Create a `locales` folder in the application root, create a `en-US` *folder*
under `locales` and add files `<namespace>.json` with localization keys.

## After translation

`intl-plugin` provides a [service worker config][./service-worker-plugin/README.md]
that adds next.js static assets to precache. This config expects that you will
translate the contents of the `en-US` folder
into other folders corresponding to the locales of the translations (e.g. `da-DK`).

##### Language Fallback

The service worker should do a sequence of checks to see which translation to
use for a given language.

1. Exact language match, e.g. `da-DK` to match with `da-DK`.
2. Language match, e.g. `da-XX` to match with `da`.
3. Fallback to US language, e.g. `ar-MA` to fall back to `en-US`.

## Lifecycles

### intlLanguage

When determining what assets to precache, `intl-plugin` defaults to reading the
first language provided in the `accept-language` header. However, you can
override this behavior by adding an `intlLanguage` hook. The `intlLanguage` hook
takes the following parameters:

- `gasket` - (object) The Gasket config
- `language` - (string) Default language specified by Gasket Intl
- `req` - (string) The request

It should then return a string indicating the user's language, or null if this
language cannot be found. `intl-plugin` will populate `intl.language` in the
react state with this value, and use it for future language operations. If null
is returned, Gasket will use `en-US`.

#### Usage example

```js
module.exports = {
  hooks: {
    intlLanguage: async function intlLanguageHook(gasket, language, req) {
      const { env } = gasket.config;
      // Always use en-US in dev for some reason....
      if(env === 'dev') return 'en-US';
      // This example could be handled via languageMap, but...
      if(language.includes('fr')) {
        return 'fr-FR';
      }
      // If no special cases apply, use the default language provided by Gasket.
      return language;
    }
  }
}
```


## How it works

When you build your app, the plugin looks for `locale` directories in the app
root and in node modules. Each file is then read and output to the build or
outputDir with a hash added to the filename. This hash is based on the contents
of the locale file, so if there are any changes, the file will get a new hash to
ensure it is unique.

Locale files are served with a long cache expiration time. This allows browsers
to cache the locale files, and only versions with hash name changes will be
newly downloaded.

In order for the app to know the hash name for a particular locale file, a
locale manifest is generated at build time. This file should not be cached by
the browser, nor should it placed on a CDN during deployments. In most cases,
the manifest contents will be served with the first page-render.

To load and utilize locale files on your app, see the [@gasket/intl] package.



[@gasket/intl]: ../gasket-intl/README.md
