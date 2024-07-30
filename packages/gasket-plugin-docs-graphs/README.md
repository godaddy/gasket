# @gasket/plugin-docs-graphs

The plugin hooks the **docsGenerate** lifecycle to provide a [`mermaid`] graph
of a given application's lifecycles.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-docs,@gasket/plugin-docs-graph
```

#### Existing apps

```sh
npm i @gasket/plugin-docs-graphs
```

Modify `plugins` section of your `gasket.config.js`:

```diff
import { makeGasket } from '@gasket/core';
+ import pluginDocsGraphs from '@gasket/plugin-docs-graphs';

export default makeGasket({
  plugins: [
+    pluginDocsGraphs
  ]
})
```

[`mermaid`]: https://mermaid-js.github.io/mermaid/#/
