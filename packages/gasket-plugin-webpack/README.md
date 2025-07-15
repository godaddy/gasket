# @gasket/plugin-webpack

Adds Webpack support to your application.

## Installation

```sh
npm i @gasket/plugin-webpack
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginWebpack from '@gasket/plugin-webpack';

export default makeGasket({
  plugins: [
+   pluginWebpack
  ]
});
```

## Configuration

The Webpack plugin is configured using the `gasket.js` file.

First, add it to the `plugins` section of your `gasket.js`:

```js
export default makeGasket({
  plugins: {
    pluginWebpack
  }
});
```

If your app was previously using the `webpack` property in the
`gasket.js`, you should update your configuration to use the
[webpackConfig] lifecycle instead.

## Actions

### getWebpackConfig

This action can be used by plugins that need to gather Webpack configuration.

```js
// Any starting Webpack configuration
const initialConfig = { };

// Any additional context such as isServer or not
const context = { isServer: true };

const webpackConfig = gasket.actions.getWebpackConfig(initialConfig, context);
```

This action will execute the `webpackConfig` lifecycle and return the final
Webpack configuration object.

## Lifecycles

### webpackConfig

Executed by [getWebpackConfig](#getwebpackconfig) action,
it receives three parameters:

1. The Gasket API
2. A Webpack config object
3. A context object with the following properties:
   * `webpack` - The Webpack API.
   * `...additionalContext` - Additional context may be exposed. For example, in next.js apps, the [next.js webpack config options](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config) are included.

A hook should return a new Webpack config object derived from the original. The
usage of [webpack-merge] is recommended when doing so since it can properly
handle the overloaded types within Webpack config properties, which can be
tricky.

```js
import webpackMerge from 'webpack-merge';

export default {
  name: 'sample-plugin',
  hooks: {
    webpackConfig: function webpackConfigHook( gasket, config, context) {
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
  }
};
```

For more details, see the additional [webpack documentation].

## GASKET_ENV Protection

This plugin automatically prevents `process.env.GASKET_ENV` from being bundled in browser code to avoid exposing server-side configuration. If detected, the build will fail with a helpful error message.

### Recommended Alternatives

Instead of using `process.env.GASKET_ENV` in any code:

1. **Use `gasket.config.env`** for environment-specific configuration:
   ```js
   // gasket.js
   export default makeGasket({
     environments: {
       dev: { apiUrl: 'http://localhost:3000' },
       prod: { apiUrl: 'https://api.example.com' }
     }
   });
   ```

2. **Use `@gasket/data`** to pass server data to the client:
   ```js
   // Server-side (in a lifecycle hook)
   export default {
     name: 'config-plugin',
     hooks: {
       publicGasketData(gasket, data) {
         return {
           ...data,
           apiUrl: gasket.config.apiUrl,
           env: gasket.config.env
         };
       }
     }
   };

   // Client-side
   import { gasketData } from '@gasket/data';
   const { apiUrl } = gasketData();
   ```

3. **Move environment logic to server-side code** and expose only necessary data through APIs or `@gasket/data`.

For more guidance, see the [environment configuration recipes].

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[webpack-merge]: https://github.com/survivejs/webpack-merge
[webpackConfig]: #webpackconfig
[webpack documentation]: ./docs/webpack.md
[environment configuration recipes]: ./docs/environment-configuration.md
