# @gasket/plugin-elastic-apm

Adds Elastic APM instrumentation to your application

## Installation

```
npm i @gasket/plugin-elastic-apm
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginElasticApm from '@gasket/plugin-elastic-apm';

export default makeGasket({
  plugins: [
+   pluginElasticApm
  ]
});
```
