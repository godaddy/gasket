---
title: ''
hide_title: true
sidebar_label: '@gasket/plugin-docusaurus'
---

# @gasket/plugin-docusaurus

Use [Docusaurus] to serve a website view of the collated docs from [@gasket/plugin-docs].

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-docs,@gasket/plugin-docusaurus
```
#### Existing apps

```
npm i @gasket/plugin-docs @gasket/plugin-docusaurus
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-docs',
+      '@gasket/plugin-docusaurus'
    ]
  }
}
```

Now, when you run `npx gasket docs` in your app, a nice Docusaurus website will be
launched in your browser.


## Configuration

To be set under `docusaurus` in the `gasket.config.js`.

- `rootDir` - (string) Root Docusaurus directory. Default is `.docs`.
- `docsDir` - (string) Sub-directory for the generated markdown from the docs plugin. Default is `docs`.
- `port` - (number) Port to serve the docs from. Default is `3000`.
- `host` - (string) Hostname to serve the docs from. Default is `localhost`.

#### Example
```js
// gasket.config.js

module.exports = {
  docusaurus: {
    rootDir: 'my-site-documents',
    docsDir: 'markdown',
    port: 8000,
    host: 'custom-host'
  }
};

// structure
gasket-app/ // app root
|_ my-site-documents // docusaurus root
  |_ .docusaurus // build folder
  |_ markdown // generated docs from @gasket/plugin-docs
```

### `docusaurus.config.js`
A required `docusaurus.config.js` will generated in the root directory if one is not present. Docusaurus allows for additional [configuration/customization](https://docusaurus.io/docs/api/docusaurus-config) options and you can define those directly in the `docusaurus.config.js`.

## License

[MIT](../../LICENSE.md)

<!-- LINKS -->
[Docusaurus]: https://docusaurus.io/
[@gasket/plugin-docs]: /docs/plugins/plugin-docs/README.md
