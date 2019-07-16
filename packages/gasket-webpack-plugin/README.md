# @gasket/webpack-plugin

The `webpack-plugin` adds `webpack` support to your application.

## Installation

```
npm install --save @gasket/webpack-plugin
```

## Configuration

The webpack plugin is configured using the `gasket.config.js` file.

- First, add it to the `plugins` section of your `gasket.config.js`:

```js
{
  "plugins": [
    "add": ["webpack"]
  ]
}
```

- You can define a specific user webpack config using the `webpack` property.

#### Example configuration

```js
module.exports = {
  plugins: {
    add: ['webpack']
  },
  webpack: {}  // user specified webpack config
}
```

## Hooks

`webpack` exposes an init function called `initWebpack`.

#### initWebpack

```js
/**
* Creates the webpack config
* @param  {Gasket} gasket The Gasket API
* @param {Object} webpackConfig Initial webpack config
* @param {Object} data Additional info
* @returns {Object} Final webpack config
*/
function initWebpack(gasket, webpackConfig, data) {
  return finalConfig;
}
```

## Lifecycles

#### webpackChain

Executed before the `webpack` lifecycle, allows you to easily create the
initial webpack configuration using a chaining syntax that is provided by the
`webpack-chain` library. The resulting configuration is then merged with:

- WebPack configuration that is specified in the `gasket.config.js` as `webpack` object.

The result of this will be passed into the `webpack` hook as base configuration.

#### webpack

Executed after `webpack-chain` lifecycle. It receives the full webpack config as first
argument. It can be used to add additional configurations to webpack.

```js
module.exports = {
  hooks: {
    webpack: function (gasket, config, data) {
      console.log(config);  // webpack.config object.
    }
  }
}
```
