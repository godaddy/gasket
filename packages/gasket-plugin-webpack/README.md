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

The Webpack plugin is configured using the `gasket.config.js` file.

First, add it to the `plugins` section of your `gasket.config.js`:

```js
module.exports = {
  plugins: {
    add: ['@gasket/plugin-webpack']
  }
}
```

If your app was previously using the `webpack` property in the
`gasket.config.js`, then you should take steps [migrating to webpackConfig]
lifecycle.  

## API

The package exposes an init function called `initWebpack` which can be used by
plugins that need to gather Webpack configuration.

### initWebpack

Use this to initialize the Webpack lifecycles in a consuming plugin.

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

### webpackConfig

Executed by [initWebpack](#initwebpack), it receives three parameters:

1. The Gasket API
2. A Webpack config object
3. A context object with the following properties:
   * `webpack` - The Webpack API.
   * `webpackMerge` - _DEPRECATED - Use `require('webpack-merge')`._
     Getter returns [webpack-merge v4] API.
   * `...additionalContext` - Additional context may be exposed. For example, in next.js apps, the [next.js webpack config options](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config) are included.

A hook should return a new Webpack config object derived from the original. The
usage of [webpack-merge] is recommended when doing so since it can properly
handle the overloaded types within Webpack config properties, which can be
tricky.

We recommend requiring [webpack-merge] as a dependency in your lifecycles,
instead of using the instance on context which will be removed in a future
version.

```js
const webpackMerge = require('webpack-merge');

function webpackConfigHook( gasket, config, context) {
  const { isServer, webpack } = context;
  
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

### webpackChain

_DEPRECATED - Use [`webpackConfig`](#webpackConfig) lifecycle instead._

Executed before the `webpack` lifecycle, allows you to easily create the initial
Webpack configuration using a chaining syntax that is provided by the
`webpack-chain` library. The resulting configuration is then merged with:

- WebPack configuration that is specified in the `gasket.config.js` as `webpack`
  object.

The result of this will be passed into the `webpack` hook as base configuration.

### webpack

_DEPRECATED - Use [`webpackConfig`](#webpackConfig) lifecycle instead._

Executed after `webpack-chain` lifecycle. It receives the full Webpack config as
first argument. It can be used to add additional configurations to Webpack.

## Migrating to webpackConfig

### From Gasket config

If your app previously added Webpack configuration in the `gasket.config.js`,
this feature is deprecated and you should migrate to using
the [`webpackConfig`](#webpackConfig) lifecycle.

For background, the `webpack` config is merged using an old deprecated "smart"
method from [webpack-merge]. It is now recommended for apps and plugins to
handle any merge strategies themselves in the `webpackConfig` lifecycle.

So move from this setting `webpack` in the `gasket.config`:

```diff
// gasket.config.js
module.exports = {
  plugins: {
    add: ['@gasket/plugin-webpack']
  },
-  webpack: {
-    performance: {
-      maxAssetSize: 20000
-    }
-  }
};
```

to using the webpackConfig lifecycle to merge any custom Webpack config:

```javascript
// lifecycles/webpack-config.js
const webpackMerge = require('webpack-merge');

module.exports = function (gasket, webpackConfig, context) {
  return webpackMerge.merge(webpackConfig, {
    performance: {
      maxAssetSize: 20000
    }
  })
}
```

This gives apps the freedom to use whatever [merge strategies] makes sense
for the custom webpack they want to configure.

### From other lifecycles

If you have plugins that were using either [webpackChain](#webpackchain)
or [webpack](#webpack) lifecycles, these are now deprecated and will be removed
in the next major release. Both of these lifecycles depended on the same
deprecated "smart" method from [webpack-merge].

Instead, handle any merging in the [webpackConfig](#webpackconfig), using
whatever [merge strategies] are useful for the particular config being added.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[webpack-merge v4]:https://github.com/survivejs/webpack-merge/tree/v4.2.2
[webpack-merge]: https://github.com/survivejs/webpack-merge
[merge strategies]: https://github.com/survivejs/webpack-merge#customizearray-and-customizeobject
