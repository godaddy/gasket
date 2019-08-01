# @gasket/analyze-plugin

Gasket plugin for building analysis reports of webpack bundles using
[webpack-bundle-analyzer].

When running `gasket analyze`, two reports will be outputted:
- `reports/browser-bundles.html`
- `reports/server-bundles.html`

Webpack is run to bundle for both browser and server-side rendering.
The **client** report will be the most critical for analysis in order to make
sure an app is bundled in a way that is most optimal for users to download.


## Options

- **`bundleAnalyzerConfig`** - (object) The base gasket.config object.
  - **`browser`** - (object) See [plugin options]
  - **`server`** - (object) See [plugin options]

This plugin utilizes [webpack-bundle-analyzer] and as such, all of it's
[plugin options] are available for tuning for both both `browser` and `server`
analysis reports. Do so by setting the `bundleAnalyzerConfig` property in the
gasket.config.js. The analyze-plugin defaults `analyzeMode` to `static`, and
outputs the reports to a `reports` dir at the root of the project.

### Config Example

```js
// gasket.config.js

module.exports = {
  bundleAnalyzerConfig: {
    browser: {
      defaultSizes: 'gzip'
    },
    server: {
      openAnalyzer: false
    }
  }
}
```

[webpack-bundle-analyzer]:https://github.com/webpack-contrib/webpack-bundle-analyzer
[plugin options]:https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin
