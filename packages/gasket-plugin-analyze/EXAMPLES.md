# @gasket/plugin-analyze Examples

This document provides working examples for using the `@gasket/plugin-analyze` package.

## Plugin Usage

### Basic Plugin Installation

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAnalyze from '@gasket/plugin-analyze';

export default makeGasket({
  plugins: [
    pluginAnalyze
  ]
});
```

### Configuration Interface

The plugin extends the `GasketConfig` interface with `bundleAnalyzerConfig`:

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAnalyze from '@gasket/plugin-analyze';

export default makeGasket({
  plugins: [
    pluginAnalyze
  ],
  bundleAnalyzerConfig: {
    browser: {
      analyzerMode: 'static',
      reportFilename: 'custom-browser-report.html',
      defaultSizes: 'gzip',
      openAnalyzer: false
    },
    server: {
      analyzerMode: 'static',
      reportFilename: 'custom-server-report.html',
      openAnalyzer: false
    }
  }
});
```

### Environment-Specific Configuration

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginAnalyze from '@gasket/plugin-analyze';

export default makeGasket({
  plugins: [
    pluginAnalyze
  ],
  environments: {
    'local.analyze': {
      bundleAnalyzerConfig: {
        browser: {
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true
        },
        server: {
          analyzerMode: 'server',
          analyzerPort: 8889,
          openAnalyzer: true
        }
      }
    }
  }
});
```

## Runtime Usage

### Running Analysis via Environment Variable

```bash
# Using ANALYZE environment variable
ANALYZE=1 next build

# Using Gasket environment
GASKET_ENV=local.analyze next build
```

### NPM Script Integration

```json
{
  "scripts": {
    "analyze": "GASKET_ENV=local.analyze next build",
    "analyze:env": "ANALYZE=1 next build"
  }
}
```

### Conditional Analysis in Build Scripts

```bash
# Disable analysis
ANALYZE=false next build

# Enable with specific mode
ANALYZE=server next build
```

## Dynamic Plugin Loading

Using the plugin with dynamic plugin loading:

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginDynamicPlugins from '@gasket/plugin-dynamic-plugins';

export default makeGasket({
  plugins: [
    pluginDynamicPlugins
  ],
  dynamicPlugins: {
    'local.analyze': {
      plugins: [
        '@gasket/plugin-analyze'
      ]
    }
  },
  bundleAnalyzerConfig: {
    browser: {
      defaultSizes: 'gzip'
    },
    server: {
      openAnalyzer: false
    }
  }
});
```
