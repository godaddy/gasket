<!-- TODO (kinetifex): this doc needs some updates and attention -->

# Configuring webpack

For the most part, additional webpack configuration should not be needed as the
most common setups are preconfigured for Gasket apps. However, there are several
integration points for apps should the need arise.

When adjusting webpack configuration, it is important to know the merge order:

1. [Next plugins](#gasket-next-config)
1. [Gasket config](#gasket-webpack-config)
1. [Gasket plugins](#gasket-plugins)

## Gasket webpack config

In an app's `gasket.config.js`, the `webpack` attribute can be defined with
standard [webpack configurations]. Configurations will also work with
[configuration environments] for per-environment settings.

```js
// gasket.config.js

module.exports = {
  // standard webpack config
  webpack: {
    resolve: {
      alias: {
        'fancy-module': './path/to/some/fancy-module'
      }
    }
  },
  environments: {
    test: {
      webpack: {
        resolve: {
          alias: {
            'fancy-module': './path/to/some/test-only/module'
          }
        }
      }
    }
  }
}
```

## Gasket plugins

After the `gasket.config.js` `webpack` attribute results are merged,
the resulting config object will be passed to the `webpack` lifecycle or plugin
hooks. The webpack hook can return a partial webpack config object, which will
be merged into the base config using [webpack-merge]. This is the preferred
approach. Optionally, the `webpackConfig` is available for direct mutation,
though this can be brittle and is preferred to be avoid.

```js
// some-custom-plugin.js

const webpackMerge = require('webpack-merge');

module.exports = {
  hooks: {
    webpack(gasket, webpackConfig) {
      // construct and return some webpack config partial
      return {
        resolve: {
          alias: {
            'fancy-module': './path/to/some/other/module'
          }
        }
      }
    }
  }
}
```

## Using a webpack lifecycle hook to update webpack config

```js
// lifecycles/webpack.js

const externalPlugin = require('some-external-plugin-installed');
const anotherExternalPlugin = require('i-love-webpack');

module.exports = function (gasket) {
  return {
    plugins: [
      new externalPlugin(),
      new anotherExternalPlugin()
    ]
  }
}
```

## Gasket Next config

Additionally, [Next.js plugins] which may modify the webpack config can be
integrated by updating the `next` attribute in the `gasket.config.js`.

```js
// gasket.config.js

const withGraphql = require('next-plugin-graphql');

module.exports = {
  // standard next.js config
  next: withGraphql()
}
```

[webpack configurations]:https://webpack.js.org/concepts/
[configuration environments]:/packages/gasket-cli/docs/configuration.md#environments
[Next.js plugins]:https://github.com/zeit/next-plugins
[webpack-merge]:https://github.com/survivejs/webpack-merge
