# Examples

This document provides working examples for all exported interfaces and methods from `@gasket/plugin-webpack`.

## Plugin Usage

### Basic Plugin Setup

```js
// gasket.js
import { makeGasket } from '@gasket/core';
import pluginWebpack from '@gasket/plugin-webpack';

export default makeGasket({
  plugins: [
    pluginWebpack
  ]
});
```

## Actions

### getWebpackConfig

Get a webpack configuration with Gasket's webpack lifecycle applied.

```js
// Using the action to get webpack config
import gasket from './gasket.js';

const webpackConfig = gasket.actions.getWebpackConfig(
  // Initial webpack config
  {
    entry: './src/index.js',
    mode: 'production'
  },
  // Context object
  {
    isServer: false
  }
);

console.log(webpackConfig);
// Returns webpack config with Gasket plugins and lifecycle transformations applied
```

### Using getWebpackConfig in a Custom Plugin

```js
// my-build-plugin.js
export default {
  name: 'my-build-plugin',
  hooks: {
    async build(gasket) {
      const webpackConfig = gasket.actions.getWebpackConfig(
        {
          entry: './src/client.js',
          output: {
            path: path.resolve('./dist'),
            filename: 'bundle.js'
          }
        },
        { isServer: false }
      );

      const webpack = require('webpack');
      const compiler = webpack(webpackConfig);

      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) reject(err);
          else resolve(stats);
        });
      });
    }
  }
};
```

## Lifecycle Hooks

### webpackConfig

Transform the webpack configuration during the lifecycle.

```js
// webpack-transform-plugin.js
export default {
  name: 'webpack-transform-plugin',
  hooks: {
    webpackConfig(gasket, config, context) {
      const { webpack, isServer } = context;

      // Add environment-specific plugins
      const plugins = [...(config.plugins || [])];

      if (!isServer) {
        plugins.push(
          new webpack.DefinePlugin({
            'process.env.BROWSER': JSON.stringify(true),
            'process.env.BUILD_TIME': JSON.stringify(Date.now())
          })
        );
      }

      // Modify resolve configuration
      const resolve = {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@components': path.resolve('./components'),
          '@utils': path.resolve('./utils')
        }
      };

      return {
        ...config,
        plugins,
        resolve
      };
    }
  }
};
```

### Advanced webpackConfig Usage

```js
// advanced-webpack-plugin.js
import webpackMerge from 'webpack-merge';

export default {
  name: 'advanced-webpack-plugin',
  hooks: {
    webpackConfig(gasket, config, context) {
      const { webpack, isServer } = context;

      // Different configurations for server vs client
      if (isServer) {
        return webpackMerge.merge(config, {
          target: 'node',
          externals: ['express', 'fs', 'path'],
          optimization: {
            minimize: false
          }
        });
      }

      // Client-side configuration
      return webpackMerge.merge(config, {
        optimization: {
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all'
              }
            }
          }
        },
        plugins: [
          new webpack.BannerPlugin({
            banner: `Build: ${new Date().toISOString()}`
          })
        ]
      });
    }
  }
};
```

## Complete Plugin Example

A comprehensive example showing multiple features:

```js
// comprehensive-webpack-plugin.js
import path from 'path';
import webpackMerge from 'webpack-merge';

export default {
  name: 'comprehensive-webpack-plugin',
  hooks: {
    webpackConfig(gasket, config, context) {
      const { webpack, isServer } = context;
      const { env } = gasket.config;

      // Base modifications
      const baseConfig = {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            '@': path.resolve('./src'),
            '@assets': path.resolve('./assets')
          }
        }
      };

      // Environment-specific modifications
      if (env === 'development') {
        return webpackMerge.merge(baseConfig, {
          devtool: 'source-map',
          plugins: [
            new webpack.HotModuleReplacementPlugin()
          ]
        });
      }

      if (env === 'production') {
        return webpackMerge.merge(baseConfig, {
          optimization: {
            minimize: true,
            sideEffects: false
          },
          plugins: [
            new webpack.optimize.ModuleConcatenationPlugin()
          ]
        });
      }

      return baseConfig;
    }
  }
};
```
