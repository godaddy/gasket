# Examples

This document provides practical examples of using `@gasket/plugin-intl` in your Gasket applications.

## Plugin Configuration

### Basic Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginIntl from '@gasket/plugin-intl';

export default makeGasket({
  plugins: [
    pluginIntl
  ],
  intl: {
    locales: ['en-US', 'fr-FR', 'es-ES'],
    defaultLocale: 'en-US',
    localesDir: 'locales'
  }
});
```

### Advanced Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginIntl from '@gasket/plugin-intl';

export default makeGasket({
  plugins: [
    pluginIntl
  ],
  intl: {
    locales: ['en-US', 'fr-FR', 'es-ES', 'de-DE'],
    defaultLocale: 'en-US',
    localesDir: 'locales',
    managerFilename: 'intl.js',
    localesMap: {
      'en-GB': 'en-US',
      'fr-CA': 'fr-FR'
    },
    modules: {
      localesDir: 'i18n',
      excludes: ['debug', 'lodash']
    },
    nextRouting: true,
  }
});
```

## Actions

### getIntlLocale

Get the current locale for a request.

```js
// In express lifecycle
export default {
  name: 'locale-plugin',
  hooks: {
    express(gasket, app) {
      app.use(async (req, res, next) => {
        const locale = await gasket.actions.getIntlLocale(req);
        console.log('Current locale:', locale);

        // Use locale for request processing
        res.locals.locale = locale;
        next();
      });
    }
  }
};
```

### getIntlManager

Access the IntlManager instance for advanced locale management.

**Note:** Requires `experimentalImportAttributes: true` in your intl config.

```js
// Configuration required for getIntlManager
export default makeGasket({
  intl: {
    managerFilename: 'intl.js',
    experimentalImportAttributes: true,
    locales: ['en-US', 'fr-FR']
  }
});
```

```js
// In a plugin action
export default {
  name: 'localization-plugin',
  actions: {
    async getTranslations(gasket, localeFilePath) {
      const intlManager = await gasket.actions.getIntlManager();
      const localeHandler = intlManager.handleLocale('en-US');

      await localeHandler.load(localeFilePath);
      return localeHandler.getAllMessages();
    },

    async preloadLocales(gasket, locale, paths) {
      const intlManager = await gasket.actions.getIntlManager();
      const localeHandler = intlManager.handleLocale(locale);

      // Load multiple locale files
      await localeHandler.load(...paths);

      return {
        locale,
        status: 'loaded',
        messages: localeHandler.getAllMessages()
      };
    }
  }
};
```

```js
// Server-side usage
import gasket from './gasket.js';

async function setupLocalization() {
  const intlManager = await gasket.actions.getIntlManager();

  // Get supported locales
  const supportedLocales = intlManager.locales;
  console.log('Supported locales:', supportedLocales);

  // Resolve a locale
  const resolvedLocale = intlManager.resolveLocale('fr-CA');
  console.log('Resolved locale:', resolvedLocale); // 'fr-FR' if fr-CA maps to fr-FR

  // Handle a specific locale
  const localeHandler = intlManager.handleLocale('en-US');
  await localeHandler.loadStatics();

  return {
    manager: intlManager,
    handler: localeHandler
  };
}
```

## Lifecycle Hooks

### intlLocale

Hook to customize locale determination logic.

```js
// Plugin with custom locale logic
export default {
  name: 'custom-locale-plugin',
  hooks: {
    intlLocale(gasket, locale, { req }) {
      // Use custom header for locale
      const customLocale = req.headers['x-custom-locale'];
      if (customLocale) {
        console.log(`Custom locale from header: ${customLocale}`);
        return customLocale;
      }

      // Use subdomain for locale
      const host = req.headers.host;
      if (host?.startsWith('fr.')) {
        return 'fr-FR';
      }
      if (host?.startsWith('es.')) {
        return 'es-ES';
      }

      // Fall back to default behavior
      return locale;
    }
  }
};
```

```js
// Plugin with user preference override
export default {
  name: 'user-locale-plugin',
  hooks: {
    intlLocale(gasket, locale, { req }) {
      // Check for user's saved preference
      const userLocale = req.cookies?.userLocale;
      if (userLocale && gasket.config.intl.locales.includes(userLocale)) {
        return userLocale;
      }

      // Check for query parameter override
      const queryLocale = req.query?.locale;
      if (queryLocale && gasket.config.intl.locales.includes(queryLocale)) {
        return queryLocale;
      }

      return locale;
    }
  }
};
```

## Configuration Interface Examples

### Module Configuration

```js
// Enable all modules with default settings
export default makeGasket({
  intl: {
    modules: true
  }
});
```

```js
// Custom module settings
export default makeGasket({
  intl: {
    modules: {
      localesDir: 'translations',
      excludes: ['webpack', 'babel-core', 'eslint']
    }
  }
});
```

```js
// Specific module list
export default makeGasket({
  intl: {
    modules: [
      '@my-company/shared-components',
      '@my-company/ui-library/locales',
      'third-party-package'
    ]
  }
});
```

### Locale Mapping

```js
// Map regional variants to base locales
export default makeGasket({
  intl: {
    locales: ['en-US', 'fr-FR', 'es-ES'],
    localesMap: {
      'en-GB': 'en-US',
      'en-AU': 'en-US',
      'fr-CA': 'fr-FR',
      'fr-BE': 'fr-FR',
      'es-MX': 'es-ES',
      'es-AR': 'es-ES'
    }
  }
});
```

### Locale File Paths

```js
// Custom default and static file paths
export default makeGasket({
  intl: {
    // Default path for locale files
    defaultLocaleFilePath: 'locales',

    // Paths to locale files for static/SSR rendering
    staticLocaleFilePaths: [
      'common',
      'navigation',
      'errors'
    ]
  }
});
```
