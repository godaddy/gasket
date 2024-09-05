# @gasket/plugin-analyze

Gasket plugin for building analysis reports of webpack bundles using
[webpack-bundle-analyzer].

## Installation

```bash
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
});
```

## Configuration

- **`bundleAnalyzerConfig`** - (object) Configuration options for the Webpack
  bundle analyzer. Define settings for both browser and server bundles.
  - **`browser`** - (object) Options specific to the client-side bundle
    analysis. See [plugin options].
  - **`server`** - (object) Options specific to the server-side bundle analysis.
    See [plugin options].

This plugin uses [webpack-bundle-analyzer] and as such, all of its [plugin
options] are available for tuning both `browser` and `server` analysis reports.
These options are defined in the `bundleAnalyzerConfig` object in your
`gasket.config.js`.

By default, the `analyzeMode` is set to `static`, meaning the analysis reports
are generated as HTML files, and the reports are output to a `reports` directory
at the root of the project.

### Example

```js
// gasket.js

export default makeGasket({
  bundleAnalyzerConfig: {
    browser: {
      defaultSizes: 'gzip' // Analyze the gzipped sizes of the bundles
    },
    server: {
      openAnalyzer: false // Do not automatically open the report in the browser
    }
  }
});
```

### Default Configuration

If no `bundleAnalyzerConfig` is provided, the plugin defaults to generating both
browser and server reports in the `reports` directory:

- Browser reports: `reports/browser-bundles.html`
- Server reports: `reports/server-bundles.html`

These paths can be customized in `bundleAnalyzerConfig` under `reportFilename`
for each type of bundle (browser and server).

## NPM script

### analyze

The npm script `analyze` will execute the following:

```bash
GASKET_ENV=local ANALYZE=true next build
```

When this script is run, the `@gasket/plugin-analyse` will add the
[webpack-bundle-analyzer] to the webpack config.

Reports for both browser and server-side rendering will be generated, with the
following output:

- `reports/browser-bundles.html`
- `reports/server-bundles.html`

Only when `ANALYZE=true` is set in the environment, will the analyzer plugin be
added to Webpack, ensuring that the bundle analyzer is used specifically for
this analysis task.

#### Example Usage

To run the analyzer:

```bash
npm run analyze
```

The **browser** report will be most critical for analyzing bundle size
optimizations, ensuring that the app is optimized for download efficiency from
the user's perspective.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[webpack-bundle-analyzer]:https://github.com/webpack-contrib/webpack-bundle-analyzer
[plugin
    options]:https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin
