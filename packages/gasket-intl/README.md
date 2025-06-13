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

### Basic Usage

```js
import intlManager from '../path/to/intl.js';

// Get a locale handler for a specific locale
const localeHandler = intlManager.handleLocale('en-US');

// Get all loaded messages for the locale
const messages = localeHandler.getAllMessages();
```

## API

### IntlManager

The `IntlManager` is the public API for internationalization. It provides a simplified interface to the underlying internationalization system.

#### Properties

- `locales` - Array of supported locales
- `defaultLocaleFilePath` - Default path to locale files
- `staticLocaleFilePaths` - Array of paths to locale files for static/SSR rendering

#### Methods

- `resolveLocale(locale)` - Resolves a locale to a supported locale
- `handleLocale(locale)` - Returns a LocaleHandler for a locale

### LocaleHandler

The `LocaleHandler` class manages resolving and loading of locale files for a specific locale.

#### Methods

- `load(...localeFilePaths)` - Loads locale files
- `loadStatics(...localeFilePaths)` - Loads static locale files for SSR
- `getStatus(...localeFilePaths)` - Gets the loading status for locale file paths
- `getAllMessages()` - Gets all loaded messages for the locale
- `getStaticsRegister()` - Gets the registry of static messages for SSR

### LocaleFileStatus

Constants representing the status of locale file loading:

- `notHandled` - The locale file has not been handled yet
- `notLoaded` - The locale file has not been loaded yet
- `loading` - The locale file is currently loading
- `loaded` - The locale file has been loaded successfully
- `error` - There was an error loading the locale file

## Examples

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

### Resolving Locales

```js
import intlManager from '../path/to/intl.js';

// Resolve a locale to a supported locale
const resolvedLocale = intlManager.resolveLocale('fr-CA');

// If fr-CA is not supported but fr is, resolvedLocale will be 'fr'
// If neither is supported, it will fall back to the default locale
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
