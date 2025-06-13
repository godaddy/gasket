# @gasket/intl

Provides internationalization managers for translation files and locale handling.

## Installation

```
npm i @gasket/intl @gasket/plugin-intl
```

See [@gasket/plugin-intl] for more information on how to configure the plugin.

## Usage

With a `intl.js` built by [@gasket/plugin-intl], you can use the IntlManager to
get messages for locales.

### Example messages for a Locale

```js
import intlManager from '../path/to/intl.js';

// Get a locale handler for a specific locale
const localeHandler = intlManager.handleLocale('en-US');

// Get all loaded messages for the locale
const messages = localeHandler.getAllMessages();
```

### Example resolving a supported locale

The IntlManager can also be used to resolve locale based on the supported locales that have been configured for
[@gasket/plugin-intl].

```js
import intlManager from '../path/to/intl.js';

// Resolve a locale to a supported locale
const resolvedLocale = intlManager.resolveLocale('fr-CA');
// If fr-CA is not supported but fr is, resolvedLocale will be 'fr'
// If neither is supported, it will fall back to the default locale
```

To list all supported locales, you can use:

```js
import intlManager from '../path/to/intl.js';

// Get all supported locales
const supportedLocales = intlManager.locales;
```

## Advanced Usage

While the above examples cover the most common use cases, the `@gasket/intl` package also provides advanced features for
managing locale files and their loading status. These are useful for scenarios where the React components from
[@gasket/react-intl] are not available or when you need to manage locale files directly.


### Loading Multiple Locale Files

```js
import intlManager from '../path/to/intl.js';

const localeHandler = intlManager.handleLocale('en-US');

// Load multiple locale files
await localeHandler.load(
  'locales/common',
  'locales/homepage',
  'locales/user-profile'
);

// Get all loaded messages
const messages = localeHandler.getAllMessages();
```

### Checking Loading Status

```js
import intlManager from '../path/to/intl.js';
import { LocaleFileStatus } from '@gasket/intl';

const localeHandler = intlManager.handleLocale('en-US');

// Start loading a locale file
localeHandler.load('locales/common');

// Check the status
const status = localeHandler.getStatus('locales/common');

if (status === LocaleFileStatus.loading) {
  console.log('Locale file is still loading...');
} else if (status === LocaleFileStatus.loaded) {
  console.log('Locale file has been loaded successfully!');
} else if (status === LocaleFileStatus.error) {
  console.error('Failed to load locale file');
}
```

### Server-Side Rendering

```js
import intlManager from '../path/to/intl.js';

// On the server, preload all static locale files
const localeHandler = intlManager.handleLocale('en-US');
await localeHandler.loadStatics();

// Get the static messages register for SSR
const staticsRegister = localeHandler.getStaticsRegister();

// Pass this to the client for hydration
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[@gasket/plugin-intl]: /packages/gasket-plugin-intl/README.md
[@gasket/react-intl]: /packages/gasket-react-intl/README.md
