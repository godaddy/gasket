# @gasket/plugin-docs

The plugin enables the **docs** command, which centralizes doc files for the
app's plugins, presets, and supporting modules.

## Installation

#### New apps

```
gasket create <app-name> --plugins @gasket/plugin-docs
```

#### Existing apps

```
npm i @gasket/plugin-docs
```

Modify `plugins` section of your `gasket.config.js`:

```diff
module.exports = {
  plugins: {
    add: [
+      '@gasket/plugin-docs'
    ]
  }
}
```

## Configuration

To be set in under `docs` in the `gasket.config.js`.

- `outputDir` - (string) Name of the directory, relative to the app's package,
  where doc files will be collected to. Default is `.docs`.

## Commands

### docs command

The **docs** command, inspired by [cargo doc][rustdoc] from the Rust language,
allows app developers to generate documentation for their Gasket projects. Only
those presets and plugins that are configured for a project, will be used to
determine what documentation is available.

When running this command, markdown and other files will gathered from installed
node modules and collated to the output directory when they can be viewed
together.

## Lifecycles

### docsSetup

The **docs** command will assemble configuration for plugins and modules, based
on available `metadata`, enabled by the [@gasket/plugin-metadata].

By default, the files that are collated include a package's `README.md` and any
files that exist under a docs directory. Additionally, if any metadata defines
`link`, these files will be collected, too.

The `docsSetup` lifecycle allows plugin developers to tune the docsConfig that
is compile for their plugin. Files or file globs can be set, and links changed
as needed. Any lifecycle hooks should return a [DocsSetup] object.
The `defaults` are an available option to reference.

#### Example setup

```js
/**
 * @typedef {import('@gasket/plugin-docs').DocsSetup} DocsSetup
 */

module.exports = {
  name: 'example',
  hooks: {
    /**
    * Tune the docsConfig that is compiled for a plugin
    *
    * @param {Gasket} gasket The Gasket API
    * @param {Object} defaults The default docs setup config
    * @returns {DocsSetup}
    */
    async docsSetup(gasket, { defaults = {} }) {
      return {
        ...defaults,
        link: 'OTHER.md',
        files: [
          'API.md',
          'docs/**/*.md'
        ],
        transforms: [{
          test: /\.md$/,
          handler: content => content.replace('something', 'nothing')
        }],
        // collate docs for any supporting modules
        modules: {
          '@some/module': {
            link: 'README.md'
          },
          'another-module': {
            link: 'README.md#go-here',
            files: ['html/**/*.html'],
            transforms: [{
               test: /\.html$/,
               handler: content => content.replace(/everything/g, 'nothing')
             }]
          }
        }
      }
    }
  }
}
```

#### Transforms

Transforms can also be added in the docsSetup lifecycle. These are plugins to
adjust content for files that match the transform's test [RegExp]. By default,
these will only affect docs collected the plugin's package. If the transform
should be able affect all collected docs, the global property should be set to
true.

Additional data is available to handlers to help with transformations which can
be read about in the [DocsTransformHandler] API.

#### Modules

Beside docs for the plugin itself, `docsSetup` for supporting modules can also
be described. For modules from [metadata], if a `docsSetup` is found, the files
described will be collected, and link for the generated index go to the link
specified in the `docsSetup`, instead of the module's homepage.

Alternatively, modules can described their own setup in their package.json by
defining a `gasket.docsSetup` property. However, Being JSON, transforms or other
setup functions cannot be described this way:

```json
{
  "name": "example",
  "version": "1.2.3",
  "gasket": {
    "docsSetup": {
      "link": "OTHER.md#go-here",
      "files": [
        "more-docs/**/*.*"
      ]
    }
  }
}
```

### docsView

Allows a plugin to provide a view of the docs for the user.

#### Example viewer

```js
const view = require('example-markdown-viewer');

module.exports = {
  name: 'example',
  hooks: {
    async docsView(gasket, docsConfigSet) {
      const { docsRoot } = docsConfigSet;

      await view(docsRoot);
    }
  }
}
```

The [@gasket/plugin-docsify] hooks this lifecycle, to render the docs using
Docsify.

### docsGenerate

Allows a plugin to add documentation that has to be programmatically generated.

#### An example graph

```js
const { writeFile } = require('fs').promises;;

module.exports = {
  name: 'questions',
  hooks: {
    async docsGenerate(gasket, docsConfigSet) {
      await writeFile('FAQ.md', 'Just shoot me a call at (605) 475-6968');

      return {
        name: 'FAQ',
        description: 'Frequently Asked Questions',
        link: '/FAQ.md',
        targetRoot: docsConfigSet.docsRoot
      };
    }
  }
}
```

## Usage

### Presets

Presets can also set up custom docs. This is done by defining a `docsSetup`
property object on the module, which will be used to establish the [DocsConfig]
for the preset.

```js
// gasket-preset-example.js
module.exports = {
  require,
  docsSetup: {
    link: 'OTHER.md#go-here',
    files: ['more-docs/**/*.*'],
  }
}
```

## How it works

The docs command will gather info about plugins and modules from their
[metadata] and [docsSetup], and will assemble a [docsConfig] for each. These
configs are are organized by type in a [docsConfigSet], which is then used to
copy files to the outputDir, and perform any [transforms] as needed. An index is
generated in markdown from docsConfigSet which serves as the entry in the doc
files. If a plugin is installed that hooks the [docsView] lifecycle, it can
serve the content in a more viewable fashion for the user.

## License

[MIT](./LICENSE.md)

<!-- LINKS -->

[transforms]: #transforms
[docsView]: #docsview

[DocsSetup]: docs/api.md#DocsSetup
[DocsConfig]: docs/api.md#DocsConfig
[DocsConfigSet]: docs/api.md#DocsConfigSet
[DocsTransform]: docs/api.md#DocsTransform
[DocsTransformHandler]: docs/api.md#DocsTransformHandler

[@gasket/plugin-metadata]: /packages/gasket-plugin-metadata/README.md
[@gasket/plugin-docsify]: /packages/gasket-plugin-docsify/README.md
[metadata]: /packages/gasket-plugin-metadata/README.md

[rustdoc]:https://doc.rust-lang.org/rustdoc/
[RegExp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
