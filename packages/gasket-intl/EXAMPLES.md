# @gasket/intl Examples

This document provides working examples for all exported functions, methods, and classes in `@gasket/intl`.

## Table of Contents

- [makeIntlManager](#makeintlmanager)
- [IntlManager](#intlmanager)
- [LocaleHandler](#localehandler)
- [LocaleFileStatus](#localefilestatus)
- [LocaleFileStatusPriority](#localefilestatuspriority)
- [Utility Functions](#utility-functions)

---

## makeIntlManager

Creates an `IntlManager` instance from a locale manifest.

```js
// intl.js
import { makeIntlManager } from '@gasket/intl';

// Example manifest
const manifest = {
  defaultLocale: 'en-US',
  locales: ['en-US', 'fr-FR', 'es-ES'],
  localesMap: {
    'zh-HK': 'zh-TW',
    'zh-SG': 'zh-CN'
  },
  defaultLocaleFilePath: 'locales',
  staticLocaleFilePaths: ['locales/common'],
  imports: {
    'locales/en-US': () => import('./locales/en-US.json'),
    'locales/fr-FR': () => import('./locales/fr-FR.json'),
    'locales/es-ES': () => import('./locales/es-ES.json'),
    'locales/common/en-US': () => import('./locales/common/en-US.json'),
    'locales/common/fr-FR': () => import('./locales/common/fr-FR.json'),
    'locales/common/es-ES': () => import('./locales/common/es-ES.json')
  }
};

const intlManager = makeIntlManager(manifest);
export default intlManager;
```

---

## IntlManager

### Properties

#### locales
Get the list of supported locales.

```js
import intlManager from '../path/to/intl.js';
const supportedLocales = intlManager.locales;
// ['en-US', 'fr-FR', 'es-ES']
```

#### defaultLocaleFilePath
Get the default locale file path.

```js
const defaultPath = intlManager.defaultLocaleFilePath;
// 'locales'
```

#### staticLocaleFilePaths
Get the static locale file paths for SSR.

```js
const staticPaths = intlManager.staticLocaleFilePaths;
// ['locales/common']
```

### Methods

#### resolveLocale(locale)
Resolves a locale to a supported locale with fallback logic.

```js
import intlManager from '../path/to/intl.js';

// Direct match
const resolved1 = intlManager.resolveLocale('en-US');
// 'en-US'

// Using localesMap
const resolved2 = intlManager.resolveLocale('zh-HK');
// 'zh-TW' (mapped locale)

// Language fallback (fr-CA falls back to fr, then to fr-FR)
const resolved3 = intlManager.resolveLocale('fr-CA');
// 'fr-FR' (falls back based on language part)

// Default fallback
const resolved4 = intlManager.resolveLocale('de-DE');
// 'en-US' (falls back to defaultLocale)
```

#### handleLocale(locale)
Gets a `LocaleHandler` for the specified locale.

```js
import intlManager from '../path/to/intl.js';
const localeHandler = intlManager.handleLocale('fr-FR');
```

---

## LocaleHandler

### Methods

#### load(...localeFilePaths)
Loads locale files dynamically.

```js
import intlManager from '../path/to/intl.js';
const handler = intlManager.handleLocale('en-US');

// Load default locale file
await handler.load();

// Load specific locale files
await handler.load('locales/components', 'locales/forms');

// Load with template paths (uses :locale, $locale, or {locale} patterns)
await handler.load('locales/:locale/heavy-component');
```

#### loadStatics(...localeFilePaths)
Loads static locale files for SSR.

```js
const handler = intlManager.handleLocale('en-US');

// Load static files for server-side rendering
await handler.loadStatics('locales/common', 'locales/navigation');
```

#### getStatus(...localeFilePaths)
Gets the loading status for locale file paths.

```js
const handler = intlManager.handleLocale('en-US');

// Check status of specific files
const status = handler.getStatus('locales/components');
// Returns one of: 'notHandled', 'notLoaded', 'loading', 'loaded', 'error'

// Check status of multiple files (returns lowest priority status)
const multiStatus = handler.getStatus('locales/common', 'locales/forms');
```

#### getAllMessages()
Gets all loaded messages for the locale.

```js
const handler = intlManager.handleLocale('en-US');
await handler.load('locales/common');

const messages = handler.getAllMessages();
// {
//   welcome: 'Welcome',
//   goodbye: 'Goodbye',
//   ...
// }
```

#### getStaticsRegister()
Gets the registry of static messages for SSR.

```js
const handler = intlManager.handleLocale('en-US');
await handler.loadStatics('locales/common');

const staticsRegister = handler.getStaticsRegister();
// {
//   'locales/common/en-US': {
//     welcome: 'Welcome',
//     goodbye: 'Goodbye'
//   }
// }
```

---

## LocaleFileStatus

Enum for locale file status values.

```js
import { LocaleFileStatus } from '@gasket/intl';

// Available status values
console.log(LocaleFileStatus.notHandled); // 'notHandled'
console.log(LocaleFileStatus.notLoaded);  // 'notLoaded'
console.log(LocaleFileStatus.loading);    // 'loading'
console.log(LocaleFileStatus.loaded);     // 'loaded'
console.log(LocaleFileStatus.error);      // 'error'

// Usage in status checking
const handler = intlManager.handleLocale('en-US');
const status = handler.getStatus('locales/forms');

if (status === LocaleFileStatus.loaded) {
  // File is ready to use
  const messages = handler.getAllMessages();
} else if (status === LocaleFileStatus.loading) {
  // File is currently loading
  console.log('Still loading...');
} else if (status === LocaleFileStatus.error) {
  // Failed to load
  console.error('Failed to load locale file');
}
```

---

## Complete Usage Example

Here's a comprehensive example showing how to use the library:

```js
import intlManager from '../path/to/intl.js';
import { LocaleFileStatus } from '@gasket/intl';

// Get handler for French locale
const frenchHandler = intlManager.handleLocale('fr-FR');

// Load some locale files
await frenchHandler.load('locales/forms');

// Check loading status
const status = frenchHandler.getStatus('locales/forms');
if (status === LocaleFileStatus.loaded) {
  // Get all messages
  const messages = frenchHandler.getAllMessages();
  console.log(messages.submitButton); // "Soumettre"
}

// For SSR: load static files and get register
await frenchHandler.loadStatics('locales/navigation');
const staticsRegister = frenchHandler.getStaticsRegister();
// Can be serialized and sent to client
```
