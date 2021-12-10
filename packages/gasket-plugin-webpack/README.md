# @gasket/plugin-webpack

Adds Webpack support to your application.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-webpack
```

#### Existing apps

```
npm i @gasket/plugin-webpack webpack
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-webpack'
    ]
  }
}
```

## Configuration

The webpack plugin is configured using the `gasket.config.js` file.

First, add it to the `plugins` section of your `gasket.config.js`:

```js
module.exports = {
  plugins: {
    add: ['@gasket/plugin-webpack']
  }
}
```

You can optionally define a specific user webpack config using the `webpack`
property. This configuration will be [smartly merged] into the application's
current `webpack` configuration.

```js
module.exports = {
  plugins: {
    add: ['@gasket/plugin-webpack']
  },
  webpack: {
    performance: {
      maxAssetSize: 20000
    }
  }
};
```

This config can be further modified by interacting with the [`webpackConfig`](#webpackConfig)
lifecycle.

## API

`webpack` exposes an init function called `initWebpack`.

### initWebpack

Use this to initialize the webpack lifecycles in a consuming plugin.

```js
const { initWebpack } = require('@gasket/plugin-webpack');

/**
* Creates the webpack config
* @param  {Gasket} gasket The Gasket API
* @param {Object} webpackConfig Initial webpack config
* @param {Object} data Additional info
* @returns {Object} Final webpack config
*/
const config = initWebpack(gasket, webpackConfig, data);
```

## Lifecycles

### webpackChain

DEPRECATED - we suggest using the [`webpackConfig`](#webpackConfig) lifecycle instead; this may be removed in a future version.

Executed before the `webpack` lifecycle, allows you to easily create the initial
webpack configuration using a chaining syntax that is provided by the
`webpack-chain` library. The resulting configuration is then merged with:

- WebPack configuration that is specified in the `gasket.config.js` as `webpack`
  object.

The result of this will be passed into the `webpack` hook as base configuration.

### webpack

DEPRECATED - we suggest using the [`webpackConfig`](#webpackConfig) lifecycle instead; this may be removed in a future version.

Executed after `webpack-chain` lifecycle. It receives the full webpack config as
first argument. It can be used to add additional configurations to webpack.

```js
const { DefinePlugin } = require('webpack');

/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} config webpack configuration
 * @return {Object} webpack config partial
 */
function webpackHook(gasket, config) {
  return {
    plugins: [
      new DefinePlugin({
        MEANING_OF_LIFE: 42
      })
    ]
  };
}
```

### webpackConfig

Executed after `webpack-chain` and `webpack`, it receives four parameters:

1. The gasket API
2. A webpack config object
3. A context object with the following properties:
   * `webpack` - The webpack API.
   * `webpackMerge` - The [`webpack-merge`](https://github.com/survivejs/webpack-merge/tree/v4.2.2) API, version 4.
   * `...additionalContext` - Additional context may be exposed. For example, in next.js apps, the [next.js webpack config options](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config) are included.
   

A hook should return a new webpack config object derived from the original. The usage of the `webpack-merge` API is recommended when doing so since properly handling the overloaded types within webpack config properties can be tricky. We recommend avoiding `webpack-merge` methods that have been deprecated in version 5 since a future version of this plugin may update to a new breaking version of `webpack-merge`.


```js
function webpackConfigHook(
  gasket,
  config,
  { isServer, webpack, webpackMerge }
) {
  return isServer
    ? config
    : webpackMerge.merge(config, {
      plugins: [
        new webpack.DefinePlugin({
          MEANING_OF_LIFE: 42
        })
      ]
    });
}
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[smartly merged]: https://github.com/survivejs/webpack-merge#smart-merging
