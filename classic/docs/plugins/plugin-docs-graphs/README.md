---
title: ''
hide_title: true
sidebar_label: '@gasket/plugin-docs-graphs'
---

# @gasket/plugin-docs-graphs

The plugin hooks the **docsGenerate** lifecycle to provide a [`mermaid`] graph
of a given application's lifecycles.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-docs,@gasket/plugin-docs-graph
```

#### Existing apps

```
npm i @gasket/plugin-docs-graphs
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-docs-graphs'
    ]
  }
}
```

[`mermaid`]: https://mermaid-js.github.io/mermaid/#/
