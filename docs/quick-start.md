# Quick Start

## Create

To get started creating a new app, use a package runner with `create-gasket-app`:

```bash
npx create-gasket-app@latest --help
# OR
yarn create gasket-app --help
```

In this example we will create a Next.js app by specifying the app name along with a template:

```bash
npx create-gasket-app@latest <app-name> --template @gasket/template-nextjs-pages
```

This will create a new directory with the name of your app.

```bash
cd ./your-app-name
```

## Start

From here, you can start your app in local development mode:

```bash
npm run local
```

Otherwise you can build and start your app directly:

```bash
npm run build
npm run start
```

## Config

If you have an existing app, some plugins can be added after create.
First, install the necessary node modules:

```bash
npm i @gasket/plugin-docs @gasket/plugin-docusaurus
```

Then, in the app's `gasket.js`, add the plugins:

```diff
import { makeGasket } from '@gasket/core';
+import pluginDocs from '@gasket/plugin-docs';
+import pluginDocusaurus from '@gasket/plugin-docusaurus';

export default makeGasket({
  plugins: [
    // other plugins
+    pluginDocs,
+    pluginDocusaurus
  ]
});
```

Now, when you run the docs command, a site will open in your default browser
with docs for what is configured in your app. See the [@gasket/plugin-command] documentation for more information about Gasket commands.

```bash
node gasket.js docs
```

## ESM

Newly created Gasket apps will use ESM and `type: module`. This means that you will need to use `.js` extensions in your imports. For example:

```js
import { myFunction } from './myModule.js';
```

<!-- LINKS -->

[@gasket/plugin-command]: ./packages/gasket-plugin-command/README.md
