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
  plugins: [
    add: [
+      '@gasket/plugin-webpack'
    ]
  ]
}
```

## Configuration

The webpack plugin is configured using the `gasket.config.js` file.

- First, add it to the `plugins` section of your `gasket.config.js`:

```js
module.exports = {
  plugins: {
    add: ['@gasket/webpack']
  }
}
```

- You can define a specific user webpack config using the `webpack` property.

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['@gasket/webpack']
  },
  webpack: {}  // user specified webpack config
}
```

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
module.exports = {
  hooks: {
    webpack: function (gasket, config, data) {
      console.log(config);  // webpack.config object.
    }
  }
}
```

## License

[MIT](./LICENSE.md)
