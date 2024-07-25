# @gasket/plugin-analyze

Gasket plugin for building analysis reports of webpack bundles using
[webpack-bundle-analyzer].

## Installation

```
npm i @gasket/plugin-analyze
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginAnalyze from '@gasket/plugin-analyze';

export default makeGasket({
  plugins: [
+   pluginAnalyze
  ]
})
```

## Configuration

- **`bundleAnalyzerConfig`** - (object) The base gasket.config object.
  - **`browser`** - (object) See [plugin options]
  - **`server`** - (object) See [plugin options]

This plugin utilizes [webpack-bundle-analyzer] and as such, all of it's
[plugin options] are available for tuning for both both `browser` and `server`
analysis reports. Do so by setting the `bundleAnalyzerConfig` property in the
gasket.config.js. The analyze plugin defaults `analyzeMode` to `static`, and
outputs the reports to a `reports` dir at the root of the project.

#### Example

```js
// gasket.mjs

 export default makeGasket({
  bundleAnalyzerConfig: {
    browser: {
      defaultSizes: 'gzip'
    },
    server: {
      openAnalyzer: false
    }
  }
})
```

## NPM script

### analyze

The npm script `analyze` will execute the following `GASKET_ENV=local ANALYZE=true next build`.

Only when _this_ script is run, will the plugin add [webpack-bundle-analyzer]
to the webpack config. By default, generated reports are output to a `reports`
dir at the root of the project.

The script runs webpack for for both browser
and server-side rendering, two reports will be outputted:
- `reports/browser-bundles.html`
- `reports/server-bundles.html`

The **browser** report will be the most critical for analysis in order to make
sure an app is bundled in a way that is most optimal for users to download.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[webpack-bundle-analyzer]:https://github.com/webpack-contrib/webpack-bundle-analyzer
[plugin options]:https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin
