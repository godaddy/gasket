# @gasket/plugin-dynamic-plugins Examples

This document provides working examples for all exported interfaces and configuration patterns for the `@gasket/plugin-dynamic-plugins` package.

## Plugin Export

The package exports a single default plugin that handles dynamic plugin loading.

### Basic Plugin Usage

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';

export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ]
});
```

## Configuration Interface: `dynamicPlugins`

The plugin extends the `GasketConfig` interface with a `dynamicPlugins` property.

### Basic Dynamic Plugin Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';

export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ],
  dynamicPlugins: [
    '@gasket/plugin-docs',
    '@gasket/plugin-docusaurus',
    '@gasket/plugin-metadata'
  ]
});
```

### Loading Local/Custom Plugins

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ],
  dynamicPlugins: [
    '@gasket/plugin-docs',
    './custom-plugin.js',
    './plugins/my-local-plugin.js'
  ]
});
```

### Environment-Specific Dynamic Plugins

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ],
  environments: {
    local: {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus'
      ]
    },
    'local.debug': {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus',
        './debug-plugin.js'
      ]
    },
    prod: {
      // No dynamic plugins in production
      dynamicPlugins: []
    }
  }
});
```

### Command-Specific Dynamic Plugins

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ],
  commands: {
    docs: {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus'
      ]
    },
    analyze: {
      dynamicPlugins: [
        '@gasket/plugin-analyze'
      ]
    }
  }
});
```

### Waiting for Dynamic Plugins to Load

```js
// my-plugin.js
export default {
  name: 'my-plugin',
  actions: {
    async myAction(gasket) {
      // Wait for dynamic plugins to be loaded before executing
      await gasket.isReady;

      // Now safe to use actions from dynamic plugins
      const metadata = await gasket.actions.getMetadata();
      return metadata;
    }
  },
  hooks: {
    async express(gasket, app) {
      // Wait for dynamic plugins before setting up routes
      await gasket.isReady;

      app.get('/api/info', async (req, res) => {
        // Dynamic plugin actions are now available
        res.json({ ready: true });
      });
    }
  }
};
```

### Handling Falsy Values in Dynamic Plugins

```js
// gasket.js
export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ],
  dynamicPlugins: [
    '@gasket/plugin-docs',
    process.env.NODE_ENV === 'development' ? '@gasket/plugin-docusaurus' : null,
    undefined, // These will be filtered out
    '',        // This will be filtered out
    '@gasket/plugin-metadata'
  ]
});
```

### Complex Environment-Based Configuration

```js
// gasket.js
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ],
  environments: {
    local: {
      dynamicPlugins: [
        '@gasket/plugin-docs',
        '@gasket/plugin-docusaurus',
        './dev-tools-plugin.js'
      ]
    },
    test: {
      dynamicPlugins: [
        './test-helpers-plugin.js'
      ]
    },
    staging: {
      dynamicPlugins: [
        '@gasket/plugin-docs' // Only docs in staging
      ]
    },
    prod: {
      dynamicPlugins: [] // No dynamic plugins in production
    }
  }
});
```
