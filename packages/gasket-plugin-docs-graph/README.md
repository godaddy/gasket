# @gasket/plugin-docs-graph

The plugin enables hooks **docsGraph** lifecycle to provide a [`mermaid`] graph
of a given application's lifecycles.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-docs-graph
```

#### Existing apps

```
npm i @gasket/plugin-docs-graph
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-docs-graph'
    ]
  }
}
```

[`mermaid`]: https://mermaid-js.github.io/mermaid/#/
