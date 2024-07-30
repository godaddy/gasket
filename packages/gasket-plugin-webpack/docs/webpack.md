# Configuring webpack

For app developers, additional [webpack configuration] should not be needed as
the most common setups are preconfigured for Gasket apps. However, there are a
couple of integration points for apps and plugins should the need arise.

With the [Gasket Webpack plugin] installed, you can use the `webpackConfig`
lifecycle and/or the `nextConfig` lifecycle or property
for [Gasket Next.js apps].

## webpackConfig

Apps can also use custom app-level plugins to hook the [webpackConfig lifecycle] to
provide additional custom config. The hook function should return the updated
Webpack config object.

You can utilize [webpack-merge] in your lifecycle hook, which is the recommended
approach. While the `webpackConfig` object can be directly mutated, this can be
brittle, so handle with care. Also, the `webpack` instance is passed via context
with the lifecycle, providing access to the [compatible Webpack plugins]
of the version installed.

### Via plugin hooks

```js
// gasket-plugin-example.js
import externalPlugin from 'some-external-plugin-installed';
import anotherExternalPlugin from 'i-love-webpack';

export default {
  name: 'example',
  hooks: {
    webpackConfig(gasket, webpackConfig, { webpack }) {
      return {
        ...webpackConfig,
        plugins: [
          ...(webpackConfig.plugins || []),
          new webpack.EnvironmentPlugin([
            'EXAMPLE_VAR'
          ]),
          new externalPlugin(),
          new anotherExternalPlugin()
        ]
      }
    }
  }
}
```

## nextConfig

For [Gasket Next.js apps] you can use the same `webpackConfig` lifecycle.
However, you may want to modify Webpack config using [Next.js plugins] or the
[Next.js custom Webpack] approach, in which case the [nextConfig lifecycle] or
the [gasket.config.nextConfig] property be helpful.

### Via config property

```js
// gasket.js
import withPreact from 'next-plugin-preact';

export default makeGasket({
  nextConfig: withPreact({
    /* regular next.js config options here */
  })
});
```

[configuration environments]:/packages/gasket-cli/docs/configuration.md#environments
[Gasket Webpack plugin]:/packages/gasket-plugin-webpack/README.md
[webpackConfig lifecycle]:/packages/gasket-plugin-webpack/README.md#webpackconfig
[Gasket Next.js apps]:/packages/gasket-plugin-nextjs/README.md
[gasket.config.nextConfig]:/packages/gasket-plugin-nextjs/README.md#configuration
[nextConfig lifecycle]:/packages/gasket-plugin-nextjs/README.md#nextconfig

[webpack configurations]:https://webpack.js.org/concepts/
[compatible webpack plugins]: https://webpack.js.org/plugins/
[Next.js plugins]:https://github.com/zeit/next-plugins
[Next.js custom Webpack]: https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
[webpack-merge]:https://github.com/survivejs/webpack-merge
