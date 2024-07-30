# @gasket/plugin-docs-graphs

The plugin hooks the **docsGenerate** lifecycle to provide a [`mermaid`] graph
of a given application's lifecycles.

## Installation

```
npm i @gasket/plugin-docs-graphs
```

Update your `gasket` file plugin configuration:

```diff
// gasket.js

+ import pluginDocsGraphs from '@gasket/plugin-docs-graphs';

 export default makeGasket({
  plugins: [
+   pluginDocsGraphs
  ]
});
```

[`mermaid`]: https://mermaid-js.github.io/mermaid/#/
