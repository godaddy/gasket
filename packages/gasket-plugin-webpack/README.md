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

This config can be further modified by interacting with the [`webpack`](#webpack)
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

Executed before the `webpack` lifecycle, allows you to easily create the initial
webpack configuration using a chaining syntax that is provided by the
`webpack-chain` library. The resulting configuration is then merged with:

- WebPack configuration that is specified in the `gasket.config.js` as `webpack`
  object.

The result of this will be passed into the `webpack` hook as base configuration.

### webpack

Executed after `webpack-chain` lifecycle. It receives the full webpack config as
first argument. It can be used to add additional configurations to webpack.

```js
const { DefinePlugin } = require('webpack');

/**
 * @param {Gasket} gasket The gasket API
 * @param {Object} config webpack configuration
 * @return {Object} resolved webpack configuration
 */
function webpackHook(gasket, config) {
  config.plugins.push(
    new DefinePlugin({
      MEANING_OF_LIFE: 42
    })
  );

  return config;
}
```

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[smartly merged]: https://github.com/survivejs/webpack-merge#smart-merging
