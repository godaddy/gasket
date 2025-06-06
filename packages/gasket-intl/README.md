# @gasket/intl

Provides internationalization managers for translation files and locale handling.

## Installation

```
npm i @gasket/intl @gasket/plugin-intl
```

See [@gasket/plugin-intl] for more information on how to configure the plugin.

## Usage

With a `intl.js` built by [@gasket/plugin-intl], you can use the manager to
get messages for locales.

To get all messages for a locale:

```js
import intlManager from '../path/to/intl.js';

const messages = intlManager.getLocale('en-US').getAllMessages();
```

### LocaleHandler

This will return a handler with the following methods:

```js

// Access a locale handler
const localeHandler = intlManager.getLocale('en-US');

// locale files can be dynamically loaded
await localeHandler.load('locales/examples')

// Get all loaded messages for a locale
localeHandler.getAllMessages();
```

### _TODO: more examples coming_

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[@gasket/plugin-intl]: /packages/gasket-plugin-intl/README.md
